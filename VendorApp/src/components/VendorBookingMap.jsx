import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useEffect, useState, useMemo } from 'react';

// Fix Leaflet default icon issue in React
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

// Vendor location icon (blue)
const vendorIcon = new L.DivIcon({
  html: `<div style="background:#2563eb;width:48px;height:48px;border-radius:50%;display:flex;align-items:center;justify-content:center;border:4px solid white;box-shadow:0 0 0 3px #2563eb, 0 4px 12px rgba(0,0,0,0.3);font-size:20px;">📍</div>`,
  className: '',
  iconSize: [48, 48],
  iconAnchor: [24, 24],
  popupAnchor: [0, -24],
});

// Customer location icon (orange)
const customerIcon = new L.DivIcon({
  html: `<div style="background:#f97316;width:40px;height:40px;border-radius:50%;display:flex;align-items:center;justify-content:center;border:3px solid white;box-shadow:0 2px 8px rgba(0,0,0,0.3);font-size:16px;">🏠</div>`,
  className: '',
  iconSize: [40, 40],
  iconAnchor: [20, 20],
  popupAnchor: [0, -20],
});

const MapContent = ({ booking, vendorLocation }) => {
  const customerLng = booking?.serviceLocation?.coordinates?.[0];
  const customerLat = booking?.serviceLocation?.coordinates?.[1];
  
  const vendorLng = vendorLocation?.coordinates?.[0];
  const vendorLat = vendorLocation?.coordinates?.[1];

  // Create route line if both locations are available
  const routeLine = useMemo(() => {
    if (typeof vendorLat === 'number' && typeof vendorLng === 'number' && 
        typeof customerLat === 'number' && typeof customerLng === 'number') {
      return [[vendorLat, vendorLng], [customerLat, customerLng]];
    }
    return null;
  }, [vendorLat, vendorLng, customerLat, customerLng]);

  return (
    <>
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      {/* Route line */}
      {routeLine && (
        <Polyline positions={routeLine} color="#2563eb" weight={3} opacity={0.7} dashArray="5, 5" />
      )}

      {/* Vendor current location */}
      {(typeof vendorLat === 'number' && typeof vendorLng === 'number') && (
        <Marker position={[vendorLat, vendorLng]} icon={vendorIcon}>
          <Popup>
            <div style={{ fontSize: 12 }}>
              <p style={{ fontWeight: 'bold', margin: '0 0 4px 0' }}>Your Location</p>
              <p style={{ color: '#666', margin: 0 }}>Lat: {vendorLat.toFixed(4)}, Lng: {vendorLng.toFixed(4)}</p>
            </div>
          </Popup>
        </Marker>
      )}

      {/* Customer location */}
      {(typeof customerLat === 'number' && typeof customerLng === 'number') && (
        <Marker position={[customerLat, customerLng]} icon={customerIcon}>
          <Popup>
            <div style={{ fontSize: 12 }}>
              <p style={{ fontWeight: 'bold', margin: '0 0 4px 0' }}>Service Location</p>
              <p style={{ color: '#666', margin: 0 }}>{booking?.serviceLocation?.serviceAddress?.formattedAddress || 'Customer location'}</p>
            </div>
          </Popup>
        </Marker>
      )}
    </>
  );
};

export default function VendorBookingMap({ booking, vendorLocation, eta, distance }) {
  const [mapKey, setMapKey] = useState(0);

  useEffect(() => {
    setMapKey(prev => prev + 1);
  }, [vendorLocation?.coordinates?.[0], vendorLocation?.coordinates?.[1]]);

  if (!booking) return null;

  const isEnRoute = ['VENDOR_EN_ROUTE', 'INSPECTION_IN_PROGRESS', 'SERVICE_IN_PROGRESS'].includes(booking?.bookingState);

  const customerLng = booking.serviceLocation?.coordinates?.[0];
  const customerLat = booking.serviceLocation?.coordinates?.[1];
  
  let center = [28.6139, 77.2090]; // Default: New Delhi
  if (typeof customerLat === 'number' && typeof customerLng === 'number') {
    center = [customerLat, customerLng];
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* Live Tracking Info Card */}
      {isEnRoute && (
        <div style={{
          background: 'linear-gradient(135deg, #2563eb 0%, #1e40af 100%)',
          border: '2px solid #1e40af',
          borderRadius: 12,
          padding: 16,
          color: 'white'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                <div style={{
                  width: 8,
                  height: 8,
                  background: '#10b981',
                  borderRadius: '50%',
                  animation: 'pulse 2s infinite'
                }} />
                <span style={{ fontSize: 11, fontWeight: 'bold', letterSpacing: 0.5, textTransform: 'uppercase' }}>Live Tracking Active</span>
              </div>

              <div style={{ marginBottom: 12 }}>
                <h3 style={{ fontSize: 16, fontWeight: 'bold', margin: '0 0 4px 0' }}>Trip to {booking.userId?.fullname}</h3>
                <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.8)', margin: 0 }}>
                  {booking.serviceLocation?.serviceAddress?.formattedAddress || 'Service location'}
                </p>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginTop: 12 }}>
                {distance !== undefined && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontSize: 18 }}>📍</span>
                    <div>
                      <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.7)', margin: 0 }}>Distance</p>
                      <p style={{ fontSize: 14, fontWeight: 'bold', margin: 0 }}>{distance.toFixed(2)} km</p>
                    </div>
                  </div>
                )}
                {eta && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontSize: 18 }}>⏱️</span>
                    <div>
                      <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.7)', margin: 0 }}>ETA</p>
                      <p style={{ fontSize: 14, fontWeight: 'bold', margin: 0 }}>{Math.round(eta)} min</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Map Container */}
      <div key={mapKey} style={{
        borderRadius: 12,
        overflow: 'hidden',
        border: '1px solid #e5e7eb',
        boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
        height: isEnRoute ? 500 : 380
      }}>
        <MapContainer
          center={center}
          zoom={13}
          style={{ height: '100%', width: '100%' }}
          scrollWheelZoom={false}
        >
          <MapContent booking={booking} vendorLocation={vendorLocation} />
        </MapContainer>
        <style>{`
          @keyframes pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.5; }
          }
        `}</style>
      </div>
    </div>
  );
}
