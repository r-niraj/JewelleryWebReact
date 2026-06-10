const prisma = require('../../lib/prisma');

module.exports = async function handler(req, res) {
  if (req.method === 'GET') return getHandler(req, res);
  if (req.method === 'POST') return postHandler(req, res);
  if (req.method === 'DELETE') return deleteHandler(req, res);
  return res.status(405).json({ success: false, error: 'Method not allowed' });
};

async function getHandler(req, res) {
  try {
    const { key } = req.params;
    const images = await prisma.sectionImage.findMany({
      where: { sectionKey: key, isActive: true },
      include: { media: true },
      orderBy: { displayOrder: 'asc' },
    });

    const mediaItems = images
      .filter((si) => si.media.isActive)
      .map((si) => ({
        ...si.media,
        linkId: si.id,
      }));

    return res.json({ success: true, media: mediaItems });
  } catch (error) {
    console.error('Section media GET error:', error);
    return res.status(500).json({ success: false, error: 'Failed to fetch section media' });
  }
}

async function postHandler(req, res) {
  try {
    const { key } = req.params;
    const { mediaId } = req.body;
    if (!mediaId) {
      return res.status(400).json({ success: false, error: 'mediaId required' });
    }

    const media = await prisma.mediaLibrary.findUnique({ where: { id: mediaId } });
    if (!media) {
      return res.status(404).json({ success: false, error: 'Media not found' });
    }

    const maxOrder = await prisma.sectionImage.aggregate({
      where: { sectionKey: key },
      _max: { displayOrder: true },
    });

    const link = await prisma.sectionImage.create({
      data: {
        sectionKey: key,
        mediaId,
        displayOrder: (maxOrder._max.displayOrder ?? -1) + 1,
        isActive: true,
      },
    });

    await prisma.mediaLibrary.update({
      where: { id: mediaId },
      data: { sectionName: key },
    });

    return res.status(201).json({ success: true, link });
  } catch (error) {
    console.error('Section link POST error:', error);
    return res.status(500).json({ success: false, error: 'Failed to link media' });
  }
}

async function deleteHandler(req, res) {
  try {
    const { key } = req.params;
    const { mediaId } = req.body;
    if (!mediaId) {
      return res.status(400).json({ success: false, error: 'mediaId required' });
    }

    await prisma.sectionImage.deleteMany({
      where: { sectionKey: key, mediaId },
    });

    return res.json({ success: true });
  } catch (error) {
    console.error('Section link DELETE error:', error);
    return res.status(500).json({ success: false, error: 'Failed to unlink media' });
  }
}
