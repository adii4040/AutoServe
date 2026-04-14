import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix Leaflet default icon issue in React
// (required for correct marker icons)
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

// Garage/vendor icon (orange)
const vendorIcon = new L.DivIcon({
  html: `<div style="background:#f97316;width:36px;height:36px;border-radius:50%;display:flex;align-items:center;justify-content:center;border:3px solid white;box-shadow:0 2px 8px rgba(0,0,0,0.3);font-size:18px;">🔧</div>`,
  className: '',
  iconSize: [36, 36],
  iconAnchor: [18, 18],
  popupAnchor: [0, -20],
});

// User location icon (blue)
const userIcon = new L.DivIcon({
  html: `<div style="background:#2563eb;width:36px;height:36px;border-radius:50%;display:flex;align-items:center;justify-content:center;border:3px solid white;box-shadow:0 2px 8px rgba(0,0,0,0.3);font-size:18px;">📍</div>`,
  className: '',
  iconSize: [36, 36],
  iconAnchor: [18, 18],
  popupAnchor: [0, -20],
});

export default function BookingMap({ booking, vendors }) {
  // Service location — coordinates are [lng, lat] in backend
  const serviceLng = booking.serviceLocation?.coordinates?.[0];
  const serviceLat = booking.serviceLocation?.coordinates?.[1];
  // Fallback to a default center if coordinates are missing
  const center = (typeof serviceLat === 'number' && typeof serviceLng === 'number')
    ? [serviceLat, serviceLng]
    : [28.6139, 77.2090]; // Default: New Delhi

  return (
    <div className="rounded-xl overflow-hidden border border-gray-100 shadow-sm" style={{ height: '420px' }}>
      <MapContainer
        center={center}
        zoom={13}
        style={{ height: '100%', width: '100%' }}
        scrollWheelZoom={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* User's service location marker (only if coordinates are valid) */}
        {(typeof serviceLat === 'number' && typeof serviceLng === 'number') && (
          <Marker position={[serviceLat, serviceLng]} icon={userIcon}>
            <Popup>
              <div className="text-sm">
                <p className="font-medium">Your location</p>
                <p className="text-gray-500">{booking.serviceLocation?.serviceAddress?.formattedAddress || booking.serviceLocation?.formattedAddress || ''}</p>
              </div>
            </Popup>
          </Marker>
        )}

        {/* Vendor markers from dispatch batch (if any) */}
        {(Array.isArray(vendors) ? vendors : []).map((vendor) => {
          if (!vendor?.location?.coordinates) return null;
          const vLng = vendor.location.coordinates[0];
          const vLat = vendor.location.coordinates[1];
          return (
            <Marker key={vendor._id} position={[vLat, vLng]} icon={vendorIcon}>
              <Popup>
                <div className="text-sm">
                  <p className="font-medium">{vendor.shopName || vendor.fullname}</p>
                  <p className="text-gray-500">{vendor.address?.shopAddress || ''}</p>
                  <p className="text-xs text-orange-500 mt-1">Available vendor</p>
                </div>
              </Popup>
            </Marker>
          );
        })}

        {/* Assigned vendor marker (from vendorId populated object) */}
        {booking.vendorId?.location?.coordinates && (
          <Marker
            position={[
              booking.vendorId.location.coordinates[1],
              booking.vendorId.location.coordinates[0],
            ]}
            icon={vendorIcon}
          >
            <Popup>
              <div className="text-sm">
                <p className="font-medium">{booking.vendorId.shopName}</p>
                <p className="text-gray-500">{booking.vendorId.fullname}</p>
                <p className="text-xs text-green-600 mt-1 font-medium">Your assigned vendor</p>
              </div>
            </Popup>
          </Marker>
        )}
      </MapContainer>
    </div>
  );
}
