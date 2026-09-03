import { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Navigation, LocateFixed, Check, X, MapPin } from 'lucide-react';

export default function DeliveryLocationMapPicker({
  initialLat = 13.014333,
  initialLng = 77.646000,
  initialTitle = 'Kalpanaaa Software Solutions — Main Office',
  autoLocate = false,
  onSelectLocation,
  onClose
}) {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markerRef = useRef(null);
  const circleRef = useRef(null);

  const [coords, setCoords] = useState({ lat: initialLat, lng: initialLng });
  const [locationDetails, setLocationDetails] = useState({
    title: initialTitle,
    address: 'Detecting live delivery location...',
    area: '',
    city: '',
    state: '',
    pincode: ''
  });
  const [isLocating, setIsLocating] = useState(false);
  const [isResolving, setIsResolving] = useState(false);
  const [liveTime, setLiveTime] = useState('');

  // Update live clock string
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setLiveTime(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true }));
    };
    updateTime();
    const interval = setInterval(updateTime, 30000);
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
        const road = addr.road || addr.pedestrian || addr.suburb || addr.neighbourhood || 'Selected Location';
        const house = addr.house_number ? `${addr.house_number}, ` : '';
        const area = addr.suburb || addr.neighbourhood || addr.city_district || addr.residential || 'Bengaluru';
        const city = addr.city || addr.town || addr.municipality || 'Bengaluru';
        const postcode = addr.postcode || '560043';
        const state = addr.state || 'Karnataka';

        const title = data.name || (road ? `${road}` : 'Selected Delivery Pin');
        const fullAddress = `${house}${road}, ${area}`;

        setLocationDetails({
          title: title.length > 40 ? title.slice(0, 40) + '...' : title,
          address: fullAddress,
          area: area,
          city: `${city} ${postcode}`,
          state: state,
          pincode: postcode
        });
      }
    } catch (err) {
      console.warn('Reverse geocoding warning:', err);
    } finally {
      setIsResolving(false);
    }
  };

  // Initialize Leaflet Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    // Custom Blue Pulsing Pin matching Screenshot 2
    const pinIcon = L.divIcon({
      className: 'leaflet-custom-pulse-marker',
      html: `
        <div style="position: relative; width: 44px; height: 44px; display: flex; align-items: center; justify-content: center;">
          <div style="position: absolute; width: 44px; height: 44px; border-radius: 50%; background: rgba(0, 113, 227, 0.28); animation: pulse 2s infinite ease-in-out;"></div>
          <div style="position: absolute; width: 28px; height: 28px; border-radius: 50%; background: #0071E3; border: 3px solid #FFFFFF; box-shadow: 0 4px 14px rgba(0,113,227,0.6); display: flex; align-items: center; justify-content: center;">
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

    const map = L.map(mapContainerRef.current, {
      center: [initialLat, initialLng],
      zoom: 15,
      zoomControl: true,
      attributionControl: true
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: 'Leaflet | &copy; OpenStreetMap contributors'
    }).addTo(map);

    // Accuracy Circle matching Screenshot 2 (Radius 100 meters)
    const circle = L.circle([initialLat, initialLng], {
      radius: 100,
      color: '#0071E3',
      fillColor: '#0071E3',
      fillOpacity: 0.16,
      weight: 1.8
    }).addTo(map);

    // Draggable Pin Marker
    const marker = L.marker([initialLat, initialLng], {
      icon: pinIcon,
      draggable: true
    }).addTo(map);

    marker.on('dragend', (e) => {
      const newPos = e.target.getLatLng();
      setCoords({ lat: newPos.lat, lng: newPos.lng });
      circle.setLatLng(newPos);
      reverseGeocode(newPos.lat, newPos.lng);
    });

    map.on('click', (e) => {
      const clickPos = e.latlng;
      marker.setLatLng(clickPos);
      circle.setLatLng(clickPos);
      setCoords({ lat: clickPos.lat, lng: clickPos.lng });
      reverseGeocode(clickPos.lat, clickPos.lng);
    });

    mapInstanceRef.current = map;
    markerRef.current = marker;
    circleRef.current = circle;

    // Initial reverse geocode
    reverseGeocode(initialLat, initialLng);

    // Invalidate map size after initial render to avoid gray tile issues
    const timer = setTimeout(() => {
      map.invalidateSize();
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (pos) => {
            const lat = pos.coords.latitude;
            const lng = pos.coords.longitude;
            setCoords({ lat, lng });
            if (mapInstanceRef.current && markerRef.current && circleRef.current) {
              mapInstanceRef.current.flyTo([lat, lng], 16, { duration: 1.2 });
              markerRef.current.setLatLng([lat, lng]);
              circleRef.current.setLatLng([lat, lng]);
            }
            reverseGeocode(lat, lng);
          },
          () => {
            reverseGeocode(initialLat, initialLng);
          },
          { enableHighAccuracy: true, timeout: 6000 }
        );
      } else {
        reverseGeocode(initialLat, initialLng);
      }
    }, 250);

    return () => {
      clearTimeout(timer);
      map.remove();
    };
  }, []);

  // Center Map to Device GPS
  const handleLocateMe = () => {
    if (!navigator.geolocation) return;
    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        setCoords({ lat, lng });

        if (mapInstanceRef.current && markerRef.current && circleRef.current) {
          mapInstanceRef.current.flyTo([lat, lng], 16, { duration: 1.2 });
          markerRef.current.setLatLng([lat, lng]);
          circleRef.current.setLatLng([lat, lng]);
        }
        reverseGeocode(lat, lng);
        setIsLocating(false);
      },
      () => {
        setIsLocating(false);
      },
      { enableHighAccuracy: true, timeout: 6000 }
    );
  };

  const handleConfirm = () => {
    if (!onSelectLocation) return;
    onSelectLocation({
      id: Date.now(),
      title: locationDetails.title || 'Selected Map Location',
      tag: 'Pinned Location',
      address: locationDetails.address,
      area: locationDetails.area,
      city: locationDetails.city,
      state: locationDetails.state,
      pincode: locationDetails.pincode,
      time: '12-20 min express delivery',
      radius: '100 meters',
      lat: coords.lat,
      lng: coords.lng
    });
  };

  return (
    <div style={{ position: 'relative', width: '100%', borderRadius: '24px', overflow: 'hidden', border: '1px solid #E2E8F0', boxShadow: '0 8px 30px rgba(0,0,0,0.12)' }}>
      {/* 🗺️ Leaflet Map Canvas */}
      <div
        ref={mapContainerRef}
        style={{
          width: '100%',
          height: '420px',
          background: '#E2E8F0',
          position: 'relative',
          zIndex: 1
        }}
      />

      {/* Floating Action Controls on Top */}
      <div style={{ position: 'absolute', top: '14px', right: '14px', zIndex: 1000, display: 'flex', gap: '8px' }}>
        {/* Recenter GPS Button */}
        <button
          type="button"
          onClick={handleLocateMe}
          disabled={isLocating}
          title="Recenter to my GPS location"
          style={{
            width: '38px',
            height: '38px',
            borderRadius: '12px',
            background: '#FFFFFF',
            border: '1px solid #CBD5E1',
            boxShadow: '0 4px 14px rgba(0,0,0,0.15)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: isLocating ? 'wait' : 'pointer',
            color: '#0071E3',
            transition: 'all 0.15s ease'
          }}
        >
          <LocateFixed size={18} color="#0071E3" className={isLocating ? 'animate-spin' : ''} />
        </button>

        {/* Close Button if requested */}
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            style={{
              width: '38px',
              height: '38px',
              borderRadius: '12px',
              background: '#FFFFFF',
              border: '1px solid #CBD5E1',
              boxShadow: '0 4px 14px rgba(0,0,0,0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              color: '#64748B'
            }}
          >
            <X size={18} />
          </button>
        )}
      </div>

      {/* 🌟 LUXURY DARK FLOATING STATUS CARD (MATCHING SCREENSHOT 2 PIXEL FOR PIXEL) */}
      <div
        style={{
          position: 'absolute',
          bottom: '12px',
          left: '12px',
          right: '12px',
          background: 'rgba(15, 23, 42, 0.94)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          borderRadius: '18px',
          padding: '14px 16px',
          boxShadow: '0 12px 36px rgba(0, 0, 0, 0.4)',
          border: '1px solid rgba(255, 255, 255, 0.12)',
          zIndex: 1000,
          color: '#FFFFFF'
        }}
      >
        {/* Top Header Row: Blue Indicator Dot + Title + Status */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0, flex: 1 }}>
            <div style={{
              width: '11px',
              height: '11px',
              borderRadius: '50%',
              background: '#0071E3',
              boxShadow: '0 0 10px #0071E3',
              flexShrink: 0
            }} />
            <div style={{
              fontSize: '13.5px',
              fontWeight: 800,
              color: '#FFFFFF',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              letterSpacing: '-0.01em'
            }}>
              {locationDetails.title || 'Selected Delivery Location'}
            </div>
          </div>

          <div style={{ fontSize: '11px', fontWeight: 800, color: '#10B981', flexShrink: 0, display: 'flex', alignItems: 'center', gap: '5px' }}>
            <span style={{ fontSize: '8px' }}>●</span> Firestore Online
          </div>
        </div>

        {/* Coordinates & Metadata Row (MATCHING SCREENSHOT 2) */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '11px', color: '#94A3B8', marginBottom: '8px' }}>
          <div>
            Radius: 100 meters &nbsp;|&nbsp; Lat: {coords.lat.toFixed(6)} &nbsp;|&nbsp; Lon: {coords.lng.toFixed(6)}
          </div>
          <div style={{ fontSize: '10.5px', color: '#64748B' }}>
            Last: {liveTime || 'Just now'}
          </div>
        </div>

        {/* Reverse Geocoded Street Address Line */}
        <div style={{
          fontSize: '11.5px',
          fontWeight: 600,
          color: '#CBD5E1',
          paddingTop: '6px',
          borderTop: '1px solid rgba(255, 255, 255, 0.08)',
          lineHeight: 1.35,
          marginBottom: '10px'
        }}>
          {isResolving ? 'Resolving street address details...' : (locationDetails.address ? `📍 ${locationDetails.address}, ${locationDetails.city}` : '📍 Tap or drag pin to choose precise drop point')}
        </div>

        {/* Set as Delivery Location Action Button */}
        <button
          type="button"
          onClick={handleConfirm}
          style={{
            width: '100%',
            padding: '11px 16px',
            borderRadius: '12px',
            border: 'none',
            background: '#0071E3',
            color: '#FFFFFF',
            fontSize: '13px',
            fontWeight: 900,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px',
            boxShadow: '0 4px 14px rgba(0, 113, 227, 0.45)',
            transition: 'transform 0.15s ease'
          }}
          onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-1px)'}
          onMouseLeave={e => e.currentTarget.style.transform = 'none'}
        >
          <Check size={16} strokeWidth={2.5} /> Set as Delivery Location
        </button>
      </div>
    </div>
  );
}
