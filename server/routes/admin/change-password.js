const bcrypt = require('bcryptjs');
const prisma = require('../../lib/prisma');

module.exports = async function handler(req, res) {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ success: false, error: 'Current password and new password are required' });
    }
    if (newPassword.length < 6) {
      return res.status(400).json({ success: false, error: 'New password must be at least 6 characters' });
    }

    const admin = await prisma.admin.findUnique({ where: { adminId: req.admin.adminId } });
    if (!admin) return res.status(404).json({ success: false, error: 'Admin not found' });

    const valid = await bcrypt.compare(currentPassword, admin.password);
    if (!valid) return res.status(401).json({ success: false, error: 'Current password is incorrect' });

    const hash = await bcrypt.hash(newPassword, 10);
    await prisma.admin.update({ where: { adminId: req.admin.adminId }, data: { password: hash } });

    return res.json({ success: true, message: 'Password updated successfully' });
  } catch (error) {
    console.error('Change password error:', error);
    return res.status(500).json({ success: false, error: 'Failed to change password' });
  }
};