import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import multer from 'multer';
import { Resend } from 'resend';
import { query, initDb } from './database.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || 'secret';
initDb();

const resend = new Resend(process.env.RESEND_API_KEY);
const EMAIL_FROM = 'OLX Marketplace <onboarding@resend.dev>';

app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir)
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
    cb(null, uniqueSuffix + path.extname(file.originalname))
  }
});
const upload = multer({ storage: storage });
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.sendStatus(401);

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
};

const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      logAction('Access Denied', req.user ? req.user.id : null, `User tried to access restricted route with role: ${req.user ? req.user.role : 'none'}`);
      return res.status(403).json({ error: 'Access denied: Insufficient permissions' });
    }
    next();
  };
};

const logAction = async (action, userId, details = '') => {
  try {
    await query('INSERT INTO Logs (action, user_id, details) VALUES ($1, $2, $3)', [action, userId, details]);
    console.log(`[LOG] ${action} by User ${userId}: ${details}`);
  } catch (err) {
    console.error('Failed to write log:', err);
  }
};


app.get('/api/test-email', async (req, res) => {
  try {
    const { data, error } = await resend.emails.send({
      from: EMAIL_FROM,
      to: process.env.EMAIL_USER,
      subject: 'Render Test Email (Resend)',
      html: '<p>If you see this, email sending works on Render via Resend.</p>'
    });
    if (error) {
      return res.json({ success: false, error });
    }
    res.json({ success: true, data, user: process.env.EMAIL_USER });
  } catch (error) {
    res.json({ success: false, error: error.message, stack: error.stack, user: process.env.EMAIL_USER });
  }
});

