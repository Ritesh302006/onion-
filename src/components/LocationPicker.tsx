import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { MapPin, RefreshCw, AlertCircle, CheckCircle2 } from 'lucide-react';
import { LocationData } from '@/lib/types';
import 'leaflet/dist/leaflet.css';

// Fix for default Leaflet icon not showing up in React
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Component to dynamically update map center
function MapUpdater({ center }: { center: [number, number] }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, map.getZoom());
  }, [center, map]);
  return null;
}

interface LocationPickerProps {
  onLocationChange: (location: LocationData | null) => void;
  className?: string;
}

export function LocationPicker({ onLocationChange, className = '' }: LocationPickerProps) {
  const [location, setLocation] = useState<LocationData | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchLocation = () => {
    setLoading(true);
    setError(null);
    onLocationChange(null);
    setLocation(null);

    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser.');
      setLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude, accuracy } = position.coords;
        
        try {
          const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${latitude}&lon=${longitude}`);
          if (!response.ok) throw new Error('Reverse geocoding failed');
          
          const text = await response.text();
          let data;
          try {
            data = JSON.parse(text);
          } catch (e) {
            throw new Error('Reverse geocoding returned invalid JSON');
          }
          
          const address = data.address || {};
          
          const locData: LocationData = {
            lat: latitude,
            lng: longitude,
            accuracy,
            timestamp: new Date().toISOString(),
            address: {
              city: address.city || address.town || address.village || address.suburb,
              district: address.state_district || address.county,
              state: address.state,
              country: address.country,
              formatted: data.display_name,
            }
          };

          setLocation(locData);
          onLocationChange(locData);
        } catch (err) {
          console.error("Geocoding Error:", err);
          // Still save GPS coordinates even if geocoding fails
          const fallbackData: LocationData = {
            lat: latitude,
            lng: longitude,
            accuracy,
            timestamp: new Date().toISOString(),
            address: { formatted: 'Address lookup failed' }
          };
          setLocation(fallbackData);
          onLocationChange(fallbackData);
        } finally {
          setLoading(false);
        }
      },
      (err) => {
        let msg = 'Failed to retrieve location.';
        if (err.code === 1) msg = 'Location access denied. Please allow location permissions.';
        if (err.code === 2) msg = 'Location unavailable.';
        if (err.code === 3) msg = 'Location request timed out.';
        setError(msg);
        setLoading(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 0,
      }
    );
  };

  useEffect(() => {
    fetchLocation();
  }, []);

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-slate-800 dark:text-white flex items-center gap-2">
            <MapPin className="w-4 h-4 text-emerald-600" />
            Location Verification
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Required for official inspection certificate
          </p>
        </div>
        <button
          type="button"
          onClick={fetchLocation}
          disabled={loading}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-md text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-50 transition-colors"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-emerald-500' : ''}`} />
          Refresh
        </button>
      </div>

      <div className="bg-slate-50 dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-700 overflow-hidden">
        {loading && !location ? (
          <div className="h-48 flex flex-col items-center justify-center text-slate-500">
            <RefreshCw className="w-6 h-6 animate-spin mb-2" />
            <p className="text-sm font-medium">Acquiring GPS Signal...</p>
          </div>
        ) : error ? (
          <div className="h-48 flex flex-col items-center justify-center p-6 text-center">
            <AlertCircle className="w-8 h-8 text-amber-500 mb-2" />
            <p className="text-sm font-medium text-slate-700 dark:text-slate-300">{error}</p>
            <p className="text-xs text-slate-500 mt-2 max-w-xs">Please ensure location permissions are enabled in your browser/device settings.</p>
          </div>
        ) : location ? (
          <div className="flex flex-col md:flex-row">
            <div className="h-48 md:w-1/2 relative z-0">
              <MapContainer 
                center={[location.lat, location.lng]} 
                zoom={14} 
                className="h-full w-full"
                zoomControl={false}
              >
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/">OSM</a>'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <MapUpdater center={[location.lat, location.lng]} />
                <Marker position={[location.lat, location.lng]}>
                  <Popup>Inspection Location</Popup>
                </Marker>
              </MapContainer>
            </div>
            
            <div className="p-4 md:w-1/2 flex flex-col justify-center space-y-3 bg-white dark:bg-slate-800">
              <div className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" />
                <div>
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Verified Location</p>
                  <p className="text-sm font-medium text-slate-900 dark:text-white mt-1">
                    {location.address.city && `${location.address.city}, `}
                    {location.address.district && `${location.address.district}`}
                  </p>
                  {location.address.state && (
                    <p className="text-sm text-slate-600 dark:text-slate-300">
                      {location.address.state}, {location.address.country}
                    </p>
                  )}
                  {(!location.address.city && !location.address.district && location.address.formatted !== 'Address lookup failed') && (
                     <p className="text-sm font-medium text-slate-900 dark:text-white mt-1 line-clamp-2">
                       {location.address.formatted}
                     </p>
                  )}
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-3 pt-3 border-t border-slate-100 dark:border-slate-700">
                <div>
                  <p className="text-[10px] uppercase font-bold text-slate-400">GPS Coordinates</p>
                  <p className="text-xs font-mono text-slate-700 dark:text-slate-300 mt-0.5">
                    {location.lat.toFixed(5)}, {location.lng.toFixed(5)}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] uppercase font-bold text-slate-400">Accuracy</p>
                  <p className="text-xs font-mono text-slate-700 dark:text-slate-300 mt-0.5">
                    ± {Math.round(location.accuracy)} meters
                  </p>
                </div>
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
