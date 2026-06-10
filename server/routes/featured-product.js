const prisma = require('../lib/prisma');

module.exports = async function handler(req, res) {
  try {
    const product = await prisma.product.findFirst({
      where: { isFeatured: true, isActive: true },
      include: {
        images: { orderBy: [{ isPrimary: 'desc' }, { displayOrder: 'asc' }] },
      },
    });

    if (!product) {
      return res.json({ success: true, product: null });
    }

    return res.json({
      success: true,
      product: {
        ...product,
        price: Number(product.price),
        originalPrice: Number(product.originalPrice),
      },
    });
  } catch (error) {
    console.error('Featured product GET error:', error);
    return res.status(500).json({ success: false, error: 'Failed to fetch featured product' });
  }
};
