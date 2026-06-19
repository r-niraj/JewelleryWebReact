const { enqueue } = require('../../lib/analytics-queue');
const { lookup } = require('../../lib/geo-lookup');

function parseUA(ua) {
  if (!ua) return { browser: null, os: null, deviceType: null };
  const u = ua.toLowerCase();
  let browser = 'Unknown';
  if (u.includes('chrome') && !u.includes('edg')) browser = 'Chrome';
  else if (u.includes('firefox')) browser = 'Firefox';
  else if (u.includes('safari') && !u.includes('chrome')) browser = 'Safari';
  else if (u.includes('edg')) browser = 'Edge';
  else if (u.includes('opera') || u.includes('opr')) browser = 'Opera';
  let os = 'Unknown';
  if (u.includes('windows')) os = 'Windows';
  else if (u.includes('mac os') || u.includes('macintosh')) os = 'macOS';
  else if (u.includes('linux') && !u.includes('android')) os = 'Linux';
  else if (u.includes('android')) os = 'Android';
  else if (u.includes('iphone') || u.includes('ipad')) os = 'iOS';
  let deviceType = 'Desktop';
  if (u.includes('mobile')) deviceType = 'Mobile';
  else if (u.includes('tablet') || u.includes('ipad')) deviceType = 'Tablet';
  return { browser, os, deviceType };
}

