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
    const images = await prisma.galleryImage.findMany({ orderBy: { sortOrder: 'asc' } });
    return res.json({ success: true, images });
  } catch (error) {
    console.error('Gallery GET error:', error);
    return res.status(500).json({ success: false, error: 'Failed to fetch' });
  }
}

async function postHandler(req, res) {
  try {
    const { imageUrl, caption, sectionType = 'gallery', sortOrder = 0, spanClass } = req.body;
    if (!imageUrl?.trim()) return res.status(400).json({ success: false, error: 'Image URL is required' });
    const image = await prisma.galleryImage.create({
      data: { imageUrl, caption, sectionType, sortOrder, spanClass },
    });
    return res.json({ success: true, image });
  } catch (error) {
    console.error('Gallery POST error:', error);
    return res.status(500).json({ success: false, error: 'Failed to create' });
  }
}

async function putHandler(req, res) {
  try {
    const { id, imageUrl, caption, sectionType, sortOrder, spanClass, isActive } = req.body;
    if (!id) return res.status(400).json({ success: false, error: 'ID is required' });
    const image = await prisma.galleryImage.update({
      where: { id },
      data: { imageUrl, caption, sectionType, sortOrder, spanClass, isActive },
    });
    return res.json({ success: true, image });
  } catch (error) {
    console.error('Gallery PUT error:', error);
    return res.status(500).json({ success: false, error: 'Failed to update' });
  }
}

async function deleteHandler(req, res) {
  try {
    const id = Number(req.query.id);
    if (!id) return res.status(400).json({ success: false, error: 'ID is required' });
    await prisma.galleryImage.delete({ where: { id } });
    return res.json({ success: true });
  } catch (error) {
    console.error('Gallery DELETE error:', error);
    return res.status(500).json({ success: false, error: 'Failed to delete' });
  }
}
