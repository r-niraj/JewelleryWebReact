const prisma = require('../../lib/prisma');
const path = require('path');
const fs = require('fs/promises');

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'video/mp4'];
const MAX_SIZE = 50 * 1024 * 1024;
const UPLOAD_BASE = path.join(__dirname, '..', '..', 'public', 'uploads', 'hero');

module.exports = async function handler(req, res) {
  if (req.method === 'GET') return getHandler(req, res);
  if (req.method === 'POST') return postHandler(req, res);
  return res.status(405).json({ success: false, error: 'Method not allowed' });
};

async function getHandler(req, res) {
  try {
    const items = await prisma.heroMedia.findMany({
      where: { isActive: true },
      include: { media: true },
      orderBy: [{ displayOrder: 'asc' }, { createdAt: 'desc' }],
    });

    const result = items
      .filter((h) => h.media.isActive)
      .map((h) => ({
        id: h.id,
        mediaId: h.media.id,
        mediaType: h.mediaType,
        displayOrder: h.displayOrder,
        isPrimary: h.isPrimary,
        fileUrl: h.media.fileUrl,
        originalName: h.media.originalName,
        altText: h.media.altText,
        width: h.media.width,
        height: h.media.height,
        mimeType: h.media.mimeType,
        fileSize: h.media.fileSize,
      }));
    return res.json({ success: true, media: result });
  } catch (error) {
    console.error('Hero media GET error:', error);
    return res.status(500).json({ success: false, error: 'Failed to fetch hero media' });
  }
}

async function postHandler(req, res) {
  try {
    const contentType = req.headers['content-type'] || '';
    if (!contentType.includes('multipart/form-data')) {
      return res.status(400).json({ success: false, error: 'Expected multipart/form-data' });
    }

    const { formidable } = await import('formidable');
    const form = formidable({ multiples: false, maxFileSize: MAX_SIZE });

    const [fields, files] = await new Promise((resolve, reject) => {
      form.parse(req, (err, fields, files) => {
        if (err) reject(err);
        else resolve([fields, files]);
      });
    });

    const file = files.file?.[0] || files.file;
    if (!file) return res.status(400).json({ success: false, error: 'No file provided' });

    if (!ALLOWED_TYPES.includes(file.mimetype)) {
      return res.status(400).json({ success: false, error: 'Invalid file type. Allowed: jpg, jpeg, png, webp, mp4' });
    }

    const mediaType = file.mimetype.startsWith('video/') ? 'video' : 'image';
    const altText = fields.altText?.[0] || fields.altText || '';
    const setPrimary = (fields.isPrimary?.[0] || fields.isPrimary) === 'true';

    const buffer = await fs.readFile(file.filepath);
    await fs.mkdir(UPLOAD_BASE, { recursive: true });

    let fileName, fileUrl, fileSize, width = 0, height = 0, mimeType = file.mimetype;
    const sanitized = file.originalFilename?.replace(/[^a-zA-Z0-9._-]/g, '_').toLowerCase() || 'file';

    const ext = path.extname(sanitized) || (mediaType === 'image' ? '.webp' : '.mp4');
    const baseName = path.parse(sanitized).name;
    fileName = `${Date.now()}-${baseName}${ext}`;
    fileUrl = `/uploads/hero/${fileName}`;
    fileSize = buffer.length;
    mimeType = file.mimetype;
    await fs.writeFile(path.join(UPLOAD_BASE, fileName), buffer);

    await fs.unlink(file.filepath).catch(() => {});

    const mediaRecord = await prisma.mediaLibrary.create({
      data: {
        fileName,
        originalName: file.originalFilename || fileName,
        fileUrl,
        fileSize,
        mimeType,
        width,
        height,
        altText,
        sectionName: 'hero',
        displayOrder: 0,
        isActive: true,
      },
    });

    if (setPrimary) {
      await prisma.heroMedia.updateMany({
        where: { isPrimary: true },
        data: { isPrimary: false },
      });
    }

    const maxOrder = await prisma.heroMedia.aggregate({ _max: { displayOrder: true } });

    const heroItem = await prisma.heroMedia.create({
      data: {
        mediaId: mediaRecord.id,
        mediaType,
        displayOrder: (maxOrder._max.displayOrder ?? -1) + 1,
        isPrimary: setPrimary,
        isActive: true,
      },
    });

    return res.status(201).json({ success: true, heroItem });
  } catch (error) {
    console.error('Hero media POST error:', error);
    return res.status(500).json({ success: false, error: 'Failed to upload' });
  }
}