async function getOrCreateVisitor(anonymousId, ip, ua) {
  if (!anonymousId) return null;
  const { query } = require('../../lib/db');
  const existing = await query('SELECT visitor_id, visit_count FROM visitors WHERE anonymous_id = ?', [anonymousId]);
  if (existing.length > 0) {
    await query(
      'UPDATE visitors SET current_ip = ?, last_visit_at = NOW(), visit_count = visit_count + 1 WHERE anonymous_id = ?',
      [ip, anonymousId]
    );
    return existing[0].visitor_id;
  }
  const uaInfo = parseUA(ua);
  const res = await query(
    `INSERT INTO visitors (anonymous_id, first_ip, current_ip, user_agent, device_type, browser, os, landing_page)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [anonymousId, ip, ip, ua, uaInfo.deviceType, uaInfo.browser, uaInfo.os, '']
  );
  return res.insertId;
}

async function getOrCreateSession(visitorId, ip, ua) {
  if (!visitorId) return null;
  const { query } = require('../../lib/db');
  const existing = await query(
    'SELECT session_id, session_start FROM visitor_sessions WHERE visitor_id = ? AND is_active = TRUE ORDER BY session_start DESC LIMIT 1',
    [visitorId]
  );
  if (existing.length > 0) {
    const age = Date.now() - new Date(existing[0].session_start).getTime();
    if (age < 30 * 60 * 1000) {
      return existing[0].session_id;
    }
    await query('UPDATE visitor_sessions SET is_active = FALSE, session_end = NOW() WHERE session_id = ?', [existing[0].session_id]);
  }
  const res = await query(
    'INSERT INTO visitor_sessions (visitor_id, ip_address, user_agent) VALUES (?, ?, ?)',
    [visitorId, ip, ua]
  );
  return res.insertId;
}

async function captureCampaign(sessionId, visitorId, queryParams) {
  if (!sessionId || !visitorId) return;
  const hasUtm = queryParams.utm_source || queryParams.utm_medium || queryParams.utm_campaign;
  if (!hasUtm && !queryParams.referrer_url) return;
  enqueue('campaign_attributions', {
    session_id: sessionId,
    visitor_id: visitorId,
    utm_source: queryParams.utm_source || null,
    utm_medium: queryParams.utm_medium || null,
    utm_campaign: queryParams.utm_campaign || null,
    utm_content: queryParams.utm_content || null,
    utm_term: queryParams.utm_term || null,
    referrer_url: queryParams.referrer_url || null,
    landing_page: queryParams.landing_page || null,
  });
}

module.exports = async function handler(req, res) {
  const { type } = req.params;
  const ip = req.headers['x-forwarded-for']?.split(',')[0]?.trim() || req.socket.remoteAddress || '0.0.0.0';
  const ua = req.headers['user-agent'] || '';
  let parsed = req.body;
  if (typeof parsed === 'string') {
    try { parsed = JSON.parse(parsed); } catch { parsed = {}; }
  }
  const { anonymousId, ...body } = parsed || {};

  try {
    if (type === 'page-view') {
      const visitorId = await getOrCreateVisitor(anonymousId, ip, ua);
      const sessionId = await getOrCreateSession(visitorId, ip, ua);
      if (!visitorId || !sessionId) return res.json({ queued: true });
      await captureCampaign(sessionId, visitorId, {
        utm_source: body.utm_source,
        utm_medium: body.utm_medium,
        utm_campaign: body.utm_campaign,
        utm_content: body.utm_content,
        utm_term: body.utm_term,
        referrer_url: body.referrer_url || req.headers.referer,
        landing_page: body.page_url,
      });
      enqueue('page_views', {
        session_id: sessionId,
        visitor_id: visitorId,
        page_url: body.page_url || '',
        page_title: body.page_title || null,
        route_name: body.route_name || null,
        previous_url: body.previous_url || null,
        referrer_url: body.referrer_url || req.headers.referer || null,
        view_start: new Date(),
      });
      if (body.screen_resolution || body.language || body.timezone) {
        const { query } = require('../../lib/db');
        await query(
          `UPDATE visitors SET screen_resolution = COALESCE(NULLIF(?, ''), screen_resolution), language = COALESCE(NULLIF(?, ''), language), timezone = COALESCE(NULLIF(?, ''), timezone) WHERE visitor_id = ?`,
          [body.screen_resolution || '', body.language || '', body.timezone || '', visitorId]
        );
      }
      if (body.page_url && body.page_url !== '/') {
        const { query } = require('../../lib/db');
        await query('UPDATE visitors SET landing_page = ? WHERE visitor_id = ? AND (landing_page IS NULL OR landing_page = \'\')', [body.page_url, visitorId]);
      }
      lookup(ip).then((geo) => {
        if (geo) {
          enqueue('visitor_locations', {
            visitor_id: visitorId,
            session_id: sessionId,
            ip_address: ip,
            country: geo.country,
            state: geo.state,
            city: geo.city,
            region: geo.region,
            latitude: geo.latitude,
            longitude: geo.longitude,
            isp: geo.isp,
            network_provider: geo.networkProvider,
          });
        }
      }).catch(() => {});
      return res.json({ queued: true });
    }

    if (type === 'event') {
      const visitorId = await getOrCreateVisitor(anonymousId, ip, ua);
      const sessionId = await getOrCreateSession(visitorId, ip, ua);
      enqueue('visitor_events', {
        session_id: sessionId,
        visitor_id: visitorId,
        event_type: body.event_type || 'custom',
        event_category: body.event_category || null,
        event_action: body.event_action || null,
        event_label: body.event_label || null,
        event_value: body.event_value || null,
        page_url: body.page_url || null,
        metadata: body.metadata ? JSON.stringify(body.metadata) : null,
      });
      return res.json({ queued: true });
    }

    if (type === 'product-interaction') {
      if (!body.product_id) return res.json({ queued: true, skipped: true });
      const visitorId = await getOrCreateVisitor(anonymousId, ip, ua);
      const sessionId = await getOrCreateSession(visitorId, ip, ua);
      enqueue('product_interactions', {
        session_id: sessionId,
        visitor_id: visitorId,
        product_id: body.product_id,
        product_name: body.product_name || null,
        product_category: body.product_category || null,
        interaction_type: body.interaction_type || 'view',
        source_page: body.source_page || null,
        metadata: body.metadata ? JSON.stringify(body.metadata) : null,
      });
      enqueue('visitor_events', {
        session_id: sessionId,
        visitor_id: visitorId,
        event_type: 'product',
        event_category: 'product',
        event_action: body.interaction_type || 'view',
        event_label: body.product_name || null,
        event_value: String(body.product_id || ''),
      });
      return res.json({ queued: true });
    }

    if (type === 'identify') {
      if (!anonymousId || !body.user_id) return res.json({ queued: true });
      const { query } = require('../../lib/db');
      await query('UPDATE visitors SET user_id = ? WHERE anonymous_id = ?', [body.user_id, anonymousId]);
      return res.json({ queued: true });
    }

    return res.status(400).json({ error: 'Unknown track type' });
  } catch (err) {
    console.error('Analytics track error:', err.message);
    return res.json({ queued: true });
  }
};
