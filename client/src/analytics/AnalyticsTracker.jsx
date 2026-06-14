import { useAnalytics } from './useAnalytics';

export default function AnalyticsTracker({ children, eventType, eventCategory, eventAction, eventLabel, eventValue, metadata, onClick }) {
  const { trackEvent } = useAnalytics();

  const handleClick = (e) => {
    trackEvent(eventType || 'click', eventCategory, eventAction, eventLabel, eventValue, metadata);
    if (onClick) onClick(e);
  };

  if (!children) return null;

  if (typeof children === 'object' && children.type) {
    return <children.type {...children.props} onClick={handleClick} />;
  }

  return <span onClick={handleClick}>{children}</span>;
}
