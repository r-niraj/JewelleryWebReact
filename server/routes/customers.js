const db = require('../lib/db');

module.exports = async function handler(req, res) {
  try {
    const search = req.query.search?.trim();

    let sql = `SELECT c.*, (SELECT COUNT(*) FROM orders WHERE customer_id = c.customer_id) AS order_count FROM customers c`;
    const params = [];
    if (search) {
      sql += ` WHERE c.full_name LIKE ? OR c.phone LIKE ?`;
      params.push(`%${search}%`, `%${search}%`);
    }
    sql += ` ORDER BY c.created_at DESC`;

    const customers = await db.query(sql, params);

    const result = customers.map((c) => ({
      customerId: c.customer_id,
      fullName: c.full_name,
      phone: c.phone,
      email: c.email,
      city: c.city,
      state: c.state,
      orderCount: Number(c.order_count),
      totalSpent: 0,
      lastOrderDate: null,
    }));

    return res.json({ success: true, customers: result });
  } catch (error) {
    console.error('Customers error:', error);
    return res.status(500).json({ success: false, error: 'Failed to fetch customers' });
  }
};
