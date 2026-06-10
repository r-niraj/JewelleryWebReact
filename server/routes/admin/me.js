module.exports = function handler(req, res) {
  return res.json({
    authenticated: true,
    admin: {
      adminId: req.admin.adminId,
      email: req.admin.email,
      role: req.admin.role,
    },
  });
};
