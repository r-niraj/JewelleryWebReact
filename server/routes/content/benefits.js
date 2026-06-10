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
    const benefits = await prisma.luxuryBenefit.findMany({ orderBy: { sortOrder: 'asc' } });
    return res.json({ success: true, benefits });
  } catch (error) {
    console.error('Benefits GET error:', error);
    return res.status(500).json({ success: false, error: 'Failed to fetch' });
  }
}

async function postHandler(req, res) {
  try {
    const { imageUrl, title, description, sortOrder = 0 } = req.body;
    if (!title?.trim()) return res.status(400).json({ success: false, error: 'Title is required' });
    const benefit = await prisma.luxuryBenefit.create({
      data: { imageUrl, title, description, sortOrder },
    });
    return res.json({ success: true, benefit });
  } catch (error) {
    console.error('Benefits POST error:', error);
    return res.status(500).json({ success: false, error: 'Failed to create' });
  }
}

async function putHandler(req, res) {
  try {
    const { id, imageUrl, title, description, sortOrder, isActive } = req.body;
    if (!id) return res.status(400).json({ success: false, error: 'ID is required' });
    const benefit = await prisma.luxuryBenefit.update({
      where: { id },
      data: { imageUrl, title, description, sortOrder, isActive },
    });
    return res.json({ success: true, benefit });
  } catch (error) {
    console.error('Benefits PUT error:', error);
    return res.status(500).json({ success: false, error: 'Failed to update' });
  }
}

async function deleteHandler(req, res) {
  try {
    const id = Number(req.query.id);
    if (!id) return res.status(400).json({ success: false, error: 'ID is required' });
    await prisma.luxuryBenefit.delete({ where: { id } });
    return res.json({ success: true });
  } catch (error) {
    console.error('Benefits DELETE error:', error);
    return res.status(500).json({ success: false, error: 'Failed to delete' });
  }
}
