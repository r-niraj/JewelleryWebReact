const prisma = require('../../lib/prisma');

module.exports = async function handler(req, res) {
  if (req.method === 'GET') return getHandler(req, res);
  if (req.method === 'POST') return postHandler(req, res);
  if (req.method === 'PUT') return putHandler(req, res);
  if (req.method === 'DELETE') return deleteHandler(req, res);
  return res.status(405).json({ success: false, error: 'Method not allowed' });
};

async function getHandler(req, res) {
  try {
    const features = await prisma.productFeature.findMany({ orderBy: { sortOrder: 'asc' } });
    return res.json({ success: true, features });
  } catch (error) {
    console.error('Features GET error:', error);
    return res.status(500).json({ success: false, error: 'Failed to fetch' });
  }
}

async function postHandler(req, res) {
  try {
    const { icon, title, description, section = 'why_love', sortOrder = 0 } = req.body;
    if (!title?.trim()) return res.status(400).json({ success: false, error: 'Title is required' });
    const feature = await prisma.productFeature.create({
      data: { icon, title, description, section, sortOrder },
    });
    return res.json({ success: true, feature });
  } catch (error) {
    console.error('Features POST error:', error);
    return res.status(500).json({ success: false, error: 'Failed to create' });
  }
}

async function putHandler(req, res) {
  try {
    const { id, icon, title, description, section, sortOrder, isActive } = req.body;
    if (!id) return res.status(400).json({ success: false, error: 'ID is required' });
    const feature = await prisma.productFeature.update({
      where: { id },
      data: { icon, title, description, section, sortOrder, isActive },
    });
    return res.json({ success: true, feature });
  } catch (error) {
    console.error('Features PUT error:', error);
    return res.status(500).json({ success: false, error: 'Failed to update' });
  }
}

async function deleteHandler(req, res) {
  try {
    const id = Number(req.query.id);
    if (!id) return res.status(400).json({ success: false, error: 'ID is required' });
    await prisma.productFeature.delete({ where: { id } });
    return res.json({ success: true });
  } catch (error) {
    console.error('Features DELETE error:', error);
    return res.status(500).json({ success: false, error: 'Failed to delete' });
  }
}
