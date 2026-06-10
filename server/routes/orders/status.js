const prisma = require('../../lib/prisma');

const ALLOWED_TRANSITIONS = {
  Pending: ['Confirmed', 'Cancelled'],
  Confirmed: ['Packed', 'Cancelled'],
  Packed: ['Shipped'],
  Shipped: ['Out For Delivery'],
  'Out For Delivery': ['Delivered'],
  Delivered: [],
  Cancelled: [],
  Returned: [],
};

module.exports = async function handler(req, res) {
  try {
    const { orderNumber, status: newStatus } = req.body;

    if (!orderNumber) return res.status(400).json({ success: false, error: 'Order number is required' });
    if (!newStatus) return res.status(400).json({ success: false, error: 'Status is required' });

    const validStatuses = ['Pending', 'Confirmed', 'Packed', 'Shipped', 'Out For Delivery', 'Delivered', 'Cancelled', 'Returned'];
    if (!validStatuses.includes(newStatus)) {
      return res.status(400).json({ success: false, error: 'Invalid status value' });
    }

    const order = await prisma.order.findUnique({ where: { orderNumber } });
    if (!order) return res.status(404).json({ success: false, error: 'Order not found' });

    const oldStatus = order.status;
    const allowedNext = ALLOWED_TRANSITIONS[oldStatus];

    if (!allowedNext || !allowedNext.includes(newStatus)) {
      return res.status(400).json({
        success: false,
        error: `Cannot change status from "${oldStatus}" to "${newStatus}". Allowed: ${(allowedNext || []).join(', ') || 'none'}`,
      });
    }

    await prisma.$transaction(async (tx) => {
      await tx.order.update({
        where: { orderNumber },
        data: { status: newStatus },
      });
      await tx.orderStatusHistory.create({
        data: {
          orderId: order.orderId,
          oldStatus,
          newStatus,
          changedBy: 'admin',
        },
      });
    });

    return res.json({ success: true, message: `Order ${orderNumber} updated to "${newStatus}"` });
  } catch (error) {
    console.error('Order status error:', error);
    return res.status(500).json({ success: false, error: 'Failed to update status' });
  }
};
