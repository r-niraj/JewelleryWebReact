const prisma = require('../lib/prisma');

module.exports = async function handler(req, res) {
  try {
    const orders = await prisma.order.findMany({
      take: 10,
      orderBy: { createdAt: 'desc' },
      include: {
        customer: { select: { fullName: true, city: true } },
      },
    });

    const items = orders.map((o) => ({
      name: o.customer.fullName,
      city: o.customer.city || 'India',
      amount: Number(o.totalAmount),
    }));

    return res.json({ success: true, items });
  } catch (error) {
    console.error('Recent orders error:', error);
    return res.status(500).json({ success: false, error: 'Failed to fetch' });
  }
};
