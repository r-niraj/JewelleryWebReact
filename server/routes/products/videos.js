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

    const { videoUrl } = req.body;
    if (!videoUrl) {
      return res.status(400).json({ success: false, error: 'videoUrl is required' });
    }

    const maxOrder = await prisma.productVideo.aggregate({
      where: { productId: product.id },
      _max: { displayOrder: true },
    });

    const video = await prisma.productVideo.create({
      data: {
        productId: product.id,
        videoUrl,
        displayOrder: (maxOrder._max.displayOrder ?? -1) + 1,
      },
    });

    return res.status(201).json({ success: true, video });
  } catch (error) {
    console.error('Product video POST error:', error);
    return res.status(500).json({ success: false, error: 'Failed to add video' });
  }
}

async function deleteHandler(req, res) {
  try {
    const { slug } = req.params;
    const videoId = parseInt(req.query.id || '');
    if (!videoId) {
      return res.status(400).json({ success: false, error: 'Video ID required' });
    }

    const product = await prisma.product.findUnique({ where: { slug } });
    if (!product) {
      return res.status(404).json({ success: false, error: 'Product not found' });
    }

    await prisma.productVideo.deleteMany({
      where: { id: videoId, productId: product.id },
    });

    return res.json({ success: true });
  } catch (error) {
    console.error('Product video DELETE error:', error);
    return res.status(500).json({ success: false, error: 'Failed to delete video' });
  }
}
