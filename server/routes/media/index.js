const prisma = require('../../lib/prisma');
const sharp = require('sharp');
const path = require('path');
const fs = require('fs/promises');

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_SIZE = 5 * 1024 * 1024;
const UPLOAD_BASE = path.join(__dirname, '..', 'public', 'uploads');

function sanitizeName(name) {
  return name.replace(/[^a-zA-Z0-9._-]/g, '_').toLowerCase();
}

module.exports = async function handler(req, res) {
  if (req.method === 'GET') return getHandler(req, res);
  if (req.method === 'POST') return postHandler(req, res);
  return res.status(405).json({ success: false, error: 'Method not allowed' });
};

async function getHandler(req, res) {
  try {
    const section = req.query.section;
    const isActive = req.query.isActive;
    const where = {};
    if (section) where.sectionName = section;
    if (isActive !== null && isActive !== undefined) where.isActive = isActive === 'true';

    const media = await prisma.mediaLibrary.findMany({
      where,
      orderBy: [{ sectionName: 'asc' }, { displayOrder: 'asc' }, { createdAt: 'desc' }],
    });

    return res.json({ success: true, media });
  } catch (error) {
    console.error('Media GET error:', error);
    return res.status(500).json({ success: false, error: 'Failed to fetch media' });
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
      return res.status(400).json({ success: false, error: 'Invalid file type. Allowed: jpg, jpeg, png, webp' });
    }

    const sectionName = fields.sectionName?.[0] || fields.sectionName || 'general';
    const altText = fields.altText?.[0] || fields.altText || '';

    const buffer = await fs.readFile(file.filepath);
    const metadata = await sharp(buffer).metadata();
    const ext = 'webp';
    const sanitized = sanitizeName(path.parse(file.originalFilename || 'file').name);
    const fileName = `${Date.now()}-${sanitized}.${ext}`;
    const sectionDir = path.join(UPLOAD_BASE, sectionName);
    await fs.mkdir(sectionDir, { recursive: true });

    const webpBuffer = await sharp(buffer).webp({ quality: 80 }).toBuffer();
    const filePath = path.join(sectionDir, fileName);
    await fs.writeFile(filePath, webpBuffer);

    await fs.unlink(file.filepath).catch(() => {});

    const fileUrl = `/uploads/${sectionName}/${fileName}`;

    const maxOrder = await prisma.mediaLibrary.aggregate({
      where: { sectionName },
      _max: { displayOrder: true },
    });

    const media = await prisma.mediaLibrary.create({
      data: {
        fileName,
        originalName: file.originalFilename || fileName,
        fileUrl,
        fileSize: webpBuffer.length,
        mimeType: 'image/webp',
        width: metadata.width || 0,
        height: metadata.height || 0,
        altText,
        sectionName,
        displayOrder: (maxOrder._max.displayOrder ?? -1) + 1,
        isActive: true,
      },
    });

    await prisma.sectionImage.create({
      data: {
        sectionKey: sectionName,
        mediaId: media.id,
        displayOrder: media.displayOrder,
        isActive: true,
      },
    });

    return res.status(201).json({ success: true, media });
  } catch (error) {
    console.error('Media POST error:', error);
    return res.status(500).json({ success: false, error: 'Failed to upload file' });
  }
}
