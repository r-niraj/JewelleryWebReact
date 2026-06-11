const db = require('../../lib/db');

module.exports = async function handler(req, res) {
  if (req.method === 'GET') return getHandler(req, res);
  if (req.method === 'PUT') return putHandler(req, res);
  return res.status(405).json({ success: false, error: 'Method not allowed' });
};

async function getHandler(req, res) {
  try {
    const rows = await db.query('SELECT * FROM hero_content WHERE isActive = 1 LIMIT 1');
    let hero = rows[0] || null;
    if (!hero) {
      const [r] = await db.query(
        `INSERT INTO hero_content (title, subtitle, buttonText, badgeText, price, discountPrice)
         VALUES (?, ?, ?, ?, ?, ?)`,
        ['More Than Jewelry.<br />A Statement of Elegance.', 'Designed to turn heads. Made to be remembered. Premium fashion jewelry that looks like a fortune.', 'ORDER NOW', 'Premium Crystal', 1299, 2499]
      );
      const inserted = await db.query('SELECT * FROM hero_content WHERE id = ? LIMIT 1', [r.insertId]);
      hero = inserted[0] || null;
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
    const rows = await db.query('SELECT * FROM hero_content WHERE isActive = 1 LIMIT 1');
    if (rows[0]) {
      await db.query(
        'UPDATE hero_content SET title = ?, subtitle = ?, buttonText = ?, badgeText = ?, price = ?, discountPrice = ? WHERE id = ?',
        [title, subtitle, buttonText, badgeText, Number(price), Number(discountPrice), rows[0].id]
      );
    } else {
      await db.query(
        'INSERT INTO hero_content (title, subtitle, buttonText, badgeText, price, discountPrice) VALUES (?, ?, ?, ?, ?, ?)',
        [title, subtitle, buttonText, badgeText, Number(price), Number(discountPrice)]
      );
    }
    const updated = await db.query('SELECT * FROM hero_content WHERE isActive = 1 LIMIT 1');
    return res.json({ success: true, hero: { ...updated[0], price: Number(updated[0].price), discountPrice: Number(updated[0].discountPrice) } });
  } catch (error) {
    console.error('Hero PUT error:', error);
    return res.status(500).json({ success: false, error: 'Failed to update' });
  }
}
