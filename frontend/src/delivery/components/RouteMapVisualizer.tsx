import React, { useEffect, useRef, useState, useCallback } from 'react';
import { OrderStatus } from '../types/delivery';
import { useDelivery } from '../context/DeliveryContext';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import {
  Navigation,
  Compass,
  MapPin,
  Store,
  Crosshair,
  Layers,
  LocateFixed,
  Radio,
  Zap,
  Info,
  Maximize2,
  ExternalLink
} from 'lucide-react';

interface RouteMapVisualizerProps {
  orderStatus: OrderStatus;
  merchantName?: string;
  customerName?: string;
  customerAddress?: string;
  distanceKm?: number;
  estimatedMinutes?: number;
  hubCoords?: { lat: number; lng: number };
  customerCoords?: { lat: number; lng: number };
}

export const RouteMapVisualizer: React.FC<RouteMapVisualizerProps> = ({
  orderStatus,
  merchantName = 'GrabIt Supermarket (Koramangala)',
  customerName = 'Customer',
  customerAddress = 'HSR Layout, Bengaluru',
  distanceKm = 3.4,
  estimatedMinutes = 16,
  hubCoords = { lat: 12.9352, lng: 77.6245 }, // Koramangala 4th Block Hub
  customerCoords = { lat: 12.9116, lng: 77.6389 } // HSR Layout Sector 2
}) => {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const routeLayerRef = useRef<L.Polyline | null>(null);
  const driverMarkerRef = useRef<L.Marker | null>(null);
  const hubMarkerRef = useRef<L.Marker | null>(null);
  const customerMarkerRef = useRef<L.Marker | null>(null);
  const accuracyCircleRef = useRef<L.Circle | null>(null);
  const liveGpsWatchId = useRef<number | null>(null);

  const [mapType, setMapType] = useState<'STREET' | 'SATELLITE'>('STREET');
  const [useDeviceGps, setUseDeviceGps] = useState(false);
  const [deviceGpsCoords, setDeviceGpsCoords] = useState<{ lat: number; lng: number; accuracy: number } | null>(null);
  const [gpsStatusText, setGpsStatusText] = useState('GPS Fix: Active (±3m)');
  const [isGpsLoading, setIsGpsLoading] = useState(false);
  const [bearing, setBearing] = useState(145);

  // Determine current active destination (use device GPS if enabled and valid, else customerCoords)
  const targetCoords = useDeviceGps && deviceGpsCoords
    ? { lat: deviceGpsCoords.lat, lng: deviceGpsCoords.lng }
    : customerCoords;

  // Generate realistic route waypoints along road network between Hub and Customer
  const generateRouteWaypoints = useCallback((start: { lat: number; lng: number }, end: { lat: number; lng: number }): [number, number][] => {
    const latDiff = end.lat - start.lat;
    const lngDiff = end.lng - start.lng;

    // Realistic street turn geometry
    return [
      [start.lat, start.lng],
      [start.lat - latDiff * 0.15, start.lng + lngDiff * 0.05], // Exit Supermarket bay onto 80 Feet Road
      [start.lat - latDiff * 0.35, start.lng + lngDiff * 0.28], // Turn onto Sarjapur Main Road junction
      [start.lat - latDiff * 0.60, start.lng + lngDiff * 0.65], // Agara Lake Flyover arterial
      [start.lat - latDiff * 0.82, start.lng + lngDiff * 0.88], // Entering sector 2 ring road
      [end.lat, end.lng] // Customer doorstep destination
    ];
  }, []);

  // Compute driver position along the route based on orderStatus or live GPS
  const getDriverPosition = useCallback((waypoints: [number, number][], status: OrderStatus): [number, number] => {
    let progressRatio = 0.0;
    switch (status) {
      case 'ACCEPTED':
        progressRatio = 0.02; // At Hub
        break;
      case 'REACHED_PICKUP':
        progressRatio = 0.05; // In Dispatch Bay
        break;
      case 'PICKED_UP':
        progressRatio = 0.18; // Leaving Hub
        break;
      case 'OUT_FOR_DELIVERY':
        progressRatio = 0.58; // Mid-route on arterial
        break;
      case 'ARRIVED':
        progressRatio = 0.96; // At customer gate
        break;
      case 'DELIVERED':
        progressRatio = 1.0; // Completed
        break;
      default:
        progressRatio = 0.5;
    }

    if (waypoints.length < 2) return [hubCoords.lat, hubCoords.lng];

    const totalSegments = waypoints.length - 1;
    const currentSegmentIndex = Math.min(
      Math.floor(progressRatio * totalSegments),
      totalSegments - 1
    );
    const subProgress = (progressRatio * totalSegments) - currentSegmentIndex;

    const pA = waypoints[currentSegmentIndex];
    const pB = waypoints[currentSegmentIndex + 1];

    const lat = pA[0] + (pB[0] - pA[0]) * subProgress;
    const lng = pA[1] + (pB[1] - pA[1]) * subProgress;

    return [lat, lng];
  }, [hubCoords]);

  // Turn-by-turn navigation prompt
  const getNavPrompt = () => {
    if (useDeviceGps && deviceGpsCoords) {
      return `Tracking Real Live Device GPS (Accuracy: ±${Math.round(deviceGpsCoords.accuracy)}m)`;
    }
    switch (orderStatus) {
      case 'ASSIGNED':
      case 'ACCEPTED':
      case 'REACHED_PICKUP':
        return 'Head to GrabIt Supermarket Dispatch Bay 3 (80 Feet Road)';
      case 'PICKED_UP':
        return `In 200m, turn left onto 80 Feet Road towards ${customerName}`;
      case 'OUT_FOR_DELIVERY':
        return `Continue on Outer Ring Road • ${(distanceKm * 0.4).toFixed(1)} km to doorstep`;
      case 'ARRIVED':
        return `Arrived at ${customerName}'s doorstep • Request 4-digit OTP`;
      case 'DELIVERED':
        return 'Order handover completed successfully';
      default:
        return `Navigating to ${customerName}`;
    }
  };

  // Initialize Leaflet Map
  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    const map = L.map(mapContainerRef.current, {
      center: [hubCoords.lat, hubCoords.lng],
      zoom: 14,
      zoomControl: false,
      attributionControl: false
    });

    // Street Tiles
    const streetTile = L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
      maxZoom: 19,
      subdomains: 'abcd'
    }).addTo(map);

    mapInstanceRef.current = map;

    // Custom Hub Pin Icon
    const hubIcon = L.divIcon({
      className: 'custom-hub-marker',
      html: `
        <div style="
          width: 38px; height: 38px;
          border-radius: 50%;
          background-color: #0071E3;
          border: 3px solid #FFFFFF;
          box-shadow: 0 4px 14px rgba(0, 113, 227, 0.45);
          display: flex; align-items: center; justify-content: center;
          color: #FFFFFF; font-size: 18px;
        ">
          🏪
        </div>
      `,
      iconSize: [38, 38],
      iconAnchor: [19, 19]
    });

    // Custom Customer Pin Icon
    const customerIcon = L.divIcon({
      className: 'custom-customer-marker',
      html: `
        <div style="
          width: 38px; height: 38px;
          border-radius: 50%;
          background-color: #34C759;
          border: 3px solid #FFFFFF;
          box-shadow: 0 4px 14px rgba(52, 199, 89, 0.45);
          display: flex; align-items: center; justify-content: center;
          color: #FFFFFF; font-size: 18px;
        ">
          📍
        </div>
      `,
      iconSize: [38, 38],
      iconAnchor: [19, 36]
    });

    // Custom Driver Vehicle Icon
    const driverIcon = L.divIcon({
      className: 'custom-driver-marker',
      html: `
        <div style="
          position: relative;
          width: 44px; height: 44px;
          display: flex; align-items: center; justify-content: center;
        ">
          <div style="
            position: absolute; inset: 0;
            border-radius: 50%;
            background-color: rgba(0, 113, 227, 0.25);
            animation: pulse-ring 2s infinite;
          "></div>
          <div style="
            width: 34px; height: 34px;
            border-radius: 50%;
            background-color: #1D1D1F;
            border: 2.5px solid #FFFFFF;
            box-shadow: 0 6px 18px rgba(0,0,0,0.3);
            display: flex; align-items: center; justify-content: center;
            color: #0071E3;
            transform: rotate(${bearing}deg);
            transition: transform 0.4s ease;
          ">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="#0071E3" stroke="#0071E3" stroke-width="2">
              <polygon points="12 2 19 21 12 17 5 21 12 2"></polygon>
            </svg>
          </div>
        </div>
      `,
      iconSize: [44, 44],
      iconAnchor: [22, 22]
    });

    // Create markers
    const hubMarker = L.marker([hubCoords.lat, hubCoords.lng], { icon: hubIcon })
      .addTo(map)
      .bindPopup(`<b>GrabIt Supermarket (Hub)</b><br/>80 Feet Road, Koramangala 4th Block`);

    const customerMarker = L.marker([targetCoords.lat, targetCoords.lng], { icon: customerIcon })
      .addTo(map)
      .bindPopup(`<b>${customerName}</b><br/>${customerAddress}`);

    const loggedRiderName = (() => {
      try {
        const u = JSON.parse(localStorage.getItem('grabit_user') || '{}');
        return u.full_name || u.name || 'Partner';
      } catch {
        return 'Partner';
      }
    })();

    const driverMarker = L.marker([hubCoords.lat, hubCoords.lng], { icon: driverIcon, zIndexOffset: 1000 })
      .addTo(map)
      .bindPopup(`<b>Delivery Agent ${loggedRiderName}</b><br/>Status: ${orderStatus}`);

    hubMarkerRef.current = hubMarker;
    customerMarkerRef.current = customerMarker;
    driverMarkerRef.current = driverMarker;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Update Route Polyline and Positions on Step / Target Change
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    const waypoints = generateRouteWaypoints(hubCoords, targetCoords);

    // Remove existing polyline
    if (routeLayerRef.current) {
      map.removeLayer(routeLayerRef.current);
    }

    // Draw high-visibility route polyline
    const polyline = L.polyline(waypoints, {
      color: '#0071E3',
      weight: 6,
      opacity: 0.85,
      lineCap: 'round',
      lineJoin: 'round',
      dashArray: orderStatus === 'OUT_FOR_DELIVERY' ? '8, 8' : undefined
    }).addTo(map);

    routeLayerRef.current = polyline;

    // Update customer marker position
    if (customerMarkerRef.current) {
      customerMarkerRef.current.setLatLng([targetCoords.lat, targetCoords.lng]);
    }

    // Update driver position
    const driverPos = (useDeviceGps && deviceGpsCoords)
      ? [deviceGpsCoords.lat, deviceGpsCoords.lng] as [number, number]
      : getDriverPosition(waypoints, orderStatus);

    if (driverMarkerRef.current) {
      driverMarkerRef.current.setLatLng(driverPos);
    }

    // Smoothly fit bounds
    const bounds = L.latLngBounds([
      [hubCoords.lat, hubCoords.lng],
      [targetCoords.lat, targetCoords.lng],
      driverPos
    ]);

    map.fitBounds(bounds, {
      padding: [40, 40],
      maxZoom: 16,
      animate: true
    });
  }, [hubCoords, targetCoords, orderStatus, useDeviceGps, deviceGpsCoords, generateRouteWaypoints, getDriverPosition]);

  const { showAlert } = useDelivery();

  // Handle Real Device GPS Geolocation
  const toggleDeviceGps = () => {
    if (!useDeviceGps) {
      if (!navigator.geolocation) {
        showAlert({
          title: 'GPS Unavailable',
          message: 'Geolocation is not supported by your browser.',
          type: 'warning'
        });
        return;
      }

      setIsGpsLoading(true);
      setGpsStatusText('Acquiring Real Device GPS Fix...');

      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const { latitude, longitude, accuracy } = pos.coords;
          setDeviceGpsCoords({ lat: latitude, lng: longitude, accuracy });
          setUseDeviceGps(true);
          setIsGpsLoading(false);
          setGpsStatusText(`Real GPS Active: ±${Math.round(accuracy)}m`);

          // Watch position
          liveGpsWatchId.current = navigator.geolocation.watchPosition(
            (update) => {
              setDeviceGpsCoords({
                lat: update.coords.latitude,
                lng: update.coords.longitude,
                accuracy: update.coords.accuracy
              });
              if (update.coords.heading) {
                setBearing(update.coords.heading);
              }
            },
            (err) => console.warn('GPS Watch warning:', err),
            { enableHighAccuracy: true, maximumAge: 2000, timeout: 10000 }
          );
        },
        (err) => {
          setIsGpsLoading(false);
          showAlert({
            title: 'GPS Notice',
            message: `Could not acquire real GPS location: ${err.message}. Showing simulated route.`,
            type: 'info'
          });
          setGpsStatusText('Simulated GPS Active (±3m)');
        },
        { enableHighAccuracy: true, timeout: 8000 }
      );
    } else {
      if (liveGpsWatchId.current !== null) {
        navigator.geolocation.clearWatch(liveGpsWatchId.current);
        liveGpsWatchId.current = null;
      }
      setUseDeviceGps(false);
      setDeviceGpsCoords(null);
      setGpsStatusText('Simulated GPS Active (±3m)');
    }
  };

  const handleRecenter = () => {
    const map = mapInstanceRef.current;
    if (!map) return;

    const bounds = L.latLngBounds([
      [hubCoords.lat, hubCoords.lng],
      [targetCoords.lat, targetCoords.lng]
    ]);

    map.fitBounds(bounds, {
      padding: [40, 40],
      animate: true
    });
  };

  const handleFocusHub = () => {
    const map = mapInstanceRef.current;
    if (!map) return;
    map.flyTo([hubCoords.lat, hubCoords.lng], 16, { animate: true, duration: 1 });
    if (hubMarkerRef.current) {
      hubMarkerRef.current.openPopup();
    }
  };

  const handleFocusDestination = () => {
    const map = mapInstanceRef.current;
    if (!map) return;
    map.flyTo([targetCoords.lat, targetCoords.lng], 16, { animate: true, duration: 1 });
    if (customerMarkerRef.current) {
      customerMarkerRef.current.openPopup();
    }
  };

  // Open Google Maps with turn-by-turn directions from hub to customer
  const handleOpenGoogleMaps = () => {
    const origin = `${hubCoords.lat},${hubCoords.lng}`;
    // Use address string as destination so Google Maps shows the real delivery address
    const dest = encodeURIComponent(customerAddress);
    const url = `https://www.google.com/maps/dir/?api=1&origin=${origin}&destination=${dest}&travelmode=driving`;
    window.open(url, '_blank');
  };

  // Open Google Maps directions to customer only (uses address string as destination)
  const handleOpenDestInMaps = () => {
    // Use address string so Google Maps navigates to and labels the real delivery address
    const dest = encodeURIComponent(customerAddress);
    const url = `https://www.google.com/maps/dir/?api=1&destination=${dest}&travelmode=driving`;
    window.open(url, '_blank');
  };

  return (
    <div
      className="card"
      style={{
        padding: 0,
        position: 'relative',
        height: '320px',
        borderRadius: '24px',
        overflow: 'hidden',
        border: '1px solid var(--glass-border-medium)',
        boxShadow: 'var(--shadow-glass-card)'
      }}
    >
      {/* Real Interactive Leaflet Map Container */}
      <div
        ref={mapContainerRef}
        style={{
          width: '100%',
          height: '100%',
          zIndex: 1,
          backgroundColor: '#F5F5F7',
          touchAction: 'pan-y'
        }}
      />


      {/* Google Maps Navigate Button — Top Right */}
      <button
        onClick={handleOpenGoogleMaps}
        style={{
          position: 'absolute',
          top: '10px',
          right: '12px',
          zIndex: 10,
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          padding: '8px 13px',
          backgroundColor: '#FFFFFF',
          border: '1.5px solid rgba(0,113,227,0.3)',
          borderRadius: '12px',
          fontSize: '12px',
          fontWeight: '800',
          color: '#0071E3',
          cursor: 'pointer',
          boxShadow: '0 4px 14px rgba(0, 113, 227, 0.18)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          whiteSpace: 'nowrap',
        }}
        title="Open full route in Google Maps"
      >
        <ExternalLink size={13} />
        Google Maps
      </button>

      {/* Floating Interactive Controls (Right Side) */}
      <div
        style={{
          position: 'absolute',
          right: '12px',
          bottom: '50px',
          display: 'flex',
          flexDirection: 'column',
          gap: '8px',
          zIndex: 10
        }}
      >
        {/* Toggle Real Device GPS Button */}
        <button
          onClick={toggleDeviceGps}
          disabled={isGpsLoading}
          style={{
            width: '40px',
            height: '40px',
            borderRadius: '12px',
            backgroundColor: useDeviceGps ? 'var(--color-green)' : 'rgba(255, 255, 255, 0.85)',
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
            color: useDeviceGps ? '#FFFFFF' : 'var(--color-graphite)',
            border: '1px solid var(--glass-border-medium)',
            boxShadow: '0 4px 16px rgba(0,0,0,0.12)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            transition: 'all 0.2s ease'
          }}
          title={useDeviceGps ? 'Switch to Route Simulation' : 'Use Real Device GPS Location'}
        >
          <LocateFixed size={20} />
        </button>

        {/* Recenter / Fit Bounds Button */}
        <button
          onClick={handleRecenter}
          style={{
            width: '40px',
            height: '40px',
            borderRadius: '12px',
            backgroundColor: 'rgba(255, 255, 255, 0.85)',
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
            color: 'var(--color-graphite)',
            border: '1px solid var(--glass-border-medium)',
            boxShadow: '0 4px 16px rgba(0,0,0,0.12)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            transition: 'all 0.2s ease'
          }}
          title="Fit Route to Screen"
        >
          <Crosshair size={20} color="var(--color-blue)" />
        </button>
      </div>

      {/* Bottom Floating Hub & Destination Badges */}
      <div
        style={{
          position: 'absolute',
          bottom: '10px',
          left: '12px',
          right: '70px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          zIndex: 10,
          overflowX: 'auto',
          paddingBottom: '2px'
        }}
      >
        {/* Hub Badge Button */}
        <button
          type="button"
          onClick={handleFocusHub}
          style={{
            backgroundColor: 'rgba(255, 255, 255, 0.94)',
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
            border: '1.5px solid rgba(0, 113, 227, 0.35)',
            borderRadius: '12px',
            padding: '6px 12px',
            fontSize: '11.5px',
            fontWeight: '800',
            color: 'var(--color-blue)',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            whiteSpace: 'nowrap',
            boxShadow: '0 4px 12px rgba(0, 113, 227, 0.15)',
            cursor: 'pointer',
            transition: 'all 0.15s ease'
          }}
          title="Click to focus map on Supermarket Hub"
        >
          <Store size={14} color="var(--color-blue)" />
          <span>Hub: {merchantName}</span>
        </button>

        {/* Customer Destination Badge Button — tap focuses, long interaction hint */}
        <button
          type="button"
          onClick={handleFocusDestination}
          onDoubleClick={handleOpenDestInMaps}
          style={{
            backgroundColor: 'rgba(255, 255, 255, 0.94)',
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
            border: '1.5px solid rgba(52, 199, 89, 0.35)',
            borderRadius: '12px',
            padding: '6px 12px',
            fontSize: '11.5px',
            fontWeight: '800',
            color: 'var(--color-green)',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            whiteSpace: 'nowrap',
            boxShadow: '0 4px 12px rgba(52, 199, 89, 0.15)',
            cursor: 'pointer',
            transition: 'all 0.15s ease'
          }}
          title="Tap to focus • Double-tap to open in Google Maps"
        >
          <MapPin size={14} color="var(--color-green)" />
          <span>Dest: {customerName} ({distanceKm} km)</span>
        </button>
      </div>

    </div>
  );
};
