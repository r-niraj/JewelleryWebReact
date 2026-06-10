const prisma = require('../lib/prisma');

module.exports = async function handler(req, res) {
  if (req.method === 'GET') return getHandler(req, res);
  if (req.method === 'POST') return postHandler(req, res);
  return res.status(405).json({ success: false, error: 'Method not allowed' });
};

async function getHandler(req, res) {
  try {
    const rows = await prisma.setting.findMany();
    const settings = {};
    rows.forEach((r) => { settings[r.key] = r.value; });
    return res.json({ success: true, settings });
  } catch (error) {
    console.error('Settings GET error:', error);
    return res.status(500).json({ success: false, error: 'Failed to fetch settings' });
  }
}

async function postHandler(req, res) {
  try {
    const { key, value } = req.body;
    if (!key?.trim()) return res.status(400).json({ success: false, error: 'Key is required' });

    await prisma.setting.upsert({
      where: { key: key.trim() },
      update: { value: String(value ?? '') },
      create: { key: key.trim(), value: String(value ?? '') },
    });

    return res.json({ success: true });
  } catch (error) {
    console.error('Settings POST error:', error);
    return res.status(500).json({ success: false, error: 'Failed to save setting' });
  }
}
