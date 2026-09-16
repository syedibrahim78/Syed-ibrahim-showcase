import express from 'express';
import path from 'path';
import fs from 'fs';
import cookieParser from 'cookie-parser';
import bcrypt from 'bcryptjs';
import { createServer as createViteServer } from 'vite';
import { dbRun, dbGet, dbAll, initDatabase } from './src/server/db';
import { generateToken, requireAuth, AuthenticatedRequest } from './src/server/auth';

const PORT = 3000;

async function startServer() {
  const app = express();

  // Basic middlewares
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));
  app.use(cookieParser());

  // Initialize SQLite database and seed admin credentials if needed
  try {
    await initDatabase();
    console.log('✅ SQLite database initialized and seeded successfully.');
  } catch (err) {
    console.error('❌ Failed to initialize database:', err);
  }

  // Ensure public uploads directory exists
  const uploadsDir = path.resolve(process.cwd(), 'public', 'uploads');
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }

  // ==========================================
  // API ROUTES
  // ==========================================

  // Health check
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  // ------------------------------------------
  // AUTHENTICATION ROUTES
  // ------------------------------------------

  // Login
  app.post('/api/auth/login', async (req, res) => {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({ error: 'Email and password are required.' });
      }

      const user = await dbGet<any>('SELECT * FROM users WHERE LOWER(email) = LOWER(?)', [email.trim()]);
      if (!user) {
        return res.status(401).json({ error: 'Invalid email or password.' });
      }

      const isValidPassword = await bcrypt.compare(password, user.password);
      if (!isValidPassword) {
        return res.status(401).json({ error: 'Invalid email or password.' });
      }

      const userPayload = {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role
      };

      const token = generateToken(userPayload);

      // Also set httpOnly cookie for extra security
      res.cookie('token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
      });

      return res.json({
        success: true,
        token,
        user: userPayload,
        message: 'Login successful'
      });
    } catch (err: any) {
      console.error('Login error:', err);
      return res.status(500).json({ error: 'An unexpected server error occurred during login.' });
    }
  });

  // Get current logged-in user
  app.get('/api/auth/me', requireAuth, async (req: AuthenticatedRequest, res) => {
    try {
      const user = await dbGet<any>('SELECT id, email, name, role, created_at FROM users WHERE id = ?', [
        req.user?.id
      ]);
      if (!user) {
        return res.status(404).json({ error: 'User not found.' });
      }
      return res.json({ user });
    } catch (err: any) {
      return res.status(500).json({ error: 'Failed to fetch user session.' });
    }
  });

  // Logout
  app.post('/api/auth/logout', (req, res) => {
    res.clearCookie('token');
    return res.json({ success: true, message: 'Logged out successfully.' });
  });

  // ------------------------------------------
  // PUBLIC PORTFOLIO DATA ROUTES
  // ------------------------------------------

  // Get public student profile
  app.get('/api/profile', async (req, res) => {
    try {
      const profile = await dbGet<any>('SELECT * FROM profile ORDER BY id DESC LIMIT 1');
      if (!profile) {
        return res.status(404).json({ error: 'Profile not configured yet.' });
      }

      let parsedSkills: string[] = [];
      try {
        parsedSkills = typeof profile.skills === 'string' ? JSON.parse(profile.skills) : profile.skills || [];
      } catch (e) {
        parsedSkills = profile.skills ? profile.skills.split(',').map((s: string) => s.trim()) : [];
      }

      return res.json({
        ...profile,
        skills: parsedSkills
      });
    } catch (err: any) {
      console.error('Get profile error:', err);
      return res.status(500).json({ error: 'Failed to fetch portfolio profile.' });
    }
  });

  // Get published projects for public portfolio
  app.get('/api/projects', async (req, res) => {
    try {
      const rows = await dbAll<any>(
        'SELECT * FROM projects WHERE is_published = 1 ORDER BY is_featured DESC, display_order ASC, created_at DESC'
      );

      const projects = rows.map((p) => {
        let parsedTech: string[] = [];
        try {
          parsedTech = typeof p.tech_stack === 'string' ? JSON.parse(p.tech_stack) : p.tech_stack || [];
        } catch (e) {
          parsedTech = p.tech_stack ? p.tech_stack.split(',').map((s: string) => s.trim()) : [];
        }

        return {
          ...p,
          tech_stack: parsedTech,
          is_published: Boolean(p.is_published),
          is_featured: Boolean(p.is_featured)
        };
      });

      return res.json(projects);
    } catch (err: any) {
      console.error('Get public projects error:', err);
      return res.status(500).json({ error: 'Failed to fetch portfolio projects.' });
    }
  });

  // Get single project details
  app.get('/api/projects/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id, 10);
      if (isNaN(id)) {
        return res.status(400).json({ error: 'Invalid project ID.' });
      }

      const project = await dbGet<any>('SELECT * FROM projects WHERE id = ?', [id]);
      if (!project) {
        return res.status(404).json({ error: 'Project not found.' });
      }

      let parsedTech: string[] = [];
      try {
        parsedTech = typeof project.tech_stack === 'string' ? JSON.parse(project.tech_stack) : project.tech_stack || [];
      } catch (e) {
        parsedTech = project.tech_stack ? project.tech_stack.split(',').map((s: string) => s.trim()) : [];
      }

      return res.json({
        ...project,
        tech_stack: parsedTech,
        is_published: Boolean(project.is_published),
        is_featured: Boolean(project.is_featured)
      });
    } catch (err: any) {
      return res.status(500).json({ error: 'Failed to fetch project.' });
    }
  });

  // Submit public contact message
  app.post('/api/contact', async (req, res) => {
    try {
      const { name, email, subject, message } = req.body;

      if (!name || !email || !message) {
        return res.status(400).json({ error: 'Name, email, and message are required fields.' });
      }

      // Basic email regex
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email.trim())) {
        return res.status(400).json({ error: 'Please provide a valid email address.' });
      }

      await dbRun(
        'INSERT INTO messages (sender_name, sender_email, subject, message) VALUES (?, ?, ?, ?)',
        [name.trim(), email.trim(), (subject || '').trim(), message.trim()]
      );

      return res.json({ success: true, message: 'Your message has been sent successfully!' });
    } catch (err: any) {
      console.error('Contact submit error:', err);
      return res.status(500).json({ error: 'Failed to send message. Please try again.' });
    }
  });

  // ------------------------------------------
  // ADMIN PROTECTED ROUTES
  // ------------------------------------------

  // Admin Dashboard Overview Stats
  app.get('/api/admin/stats', requireAuth, async (req: AuthenticatedRequest, res) => {
    try {
      const totalProjectsRow = await dbGet<any>('SELECT COUNT(*) as count FROM projects');
      const publishedProjectsRow = await dbGet<any>('SELECT COUNT(*) as count FROM projects WHERE is_published = 1');
      const draftProjectsRow = await dbGet<any>('SELECT COUNT(*) as count FROM projects WHERE is_published = 0');
      const totalMessagesRow = await dbGet<any>('SELECT COUNT(*) as count FROM messages');
      const unreadMessagesRow = await dbGet<any>('SELECT COUNT(*) as count FROM messages WHERE is_read = 0');
      const profile = await dbGet<any>('SELECT name, title, skills FROM profile LIMIT 1');

      let skillsCount = 0;
      if (profile?.skills) {
        try {
          skillsCount = JSON.parse(profile.skills).length;
        } catch {
          skillsCount = profile.skills.split(',').length;
        }
      }

      return res.json({
        totalProjects: totalProjectsRow?.count || 0,
        publishedProjects: publishedProjectsRow?.count || 0,
        draftProjects: draftProjectsRow?.count || 0,
        totalMessages: totalMessagesRow?.count || 0,
        unreadMessages: unreadMessagesRow?.count || 0,
        profileStatus: {
          isConfigured: Boolean(profile?.name),
          name: profile?.name || 'Not configured',
          title: profile?.title || 'Not configured',
          skillsCount
        }
      });
    } catch (err: any) {
      console.error('Stats error:', err);
      return res.status(500).json({ error: 'Failed to fetch dashboard statistics.' });
    }
  });

  // Admin: Get all projects (Draft + Published)
  app.get('/api/admin/projects', requireAuth, async (req: AuthenticatedRequest, res) => {
    try {
      const rows = await dbAll<any>(
        'SELECT * FROM projects ORDER BY display_order ASC, created_at DESC'
      );

      const projects = rows.map((p) => {
        let parsedTech: string[] = [];
        try {
          parsedTech = typeof p.tech_stack === 'string' ? JSON.parse(p.tech_stack) : p.tech_stack || [];
        } catch (e) {
          parsedTech = p.tech_stack ? p.tech_stack.split(',').map((s: string) => s.trim()) : [];
        }

        return {
          ...p,
          tech_stack: parsedTech,
          is_published: Boolean(p.is_published),
          is_featured: Boolean(p.is_featured)
        };
      });

      return res.json(projects);
    } catch (err: any) {
      console.error('Admin get projects error:', err);
      return res.status(500).json({ error: 'Failed to fetch projects.' });
    }
  });

  // Admin: Create new project
  app.post('/api/admin/projects', requireAuth, async (req: AuthenticatedRequest, res) => {
    try {
      const {
        title,
        short_description,
        detailed_description,
        tech_stack,
        image_url,
        live_demo_url,
        github_url,
        is_published,
        is_featured,
        display_order
      } = req.body;

      if (!title || !title.trim()) {
        return res.status(400).json({ error: 'Project title is required.' });
      }
      if (!short_description || !short_description.trim()) {
        return res.status(400).json({ error: 'Short description is required.' });
      }

      // Convert tech_stack to JSON string
      let techStackString = '[]';
      if (Array.isArray(tech_stack)) {
        techStackString = JSON.stringify(tech_stack.filter((t: any) => typeof t === 'string' && t.trim().length > 0));
      } else if (typeof tech_stack === 'string') {
        techStackString = JSON.stringify(
          tech_stack
            .split(',')
            .map((t) => t.trim())
            .filter((t) => t.length > 0)
        );
      }

      const publishedVal = is_published ? 1 : 0;
      const featuredVal = is_featured ? 1 : 0;
      const orderVal = typeof display_order === 'number' ? display_order : 0;

      const result = await dbRun(
        `INSERT INTO projects 
          (title, short_description, detailed_description, tech_stack, image_url, live_demo_url, github_url, is_published, is_featured, display_order)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          title.trim(),
          short_description.trim(),
          (detailed_description || '').trim(),
          techStackString,
          (image_url || '').trim(),
          (live_demo_url || '').trim(),
          (github_url || '').trim(),
          publishedVal,
          featuredVal,
          orderVal
        ]
      );

      const created = await dbGet<any>('SELECT * FROM projects WHERE id = ?', [result.lastID]);
      return res.status(201).json({
        success: true,
        message: 'Project created successfully.',
        project: {
          ...created,
          tech_stack: JSON.parse(created.tech_stack || '[]'),
          is_published: Boolean(created.is_published),
          is_featured: Boolean(created.is_featured)
        }
      });
    } catch (err: any) {
      console.error('Create project error:', err);
      return res.status(500).json({ error: 'Failed to create project.' });
    }
  });

  // Admin: Update existing project
  app.put('/api/admin/projects/:id', requireAuth, async (req: AuthenticatedRequest, res) => {
    try {
      const id = parseInt(req.params.id, 10);
      if (isNaN(id)) {
        return res.status(400).json({ error: 'Invalid project ID.' });
      }

      const existing = await dbGet<any>('SELECT * FROM projects WHERE id = ?', [id]);
      if (!existing) {
        return res.status(404).json({ error: 'Project not found.' });
      }

      const {
        title,
        short_description,
        detailed_description,
        tech_stack,
        image_url,
        live_demo_url,
        github_url,
        is_published,
        is_featured,
        display_order
      } = req.body;

      if (!title || !title.trim()) {
        return res.status(400).json({ error: 'Project title is required.' });
      }
      if (!short_description || !short_description.trim()) {
        return res.status(400).json({ error: 'Short description is required.' });
      }

      let techStackString = existing.tech_stack;
      if (Array.isArray(tech_stack)) {
        techStackString = JSON.stringify(tech_stack.filter((t: any) => typeof t === 'string' && t.trim().length > 0));
      } else if (typeof tech_stack === 'string') {
        techStackString = JSON.stringify(
          tech_stack
            .split(',')
            .map((t) => t.trim())
            .filter((t) => t.length > 0)
        );
      }

      const publishedVal = is_published !== undefined ? (is_published ? 1 : 0) : existing.is_published;
      const featuredVal = is_featured !== undefined ? (is_featured ? 1 : 0) : existing.is_featured;
      const orderVal = typeof display_order === 'number' ? display_order : existing.display_order;

      await dbRun(
        `UPDATE projects 
         SET title = ?, short_description = ?, detailed_description = ?, tech_stack = ?,
             image_url = ?, live_demo_url = ?, github_url = ?, is_published = ?,
             is_featured = ?, display_order = ?, updated_at = CURRENT_TIMESTAMP
         WHERE id = ?`,
        [
          title.trim(),
          short_description.trim(),
          (detailed_description || '').trim(),
          techStackString,
          (image_url !== undefined ? image_url : existing.image_url || '').trim(),
          (live_demo_url !== undefined ? live_demo_url : existing.live_demo_url || '').trim(),
          (github_url !== undefined ? github_url : existing.github_url || '').trim(),
          publishedVal,
          featuredVal,
          orderVal,
          id
        ]
      );

      const updated = await dbGet<any>('SELECT * FROM projects WHERE id = ?', [id]);
      return res.json({
        success: true,
        message: 'Project updated successfully.',
        project: {
          ...updated,
          tech_stack: JSON.parse(updated.tech_stack || '[]'),
          is_published: Boolean(updated.is_published),
          is_featured: Boolean(updated.is_featured)
        }
      });
    } catch (err: any) {
      console.error('Update project error:', err);
      return res.status(500).json({ error: 'Failed to update project.' });
    }
  });

  // Admin: Toggle project visibility (Draft / Published)
  app.patch('/api/admin/projects/:id/visibility', requireAuth, async (req: AuthenticatedRequest, res) => {
    try {
      const id = parseInt(req.params.id, 10);
      if (isNaN(id)) {
        return res.status(400).json({ error: 'Invalid project ID.' });
      }

      const existing = await dbGet<any>('SELECT is_published FROM projects WHERE id = ?', [id]);
      if (!existing) {
        return res.status(404).json({ error: 'Project not found.' });
      }

      const newVisibility = existing.is_published === 1 ? 0 : 1;
      await dbRun(
        'UPDATE projects SET is_published = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
        [newVisibility, id]
      );

      return res.json({
        success: true,
        is_published: Boolean(newVisibility),
        message: `Project ${newVisibility === 1 ? 'published' : 'moved to drafts'}.`
      });
    } catch (err: any) {
      return res.status(500).json({ error: 'Failed to toggle visibility.' });
    }
  });

  // Admin: Delete project
  app.delete('/api/admin/projects/:id', requireAuth, async (req: AuthenticatedRequest, res) => {
    try {
      const id = parseInt(req.params.id, 10);
      if (isNaN(id)) {
        return res.status(400).json({ error: 'Invalid project ID.' });
      }

      const existing = await dbGet<any>('SELECT title FROM projects WHERE id = ?', [id]);
      if (!existing) {
        return res.status(404).json({ error: 'Project not found.' });
      }

      await dbRun('DELETE FROM projects WHERE id = ?', [id]);
      return res.json({ success: true, message: `Project "${existing.title}" deleted permanently.` });
    } catch (err: any) {
      return res.status(500).json({ error: 'Failed to delete project.' });
    }
  });

  // Admin: Update Student Profile
  app.put('/api/admin/profile', requireAuth, async (req: AuthenticatedRequest, res) => {
    try {
      const {
        name,
        title,
        bio,
        avatar_url,
        email,
        github_url,
        linkedin_url,
        twitter_url,
        website_url,
        resume_url,
        skills
      } = req.body;

      if (!name || !name.trim()) {
        return res.status(400).json({ error: 'Student name is required.' });
      }
      if (!title || !title.trim()) {
        return res.status(400).json({ error: 'Headline title is required.' });
      }

      let skillsString = '[]';
      if (Array.isArray(skills)) {
        skillsString = JSON.stringify(skills.map((s: any) => String(s).trim()).filter((s) => s.length > 0));
      } else if (typeof skills === 'string') {
        skillsString = JSON.stringify(
          skills
            .split(',')
            .map((s) => s.trim())
            .filter((s) => s.length > 0)
        );
      }

      const existing = await dbGet<any>('SELECT id FROM profile LIMIT 1');
      if (existing) {
        await dbRun(
          `UPDATE profile 
           SET name = ?, title = ?, bio = ?, avatar_url = ?, email = ?,
               github_url = ?, linkedin_url = ?, twitter_url = ?, website_url = ?,
               resume_url = ?, skills = ?, updated_at = CURRENT_TIMESTAMP
           WHERE id = ?`,
          [
            name.trim(),
            title.trim(),
            (bio || '').trim(),
            (avatar_url || '').trim(),
            (email || '').trim(),
            (github_url || '').trim(),
            (linkedin_url || '').trim(),
            (twitter_url || '').trim(),
            (website_url || '').trim(),
            (resume_url || '').trim(),
            skillsString,
            existing.id
          ]
        );
      } else {
        await dbRun(
          `INSERT INTO profile (name, title, bio, avatar_url, email, github_url, linkedin_url, twitter_url, website_url, resume_url, skills)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            name.trim(),
            title.trim(),
            (bio || '').trim(),
            (avatar_url || '').trim(),
            (email || '').trim(),
            (github_url || '').trim(),
            (linkedin_url || '').trim(),
            (twitter_url || '').trim(),
            (website_url || '').trim(),
            (resume_url || '').trim(),
            skillsString
          ]
        );
      }

      const updated = await dbGet<any>('SELECT * FROM profile ORDER BY id DESC LIMIT 1');
      return res.json({
        success: true,
        message: 'Profile updated successfully.',
        profile: {
          ...updated,
          skills: JSON.parse(updated.skills || '[]')
        }
      });
    } catch (err: any) {
      console.error('Update profile error:', err);
      return res.status(500).json({ error: 'Failed to update student profile.' });
    }
  });

  // Admin: Update Account Security (Email, Name, Password)
  app.put('/api/admin/account', requireAuth, async (req: AuthenticatedRequest, res) => {
    try {
      const { email, name, currentPassword, newPassword } = req.body;
      const userId = req.user?.id;

      const user = await dbGet<any>('SELECT * FROM users WHERE id = ?', [userId]);
      if (!user) {
        return res.status(404).json({ error: 'User account not found.' });
      }

      let updatedEmail = user.email;
      let updatedName = user.name;

      if (email && email.trim() !== '') {
        const cleanEmail = email.trim().toLowerCase();
        // Check uniqueness if changing email
        if (cleanEmail !== user.email.toLowerCase()) {
          const emailCheck = await dbGet<any>('SELECT id FROM users WHERE LOWER(email) = ? AND id != ?', [
            cleanEmail,
            userId
          ]);
          if (emailCheck) {
            return res.status(400).json({ error: 'This email is already in use by another account.' });
          }
          updatedEmail = cleanEmail;
        }
      }

      if (name && name.trim() !== '') {
        updatedName = name.trim();
      }

      // If user wants to change password
      if (newPassword) {
        if (!currentPassword) {
          return res.status(400).json({ error: 'Current password is required to set a new password.' });
        }

        const isCurrentValid = await bcrypt.compare(currentPassword, user.password);
        if (!isCurrentValid) {
          return res.status(400).json({ error: 'Current password does not match our records.' });
        }

        if (newPassword.length < 6) {
          return res.status(400).json({ error: 'New password must be at least 6 characters long.' });
        }

        const hashedNewPassword = await bcrypt.hash(newPassword, 10);

        await dbRun(
          'UPDATE users SET email = ?, name = ?, password = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
          [updatedEmail, updatedName, hashedNewPassword, userId]
        );
      } else {
        await dbRun(
          'UPDATE users SET email = ?, name = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
          [updatedEmail, updatedName, userId]
        );
      }

      const updatedUser = await dbGet<any>('SELECT id, email, name, role FROM users WHERE id = ?', [userId]);
      const newToken = generateToken(updatedUser);

      return res.json({
        success: true,
        message: 'Account settings updated successfully.',
        user: updatedUser,
        token: newToken
      });
    } catch (err: any) {
      console.error('Account update error:', err);
      return res.status(500).json({ error: 'Failed to update account settings.' });
    }
  });

  // Admin: Get contact messages
  app.get('/api/admin/messages', requireAuth, async (req: AuthenticatedRequest, res) => {
    try {
      const messages = await dbAll<any>('SELECT * FROM messages ORDER BY created_at DESC');
      return res.json(
        messages.map((m) => ({
          ...m,
          is_read: Boolean(m.is_read)
        }))
      );
    } catch (err: any) {
      return res.status(500).json({ error: 'Failed to fetch messages.' });
    }
  });

  // Admin: Toggle message read status
  app.patch('/api/admin/messages/:id/read', requireAuth, async (req: AuthenticatedRequest, res) => {
    try {
      const id = parseInt(req.params.id, 10);
      const msg = await dbGet<any>('SELECT is_read FROM messages WHERE id = ?', [id]);
      if (!msg) {
        return res.status(404).json({ error: 'Message not found.' });
      }

      const newStatus = msg.is_read === 1 ? 0 : 1;
      await dbRun('UPDATE messages SET is_read = ? WHERE id = ?', [newStatus, id]);
      return res.json({ success: true, is_read: Boolean(newStatus) });
    } catch (err: any) {
      return res.status(500).json({ error: 'Failed to update message.' });
    }
  });

  // Admin: Delete message
  app.delete('/api/admin/messages/:id', requireAuth, async (req: AuthenticatedRequest, res) => {
    try {
      const id = parseInt(req.params.id, 10);
      await dbRun('DELETE FROM messages WHERE id = ?', [id]);
      return res.json({ success: true, message: 'Message deleted.' });
    } catch (err: any) {
      return res.status(500).json({ error: 'Failed to delete message.' });
    }
  });

  // Admin: Image Upload endpoint (accepts file or base64 data URI)
  app.post('/api/admin/upload', requireAuth, async (req: AuthenticatedRequest, res) => {
    try {
      const { image, filename } = req.body;
      if (!image) {
        return res.status(400).json({ error: 'No image data provided.' });
      }

      // If it's a data URL, we can save it to /public/uploads/ or return it
      if (image.startsWith('data:image/')) {
        const matches = image.match(/^data:image\/([a-zA-Z0-9]+);base64,(.+)$/);
        if (matches) {
          const ext = matches[1] === 'jpeg' ? 'jpg' : matches[1];
          const base64Data = matches[2];
          const safeFilename = `upload_${Date.now()}_${Math.random().toString(36).substring(2, 8)}.${ext}`;
          const filePath = path.join(uploadsDir, safeFilename);

          fs.writeFileSync(filePath, Buffer.from(base64Data, 'base64'));
          return res.json({
            success: true,
            url: `/uploads/${safeFilename}`
          });
        }
      }

      // If already a URL, return as is
      return res.json({ success: true, url: image });
    } catch (err: any) {
      console.error('Upload error:', err);
      return res.status(500).json({ error: 'Failed to process image upload.' });
    }
  });

  // Admin: Reset / Re-seed sample projects helper
  app.post('/api/admin/seed-demo', requireAuth, async (req: AuthenticatedRequest, res) => {
    try {
      await dbRun('DELETE FROM projects');
      // Re-trigger seed
      const defaultSkills = JSON.stringify([
        'TypeScript', 'React', 'Node.js', 'Express', 'Tailwind CSS', 'PostgreSQL', 'SQLite', 'Python', 'Git', 'REST APIs'
      ]);
      await dbRun('UPDATE profile SET skills = ? WHERE id = (SELECT id FROM profile LIMIT 1)', [defaultSkills]);
      
      const sampleProjects = [
        {
          title: 'AlgoCraft - Interactive Algorithm Visualizer',
          short_description: 'Interactive web platform visualizing graph traversal, dynamic programming, and sorting algorithms in real-time.',
          detailed_description: `## Overview\nAlgoCraft is an educational web application developed to help computer science students comprehend complex algorithms through dynamic, step-by-step visual transitions.\n\n### Key Features\n- **Graph Algorithms**: BFS, DFS, Dijkstra's shortest path, and A* pathfinding on custom grids.\n- **Sorting Visualizer**: QuickSort, MergeSort, HeapSort with adjustable playback speeds.\n- **Execution Timeline**: Pause, rewind, and step forwards through algorithmic states.\n- **Custom Input Support**: Create custom weighted graphs and weighted matrices.\n\n### Architectural Highlights\nBuilt with React, WebGL rendering canvas, and custom state machines to maintain zero-lag 60fps animations during heavy computation.`,
          tech_stack: JSON.stringify(['React', 'TypeScript', 'Canvas API', 'Tailwind CSS', 'Vite']),
          image_url: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&auto=format&fit=crop&q=80',
          live_demo_url: 'https://algocraft-demo.example.com',
          github_url: 'https://github.com/alexrivera-dev/algocraft-visualizer',
          is_published: 1,
          is_featured: 1,
          display_order: 1
        },
        {
          title: 'CampusPulse - Student Collaboration Hub',
          short_description: 'Full-stack peer-to-peer study group coordinator, assignment deadline tracker, and campus resource finder.',
          detailed_description: `## Overview\nCampusPulse connects over 1,500 students across 6 departments to find study partners, share course materials, and synchronize group schedules.\n\n### Highlights\n- **Real-Time Study Rooms**: WebSocket-powered chat and collaborative markdown scratchpads.\n- **Automated Reminders**: Push alerts for upcoming assignment milestones.\n- **Course Review Aggregator**: Student-vetted reviews of electives and professors.\n\n### Tech Stack & Performance\n- Backend implemented with Express.js, SQLite / PostgreSQL data caching.\n- JWT authentication with role-based permissions (Student, TA, Moderator).`,
          tech_stack: JSON.stringify(['Node.js', 'Express', 'SQLite', 'React', 'Tailwind CSS', 'JWT']),
          image_url: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800&auto=format&fit=crop&q=80',
          live_demo_url: 'https://campuspulse.example.com',
          github_url: 'https://github.com/alexrivera-dev/campuspulse-hub',
          is_published: 1,
          is_featured: 1,
          display_order: 2
        },
        {
          title: 'NeuralSketch - Edge AI Doodle Classifier',
          short_description: 'Client-side deep learning web app that recognizes hand-drawn sketches with 94% accuracy in real-time.',
          detailed_description: `## Overview\nNeuralSketch allows users to draw sketches on a digital canvas and predicts what is being drawn using a custom lightweight Convolutional Neural Network (CNN) trained on the QuickDraw dataset.\n\n### Technical Details\n- **Model**: Custom quantized MobileNet trained using PyTorch, converted for in-browser inference.\n- **Performance**: Zero server round-trips; inferences execute in < 18ms on low-power mobile devices.\n- **Game Mode**: Competitive quick-draw challenge with leaderboards.`,
          tech_stack: JSON.stringify(['Python', 'PyTorch', 'TypeScript', 'Web Workers', 'Tailwind CSS']),
          image_url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop&q=80',
          live_demo_url: 'https://neuralsketch.example.com',
          github_url: 'https://github.com/alexrivera-dev/neural-sketch-app',
          is_published: 1,
          is_featured: 0,
          display_order: 3
        },
        {
          title: 'DevMetrics - GitHub Activity Analytics Dashboard',
          short_description: 'Developer productivity tool analyzing Git commit rhythms, code reviews, and repo velocity with rich visualizations.',
          detailed_description: `## Overview\nDevMetrics ingests GitHub API webhooks and provides engineering students with insights into their coding consistency, language breakdown, and collaborative habits.\n\n### Features\n- Heatmaps of commit frequency and peak productivity hours.\n- Language distribution radar charts.\n- Pull request lifecycle analytics.`,
          tech_stack: JSON.stringify(['React', 'Recharts', 'Express', 'REST API', 'Tailwind CSS']),
          image_url: 'https://images.unsplash.com/photo-1504868584819-f8e8b4b6d7e3?w=800&auto=format&fit=crop&q=80',
          live_demo_url: 'https://devmetrics.example.com',
          github_url: 'https://github.com/alexrivera-dev/devmetrics-dashboard',
          is_published: 0,
          is_featured: 0,
          display_order: 4
        }
      ];

      for (const p of sampleProjects) {
        await dbRun(
          `INSERT INTO projects (title, short_description, detailed_description, tech_stack, image_url, live_demo_url, github_url, is_published, is_featured, display_order)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            p.title, p.short_description, p.detailed_description, p.tech_stack,
            p.image_url, p.live_demo_url, p.github_url, p.is_published, p.is_featured, p.display_order
          ]
        );
      }

      return res.json({ success: true, message: 'Sample projects reset successfully.' });
    } catch (err: any) {
      return res.status(500).json({ error: 'Failed to reset sample projects.' });
    }
  });

  // Serve static uploads
  app.use('/uploads', express.static(uploadsDir));

  // ==========================================
  // VITE MIDDLEWARE / PRODUCTION STATIC SERVE
  // ==========================================
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Student Portfolio & CMS server running on port ${PORT}`);
  });
}

startServer();
