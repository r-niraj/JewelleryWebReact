const db = require('./lib/db');
const bcrypt = require('bcryptjs');

async function main() {
  console.log('Seeding admin...');
  const hash = await bcrypt.hash('BhagwatBhajan@@', 10);
  const [admins] = await db.pool.execute('SELECT * FROM admins WHERE email = ?', ['admin@shopsastamart.com']);
  if (admins.length === 0) {
    await db.pool.execute(
      'INSERT INTO admins (email, password, name, role) VALUES (?, ?, ?, ?)',
      ['admin@shopsastamart.com', hash, 'Admin', 'admin']
    );
    console.log('Admin created');
  } else {
    await db.pool.execute(
      'UPDATE admins SET password = ? WHERE email = ?',
      [hash, 'admin@shopsastamart.com']
    );
    console.log('Admin password updated');
  }

  console.log('Seeding products...');
  const [existing] = await db.pool.execute('SELECT COUNT(*) AS c FROM products');
  if (existing[0].c > 0) {
    console.log('Products already seeded, skipping');
    return;
  }

  const products = [
    { name: 'Premium Crystal Necklace', slug: 'premium-crystal-necklace', short: 'Designed to turn heads. Made to be remembered. Premium fashion jewelry that looks like a fortune.', full: 'Each piece is meticulously hand-finished by skilled artisans who have spent years perfecting their craft. Our proprietary tarnish-resistant coating ensures your necklace stays brilliant and shiny, wear after wear.', price: 1299, orig: 2499, disc: 48, sku: 'ELG-CRYSTAL-001', stock: 25, cat: 'Crystal Necklaces', featured: true },
    { name: 'Pearl Drop Elegance Necklace', slug: 'pearl-drop-elegance', short: 'Timeless freshwater pearls with a modern drop design for that sophisticated evening look.', full: 'Each pearl is hand-selected for its luster and uniformity, then expertly strung on a delicate chain.', price: 1599, orig: 2999, disc: 46, sku: 'ELG-PEARL-002', stock: 20, cat: 'Pearl Necklaces', featured: true },
    { name: 'Rose Gold Crystal Delight', slug: 'rose-gold-crystal-delight', short: 'Stunning rose gold finish paired with sparkling crystals — a perfect blend of warmth and shine.', full: 'The rose gold plating adds a warm blush tone that complements all skin tones beautifully.', price: 1399, orig: 2799, disc: 50, sku: 'ELG-ROSE-003', stock: 30, cat: 'Crystal Necklaces', featured: true },
    { name: 'Midnight Sapphire Statement', slug: 'midnight-sapphire-statement', short: 'Deep blue sapphire-inspired crystals set in an elegant silver-tone frame.', full: 'Inspired by royal jewels, this statement piece features deep blue crystals that catch the light.', price: 1899, orig: 3499, disc: 45, sku: 'ELG-SAPPHIRE-004', stock: 15, cat: 'Crystal Necklaces', featured: true },
    { name: 'Golden Layered Luxe Necklace', slug: 'golden-layered-luxe', short: 'Two layers of golden elegance for a rich, dimensional look that elevates any outfit.', full: 'The layered design creates depth and movement, making it a standout piece.', price: 1699, orig: 3199, disc: 46, sku: 'ELG-GOLD-005', stock: 22, cat: 'Gold Necklaces', featured: false },
    { name: 'Silver Crystal Waterfall Necklace', slug: 'silver-crystal-waterfall', short: 'Cascading crystals in a silver setting that mimics a shimmering waterfall effect.', full: 'Hundreds of tiny crystals create a waterfall effect that sparkles from every angle.', price: 1499, orig: 2899, disc: 48, sku: 'ELG-SILVER-006', stock: 18, cat: 'Crystal Necklaces', featured: false },
    { name: 'Emerald Cut Crystal Pendant', slug: 'emerald-cut-crystal-pendant', short: 'An emerald-cut center crystal in a classic prong setting on a delicate chain.', full: 'The emerald cut creates a hall-of-mirrors effect that amplifies the crystal brilliance.', price: 1199, orig: 2299, disc: 47, sku: 'ELG-EMERALD-007', stock: 28, cat: 'Crystal Necklaces', featured: false },
    { name: 'Vintage Pearl Choker Set', slug: 'vintage-pearl-choker', short: 'A classic pearl choker with a vintage gold-tone clasp — timeless elegance reimagined.', full: 'Sits gracefully on the collarbone and pairs perfectly with both casual and formal wear.', price: 1299, orig: 2499, disc: 48, sku: 'ELG-VINTAGE-008', stock: 24, cat: 'Pearl Necklaces', featured: true },
  ];

  for (const p of products) {
    const [r] = await db.pool.execute(
      `INSERT INTO products (name, slug, short_description, full_description, price, original_price, discount_percentage, sku, stock_quantity, category, is_featured)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [p.name, p.slug, p.short, p.full, p.price, p.orig, p.disc, p.sku, p.stock, p.cat, p.featured]
    );
    const productId = r.insertId;

    const imageFiles = [
      { file: 'necklace-1.jpeg', primary: false },
      { file: 'necklace-2.jpeg', primary: true },
      { file: 'necklace-3.jpeg', primary: false },
      { file: 'necklace-4.jpeg', primary: false },
      { file: 'necklace-5.jpeg', primary: false },
      { file: 'necklace-6.jpeg', primary: false },
    ];
    for (let i = 0; i < imageFiles.length; i++) {
      await db.pool.execute(
        'INSERT INTO product_images (product_id, image_url, alt_text, display_order, is_primary) VALUES (?, ?, ?, ?, ?)',
        [productId, `/images/${imageFiles[i].file}`, p.name, i, imageFiles[i].primary ? 1 : 0]
      );
    }
    console.log(`  Seeded: ${p.name}`);
  }
  console.log('Done!');
}

main().catch(e => { console.error('Seed error:', e.message); process.exit(1); });
