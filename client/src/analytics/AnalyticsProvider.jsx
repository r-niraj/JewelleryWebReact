import { createContext, useContext, useEffect, useRef, useCallback, useState } from 'react';
import { useLocation } from 'react-router-dom';

const AnalyticsContext = createContext(null);

function generateId() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    return (c === 'x' ? r : (r & 0x3) | 0x8).toString(16);
  });
}

function getAnonymousId() {
  let id = localStorage.getItem('shop_anon_id');
  if (!id) {
    id = generateId();
    localStorage.setItem('shop_anon_id', id);
  }
  return id;
}

function getUtmParams() {
  const params = new URLSearchParams(window.location.search);
  const utm = {};
  for (const key of ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term']) {
    const val = params.get(key);
    if (val) utm[key] = val;
  }
  return utm;
}

function getDeviceInfo() {
  return {
    screen_resolution: `${window.screen.width}x${window.screen.height}`,
    language: navigator.language || '',
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || '',
  };
}

export function AnalyticsProvider({ children }) {
  const location = useLocation();
  const anonymousId = useRef(getAnonymousId());
  const lastUrl = useRef('');
  const pageStart = useRef(Date.now());
  const queue = useRef([]);
  const flushTimer = useRef(null);
  const [settings, setSettings] = useState(null);
  const utmRef = useRef(null);
  const initialized = useRef(false);

  const send = useCallback((endpoint, data) => {
    try {
      navigator.sendBeacon(endpoint, new Blob([JSON.stringify(data)], { type: 'application/json' }));
    } catch {
      fetch(endpoint, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data), keepalive: true }).catch(() => {});
    }
  }, []);

  const flush = useCallback(() => {
    if (flushTimer.current) clearTimeout(flushTimer.current);
    flushTimer.current = null;
    if (queue.current.length === 0) return;
    const batch = queue.current.splice(0);
    for (const item of batch) {
      send(item.endpoint, item.data);
    }
  }, [send]);

  const enqueue = useCallback((endpoint, data) => {
    queue.current.push({ endpoint, data });
    if (!flushTimer.current) {
      flushTimer.current = setTimeout(flush, 5000);
    }
    if (queue.current.length >= 10) flush();
  }, [flush]);

  const trackEvent = useCallback((eventType, eventCategory, eventAction, eventLabel, eventValue, metadata) => {
    if (settings && settings.analytics_enabled === 'false') return;
    enqueue('/api/analytics/track/event', {
      anonymousId: anonymousId.current,
      event_type: eventType,
      event_category: eventCategory,
      event_action: eventAction,
      event_label: eventLabel,
      event_value: eventValue,
      page_url: window.location.pathname,
      metadata,
    });
  }, [enqueue, settings]);

  const trackPageView = useCallback((routeName, pageTitle) => {
    if (settings && settings.analytics_enabled === 'false') return;
    enqueue('/api/analytics/track/page-view', {
      anonymousId: anonymousId.current,
      page_url: window.location.pathname,
      page_title: pageTitle || document.title,
      route_name: routeName || '',
      previous_url: lastUrl.current,
      referrer_url: document.referrer || '',
      ...getDeviceInfo(),
      ...(utmRef.current || {}),
    });
    lastUrl.current = window.location.pathname;
  }, [enqueue, settings]);

  const trackProductInteraction = useCallback((productId, productName, productCategory, interactionType, sourcePage, metadata) => {
    if (settings && settings.analytics_enabled === 'false') return;
    enqueue('/api/analytics/track/product-interaction', {
      anonymousId: anonymousId.current,
      product_id: productId,
      product_name: productName,
      product_category: productCategory,
      interaction_type: interactionType,
      source_page: sourcePage || window.location.pathname,
      metadata,
    });
  }, [enqueue, settings]);

  const identifyVisitor = useCallback((userId) => {
    send('/api/analytics/track/identify', {
      anonymousId: anonymousId.current,
      user_id: userId,
    });
  }, [send]);

  const getAttribution = useCallback(() => {
    return utmRef.current || {};
  }, []);

  useEffect(() => {
    if (!initialized.current) {
      initialized.current = true;
      utmRef.current = getUtmParams();
      fetch('/api/analytics/settings')
        .then((r) => r.json())
        .then((d) => { if (d.success) setSettings(d.settings); })
        .catch(() => {});
    }
  }, []);

  useEffect(() => {
    const routeName = location.pathname;
    trackPageView(routeName);
  }, [location.pathname, trackPageView]);

  useEffect(() => {
    const handleVisibility = () => {
      if (document.visibilityState === 'hidden') {
        flush();
      }
    };
    document.addEventListener('visibilitychange', handleVisibility);
    window.addEventListener('beforeunload', flush);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibility);
      window.removeEventListener('beforeunload', flush);
    };
  }, [flush]);

  return (
    <AnalyticsContext.Provider value={{ trackEvent, trackPageView, trackProductInteraction, identifyVisitor, getAttribution, settings }}>
      {children}
    </AnalyticsContext.Provider>
  );
}

export function useAnalyticsContext() {
  return useContext(AnalyticsContext);
}
