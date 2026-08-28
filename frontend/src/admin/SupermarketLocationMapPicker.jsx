import { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Navigation, LocateFixed, Check, MapPin } from 'lucide-react';

export default function SupermarketLocationMapPicker({
  initialLat = 13.014333,
  initialLng = 77.646000,
  initialTitle = 'Fresh Mart Supermarket — Main Hub',
  initialRadius = 100,
  onSaveLocation
}) {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markerRef = useRef(null);
  const circleRef = useRef(null);

  const [coords, setCoords] = useState({ lat: initialLat, lng: initialLng });
  const [geofenceRadius, setGeofenceRadius] = useState(initialRadius);
  const [storeTitle, setStoreTitle] = useState(initialTitle);
  const [resolvedAddress, setResolvedAddress] = useState('Near 9th Main Road, HRBR Layout 1st Block, Banaswadi, Bengaluru 560043');
  const [isLocating, setIsLocating] = useState(false);
  const [isResolving, setIsResolving] = useState(false);
  const [savedNotice, setSavedNotice] = useState('');
  const [liveTime, setLiveTime] = useState('');

  // Live clock string
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setLiveTime(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true }));
    };
    updateTime();
    const interval = setInterval(updateTime, 10000);
    return () => clearInterval(interval);
  }, []);

  // Reverse Geocoding via OpenStreetMap Nominatim
  const reverseGeocode = async (lat, lng) => {
    setIsResolving(true);
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&addressdetails=1`,
        { headers: { 'Accept-Language': 'en' } }
      );
      if (res.ok) {
        const data = await res.json();
        const addr = data.address || {};
        const road = addr.road || addr.pedestrian || addr.suburb || 'Main Market Road';
        const area = addr.suburb || addr.neighbourhood || addr.city_district || 'Banaswadi';
        const city = addr.city || addr.town || 'Bengaluru';
        const postcode = addr.postcode || '560043';

        const title = data.name || `${road}, ${area}`;
        setStoreTitle(`Fresh Mart Supermarket — ${area}`);
        setResolvedAddress(`${road}, ${area}, ${city} ${postcode}`);
      }
    } catch {
      setResolvedAddress('HRBR Layout 1st Block, Banaswadi, Bengaluru 560043');
    } finally {
      setIsResolving(false);
    }
  };

  // Initialize Leaflet Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    // Custom Pulse Marker Icon
    const pinIcon = L.divIcon({
      className: 'supermarket-pulse-marker',
      html: `
        <div style="position: relative; width: 44px; height: 44px; display: flex; align-items: center; justify-content: center;">
          <div style="position: absolute; width: 44px; height: 44px; border-radius: 50%; background: rgba(0, 113, 227, 0.22); animation: pulse 2s infinite ease-in-out;"></div>
          <div style="position: absolute; width: 28px; height: 28px; border-radius: 50%; background: #0071E3; border: 3px solid #FFFFFF; box-shadow: 0 4px 14px rgba(0,113,227,0.4); display: flex; align-items: center; justify-content: center;">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
              <circle cx="12" cy="10" r="3"></circle>
            </svg>
          </div>
        </div>
      `,
      iconSize: [44, 44],
      iconAnchor: [22, 22]
    });

    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: [coords.lat, coords.lng],
        zoom: 16,
        zoomControl: true,
        attributionControl: false
      });

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19
      }).addTo(map);

      // Draggable Marker Pin
      const marker = L.marker([coords.lat, coords.lng], {
        icon: pinIcon,
        draggable: true
      }).addTo(map);

      // Blue Geofence Circle
      const circle = L.circle([coords.lat, coords.lng], {
        radius: geofenceRadius,
        color: '#0071E3',
        fillColor: '#0071E3',
        fillOpacity: 0.16,
        weight: 2
      }).addTo(map);

      markerRef.current = marker;
      circleRef.current = circle;
      mapInstanceRef.current = map;

      // Handle Marker Drag
      marker.on('dragend', (e) => {
        const newPos = e.target.getLatLng();
        const lat = parseFloat(newPos.lat.toFixed(6));
        const lng = parseFloat(newPos.lng.toFixed(6));
        setCoords({ lat, lng });
        circle.setLatLng([lat, lng]);
        reverseGeocode(lat, lng);
      });

      // Handle Map Click
      map.on('click', (e) => {
        const lat = parseFloat(e.latlng.lat.toFixed(6));
        const lng = parseFloat(e.latlng.lng.toFixed(6));
        setCoords({ lat, lng });
        marker.setLatLng([lat, lng]);
        circle.setLatLng([lat, lng]);
        reverseGeocode(lat, lng);
      });
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Update circle radius when geofenceRadius changes
  useEffect(() => {
    if (circleRef.current) {
      circleRef.current.setRadius(geofenceRadius);
    }
  }, [geofenceRadius]);

  // Recenter map on coords update
  const updateMapPosition = (lat, lng) => {
    setCoords({ lat, lng });
    if (markerRef.current) markerRef.current.setLatLng([lat, lng]);
    if (circleRef.current) circleRef.current.setLatLng([lat, lng]);
    if (mapInstanceRef.current) mapInstanceRef.current.panTo([lat, lng]);
    reverseGeocode(lat, lng);
  };

  // Browser GPS Geolocation
  const handleLocateMe = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser.');
      return;
    }
    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = parseFloat(pos.coords.latitude.toFixed(6));
        const lng = parseFloat(pos.coords.longitude.toFixed(6));
        updateMapPosition(lat, lng);
        setIsLocating(false);
      },
      (err) => {
        console.warn('GPS location error:', err);
        setIsLocating(false);
        updateMapPosition(13.014333, 77.646000);
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  };

  const handleSave = () => {
    const data = {
      lat: coords.lat,
      lng: coords.lng,
      radius: geofenceRadius,
      title: storeTitle,
      address: resolvedAddress
    };
    if (onSaveLocation) onSaveLocation(data);
    setSavedNotice(`✅ Supermarket Location Saved: ${coords.lat}, ${coords.lng} (${geofenceRadius}m radius)`);
    setTimeout(() => setSavedNotice(''), 4000);
  };

  return (
    <div style={{
      background: '#FFFFFF',
      borderRadius: '18px',
      padding: '20px',
      color: '#0F172A',
      boxShadow: '0 2px 12px rgba(0, 0, 0, 0.03)',
      border: '1px solid #E2E8F0'
    }}>
      {/* ── HEADER ROW (LIGHT THEME) ── */}
      <div style={{
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '12px',
        marginBottom: '16px'
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <Navigation size={18} color="#0071E3" />
            <h3 style={{
              fontSize: '14px',
              fontWeight: 900,
              color: '#0071E3',
              margin: 0,
              letterSpacing: '0.6px',
              textTransform: 'uppercase'
            }}>
              INTERACTIVE MAP &amp; GEOFENCE VISUALIZER
            </h3>
          </div>
          <p style={{ fontSize: '12px', color: '#64748B', margin: 0, lineHeight: 1.3, fontWeight: 500 }}>
            Drag the marker pin or click anywhere on the map to set exact supermarket hub coordinates.
          </p>
        </div>

        {/* Lat/Lng Badge */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          background: '#F8FAFC',
          border: '1px solid #E2E8F0',
          borderRadius: '10px',
          padding: '6px 12px',
          fontSize: '12.5px',
          fontWeight: 800,
          color: '#0071E3'
        }}>
          <MapPin size={14} color="#0071E3" />
          <span>{coords.lat.toFixed(4)}, {coords.lng.toFixed(4)}</span>
        </div>
      </div>

      {/* ── MAP CONTAINER ── */}
      <div style={{ position: 'relative', width: '100%', borderRadius: '14px', overflow: 'hidden', border: '1px solid #CBD5E1' }}>
        <div ref={mapContainerRef} style={{ width: '100%', height: '360px', zIndex: 1 }} />

        {/* Top-Right GPS Location Button Overlay */}
        <div style={{ position: 'absolute', top: '12px', right: '12px', zIndex: 500 }}>
          <button
            type="button"
            onClick={handleLocateMe}
            disabled={isLocating}
            style={{
              background: '#FFFFFF',
              color: '#0F172A',
              border: '1px solid #CBD5E1',
              borderRadius: '8px',
              padding: '8px 12px',
              fontSize: '11.5px',
              fontWeight: 800,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
            }}
          >
            <LocateFixed size={14} color="#0071E3" />
            {isLocating ? 'Locating...' : 'My Location'}
          </button>
        </div>

        {/* ── BOTTOM LIGHT GLASSMORPHISM OVERLAY BANNER ── */}
        <div style={{
          position: 'absolute',
          bottom: '12px',
          left: '12px',
          right: '12px',
          zIndex: 500,
          background: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(8px)',
          borderRadius: '12px',
          padding: '12px 16px',
          border: '1px solid #E2E8F0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '8px',
          boxShadow: '0 4px 16px rgba(0,0,0,0.06)'
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#0071E3', display: 'inline-block' }} />
              <strong style={{ fontSize: '13.5px', fontWeight: 900, color: '#0F172A' }}>
                {storeTitle}
              </strong>
            </div>
            <div style={{ fontSize: '11px', color: '#64748B', marginTop: '2px', fontWeight: 600 }}>
              Radius: {geofenceRadius} meters &nbsp;|&nbsp; Lat: {coords.lat} &nbsp;|&nbsp; Lon: {coords.lng}
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', color: '#059669', fontWeight: 800 }}>
            <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#10B981' }} />
            <span>Cloud Live &nbsp;•&nbsp; {liveTime || 'Online'}</span>
          </div>
        </div>
      </div>

      {/* ── SETUP CONTROLS BELOW MAP (LIGHT THEME) ── */}
      <div style={{ marginTop: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 180px', gap: '12px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '11px', fontWeight: 800, color: '#475569', textTransform: 'uppercase', marginBottom: '4px' }}>
              Resolved Address
            </label>
            <input
              readOnly
              value={isResolving ? 'Resolving map location...' : resolvedAddress}
              style={{
                width: '100%',
                padding: '9px 12px',
                borderRadius: '8px',
                border: '1.5px solid #CBD5E1',
                background: '#F8FAFC',
                color: '#0F172A',
                fontSize: '12.5px',
                fontWeight: 600,
                outline: 'none'
              }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '11px', fontWeight: 800, color: '#475569', textTransform: 'uppercase', marginBottom: '4px' }}>
              Delivery Geofence
            </label>
            <select
              value={geofenceRadius}
              onChange={(e) => setGeofenceRadius(Number(e.target.value))}
              style={{
                width: '100%',
                padding: '9px 12px',
                borderRadius: '8px',
                border: '1.5px solid #CBD5E1',
                background: '#F8FAFC',
                color: '#0071E3',
                fontSize: '12.5px',
                fontWeight: 800,
                outline: 'none',
                cursor: 'pointer'
              }}
            >
              <option value={50}>50 Meters Radius</option>
              <option value={100}>100 Meters Radius</option>
              <option value={250}>250 Meters Radius</option>
              <option value={500}>500 Meters Radius</option>
              <option value={1000}>1,000 Meters Radius</option>
            </select>
          </div>
        </div>

        {/* Notice Message */}
        {savedNotice && (
          <div style={{ padding: '10px 14px', borderRadius: '8px', background: '#ECFDF5', border: '1px solid #A7F3D0', color: '#047857', fontSize: '12.5px', fontWeight: 800 }}>
            {savedNotice}
          </div>
        )}

        {/* Save Button */}
        <button
          type="button"
          onClick={handleSave}
          style={{
            background: 'linear-gradient(135deg, #0071E3 0%, #005BB5 100%)',
            color: '#FFFFFF',
            border: 'none',
            borderRadius: '10px',
            padding: '12px',
            fontSize: '13.5px',
            fontWeight: 800,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            boxShadow: '0 4px 14px rgba(0, 113, 227, 0.25)'
          }}
        >
          <Check size={16} /> Save Supermarket Location
        </button>
      </div>
    </div>
  );
}
