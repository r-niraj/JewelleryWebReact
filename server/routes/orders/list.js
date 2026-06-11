const db = require('../../lib/db');

module.exports = async function handler(req, res) {
  try {
    const search = req.query.search?.trim();
    const status = req.query.status;
    const page = Math.max(1, parseInt(req.query.page || '1', 10));
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit || '50', 10)));
    const offset = (page - 1) * limit;

    const where = [];
    const params = [];
    if (status && status !== 'all') { where.push('o.status = ?'); params.push(status); }
    if (search) {
      where.push('(o.order_number LIKE ? OR c.full_name LIKE ? OR c.phone LIKE ?)');
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }

    const whereSql = where.length ? 'WHERE ' + where.join(' AND ') : '';

    const [orders, countResult] = await Promise.all([
      db.query(
        `SELECT o.*, c.full_name AS customer_name, c.phone AS customer_phone, c.address AS customer_address, c.city AS customer_city, c.state AS customer_state, c.pincode AS customer_pincode
         FROM orders o LEFT JOIN customers c ON o.customer_id = c.customer_id ${whereSql}
         ORDER BY o.created_at DESC LIMIT ? OFFSET ?`,
        [...params, limit, offset]
      ),
      db.query(
        `SELECT COUNT(*) AS total FROM orders o LEFT JOIN customers c ON o.customer_id = c.customer_id ${whereSql}`,
        params
      ),
    ]);

    const total = Number(countResult[0]?.total ?? 0);

    const orderIds = orders.map(o => o.order_id);
    let itemsMap = {};
    if (orderIds.length) {
      const placeholders = orderIds.map(() => '?').join(',');
      const items = await db.query(
        `SELECT * FROM order_items WHERE order_id IN (${placeholders})`,
        orderIds
      );
      for (const item of items) {
        if (!itemsMap[item.order_id]) itemsMap[item.order_id] = [];
        itemsMap[item.order_id].push(item);
      }
    }

    const serialized = orders.map((o) => ({
      orderId: o.order_id,
      orderNumber: o.order_number,
      customerId: o.customer_id,
      productName: o.product_name,
      quantity: o.quantity,
      unitPrice: Number(o.unit_price),
      totalAmount: Number(o.total_amount),
      paymentMethod: o.payment_method,
      status: o.status,
      trackingNumber: o.tracking_number,
      notes: o.notes,
      createdAt: o.created_at,
      updatedAt: o.updated_at,
      customer: o.customer_name ? { fullName: o.customer_name, phone: o.customer_phone, address: o.customer_address, city: o.customer_city, state: o.customer_state, pincode: o.customer_pincode } : null,
      items: (itemsMap[o.order_id] || []).map(i => ({
        id: i.id, productName: i.product_name, productImage: i.product_image,
        quantity: i.quantity, unitPrice: Number(i.unit_price), totalPrice: Number(i.total_price),
      })),
    }));

    return res.json({ success: true, orders: serialized, total, page, limit });
  } catch (error) {
    console.error('Order list error:', error);
    return res.status(500).json({ success: false, error: 'Failed to fetch orders' });
  }
};
