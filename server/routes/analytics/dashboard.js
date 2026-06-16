const { query } = require('../../lib/db');

function periodFilter(period) {
  if (period === '7d') return 7;
  if (period === '30d') return 30;
  if (period === '90d') return 90;
  return 30;
}

module.exports = async function handler(req, res) {
  const { type } = req.params;
  const period = periodFilter(req.query.period);

  try {
    if (type === 'traffic') {
      const [totalVisitors] = await query('SELECT COUNT(*) AS count FROM visitors');
      const [uniqueVisitors] = await query('SELECT COUNT(DISTINCT anonymous_id) AS count FROM visitors WHERE created_at >= DATE_SUB(NOW(), INTERVAL ? DAY)', [period]);
      const [returning] = await query('SELECT COUNT(*) AS count FROM visitors WHERE visit_count > 1 AND created_at >= DATE_SUB(NOW(), INTERVAL ? DAY)', [period]);
      const [sessions] = await query('SELECT COUNT(*) AS count FROM visitor_sessions WHERE created_at >= DATE_SUB(NOW(), INTERVAL ? DAY)', [period]);
      const [bounce] = await query('SELECT COUNT(*) AS count FROM visitor_sessions WHERE session_end IS NULL AND created_at >= DATE_SUB(NOW(), INTERVAL ? DAY)', [period]);
      const [avgDur] = await query('SELECT AVG(TIMESTAMPDIFF(SECOND, session_start, COALESCE(session_end, NOW()))) AS avg_sec FROM visitor_sessions WHERE created_at >= DATE_SUB(NOW(), INTERVAL ? DAY)', [period]);
      const daily = await query(
        `SELECT DATE(created_at) AS date, COUNT(*) AS count FROM visitor_sessions
         WHERE created_at >= DATE_SUB(NOW(), INTERVAL ? DAY)
         GROUP BY DATE(created_at) ORDER BY date ASC`,
        [period]
      );
      return res.json({
        success: true,
        stats: {
          totalVisitors: totalVisitors.count,
          uniqueVisitors: uniqueVisitors.count,
          returningVisitors: returning.count,
          sessions: sessions.count,
          bounceRate: sessions.count > 0 ? Math.round((bounce.count / sessions.count) * 100) : 0,
          avgSessionDuration: Math.round(avgDur.avg_sec || 0),
        },
        daily: daily.map((r) => ({ date: r.date, count: r.count })),
      });
    }

    if (type === 'geography') {
      const countries = await query(
        `SELECT country, COUNT(*) AS count FROM visitor_locations
         WHERE detected_at >= DATE_SUB(NOW(), INTERVAL ? DAY) AND country IS NOT NULL
         GROUP BY country ORDER BY count DESC LIMIT 20`,
        [period]
      );
      const states = await query(
        `SELECT state, country, COUNT(*) AS count FROM visitor_locations
         WHERE detected_at >= DATE_SUB(NOW(), INTERVAL ? DAY) AND state IS NOT NULL
         GROUP BY state, country ORDER BY count DESC LIMIT 20`,
        [period]
      );
      const cities = await query(
        `SELECT city, state, country, COUNT(*) AS count FROM visitor_locations
         WHERE detected_at >= DATE_SUB(NOW(), INTERVAL ? DAY) AND city IS NOT NULL
         GROUP BY city, state, country ORDER BY count DESC LIMIT 20`,
        [period]
      );
      const topISPs = await query(
        `SELECT isp, COUNT(*) AS count FROM visitor_locations
         WHERE detected_at >= DATE_SUB(NOW(), INTERVAL ? DAY) AND isp IS NOT NULL
         GROUP BY isp ORDER BY count DESC LIMIT 10`,
        [period]
      );
      return res.json({
        success: true,
        byCountry: countries.map((c) => ({ country: c.country, visitors: c.count })),
        byCity: cities.map((c) => ({ city: c.city, state: c.state, country: c.country, visitors: c.count })),
        byState: states.map((s) => ({ state: s.state, country: s.country, visitors: s.count })),
        topISPs: topISPs.map((i) => ({ isp: i.isp, visitors: i.count })),
      });
    }

    if (type === 'marketing') {
      const bySource = await query(
        `SELECT COALESCE(utm_source, 'Direct') AS source, COUNT(*) AS sessions,
                COUNT(DISTINCT visitor_id) AS visitors
         FROM campaign_attributions
         WHERE first_seen_at >= DATE_SUB(NOW(), INTERVAL ? DAY)
         GROUP BY source ORDER BY sessions DESC`,
        [period]
      );
      const byCampaign = await query(
        `SELECT utm_source, utm_medium, utm_campaign, COUNT(*) AS sessions,
                COUNT(DISTINCT visitor_id) AS visitors
         FROM campaign_attributions
         WHERE first_seen_at >= DATE_SUB(NOW(), INTERVAL ? DAY) AND utm_campaign IS NOT NULL
         GROUP BY utm_source, utm_medium, utm_campaign ORDER BY sessions DESC LIMIT 50`,
        [period]
      );
      const withOrders = await query(
        `SELECT c.utm_source, c.utm_campaign, COUNT(DISTINCT o.order_id) AS orders,
                COALESCE(SUM(o.total_amount), 0) AS revenue
         FROM campaign_attributions c
         LEFT JOIN visitor_sessions vs ON c.session_id = vs.session_id
         LEFT JOIN visitors v ON c.visitor_id = v.visitor_id
         LEFT JOIN orders o ON o.created_at >= DATE_SUB(NOW(), INTERVAL ? DAY)
         WHERE c.first_seen_at >= DATE_SUB(NOW(), INTERVAL ? DAY)
         GROUP BY c.utm_source, c.utm_campaign
         ORDER BY revenue DESC LIMIT 20`,
        [period, period]
      );
      return res.json({ success: true, bySource, byCampaign, withOrders });
    }

    if (type === 'products') {
      const mostViewed = await query(
        `SELECT product_id, product_name, product_category, COUNT(*) AS views
         FROM product_interactions
         WHERE interaction_type = 'view' AND timestamp >= DATE_SUB(NOW(), INTERVAL ? DAY)
         GROUP BY product_id, product_name, product_category ORDER BY views DESC LIMIT 20`,
        [period]
      );
      const mostAddedToCart = await query(
        `SELECT product_id, product_name, product_category, COUNT(*) AS adds
         FROM product_interactions
         WHERE interaction_type = 'add_to_cart' AND timestamp >= DATE_SUB(NOW(), INTERVAL ? DAY)
         GROUP BY product_id, product_name, product_category ORDER BY adds DESC LIMIT 20`,
        [period]
      );
      const mostPurchased = await query(
        `SELECT product_id, product_name, product_category, COUNT(*) AS purchases
         FROM product_interactions
         WHERE interaction_type = 'purchase' AND timestamp >= DATE_SUB(NOW(), INTERVAL ? DAY)
         GROUP BY product_id, product_name, product_category ORDER BY purchases DESC LIMIT 20`,
        [period]
      );
      return res.json({ success: true, mostViewed, mostAddedToCart, mostPurchased });
    }

    if (type === 'journey') {
      const totalViews = await query(
        `SELECT COUNT(*) AS count FROM page_views WHERE view_start >= DATE_SUB(NOW(), INTERVAL ? DAY)`,
        [period]
      );
      const routeCounts = await query(
        `SELECT route_name, COUNT(*) AS count
         FROM page_views
         WHERE view_start >= DATE_SUB(NOW(), INTERVAL ? DAY) AND route_name IS NOT NULL
         GROUP BY route_name ORDER BY count DESC`,
        [period]
      );
      const byPage = await query(
        `SELECT page_url, route_name, COUNT(*) AS views,
                COUNT(DISTINCT visitor_id) AS unique_visitors
         FROM page_views
         WHERE view_start >= DATE_SUB(NOW(), INTERVAL ? DAY)
         GROUP BY page_url, route_name ORDER BY views DESC LIMIT 30`,
        [period]
      );
      return res.json({ success: true, totalViews: totalViews[0]?.count || 0, routes: routeCounts, pages: byPage });
    }

    if (type === 'funnel') {
      const funnel = [
        { step: 'Page View', key: 'page_view' },
        { step: 'Product View', key: 'product_view' },
        { step: 'Add to Cart', key: 'add_to_cart' },
        { step: 'Checkout', key: 'checkout' },
        { step: 'Purchase', key: 'purchase' },
      ];
      const results = [];
      for (const f of funnel) {
        let count;
        if (f.key === 'page_view') {
          const r = await query(
            'SELECT COUNT(DISTINCT visitor_id) AS count FROM page_views WHERE view_start >= DATE_SUB(NOW(), INTERVAL ? DAY)',
            [period]
          );
          count = r[0]?.count || 0;
        } else {
          const r = await query(
            `SELECT COUNT(DISTINCT visitor_id) AS count FROM product_interactions
             WHERE interaction_type = ? AND timestamp >= DATE_SUB(NOW(), INTERVAL ? DAY)`,
            [f.key, period]
          );
          count = r[0]?.count || 0;
        }
        results.push({ step: f.step, key: f.key, count });
      }
      return res.json({ success: true, funnel: results });
    }

    if (type === 'live') {
      const active = await query(
        `SELECT COUNT(*) AS count FROM visitor_sessions
         WHERE is_active = TRUE AND session_start >= DATE_SUB(NOW(), INTERVAL 5 MINUTE)`
      );
      const visitors = await query(
        `SELECT vs.session_id, vs.ip_address, pv.page_url, v.device_type, v.browser, vl.country
         FROM visitor_sessions vs
         LEFT JOIN visitors v ON vs.visitor_id = v.visitor_id
         LEFT JOIN page_views pv ON pv.session_id = vs.session_id
         LEFT JOIN visitor_locations vl ON vl.visitor_id = v.visitor_id
         WHERE vs.is_active = TRUE AND vs.session_start >= DATE_SUB(NOW(), INTERVAL 5 MINUTE)
         GROUP BY vs.session_id ORDER BY vs.session_start DESC LIMIT 50`
      );
      return res.json({ success: true, count: active[0]?.count || 0, visitors });
    }

    if (type === 'events') {
      const { event_type, event_category, limit, offset } = req.query;
      const where = ['timestamp >= DATE_SUB(NOW(), INTERVAL ? DAY)'];
      const params = [period];
      if (event_type) { where.push('event_type = ?'); params.push(event_type); }
      if (event_category) { where.push('event_category = ?'); params.push(event_category); }
      const lim = Math.min(parseInt(limit) || 100, 500);
      const off = parseInt(offset) || 0;
      const events = await query(
        `SELECT * FROM visitor_events WHERE ${where.join(' AND ')} ORDER BY timestamp DESC LIMIT ? OFFSET ?`,
        [...params, lim, off]
      );
      const [total] = await query(
        `SELECT COUNT(*) AS count FROM visitor_events WHERE ${where.join(' AND ')}`,
        params
      );
      const types = await query(
        `SELECT event_type, COUNT(*) AS count FROM visitor_events
         WHERE timestamp >= DATE_SUB(NOW(), INTERVAL ? DAY)
         GROUP BY event_type ORDER BY count DESC`,
        [period]
      );
      return res.json({ success: true, events, total: total.count, types });
    }

    return res.status(400).json({ error: 'Unknown dashboard type' });
  } catch (err) {
    console.error('Analytics dashboard error:', err.message);
    return res.status(500).json({ success: false, error: 'Failed to fetch analytics' });
  }
};
