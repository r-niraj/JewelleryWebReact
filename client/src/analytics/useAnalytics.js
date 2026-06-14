import { useAnalyticsContext } from './AnalyticsProvider';

export function useAnalytics() {
  const ctx = useAnalyticsContext();
  if (!ctx) {
    return {
      trackEvent: () => {},
      trackPageView: () => {},
      trackProductInteraction: () => {},
      identifyVisitor: () => {},
      getAttribution: () => ({}),
      settings: null,
    };
  }
  return ctx;
}
