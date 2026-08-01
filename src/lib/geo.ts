export interface GeoPosition {
  latitude: number;
  longitude: number;
  accuracy?: number;
}

export function getCurrentPosition(): Promise<GeoPosition> {
  return new Promise((resolve, reject) => {
    if (!('geolocation' in navigator)) {
      reject(new Error('Geolocation is not supported by this browser.'));
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        resolve({
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
          accuracy: pos.coords.accuracy,
        });
      },
      (err) => {
        let msg = 'Unable to get your location.';
        if (err.code === err.PERMISSION_DENIED)
          msg = 'Location permission denied. Please allow location access.';
        else if (err.code === err.POSITION_UNAVAILABLE)
          msg = 'Location information is unavailable.';
        else if (err.code === err.TIMEOUT)
          msg = 'Location request timed out.';
        reject(new Error(msg));
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
    );
  });
}

export async function reverseGeocode(lat: number, lon: number): Promise<string> {
  // OpenStreetMap Nominatim - free, no key required
  try {
    const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&zoom=18&addressdetails=1`;
    const res = await fetch(url, {
      headers: { 'Accept-Language': 'en' },
    });
    if (!res.ok) throw new Error('Geocode failed');
    const data = await res.json();
    return data.display_name ?? `${lat.toFixed(5)}, ${lon.toFixed(5)}`;
  } catch {
    return `${lat.toFixed(5)}, ${lon.toFixed(5)}`;
  }
}

export function staticMapUrl(lat: number, lon: number, size = '320x200'): string {
  // OpenStreetMap static preview via a marker bbox
  const delta = 0.005;
  const bbox = `${lon - delta},${lat - delta},${lon + delta},${lat + delta}`;
  return `https://staticmap.openstreetmap.de/staticmap.php?center=${lat},${lon}&zoom=16&size=${size}&maptype=mapnik&markers=${lat},${lon},red-pushpin`;
}

export function mapLink(lat: number, lon: number): string {
  return `https://www.openstreetmap.org/?mlat=${lat}&mlon=${lon}#map=18/${lat}/${lon}`;
}

export function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days}d ago`;
  return formatDate(iso);
}

export function generateTicketId(): string {
  return (
    'CIV-' +
    Math.random().toString(36).slice(2, 6).toUpperCase() +
    '-' +
    Date.now().toString(36).slice(-4).toUpperCase()
  );
}
