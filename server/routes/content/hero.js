const prisma = require('../../lib/prisma');

module.exports = async function handler(req, res) {
  if (req.method === 'GET') return getHandler(req, res);
  if (req.method === 'PUT') return putHandler(req, res);
  return res.status(405).json({ success: false, error: 'Method not allowed' });
};

async function getHandler(req, res) {
  try {
    let hero = await prisma.heroContent.findFirst({ where: { isActive: true } });
    if (!hero) {
      hero = await prisma.heroContent.create({
        data: {
          title: 'More Than Jewelry.<br />A Statement of Elegance.',
          subtitle: 'Designed to turn heads. Made to be remembered. Premium fashion jewelry that looks like a fortune.',
          buttonText: 'ORDER NOW',
          badgeText: 'Premium Crystal',
          price: 1299,
          discountPrice: 2499,
        },
      });
    }
    return res.json({ success: true, hero: { ...hero, price: Number(hero.price), discountPrice: Number(hero.discountPrice) } });
  } catch (error) {
    console.error('Hero GET error:', error);
    return res.status(500).json({ success: false, error: 'Failed to fetch' });
  }
}

async function putHandler(req, res) {
  try {
    const { title, subtitle, buttonText, badgeText, price, discountPrice } = req.body;
    let hero = await prisma.heroContent.findFirst({ where: { isActive: true } });
    if (hero) {
      hero = await prisma.heroContent.update({
        where: { id: hero.id },
        data: { title, subtitle, buttonText, badgeText, price: Number(price), discountPrice: Number(discountPrice) },
      });
    } else {
      hero = await prisma.heroContent.create({
        data: { title, subtitle, buttonText, badgeText, price: Number(price), discountPrice: Number(discountPrice) },
      });
    }
    return res.json({ success: true, hero: { ...hero, price: Number(hero.price), discountPrice: Number(hero.discountPrice) } });
  } catch (error) {
    console.error('Hero PUT error:', error);
    return res.status(500).json({ success: false, error: 'Failed to update' });
  }
}
