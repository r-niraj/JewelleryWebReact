const prisma = require('../../lib/prisma');

module.exports = async function handler(req, res) {
  try {
    const { items } = req.body;
    if (!Array.isArray(items)) {
      return res.status(400).json({ success: false, error: 'items array required' });
    }

    for (const item of items) {
      if (item.id && item.displayOrder !== undefined) {
        await prisma.mediaLibrary.update({
          where: { id: item.id },
          data: { displayOrder: item.displayOrder },
        });
        await prisma.sectionImage.updateMany({
          where: { mediaId: item.id },
          data: { displayOrder: item.displayOrder },
        });
      }
    }

    return res.json({ success: true });
  } catch (error) {
    console.error('Reorder error:', error);
    return res.status(500).json({ success: false, error: 'Failed to reorder' });
  }
};
