import { useEffect, useState } from 'react';

const STORAGE_KEY = 'shopsastamart_location';

export function getStoredLocation() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const data = JSON.parse(raw);
    if (!data.lat || !data.lng) return null;
    const elapsed = Date.now() - (data.timestamp || 0);
    if (elapsed > 7 * 24 * 60 * 60 * 1000) { localStorage.removeItem(STORAGE_KEY); return null; }
    return data;
  } catch { return null; }
}

export function setStoredLocation(lat, lng, address) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ lat, lng, address: address || '', timestamp: Date.now() }));
  } catch {}
}

export async function reverseGeocode(lat, lng) {
  try {
    const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}&accept-language=en`, {
      headers: { 'User-Agent': 'Shopsastamart/1.0' },
    });
    if (!res.ok) return null;
    const data = await res.json();
    if (!data || data.error) return null;
    const parts = [];
    if (data.address?.suburb) parts.push(data.address.suburb);
    if (data.address?.neighbourhood) parts.push(data.address.neighbourhood);
    if (data.address?.residential) parts.push(data.address.residential);
    if (data.address?.road) parts.push(data.address.road);
    if (data.address?.city_district) parts.push(data.address.city_district);
    if (data.address?.city) parts.push(data.address.city);
    if (data.address?.state_district) parts.push(data.address.state_district);
    if (data.address?.state) parts.push(data.address.state);
    if (data.address?.postcode) parts.push(data.address.postcode);
    if (data.address?.country) parts.push(data.address.country);
    return {
      displayName: parts.length > 0 ? parts.join(', ') : (data.display_name || `${lat.toFixed(4)}, ${lng.toFixed(4)}`),
      city: data.address?.city || data.address?.city_district || data.address?.state_district || '',
      state: data.address?.state || '',
      pincode: data.address?.postcode || '',
    };
  } catch { return null; }
}

export default function LocationModal() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const stored = getStoredLocation();
    if (stored) return;
    const timer = setTimeout(() => setVisible(true), 2000);
    return () => clearTimeout(timer);
  }, []);

  const handleAllow = () => {
    if (!navigator.geolocation) { setVisible(false); return; }
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude: lat, longitude: lng } = pos.coords;
        const geo = await reverseGeocode(lat, lng);
        setStoredLocation(lat, lng, geo?.displayName || '');
        setVisible(false);
      },
      () => setVisible(false),
      { enableHighAccuracy: true, timeout: 10000 },
    );
  };

  const handleSkip = () => {
    setStoredLocation(0, 0, '');
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-5 bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl p-7 max-w-sm w-full shadow-2xl text-center">
        <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-emerald-100 flex items-center justify-center">
          <i className="fas fa-map-pin text-emerald-deep text-xl" />
        </div>
        <h3 className="font-serif text-lg font-semibold text-heading mb-2">We detected your location</h3>
        <p className="text-xs text-muted mb-6">Allow location access to auto-fill your delivery address and help us serve you faster.</p>
        <div className="flex gap-3 justify-center">
          <button onClick={handleSkip} className="px-5 py-2 border border-gold-soft/30 rounded-lg text-xs font-semibold hover:border-emerald-deep transition">Skip</button>
          <button onClick={handleAllow} className="px-5 py-2 bg-emerald-deep text-white rounded-lg text-xs font-semibold hover:bg-teal-luxury transition">
            <i className="fas fa-crosshairs mr-1" /> Allow Location
          </button>
        </div>
      </div>
    </div>
  );
}
