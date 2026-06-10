const prisma = require('../../lib/prisma');

const STATUS_DELAYS = {
  Pending: 0, Confirmed: 1, Packed: 2, Shipped: 4,
  'Out For Delivery': 6, Delivered: 7,
};

async function getOrderWithHistory(orderNumber, phone) {
  const order = await prisma.order.findUnique({
    where: { orderNumber },
    include: {
      customer: { select: { fullName: true, phone: true } },
      statusHistory: { orderBy: { changedAt: 'asc' } },
      items: {
        select: { id: true, productName: true, productImage: true, quantity: true, unitPrice: true, totalPrice: true },
      },
    },
  });
  if (!order) return null;
  if (phone && order.customer.phone !== phone) return null;

  const history = order.statusHistory.map((h) => ({
    oldStatus: h.oldStatus,
    newStatus: h.newStatus,
    changedAt: h.changedAt.toISOString(),
    changedBy: h.changedBy,
  }));

  const delayDays = STATUS_DELAYS[order.status] ?? 0;
  const expected = new Date(order.createdAt);
  expected.setDate(expected.getDate() + delayDays);

  return {
    orderNumber: order.orderNumber,
    status: order.status,
    productName: order.productName,
    quantity: order.quantity,
    totalAmount: Number(order.totalAmount),
    paymentMethod: order.paymentMethod,
    trackingNumber: order.trackingNumber,
    createdAt: order.createdAt.toISOString(),
    expectedDelivery: order.status !== 'Delivered' && order.status !== 'Cancelled' ? expected.toISOString() : null,
    customer: order.customer,
    statusHistory: history,
  };
}

module.exports = async function handler(req, res) {
  try {
    const orderNumber = req.query.orderNumber?.trim();
    const phone = req.query.phone?.trim();

    if (!phone && !orderNumber) {
      return res.status(400).json({
        success: false,
        error: 'Enter your phone number to find your orders',
      });
    }

    if (orderNumber) {
      const order = await getOrderWithHistory(orderNumber, phone || undefined);
      if (!order) {
        return res.status(404).json({
          success: false,
          error: 'Order not found. Check your order number or phone.',
        });
      }
      return res.json({ success: true, orders: [order], single: true });
    }

    const customers = await prisma.customer.findMany({
      where: { phone },
      select: { customerId: true },
    });

    if (customers.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'No orders found for this phone number',
      });
    }

    const orders = await prisma.order.findMany({
      where: { customerId: { in: customers.map((c) => c.customerId) }, customer: { phone } },
      include: {
        customer: { select: { fullName: true, phone: true } },
        statusHistory: { orderBy: { changedAt: 'asc' } },
        items: {
          select: { id: true, productName: true, productImage: true, quantity: true, unitPrice: true, totalPrice: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    const result = orders.map((o) => {
      const history = o.statusHistory.map((h) => ({
        oldStatus: h.oldStatus,
        newStatus: h.newStatus,
        changedAt: h.changedAt.toISOString(),
        changedBy: h.changedBy,
      }));
      const delayDays = STATUS_DELAYS[o.status] ?? 0;
      const expected = new Date(o.createdAt);
      expected.setDate(expected.getDate() + delayDays);
      return {
        orderNumber: o.orderNumber,
        status: o.status,
        productName: o.productName,
        quantity: o.quantity,
        totalAmount: Number(o.totalAmount),
        paymentMethod: o.paymentMethod,
        trackingNumber: o.trackingNumber,
        createdAt: o.createdAt.toISOString(),
        expectedDelivery: o.status !== 'Delivered' && o.status !== 'Cancelled' ? expected.toISOString() : null,
        customer: o.customer,
        statusHistory: history,
      };
    });

    return res.json({ success: true, orders: result, single: false });
  } catch (error) {
    console.error('Order track error:', error);
    return res.status(500).json({ success: false, error: 'Failed to fetch orders' });
  }
};
