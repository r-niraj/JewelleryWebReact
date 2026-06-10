const prisma = require('../../lib/prisma');
const path = require('path');
const fs = require('fs/promises');

module.exports = async function handler(req, res) {
  if (req.method === 'GET') return getHandler(req, res);
  if (req.method === 'PUT') return putHandler(req, res);
  if (req.method === 'DELETE') return deleteHandler(req, res);
  return res.status(405).json({ success: false, error: 'Method not allowed' });
};

async function getHandler(req, res) {
  try {
    const id = Number(req.params.id);
    const media = await prisma.mediaLibrary.findUnique({ where: { id } });
    if (!media) return res.status(404).json({ success: false, error: 'Not found' });
    return res.json({ success: true, media });
  } catch (error) {
    console.error('Media GET error:', error);
    return res.status(500).json({ success: false, error: 'Failed to fetch media' });
  }
}

async function putHandler(req, res) {
  try {
    const id = Number(req.params.id);
    const existing = await prisma.mediaLibrary.findUnique({ where: { id } });
    if (!existing) return res.status(404).json({ success: false, error: 'Not found' });

    const updateData = {};
    if (req.body.altText !== undefined) updateData.altText = req.body.altText;
    if (req.body.sectionName !== undefined) updateData.sectionName = req.body.sectionName;
    if (req.body.isActive !== undefined) updateData.isActive = req.body.isActive;
    if (req.body.displayOrder !== undefined) updateData.displayOrder = req.body.displayOrder;

    const media = await prisma.mediaLibrary.update({
      where: { id },
      data: updateData,
    });

    return res.json({ success: true, media });
  } catch (error) {
    console.error('Media PUT error:', error);
    return res.status(500).json({ success: false, error: 'Failed to update media' });
  }
}

async function deleteHandler(req, res) {
  try {
    const id = Number(req.params.id);
    const media = await prisma.mediaLibrary.findUnique({ where: { id } });
    if (!media) return res.status(404).json({ success: false, error: 'Not found' });

    const filePath = path.join(__dirname, '..', 'public', media.fileUrl);
    try { await fs.unlink(filePath); } catch {}

    await prisma.mediaLibrary.delete({ where: { id } });

    return res.json({ success: true });
  } catch (error) {
    console.error('Media DELETE error:', error);
    return res.status(500).json({ success: false, error: 'Failed to delete media' });
  }
}
