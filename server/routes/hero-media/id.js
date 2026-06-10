const prisma = require('../../lib/prisma');
const path = require('path');
const fs = require('fs/promises');

module.exports = async function handler(req, res) {
  if (req.method === 'PUT') return putHandler(req, res);
  if (req.method === 'DELETE') return deleteHandler(req, res);
  return res.status(405).json({ success: false, error: 'Method not allowed' });
};

async function putHandler(req, res) {
  try {
    const id = Number(req.params.id);
    const existing = await prisma.heroMedia.findUnique({ where: { id } });
    if (!existing) return res.status(404).json({ success: false, error: 'Not found' });

    if (req.body.isPrimary) {
      await prisma.heroMedia.updateMany({
        where: { isPrimary: true, id: { not: id } },
        data: { isPrimary: false },
      });
    }

    const updateData = {};
    if (req.body.mediaType !== undefined) updateData.mediaType = req.body.mediaType;
    if (req.body.displayOrder !== undefined) updateData.displayOrder = req.body.displayOrder;
    if (req.body.isPrimary !== undefined) updateData.isPrimary = req.body.isPrimary;
    if (req.body.isActive !== undefined) updateData.isActive = req.body.isActive;

    const updated = await prisma.heroMedia.update({
      where: { id },
      data: updateData,
    });

    if (req.body.altText !== undefined) {
      await prisma.mediaLibrary.update({
        where: { id: existing.mediaId },
        data: { altText: req.body.altText },
      });
    }

    return res.json({ success: true, heroItem: updated });
  } catch (error) {
    console.error('Hero media PUT error:', error);
    return res.status(500).json({ success: false, error: 'Failed to update' });
  }
}

async function deleteHandler(req, res) {
  try {
    const id = Number(req.params.id);
    const item = await prisma.heroMedia.findUnique({
      where: { id },
      include: { media: true },
    });
    if (!item) return res.status(404).json({ success: false, error: 'Not found' });

    const filePath = path.join(__dirname, '..', 'public', item.media.fileUrl);
    try { await fs.unlink(filePath); } catch {}

    await prisma.heroMedia.delete({ where: { id } });
    await prisma.mediaLibrary.delete({ where: { id: item.mediaId } });

    return res.json({ success: true });
  } catch (error) {
    console.error('Hero media DELETE error:', error);
    return res.status(500).json({ success: false, error: 'Failed to delete' });
  }
}
