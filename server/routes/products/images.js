const prisma = require('../../lib/prisma');

module.exports = async function handler(req, res) {
  if (req.method === 'POST') return postHandler(req, res);
  if (req.method === 'DELETE') return deleteHandler(req, res);
  return res.status(405).json({ success: false, error: 'Method not allowed' });
};

async function postHandler(req, res) {
  try {
    const { slug } = req.params;
    const product = await prisma.product.findUnique({ where: { slug } });
    if (!product) {
      return res.status(404).json({ success: false, error: 'Product not found' });
    }

    const { imageUrl, altText, isPrimary } = req.body;
    if (!imageUrl) {
      return res.status(400).json({ success: false, error: 'imageUrl is required' });
    }

    if (isPrimary) {
      await prisma.productImage.updateMany({
        where: { productId: product.id, isPrimary: true },
        data: { isPrimary: false },
      });
    }

    const maxOrder = await prisma.productImage.aggregate({
      where: { productId: product.id },
      _max: { displayOrder: true },
    });

    const image = await prisma.productImage.create({
      data: {
        productId: product.id,
        imageUrl,
        altText: altText || '',
        displayOrder: (maxOrder._max.displayOrder ?? -1) + 1,
        isPrimary: isPrimary || false,
      },
    });

    return res.status(201).json({ success: true, image });
  } catch (error) {
    console.error('Product image POST error:', error);
    return res.status(500).json({ success: false, error: 'Failed to add image' });
  }
}

async function deleteHandler(req, res) {
  try {
    const { slug } = req.params;
    const imageId = parseInt(req.query.id || '');
    if (!imageId) {
      return res.status(400).json({ success: false, error: 'Image ID required' });
    }

    const product = await prisma.product.findUnique({ where: { slug } });
    if (!product) {
      return res.status(404).json({ success: false, error: 'Product not found' });
    }

    await prisma.productImage.deleteMany({
      where: { id: imageId, productId: product.id },
    });

    return res.json({ success: true });
  } catch (error) {
    console.error('Product image DELETE error:', error);
    return res.status(500).json({ success: false, error: 'Failed to delete image' });
  }
}
