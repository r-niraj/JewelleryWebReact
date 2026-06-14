async function lookup(ip) {
  if (!ip || ip === '127.0.0.1' || ip === '::1' || ip === '::ffff:127.0.0.1') {
    return null;
  }
  try {
    const response = await fetch(`http://ip-api.com/json/${ip}?fields=status,country,regionName,city,lat,lon,isp,query`, {
      signal: AbortSignal.timeout(3000),
    });
    if (!response.ok) return null;
    const data = await response.json();
    if (data.status !== 'success') return null;
    return {
      country: data.country || null,
      state: data.regionName || null,
      city: data.city || null,
      region: data.regionName || null,
      latitude: data.lat != null ? String(data.lat) : null,
      longitude: data.lon != null ? String(data.lon) : null,
      isp: data.isp || null,
      networkProvider: null,
    };
  } catch {
    return null;
  }
}

module.exports = { lookup };
