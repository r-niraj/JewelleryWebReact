module.exports = function handler(req, res) {
  res.cookie('admin_session', '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 0,
  });
  return res.json({ success: true });
};
