const { verifyToken } = require('../lib/auth');

module.exports = async function authMiddleware(req, res, next) {
  const token = req.cookies?.admin_session;
  if (!token) {
    return res.status(401).json({ authenticated: false, error: 'Unauthorized' });
  }
  const payload = await verifyToken(token);
  if (!payload) {
    return res.status(401).json({ authenticated: false, error: 'Invalid token' });
  }
  req.admin = payload;
  next();
};
