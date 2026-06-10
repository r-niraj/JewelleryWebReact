const prisma = require('../../lib/prisma');

module.exports = async function handler(req, res) {
  if (req.method === 'GET') return getHandler(req, res);
  if (req.method === 'PUT') return putHandler(req, res);
  if (req.method === 'DELETE') return deleteHandler(req, res);
  return res.status(405).json({ success: false, error: 'Method not allowed' });
};

async function getHandler(req, res) {
  try {
    const { slug } = req.params;
    const product = await prisma.product.findUnique({
      where: { slug, isActive: true },
      include: {
        images: { orderBy: [{ isPrimary: 'desc' }, { displayOrder: 'asc' }] },
        videos: { orderBy: { displayOrder: 'asc' } },
      },
    });

    if (!product) {
      return res.status(404).json({ success: false, error: 'Product not found' });
    }

    const related = await prisma.product.findMany({
      where: {
        isActive: true,
        id: { not: product.id },
        OR: [
          { category: product.category || undefined },
          { isFeatured: true },
        ].filter(Boolean),
      },
      include: { images: { where: { isPrimary: true }, take: 1 } },
      take: 4,
      orderBy: { createdAt: 'desc' },
    });

    const serialized = {
      ...product,
      price: Number(product.price),
      originalPrice: Number(product.originalPrice),
    };
    const serializedRelated = related.map((r) => ({ ...r, price: Number(r.price), originalPrice: Number(r.originalPrice) }));

    return res.json({ success: true, product: serialized, related: serializedRelated });
  } catch (error) {
    console.error('Product detail GET error:', error);
    return res.status(500).json({ success: false, error: 'Failed to fetch product' });
  }
}

async function putHandler(req, res) {
  try {
    const { slug } = req.params;
    const body = req.body;
    const existing = await prisma.product.findUnique({ where: { slug } });
    if (!existing) {
      return res.status(404).json({ success: false, error: 'Product not found' });
    }

    const discountPercentage = body.price && body.originalPrice
      ? Math.round((1 - Number(body.price) / Number(body.originalPrice)) * 100)
      : existing.discountPercentage;

    if (body.isFeatured === true) {
      await prisma.product.updateMany({
        where: { isFeatured: true, id: { not: existing.id } },
        data: { isFeatured: false },
      });
    }

    const product = await prisma.product.update({
      where: { slug },
      data: {
        ...(body.name !== undefined && { name: body.name }),
        ...(body.shortDescription !== undefined && { shortDescription: body.shortDescription }),
        ...(body.fullDescription !== undefined && { fullDescription: body.fullDescription }),
        ...(body.price !== undefined && { price: Number(body.price) }),
        ...(body.originalPrice !== undefined && { originalPrice: Number(body.originalPrice) }),
        ...(discountPercentage !== undefined && { discountPercentage }),
        ...(body.sku !== undefined && { sku: body.sku }),
        ...(body.stockQuantity !== undefined && { stockQuantity: Number(body.stockQuantity) }),
        ...(body.category !== undefined && { category: body.category }),
        ...(body.isActive !== undefined && { isActive: body.isActive }),
        ...(body.isFeatured !== undefined && { isFeatured: body.isFeatured }),
      },
    });

    return res.json({ success: true, product: { ...product, price: Number(product.price), originalPrice: Number(product.originalPrice) } });
  } catch (error) {
    console.error('Product PUT error:', error);
    return res.status(500).json({ success: false, error: 'Failed to update product' });
  }
}

async function deleteHandler(req, res) {
  try {
    const { slug } = req.params;
    await prisma.product.delete({ where: { slug } });
    return res.json({ success: true });
  } catch (error) {
    console.error('Product DELETE error:', error);
    return res.status(500).json({ success: false, error: 'Failed to delete product' });
  }
}
