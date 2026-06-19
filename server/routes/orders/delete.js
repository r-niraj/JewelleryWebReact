const db = require('../../lib/db');

module.exports = async function handler(req, res) {
  try {
    const { orderNumbers } = req.body;

    if (!Array.isArray(orderNumbers) || orderNumbers.length === 0) {
      return res.status(400).json({ success: false, error: 'No order numbers provided' });
    }

    const placeholders = orderNumbers.map(() => '?').join(',');
    const result = await db.query(
      `DELETE FROM orders WHERE order_number IN (${placeholders})`,
      orderNumbers
    );

    return res.json({
      success: true,
      deleted: result.affectedRows,
    });
  } catch (error) {
    console.error('Order delete error:', error);
    return res.status(500).json({ success: false, error: 'Failed to delete orders' });
  }
};
