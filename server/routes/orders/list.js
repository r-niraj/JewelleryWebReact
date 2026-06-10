const prisma = require('../../lib/prisma');

module.exports = async function handler(req, res) {
  try {
    const search = req.query.search?.trim();
    const status = req.query.status;
    const page = Math.max(1, parseInt(req.query.page || '1', 10));
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit || '50', 10)));
    const offset = (page - 1) * limit;

    const where = {};
    if (status && status !== 'all') where.status = status;
    if (search) {
      where.OR = [
        { orderNumber: { contains: search } },
        { customer: { fullName: { contains: search } } },
        { customer: { phone: { contains: search } } },
      ];
    }

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where,
        include: {
          customer: { select: { fullName: true, phone: true, address: true, city: true, state: true, pincode: true } },
          items: { select: { id: true, productName: true, productImage: true, quantity: true, unitPrice: true, totalPrice: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip: offset,
        take: limit,
      }),
      prisma.order.count({ where }),
    ]);

    const serialized = orders.map((o) => ({
      ...o,
      totalAmount: Number(o.totalAmount),
      unitPrice: Number(o.unitPrice),
      items: o.items.map((i) => ({ ...i, unitPrice: Number(i.unitPrice), totalPrice: Number(i.totalPrice) })),
    }));

    return res.json({ success: true, orders: serialized, total, page, limit });
  } catch (error) {
    console.error('Order list error:', error);
    return res.status(500).json({ success: false, error: 'Failed to fetch orders' });
  }
};
