const { query } = require('../../lib/db');

module.exports = async function handler(req, res) {
  if (req.method === 'GET') return getHandler(req, res);
  if (req.method === 'PUT') return putHandler(req, res);
  return res.status(405).json({ success: false, error: 'Method not allowed' });
};

async function getHandler(req, res) {
  try {
    const rows = await query("SELECT `key`, `value` FROM settings WHERE `key` LIKE 'analytics_%'");
    const settings = {
      analytics_enabled: 'true',
      ip_anonymization: 'true',
      retention_days: '0',
    };
    for (const row of rows) {
      settings[row.key] = row.value;
    }
    return res.json({ success: true, settings });
  } catch (err) {
    console.error('Analytics settings GET error:', err);
    return res.status(500).json({ success: false, error: 'Failed to fetch analytics settings' });
  }
}

async function putHandler(req, res) {
  try {
    const updates = [];
    if (req.body.analytics_enabled !== undefined) updates.push({ key: 'analytics_enabled', value: req.body.analytics_enabled });
    if (req.body.ip_anonymization !== undefined) updates.push({ key: 'ip_anonymization', value: req.body.ip_anonymization });
    if (req.body.retention_days !== undefined) updates.push({ key: 'retention_days', value: String(req.body.retention_days) });
    for (const u of updates) {
      const existing = await query('SELECT setting_id FROM settings WHERE `key` = ?', [u.key]);
      if (existing.length > 0) {
        await query('UPDATE settings SET `value` = ? WHERE `key` = ?', [u.value, u.key]);
      } else {
        await query('INSERT INTO settings (`key`, `value`) VALUES (?, ?)', [u.key, u.value]);
      }
    }
    return res.json({ success: true });
  } catch (err) {
    console.error('Analytics settings PUT error:', err);
    return res.status(500).json({ success: false, error: 'Failed to update analytics settings' });
  }
}