app.post('/api/auth/register', async (req, res) => {
  try {
    const { name, phone, email, password } = req.body;
    if (!name || !phone || !password) {
      return res.status(400).json({ error: 'Name, phone, and password are required' });
    }
    const userExist = await query('SELECT * FROM users WHERE phone = $1 OR email = $2', [phone, email || null]);
    if (userExist.rows.length > 0) {
      return res.status(400).json({ error: 'Бұл телефон нөмірі немесе email қазірдің өзінде тіркелген.' });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const userRole = 'buyer';

    const result = await query(
      'INSERT INTO users (name, phone, email, password, role, balance, is_verified) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id, name, phone, email, role, balance',
      [name, phone, email || null, hashedPassword, userRole, 100000, true]
    );

    const newUser = result.rows[0];

    const token = jwt.sign({ id: newUser.id, name: newUser.name, phone: newUser.phone, role: newUser.role }, JWT_SECRET, { expiresIn: '24h' });

    logAction('User Registered', newUser.id, `Role: ${newUser.role}`);
    res.status(201).json({ token, user: newUser, message: 'Тіркелу сәтті!' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Registration failed' });
  }
});

app.get('/api/auth/profile', authenticateToken, async (req, res) => {
  try {
    const result = await query('SELECT id, name, phone, role FROM users WHERE id = $1', [req.user.id]);
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
});

app.put('/api/auth/profile', authenticateToken, async (req, res) => {
  try {
    const { name, phone } = req.body;
    const result = await query(
      'UPDATE users SET name = $1, phone = $2 WHERE id = $3 RETURNING id, name, phone, role',
      [name, phone, req.user.id]
    );
    logAction('Profile Updated', req.user.id, `Name: ${name}, Phone: ${phone}`);
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { phone, password } = req.body;

    const result = await query('SELECT * FROM users WHERE phone = $1', [phone]);
    const user = result.rows[0];

    if (!user) {
      return res.status(400).json({ error: 'User not found' });
    }

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(400).json({ error: 'Invalid password' });
    }

    const token = jwt.sign({ id: user.id, name: user.name, phone: user.phone, role: user.role }, JWT_SECRET, { expiresIn: '24h' });

    logAction('User Login', user.id);
    res.json({ token, user: { id: user.id, name: user.name, phone: user.phone, role: user.role, balance: user.balance } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Login failed' });
  }
});

app.post('/api/auth/reset-password', async (req, res) => {
  try {
    const { phone, password } = req.body;
    if (!phone || !password) return res.status(400).json({ error: 'Мәліметтер толық емес' });
    const userExist = await query('SELECT * FROM users WHERE phone = $1', [phone]);
    if (userExist.rows.length === 0) return res.status(404).json({ error: 'Пайдаланушы табылмады' });
    const hashedPassword = await bcrypt.hash(password, 10);
    await query('UPDATE users SET password = $1 WHERE phone = $2', [hashedPassword, phone]);
    logAction('Password Reset', userExist.rows[0].id, 'Password changed via reset');
    res.json({ message: 'Құпия сөз сәтті өзгертілді' });
  } catch (err) {
    res.status(500).json({ error: 'Қате кетті' });
  }
});

app.post('/api/auth/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;
    const userResult = await query('SELECT * FROM users WHERE email = $1', [email]);
    const user = userResult.rows[0];

    if (!user) {
      return res.status(404).json({ error: 'Бұл email тіркелмеген' });
    }

    const resetToken = jwt.sign({ id: user.id }, JWT_SECRET, { expiresIn: '15m' });
    const frontendUrl = process.env.FRONTEND_URL || (req.protocol + '://' + req.get('host'));
    const resetLink = `${frontendUrl}/reset-password?token=${resetToken}`;

    // Send email in background to prevent hanging
    resend.emails.send({
      from: EMAIL_FROM,
      to: email,
      subject: 'Құпия сөзді қалпына келтіру',
      html: `
        <h3>Құпия сөзіңізді ұмыттыңыз ба?</h3>
        <p>Жаңа құпия сөз орнату үшін төмендегі сілтемені басыңыз:</p>
        <a href="${resetLink}" style="background: blue; color: white; padding: 10px; text-decoration: none; border-radius: 5px;">Құпия сөзді өзгерту</a>
        <p>Сілтеме тек <b>15 минутқа</b> ғана жарамды.</p>
      `
    }).then(({ data, error }) => {
        if (error) console.error('Resend error:', error);
    }).catch(err => console.error('Background email error:', err));

    res.json({ message: 'Сілтеме email-ге жіберілді. Поштаңызды тексеріңіз.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Қате кетті, хат жіберілмеді.' });
  }
});

app.post('/api/auth/reset-password-confirm', async (req, res) => {
  try {
    const { token, newPassword } = req.body;
    if (!token || !newPassword) return res.status(400).json({ error: 'Токен мен жаңа құпия сөз қажет' });

    const decoded = jwt.verify(token, JWT_SECRET);
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await query('UPDATE users SET password = $1 WHERE id = $2', [hashedPassword, decoded.id]);

    logAction('Password Reset via Email', decoded.id, 'Password changed via email link');
    res.json({ message: 'Құпия сөзіңіз сәтті өзгертілді! Енді кіре аласыз.' });
  } catch (err) {
    res.status(400).json({ error: 'Сілтеме жарамсыз немесе мерзімі бітіп қалған.' });
  }
});

app.post('/api/auth/verify-email', async (req, res) => {
  try {
    const { token } = req.body;
    const user = await query('SELECT * FROM users WHERE verification_token = $1', [token]);
    
    if (user.rows.length === 0) {
      return res.status(400).json({ error: 'Растау коды қате немесе ескірген' });
    }

    await query('UPDATE users SET is_verified = TRUE, verification_token = NULL WHERE id = $1', [user.rows[0].id]);
    res.json({ message: 'Электрондық пошта сәтті расталды!' });
  } catch (err) {
    res.status(500).json({ error: 'Растау кезінде қате кетті' });
  }
});

// Reviews API
app.get('/api/products/:id/reviews', async (req, res) => {
  try {
    const result = await query(
      'SELECT r.*, u.name as user_name FROM reviews r JOIN users u ON r.user_id = u.id WHERE r.product_id = $1 ORDER BY r.created_at DESC',
      [req.params.id]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch reviews' });
  }
});

app.post('/api/products/:id/view', async (req, res) => {
  try {
    await query('UPDATE products SET views = views + 1 WHERE id = $1', [req.params.id]);
    res.json({ message: 'View incremented' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to increment view' });
  }
});

app.post('/api/products/:id/reviews', authenticateToken, async (req, res) => {
  try {
    const { rating, comment } = req.body;
    const result = await query(
      'INSERT INTO reviews (product_id, user_id, rating, comment) VALUES ($1, $2, $3, $4) RETURNING *',
      [req.params.id, req.user.id, rating, comment]
    );
    logAction('Review Added', req.user.id, `Product ID: ${req.params.id}, Rating: ${rating}`);
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Failed to add review' });
  }
});

app.get('/api/products', async (req, res) => {
  try {
    const result = await query(`
      SELECT p.*, u.name as seller_name, 
      (SELECT AVG(rating) FROM reviews WHERE product_id = p.id) as avg_rating,
      (SELECT COUNT(*) FROM reviews WHERE product_id = p.id) as reviews_count
      FROM products p 
      JOIN users u ON p.seller_id = u.id 
      WHERE p.status = 'available' 
      ORDER BY p.id DESC
    `);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch products' });
  }
});

app.get('/api/my-products', authenticateToken, authorizeRoles('admin', 'seller'), async (req, res) => {
  try {
    const result = await query('SELECT * FROM products WHERE seller_id = $1 ORDER BY id DESC', [req.user.id]);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch your products' });
  }
});

app.post('/api/upload', authenticateToken, upload.single('image'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
  const baseUrl = req.protocol + '://' + req.get('host');
  const imageUrl = `${baseUrl}/uploads/${req.file.filename}`;
  res.json({ url: imageUrl });
});

app.post('/api/products', authenticateToken, authorizeRoles('admin', 'seller'), async (req, res) => {
  try {
    const { title, description, price, image_url, category } = req.body;
    const result = await query(
      'INSERT INTO products (title, description, price, image_url, category, seller_id) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
      [title, description || '', price, image_url || '', category || 'Басқа', req.user.id]
    );
    logAction('Product Created', req.user.id, `Product: ${title}`);
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create product' });
  }
});

app.put('/api/products/:id', authenticateToken, authorizeRoles('admin', 'seller'), async (req, res) => {
  try {
    const { title, description, price, image_url, status, category } = req.body;

    const prodCheck = await query('SELECT seller_id FROM products WHERE id = $1', [req.params.id]);
    if (prodCheck.rows.length === 0) return res.status(404).json({ error: 'Product not found' });
    
    if (req.user.role !== 'admin' && prodCheck.rows[0].seller_id !== req.user.id) {
      return res.status(403).json({ error: 'Unauthorized to edit this product' });
    }

    const result = await query(
      'UPDATE products SET title = $1, description = $2, price = $3, image_url = $4, status = $5, category = $6 WHERE id = $7 RETURNING *',
      [title, description || '', price, image_url || '', status || 'available', category || 'Басқа', req.params.id]
    );
    logAction('Product Updated', req.user.id, `Product ID: ${req.params.id}`);
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update product' });
  }
});

app.delete('/api/products/:id', authenticateToken, authorizeRoles('admin', 'seller'), async (req, res) => {
  try {
    const prodCheck = await query('SELECT seller_id FROM products WHERE id = $1', [req.params.id]);
    if (prodCheck.rows.length === 0) return res.status(404).json({ error: 'Product not found' });

    if (req.user.role !== 'admin' && prodCheck.rows[0].seller_id !== req.user.id) {
      return res.status(403).json({ error: 'Unauthorized to delete this product' });
    }

    await query('DELETE FROM products WHERE id = $1', [req.params.id]);
    logAction('Product Deleted', req.user.id, `Product ID: ${req.params.id}`);
    res.status(204).send();
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to delete product' });
  }
});



app.post('/api/orders', authenticateToken, async (req, res) => {
  try {
    const { product_id } = req.body;
    
    const prodRes = await query('SELECT seller_id, title FROM products WHERE id = $1', [product_id]);
    const product = prodRes.rows[0];

    await query(
      'INSERT INTO orders (product_id, buyer_id) VALUES ($1, $2)',
      [product_id, req.user.id]
    );

    await query(
      'INSERT INTO notifications (user_id, message, type) VALUES ($1, $2, $3)',
      [product.seller_id, `Жаңа тапсырыс: ${product.title}`, 'order']
    );

    logAction('Product Order', req.user.id, `Product ID: ${product_id}`);
    res.status(201).json({ message: 'Order placed successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to place order' });
  }
});

app.get('/api/favorites', authenticateToken, async (req, res) => {
  try {
    const result = await query(
      'SELECT f.product_id, p.*, u.name as seller_name FROM favorites f JOIN products p ON f.product_id = p.id JOIN users u ON p.seller_id = u.id WHERE f.user_id = $1 ORDER BY f.created_at DESC',
      [req.user.id]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch favorites' });
  }
});

app.post('/api/favorites', authenticateToken, async (req, res) => {
  try {
    const { product_id } = req.body;
    await query('INSERT INTO favorites (user_id, product_id) VALUES ($1, $2) ON CONFLICT DO NOTHING', [req.user.id, product_id]);
    res.status(201).json({ message: 'Added to favorites' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to add favorite' });
  }
});

app.delete('/api/favorites/:id', authenticateToken, async (req, res) => {
  try {
    await query('DELETE FROM favorites WHERE user_id = $1 AND product_id = $2', [req.user.id, req.params.id]);
    res.status(204).send();
  } catch (err) {
    res.status(500).json({ error: 'Failed to remove favorite' });
  }
});

app.get('/api/notifications', authenticateToken, async (req, res) => {
  try {
    const result = await query('SELECT * FROM notifications WHERE user_id = $1 ORDER BY created_at DESC LIMIT 50', [req.user.id]);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch notifications' });
  }
});

app.get('/api/notifications/unread-count', authenticateToken, async (req, res) => {
  try {
    const result = await query('SELECT COUNT(*) FROM notifications WHERE user_id = $1 AND is_read = FALSE', [req.user.id]);
    res.json({ count: parseInt(result.rows[0].count) });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch unread count' });
  }
});

app.put('/api/notifications/read', authenticateToken, async (req, res) => {
  try {
    await query('UPDATE notifications SET is_read = TRUE WHERE user_id = $1', [req.user.id]);
    res.json({ message: 'Notifications marked as read' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update notifications' });
  }
});

app.patch('/api/notifications/:id/read', authenticateToken, async (req, res) => {
  try {
    const notif = await query('SELECT * FROM notifications WHERE id = $1 AND user_id = $2', [req.params.id, req.user.id]);
    if (notif.rows.length === 0) return res.status(404).json({ error: 'Notification not found' });
    await query('UPDATE notifications SET is_read = TRUE WHERE id = $1', [req.params.id]);
    res.json({ message: 'Marked as read' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to mark notification' });
  }
});

app.post('/api/messages', authenticateToken, async (req, res) => {
  try {
    const { receiver_id, message_text } = req.body;
    if (!message_text || message_text.trim().length === 0) {
      return res.status(400).json({ error: 'Хабарлама бос болмауы керек' });
    }
    if (message_text.length > 2000) {
      return res.status(400).json({ error: 'Хабарлама тым ұзын (макс 2000 таңба)' });
    }
    if (parseInt(receiver_id) === req.user.id) {
      return res.status(400).json({ error: 'Өзіңізге хабарлама жібере алмайсыз' });
    }
    const userCheck = await query('SELECT id, name FROM users WHERE id = $1', [receiver_id]);
    if (userCheck.rows.length === 0) return res.status(404).json({ error: 'User not found' });

    const result = await query(
      'INSERT INTO messages (sender_id, receiver_id, message_text) VALUES ($1, $2, $3) RETURNING *',
      [req.user.id, receiver_id, message_text.trim()]
    );
    const newMessage = result.rows[0];
    io.to(`user_${receiver_id}`).emit('new_message', newMessage);
    res.status(201).json(newMessage);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to send message' });
  }
});

app.get('/api/messages/:userId', authenticateToken, async (req, res) => {
  try {
    const otherId = parseInt(req.params.userId);
    const result = await query(
      `SELECT m.*, s.name as sender_name, r.name as receiver_name
       FROM messages m
       JOIN users s ON m.sender_id = s.id
       JOIN users r ON m.receiver_id = r.id
       WHERE (m.sender_id = $1 AND m.receiver_id = $2) OR (m.sender_id = $2 AND m.receiver_id = $1)
       ORDER BY m.created_at ASC`,
      [req.user.id, otherId]
    );
    await query(
      'UPDATE messages SET is_read = TRUE WHERE sender_id = $1 AND receiver_id = $2 AND is_read = FALSE',
      [otherId, req.user.id]
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch messages' });
  }
});

app.get('/api/messages-unread-count', authenticateToken, async (req, res) => {
  try {
    const result = await query('SELECT COUNT(*) FROM messages WHERE receiver_id = $1 AND is_read = FALSE', [req.user.id]);
    res.json({ count: parseInt(result.rows[0].count) });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch unread messages count' });
  }
});

app.get('/api/conversations', authenticateToken, async (req, res) => {
  try {
    const result = await query(`
      SELECT DISTINCT ON (other_id) other_id, other_name, last_message, last_time, unread
      FROM (
        SELECT 
          CASE WHEN m.sender_id = $1 THEN m.receiver_id ELSE m.sender_id END as other_id,
          CASE WHEN m.sender_id = $1 THEN r.name ELSE s.name END as other_name,
          m.message_text as last_message,
          m.created_at as last_time,
          CASE WHEN m.receiver_id = $1 AND m.is_read = FALSE THEN 1 ELSE 0 END as unread
        FROM messages m
        JOIN users s ON m.sender_id = s.id
        JOIN users r ON m.receiver_id = r.id
        WHERE m.sender_id = $1 OR m.receiver_id = $1
        ORDER BY m.created_at DESC
      ) sub
      ORDER BY other_id, last_time DESC
    `, [req.user.id]);

    const unreadRes = await query(`
      SELECT sender_id, COUNT(*) as cnt FROM messages 
      WHERE receiver_id = $1 AND is_read = FALSE 
      GROUP BY sender_id
    `, [req.user.id]);
    const unreadMap = {};
    unreadRes.rows.forEach(r => { unreadMap[r.sender_id] = parseInt(r.cnt); });

    const conversations = result.rows.map(r => ({
      ...r,
      unread_count: unreadMap[r.other_id] || 0
    }));
    conversations.sort((a, b) => new Date(b.last_time) - new Date(a.last_time));
    res.json(conversations);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch conversations' });
  }
});

app.get('/api/users-list', authenticateToken, async (req, res) => {
  try {
    const result = await query('SELECT id, name, role FROM users WHERE id != $1 ORDER BY name', [req.user.id]);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

app.get('/api/seller/stats', authenticateToken, authorizeRoles('admin', 'seller'), async (req, res) => {
  try {
    const totalSales = await query('SELECT COUNT(*) FROM orders o JOIN products p ON o.product_id = p.id WHERE p.seller_id = $1', [req.user.id]);
    const revenue = await query('SELECT SUM(p.price) FROM orders o JOIN products p ON o.product_id = p.id WHERE p.seller_id = $1', [req.user.id]);
    const productsCount = await query('SELECT COUNT(*) FROM products WHERE seller_id = $1', [req.user.id]);
    const totalViews = await query('SELECT SUM(views) FROM products WHERE seller_id = $1', [req.user.id]);
    const avgRating = await query(`
      SELECT AVG(r.rating) 
      FROM reviews r 
      JOIN products p ON r.product_id = p.id 
      WHERE p.seller_id = $1
    `, [req.user.id]);
    
    res.json({
      sales: parseInt(totalSales.rows[0].count),
      revenue: parseFloat(revenue.rows[0].sum || 0),
      products: parseInt(productsCount.rows[0].count),
      views: parseInt(totalViews.rows[0].sum || 0),
      rating: parseFloat(avgRating.rows[0].avg || 0).toFixed(1)
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch seller stats' });
  }
});

app.get('/api/orders', authenticateToken, async (req, res) => {
  try {
    const result = await query(
      `SELECT o.id as order_id, o.ordered_at, p.*, u.name as seller_name 
       FROM orders o 
       JOIN products p ON o.product_id = p.id 
       JOIN users u ON p.seller_id = u.id
       WHERE o.buyer_id = $1`,
      [req.user.id]
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
});

app.get('/api/admin/users', authenticateToken, authorizeRoles('admin'), async (req, res) => {
  try {
    const result = await query('SELECT id, name, phone, role, balance FROM users ORDER BY id ASC');
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

app.get('/api/admin/logs', authenticateToken, authorizeRoles('admin'), async (req, res) => {
  try {
    const result = await query('SELECT l.*, u.name as user_name FROM logs l LEFT JOIN users u ON l.user_id = u.id ORDER BY l.id DESC LIMIT 100');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch logs' });
  }
});

app.get('/api/admin/orders', authenticateToken, authorizeRoles('admin'), async (req, res) => {
  try {
    const result = await query(`
      SELECT o.id as order_id, o.ordered_at, p.title, p.price, u.name as buyer_name, s.name as seller_name
      FROM orders o
      JOIN products p ON o.product_id = p.id
      JOIN users u ON o.buyer_id = u.id
      JOIN users s ON p.seller_id = s.id
      ORDER BY o.id DESC
    `);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch all orders' });
  }
});

app.put('/api/admin/users/:id/role', authenticateToken, authorizeRoles('admin'), async (req, res) => {
  try {
    const { role } = req.body;
    const result = await query('UPDATE users SET role = $1 WHERE id = $2 RETURNING id, name, role', [role, req.params.id]);
    logAction('Admin: Role Changed', req.user.id, `User ID: ${req.params.id} to ${role}`);
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update role' });
  }
});

app.delete('/api/admin/users/:id', authenticateToken, authorizeRoles('admin'), async (req, res) => {
  try {
    if (parseInt(req.params.id) === req.user.id) {
        return res.status(400).json({ error: 'Cannot delete yourself' });
    }
    await query('DELETE FROM users WHERE id = $1', [req.params.id]);
    logAction('Admin: User Deleted', req.user.id, `User ID: ${req.params.id}`);
    res.status(204).send();
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to delete user' });
  }
});

app.post('/api/seller-request', authenticateToken, async (req, res) => {
  try {
    const { reason } = req.body;
    if (req.user.role !== 'buyer') {
      return res.status(400).json({ error: 'Тек сатып алушылар ғана өтінім бере алады' });
    }
    const existing = await query(
      'SELECT * FROM seller_requests WHERE user_id = $1 AND status = $2',
      [req.user.id, 'pending']
    );
    if (existing.rows.length > 0) {
      return res.status(400).json({ error: 'Сіздің өтінімді әлі қаралуда' });
    }
    await query(
      'INSERT INTO seller_requests (user_id, reason) VALUES ($1, $2)',
      [req.user.id, reason || '']
    );
    await query(
      'INSERT INTO notifications (user_id, message, type) VALUES ((SELECT id FROM users WHERE role = $1 LIMIT 1), $2, $3)',
      ['admin', `Жаңа сатушы өтінімі: ${req.user.name}`, 'seller_request']
    );
    logAction('Seller Request', req.user.id, `Reason: ${reason}`);
    res.status(201).json({ message: 'Өтінім сәтті жіберілді' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to submit request' });
  }
});

app.get('/api/seller-request/status', authenticateToken, async (req, res) => {
  try {
    const result = await query(
      'SELECT * FROM seller_requests WHERE user_id = $1 ORDER BY created_at DESC LIMIT 1',
      [req.user.id]
    );
    res.json(result.rows[0] || null);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch request status' });
  }
});

app.get('/api/admin/seller-requests', authenticateToken, authorizeRoles('admin'), async (req, res) => {
  try {
    const result = await query(`
      SELECT sr.*, u.name as user_name, u.phone as user_phone
      FROM seller_requests sr
      JOIN users u ON sr.user_id = u.id
      ORDER BY sr.created_at DESC
    `);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch seller requests' });
  }
});

app.put('/api/admin/seller-requests/:id/approve', authenticateToken, authorizeRoles('admin'), async (req, res) => {
  try {
    const reqData = await query('SELECT * FROM seller_requests WHERE id = $1', [req.params.id]);
    if (reqData.rows.length === 0) return res.status(404).json({ error: 'Request not found' });
    
    const userId = reqData.rows[0].user_id;
    await query('UPDATE seller_requests SET status = $1 WHERE id = $2', ['approved', req.params.id]);
    await query('UPDATE users SET role = $1 WHERE id = $2', ['seller', userId]);
    await query(
      'INSERT INTO notifications (user_id, message, type) VALUES ($1, $2, $3)',
      [userId, 'Құттықтаймыз! Сатушы өтінімі бекітілді. Енді тауар қоса аласыз.', 'approved']
    );
    logAction('Admin: Seller Approved', req.user.id, `User ID: ${userId}`);
    res.json({ message: 'Approved' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to approve' });
  }
});

app.put('/api/admin/seller-requests/:id/reject', authenticateToken, authorizeRoles('admin'), async (req, res) => {
  try {
    const reqData = await query('SELECT * FROM seller_requests WHERE id = $1', [req.params.id]);
    if (reqData.rows.length === 0) return res.status(404).json({ error: 'Request not found' });
    
    const userId = reqData.rows[0].user_id;
    await query('UPDATE seller_requests SET status = $1 WHERE id = $2', ['rejected', req.params.id]);
    await query(
      'INSERT INTO notifications (user_id, message, type) VALUES ($1, $2, $3)',
      [userId, 'Сатушы өтінімі қабылданбады. Себебі туралы байланысқа шығыңыз.', 'rejected']
    );
    logAction('Admin: Seller Rejected', req.user.id, `User ID: ${userId}`);
    res.json({ message: 'Rejected' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to reject' });
  }
});

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use(express.static(path.join(__dirname, 'dist')));
app.get(/^(?!\/api).*$/, (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

// Socket.io logic
io.on('connection', (socket) => {
  socket.on('join', (userId) => {
    socket.join(`user_${userId}`);
    console.log(`User joined room: user_${userId}`);
  });

  socket.on('disconnect', () => {
    console.log('User disconnected');
  });
});

server.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
