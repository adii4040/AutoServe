import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useEffect, useState } from 'react';
import { Clock, MapPin, Phone } from 'lucide-react';

// Fix Leaflet default icon issue in React
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

// Active vendor icon (orange with pulse effect)
const activeVendorIcon = new L.DivIcon({
  html: `<div style="background:#f97316;width:48px;height:48px;border-radius:50%;display:flex;align-items:center;justify-content:center;border:4px solid white;box-shadow:0 0 0 3px #f97316, 0 4px 12px rgba(0,0,0,0.3);font-size:20px;animation:pulse 2s infinite;">🚙</div>`,
  className: '',
  iconSize: [48, 48],
  iconAnchor: [24, 24],
  popupAnchor: [0, -24],
});

// Vendor icon (orange)
const vendorIcon = new L.DivIcon({
  html: `<div style="background:#f97316;width:36px;height:36px;border-radius:50%;display:flex;align-items:center;justify-content:center;border:3px solid white;box-shadow:0 2px 8px rgba(0,0,0,0.3);font-size:16px;">🔧</div>`,
  className: '',
  iconSize: [36, 36],
  iconAnchor: [18, 18],
  popupAnchor: [0, -20],
});

// User location icon (blue)
const userIcon = new L.DivIcon({
  html: `<div style="background:#2563eb;width:36px;height:36px;border-radius:50%;display:flex;align-items:center;justify-content:center;border:3px solid white;box-shadow:0 2px 8px rgba(0,0,0,0.3);font-size:16px;">📍</div>`,
  className: '',
  iconSize: [36, 36],
  iconAnchor: [18, 18],
  popupAnchor: [0, -20],
});

const Map = ({ booking, vendors, realTimeData }) => {
  const serviceLng = booking.serviceLocation?.coordinates?.[0];
  const serviceLat = booking.serviceLocation?.coordinates?.[1];
  
  const assignedVendor = booking.vendorId;
  const vendorLng = assignedVendor?.location?.coordinates?.[0] || realTimeData?.location?.[0];
  const vendorLat = assignedVendor?.location?.coordinates?.[1] || realTimeData?.location?.[1];
  
  const center = (typeof serviceLat === 'number' && typeof serviceLng === 'number')
    ? [serviceLat, serviceLng]
    : [28.6139, 77.2090];

  // Create route line if both vendor and service locations are available
  const routeLine = (typeof serviceLat === 'number' && typeof serviceLng === 'number' && 
                     typeof vendorLat === 'number' && typeof vendorLng === 'number')
    ? [[vendorLat, vendorLng], [serviceLat, serviceLng]]
    : null;

  return (
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

      {/* Route line between vendor and service location */}
      {routeLine && (
        <Polyline positions={routeLine} color="#f97316" weight={3} opacity={0.7} dashArray="5, 5" />
      )}

      {/* Service location marker */}
      {(typeof serviceLat === 'number' && typeof serviceLng === 'number') && (
        <Marker position={[serviceLat, serviceLng]} icon={userIcon}>
          <Popup>
            <div className="text-sm">
              <p className="font-semibold">Your Location</p>
              <p className="text-gray-600 text-xs mt-1">{booking.serviceLocation?.serviceAddress?.formattedAddress || booking.serviceLocation?.formattedAddress || 'Service location'}</p>
            </div>
          </Popup>
        </Marker>
      )}

      {/* Assigned vendor en route */}
      {(typeof vendorLat === 'number' && typeof vendorLng === 'number') && (
        <Marker 
          position={[vendorLat, vendorLng]} 
          icon={activeVendorIcon}
        >
          <Popup>
            <div className="text-sm">
              <p className="font-semibold">{assignedVendor?.shopName || 'Service Vendor'}</p>
              <p className="text-gray-600 text-xs mt-1">{assignedVendor?.fullname}</p>
              <p className="text-green-600 text-xs font-medium mt-1">En Route</p>
            </div>
          </Popup>
        </Marker>
      )}

      {/* Other available vendors */}
      {(Array.isArray(vendors) ? vendors : []).filter(v => v._id !== assignedVendor?._id).map((vendor) => {
        if (!vendor?.location?.coordinates) return null;
        const vLng = vendor.location.coordinates[0];
        const vLat = vendor.location.coordinates[1];
        return (
          <Marker key={vendor._id} position={[vLat, vLng]} icon={vendorIcon}>
            <Popup>
              <div className="text-sm">
                <p className="font-semibold">{vendor.shopName || vendor.fullname}</p>
                <p className="text-gray-600 text-xs mt-1">Available vendor</p>
              </div>
            </Popup>
          </Marker>
        );
      })}
    </MapContainer>
  );
};

export default function BookingMap({ booking, vendors, realTimeData }) {
  const [mapKey, setMapKey] = useState(0);

  // Trigger map re-render when real-time data changes
  useEffect(() => {
    setMapKey(prev => prev + 1);
  }, [realTimeData?.location]);

  const assignedVendor = booking.vendorId;
  const isVendorEnRoute = ['VENDOR_EN_ROUTE', 'VENDOR_ARRIVED'].includes(booking?.bookingState || booking?.status);
  const eta = realTimeData?.eta || booking?.estimatedArrival;
  const distance = realTimeData?.distance;

  return (
    <div className="space-y-4">
      {/* Live Tracking Card */}
      {isVendorEnRoute && assignedVendor && (
        <div className="bg-gradient-to-r from-orange-50 to-red-50 border-2 border-orange-200 rounded-xl p-4">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
                <span className="text-xs font-semibold text-green-700 uppercase tracking-wide">Live Tracking Active</span>
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-1">{assignedVendor.shopName || assignedVendor.fullname}</h3>
              
              <div className="grid grid-cols-2 gap-3 mt-3">
                {distance !== undefined && (
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-orange-600" />
                    <div>
                      <p className="text-xs text-gray-600">Distance</p>
                      <p className="text-sm font-semibold text-gray-900">{distance.toFixed(1)} km</p>
                    </div>
                  </div>
                )}
                {eta && (
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-orange-600" />
                    <div>
                      <p className="text-xs text-gray-600">ETA</p>
                      <p className="text-sm font-semibold text-gray-900">{Math.round(eta)} min</p>
                    </div>
                  </div>
                )}
              </div>

              {assignedVendor.phone && (
                <button className="mt-3 flex items-center gap-2 px-3 py-2 bg-white border border-orange-200 rounded-lg hover:bg-orange-50 transition text-sm font-medium text-gray-900">
                  <Phone className="w-4 h-4 text-orange-600" />
                  Call Vendor
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Map Container */}
      <div 
        key={mapKey}
        className="rounded-xl overflow-hidden border border-gray-200 shadow-md" 
        style={{ height: isVendorEnRoute ? '500px' : '380px' }}
      >
        <Map booking={booking} vendors={vendors} realTimeData={realTimeData} />
        <style>{`
          @keyframes pulse {
            0%, 100% { box-shadow: 0 0 0 3px #f97316, 0 4px 12px rgba(0,0,0,0.3); }
            50% { box-shadow: 0 0 0 8px rgba(249, 115, 22, 0.3), 0 4px 12px rgba(0,0,0,0.3); }
          }
        `}</style>
      </div>
    </div>
  );
}
