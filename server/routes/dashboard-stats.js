const prisma = require('../lib/prisma');

module.exports = async function handler(req, res) {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayEnd = new Date(today);
    todayEnd.setHours(23, 59, 59, 999);

    const [totalOrders, todayOrders, statusCounts, revenueResult] = await Promise.all([
      prisma.order.count(),
      prisma.order.count({ where: { createdAt: { gte: today, lte: todayEnd } } }),
      prisma.order.groupBy({
        by: ['status'],
        _count: { status: true },
      }),
      prisma.order.aggregate({
        _sum: { totalAmount: true },
      }),
    ]);

    const statusMap = {};
    statusCounts.forEach((s) => { statusMap[s.status] = s._count.status; });

    return res.json({
      success: true,
      stats: {
        totalOrders,
        todayOrders,
        pendingOrders: statusMap['Pending'] || 0,
        confirmedOrders: statusMap['Confirmed'] || 0,
        packedOrders: statusMap['Packed'] || 0,
        shippedOrders: statusMap['Shipped'] || 0,
        outForDeliveryOrders: statusMap['Out For Delivery'] || 0,
        deliveredOrders: statusMap['Delivered'] || 0,
        cancelledOrders: statusMap['Cancelled'] || 0,
        returnedOrders: statusMap['Returned'] || 0,
        revenue: Number(revenueResult._sum.totalAmount || 0),
      },
    });
  } catch (error) {
    console.error('Dashboard stats error:', error);
    return res.status(500).json({ success: false, error: 'Failed to fetch stats' });
  }
};
