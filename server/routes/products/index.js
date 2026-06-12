const prisma = require('../../lib/prisma');

module.exports = async function handler(req, res) {
  if (req.method === 'GET') return getHandler(req, res);
  if (req.method === 'POST') return postHandler(req, res);
  return res.status(405).json({ success: false, error: 'Method not allowed' });
};

async function getHandler(req, res) {
  try {
    const featured = req.query.featured === 'true';
    const category = req.query.category;
    const search = req.query.search;
    const page = Math.max(1, parseInt(req.query.page || '1'));
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit || '20')));
    const skip = (page - 1) * limit;

    const where = {};
    if (req.query.all !== 'true') where.isActive = true;
    if (featured) where.isFeatured = true;
    if (category) where.category = category;
    if (search) {
      where.OR = [
        { name: { contains: search } },
        { shortDescription: { contains: search } },
      ];
    }

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        include: {
          images: { where: { isPrimary: true }, take: 1, orderBy: { displayOrder: 'asc' } },
          videos: { take: 1, orderBy: { displayOrder: 'asc' } },
        },
        orderBy: [{ isFeatured: 'desc' }, { createdAt: 'desc' }],
        skip,
        take: limit,
      }),
      prisma.product.count({ where }),
    ]);

    const serialized = products.map((p) => ({
      ...p,
      price: Number(p.price),
      originalPrice: Number(p.originalPrice),
    }));

    return res.json({ success: true, products: serialized, total, page, limit });
  } catch (error) {
    console.error('Products GET error:', error);
    return res.status(500).json({ success: false, error: 'Failed to fetch products' });
  }
}

async function postHandler(req, res) {
  try {
    const { name, slug, shortDescription, fullDescription, price, originalPrice, sku, stockQuantity, category, isFeatured, detailsMaterials, shippingReturns, careInstructions } = req.body;

    if (!name || !slug || !price) {
      return res.status(400).json({ success: false, error: 'name, slug, and price are required' });
    }

    const discountPercentage = Math.round((1 - Number(price) / Number(originalPrice || price)) * 100);

    if (isFeatured) {
      await prisma.product.updateMany({
        where: { isFeatured: true },
        data: { isFeatured: false },
      });
    }

    const product = await prisma.product.create({
      data: {
        name, slug,
        shortDescription: shortDescription || '',
        fullDescription: fullDescription || '',
        price: Number(price),
        originalPrice: Number(originalPrice || price),
        discountPercentage: discountPercentage > 0 ? discountPercentage : 0,
        sku: sku || '',
        stockQuantity: stockQuantity || 0,
        category: category || null,
        detailsMaterials: detailsMaterials || null,
        shippingReturns: shippingReturns || null,
        careInstructions: careInstructions || null,
        isFeatured: isFeatured || false,
      },
    });

    return res.status(201).json({ success: true, product: { ...product, price: Number(product.price), originalPrice: Number(product.originalPrice) } });
  } catch (error) {
    if (error?.code === 'P2002') {
      return res.status(409).json({ success: false, error: 'A product with this slug already exists' });
    }
    console.error('Products POST error:', error);
    return res.status(500).json({ success: false, error: 'Failed to create product' });
  }
}
