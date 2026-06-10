const prisma = require('../../lib/prisma');

module.exports = async function handler(req, res) {
  if (req.method === 'GET') return getHandler(req, res);
  if (req.method === 'PUT') return putHandler(req, res);
  return res.status(405).json({ success: false, error: 'Method not allowed' });
};

async function getHandler(req, res) {
  try {
    const sections = await prisma.cTASection.findMany();
    const map = {};
    sections.forEach((s) => {
      map[s.sectionKey] = { buttonText: s.buttonText, headline: s.headline, subheadline: s.subheadline, isVisible: s.isVisible };
    });
    return res.json({ success: true, sections: map });
  } catch (error) {
    console.error('CTA GET error:', error);
    return res.status(500).json({ success: false, error: 'Failed to fetch' });
  }
}

async function putHandler(req, res) {
  try {
    const { sectionKey, buttonText, headline, subheadline, isVisible } = req.body;
    if (!sectionKey?.trim()) return res.status(400).json({ success: false, error: 'sectionKey is required' });
    const section = await prisma.cTASection.upsert({
      where: { sectionKey },
      update: { buttonText, headline, subheadline, isVisible },
      create: { sectionKey, buttonText: buttonText || 'ORDER NOW', headline, subheadline, isVisible },
    });
    return res.json({ success: true, section });
  } catch (error) {
    console.error('CTA PUT error:', error);
    return res.status(500).json({ success: false, error: 'Failed to update' });
  }
}
