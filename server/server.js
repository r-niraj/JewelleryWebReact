const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const compression = require('compression');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(compression());
app.use(cors({ origin: true, credentials: true }));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

app.use(express.static(path.join(__dirname, 'public'), { maxAge: '1y', immutable: true }));

const authMiddleware = require('./routes/_auth-middleware');

// Admin routes
app.post('/api/admin/login', require('./routes/admin/login'));
app.post('/api/admin/logout', require('./routes/admin/logout'));
app.get('/api/admin/me', authMiddleware, require('./routes/admin/me'));
app.post('/api/admin/change-password', authMiddleware, require('./routes/admin/change-password'));

// Products
app.get('/api/products', require('./routes/products/index'));
app.post('/api/products', authMiddleware, require('./routes/products/index'));
app.get('/api/products/:slug', require('./routes/products/slug'));
app.put('/api/products/:slug', authMiddleware, require('./routes/products/slug'));
app.delete('/api/products/:slug', authMiddleware, require('./routes/products/slug'));
app.post('/api/products/:slug/images', authMiddleware, require('./routes/products/images'));
app.delete('/api/products/:slug/images', authMiddleware, require('./routes/products/images'));
app.post('/api/products/:slug/videos', authMiddleware, require('./routes/products/videos'));
app.delete('/api/products/:slug/videos', authMiddleware, require('./routes/products/videos'));

// Orders
app.post('/api/orders/create', require('./routes/orders/create'));
app.get('/api/orders/list', authMiddleware, require('./routes/orders/list'));
app.put('/api/orders/status', authMiddleware, require('./routes/orders/status'));
app.get('/api/orders/track', require('./routes/orders/track'));

// Customers
app.get('/api/customers', authMiddleware, require('./routes/customers'));

// Dashboard
app.get('/api/dashboard/stats', authMiddleware, require('./routes/dashboard-stats'));

// Settings
app.get('/api/settings', require('./routes/settings'));
app.post('/api/settings', authMiddleware, require('./routes/settings'));

// Featured product
app.get('/api/featured-product', require('./routes/featured-product'));

// Recent orders
app.get('/api/recent-orders', require('./routes/recent-orders'));

// Content management
app.get('/api/content/hero', require('./routes/content/hero'));
app.put('/api/content/hero', authMiddleware, require('./routes/content/hero'));
app.get('/api/content/gallery', require('./routes/content/gallery'));
app.post('/api/content/gallery', authMiddleware, require('./routes/content/gallery'));
app.put('/api/content/gallery', authMiddleware, require('./routes/content/gallery'));
app.delete('/api/content/gallery', authMiddleware, require('./routes/content/gallery'));
app.get('/api/content/features', require('./routes/content/features'));
app.post('/api/content/features', authMiddleware, require('./routes/content/features'));
app.put('/api/content/features', authMiddleware, require('./routes/content/features'));
app.delete('/api/content/features', authMiddleware, require('./routes/content/features'));
app.get('/api/content/cta', require('./routes/content/cta'));
app.put('/api/content/cta', authMiddleware, require('./routes/content/cta'));
app.get('/api/content/benefits', require('./routes/content/benefits'));
app.post('/api/content/benefits', authMiddleware, require('./routes/content/benefits'));
app.put('/api/content/benefits', authMiddleware, require('./routes/content/benefits'));
app.delete('/api/content/benefits', authMiddleware, require('./routes/content/benefits'));

// Media library
app.get('/api/media', require('./routes/media/index'));
app.post('/api/media', authMiddleware, require('./routes/media/index'));
app.get('/api/media/:id', require('./routes/media/id'));
app.put('/api/media/:id', authMiddleware, require('./routes/media/id'));
app.delete('/api/media/:id', authMiddleware, require('./routes/media/id'));
app.put('/api/media/reorder', authMiddleware, require('./routes/media/reorder'));
app.get('/api/media/section/:key', require('./routes/media/section'));
app.post('/api/media/section/:key', authMiddleware, require('./routes/media/section'));
app.delete('/api/media/section/:key', authMiddleware, require('./routes/media/section'));

// Hero media
app.get('/api/hero-media', require('./routes/hero-media/index'));
app.post('/api/hero-media', authMiddleware, require('./routes/hero-media/index'));
app.put('/api/hero-media/:id', authMiddleware, require('./routes/hero-media/id'));
app.delete('/api/hero-media/:id', authMiddleware, require('./routes/hero-media/id'));

// Analytics tracking (public, rate-limited)
app.use('/api/analytics/track', (req, res, next) => {
  const ip = req.headers['x-forwarded-for']?.split(',')[0]?.trim() || req.socket.remoteAddress;
  if (!req.app._analyticsCount) req.app._analyticsCount = {};
  const key = `track_${ip}_${Math.floor(Date.now() / 60000)}`;
  req.app._analyticsCount[key] = (req.app._analyticsCount[key] || 0) + 1;
  if (req.app._analyticsCount[key] > 100) {
    return res.status(429).json({ error: 'Too many requests' });
  }
  next();
}, require('./routes/analytics/track'));

// Analytics dashboard (auth required)
app.get('/api/analytics/dashboard/:type', authMiddleware, require('./routes/analytics/dashboard'));

// Analytics settings (public GET, auth PUT)
app.get('/api/analytics/settings', require('./routes/analytics/settings'));
app.put('/api/analytics/settings', authMiddleware, require('./routes/analytics/settings'));

// Catch-all for SPA frontend
app.get('*', (req, res) => {
  const indexPath = path.join(__dirname, 'public', 'index.html');
  if (fs.existsSync(indexPath)) {
    res.sendFile(indexPath);
  } else {
    res.status(200).json({ status: 'API is running', message: 'Build the React app for the frontend' });
  }
});

app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({ success: false, error: 'Internal server error' });
});

// Auto-create analytics tables on startup
const sqlPath = path.join(__dirname, 'db-analytics.sql');
if (fs.existsSync(sqlPath)) {
  const { query } = require('./lib/db');
  const statements = fs.readFileSync(sqlPath, 'utf8')
    .split(';')
    .map(s => s.trim())
    .filter(s => s.length > 0 && !s.startsWith('--'));
  (async () => {
    for (const stmt of statements) {
      try { await query(stmt); } catch (e) { console.error('Analytics table init:', e.message); }
    }
    console.log('Analytics tables ready');
  })();
}

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
