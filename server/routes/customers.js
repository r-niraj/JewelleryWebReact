const prisma = require('../lib/prisma');

module.exports = async function handler(req, res) {
  try {
    const search = req.query.search?.trim();

    const where = {};
    if (search) {
      where.OR = [
        { fullName: { contains: search } },
        { phone: { contains: search } },
      ];
    }

    const customers = await prisma.customer.findMany({
      where,
      include: {
        _count: { select: { orders: true } },
        orders: {
          select: { totalAmount: true, createdAt: true },
          orderBy: { createdAt: 'desc' },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    const result = customers.map((c) => ({
      customerId: c.customerId,
      fullName: c.fullName,
      phone: c.phone,
      email: c.email,
      city: c.city,
      state: c.state,
      orderCount: c._count.orders,
      totalSpent: c.orders.reduce((sum, o) => sum + Number(o.totalAmount), 0),
      lastOrderDate: c.orders[0]?.createdAt?.toISOString() || null,
    }));

    return res.json({ success: true, customers: result });
  } catch (error) {
    console.error('Customers error:', error);
    return res.status(500).json({ success: false, error: 'Failed to fetch customers' });
  }
};
