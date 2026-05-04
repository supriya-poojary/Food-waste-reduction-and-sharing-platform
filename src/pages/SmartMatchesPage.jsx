import { useState, useEffect, useCallback, useRef } from 'react';
import { motion } from 'framer-motion';
import { MapContainer, TileLayer, Marker, Popup, Circle } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { MapPin, Navigation, Compass, Star, Crosshair } from 'lucide-react';
import { api } from '../data/storage';
import { Button } from '../components/ui/Button';
import FoodCard from '../components/food/FoodCard';
import UrgencyBadge from '../components/ui/UrgencyBadge';
import { SkeletonGrid } from '../components/ui/Skeleton';
import toast from 'react-hot-toast';

// Fix for default Leaflet markers
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const myIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

export default function SmartMatchesPage() {
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userLocation, setUserLocation] = useState(null);
  const [radius, setRadius] = useState(30);
  const mapRef = useRef(null);

  const fetchMatches = useCallback(async (lat, lng) => {
    setLoading(true);
    try {
      const data = await api.getMatches({ lat, lng, radius });
      setMatches(data);
    } catch (error) {
      toast.error('Failed to fetch smart matches');
    } finally {
      setLoading(false);
    }
  }, [radius]);

  const getLocation = () => {
    if (!navigator.geolocation) {
      toast.error('Geolocation is not supported by your browser');
      // Fallback to Bangalore default
      setUserLocation({ lat: 12.9716, lng: 77.5946 });
      fetchMatches(12.9716, 77.5946);
      return;
    }

    setLoading(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setUserLocation({ lat: latitude, lng: longitude });
        fetchMatches(latitude, longitude);
      },
      (error) => {
        toast.error('Could not access location. Using default.');
        setUserLocation({ lat: 12.9716, lng: 77.5946 });
        fetchMatches(12.9716, 77.5946);
      }
    );
  };

  useEffect(() => {
    getLocation();
  }, []);

  useEffect(() => {
    if (userLocation && mapRef.current) {
      mapRef.current.setView([userLocation.lat, userLocation.lng], 12);
    }
  }, [userLocation]);

  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        
        {/* Header */}
        <div className="mb-8 animate-fade-up">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-gradient-to-br from-green-400/20 to-emerald-600/20 rounded-xl border border-green-500/30">
              <Compass size={24} className="text-green-400" />
            </div>
            <h1 className="font-display font-black text-4xl text-white">Smart Matches</h1>
          </div>
          <p className="text-white/60 max-w-2xl">
            Our AI-powered algorithm connects you with nearby food donations based on distance, expiry urgency, and quantity.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column: Map & Controls */}
          <div className="lg:col-span-1 space-y-6">
            
            <div className="glass-card p-5 animate-fade-up" style={{ animationDelay: '100ms' }}>
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-white flex items-center gap-2">
                  <Navigation size={16} className="text-blue-400" />
                  Your Location
                </h3>
                <button 
                  onClick={getLocation}
                  className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white/70 transition-colors"
                  title="Update Location"
                >
                  <Crosshair size={16} />
                </button>
              </div>

              {/* Map container */}
              <div className="w-full h-64 rounded-xl overflow-hidden border border-white/10 relative z-0 mb-4 bg-slate-800">
                {userLocation ? (
                  <MapContainer 
                    center={[userLocation.lat, userLocation.lng]} 
                    zoom={12} 
                    style={{ height: '100%', width: '100%', zIndex: 1 }}
                    ref={mapRef}
                  >
                    <TileLayer
                      attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                      url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                    />
                    <Marker position={[userLocation.lat, userLocation.lng]}>
                      <Popup className="text-slate-800 font-medium">You are here</Popup>
                    </Marker>
                    <Circle 
                      center={[userLocation.lat, userLocation.lng]} 
                      radius={radius * 1000} 
                      pathOptions={{ color: '#22c55e', fillColor: '#22c55e', fillOpacity: 0.1 }} 
                    />
                    
                    {matches.map(m => m.lat && m.lng && (
                      <Marker key={m.id} position={[m.lat, m.lng]} icon={myIcon}>
                        <Popup>
                          <div className="p-1 min-w-[150px]">
                            <p className="font-bold text-slate-800 text-sm leading-tight mb-1">{m.title}</p>
                            <p className="text-xs text-slate-600 mb-2">{m.distanceKm} km away</p>
                            <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${m.urgency === 'URGENT' || m.urgency === 'HIGH' ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'}`}>
                              {m.expiryStatus}
                            </span>
                          </div>
                        </Popup>
                      </Marker>
                    ))}
                  </MapContainer>
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center bg-white/5">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500"></div>
                  </div>
                )}
              </div>

              {/* Controls */}
              <div className="space-y-3">
                <label className="text-sm text-white/70 flex justify-between">
                  <span>Search Radius</span>
                  <span className="font-mono text-green-400">{radius} km</span>
                </label>
                <input 
                  type="range" 
                  min="1" 
                  max="100" 
                  value={radius} 
                  onChange={(e) => setRadius(e.target.value)}
                  onMouseUp={() => { if(userLocation) fetchMatches(userLocation.lat, userLocation.lng) }}
                  onTouchEnd={() => { if(userLocation) fetchMatches(userLocation.lat, userLocation.lng) }}
                  className="w-full accent-green-500"
                />
              </div>
            </div>
            
            {/* Legend / Info */}
            <div className="glass-card p-5 animate-fade-up" style={{ animationDelay: '150ms' }}>
              <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
                <Star size={16} className="text-yellow-400" />
                Matching Criteria
              </h3>
              <ul className="space-y-3 text-sm text-white/60">
                <li className="flex items-center gap-2">
                  <span className="w-8 h-1.5 rounded-full bg-red-400"></span> 
                  <span><strong>40% Expiry:</strong> Highly favors soon-to-expire items</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-8 h-1.5 rounded-full bg-blue-400"></span> 
                  <span><strong>35% Distance:</strong> Prioritizes food closest to you</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-8 h-1.5 rounded-full bg-purple-400"></span> 
                  <span><strong>25% Quantity:</strong> Values larger donations slightly more</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Right Column: List */}
          <div className="lg:col-span-2">
            {loading ? (
              <SkeletonGrid count={4} />
            ) : matches.length === 0 ? (
              <div className="glass-card p-12 flex flex-col items-center justify-center text-center">
                <MapPin size={48} className="text-white/20 mb-4" />
                <h3 className="text-xl font-bold text-white mb-2">No Matches Found</h3>
                <p className="text-white/50 max-w-sm">
                  We couldn't find any available food within {radius}km of your location. Try expanding your search radius.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {matches.map((item, index) => (
                  <MatchCard key={item.id} item={item} index={index} />
                ))}
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}

function MatchCard({ item, index }) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className="glass-card-hover p-4 flex flex-col sm:flex-row gap-4 relative overflow-hidden"
    >
      {/* Match Score Strip */}
      <div className="absolute top-0 bottom-0 left-0 w-1.5 bg-gradient-to-b from-green-400 to-emerald-600"></div>

      <img 
        src={item.image} 
        alt={item.title} 
        className="w-full sm:w-40 h-32 object-cover rounded-xl border border-white/10" 
      />
      
      <div className="flex-1 flex flex-col justify-between">
        <div>
          <div className="flex justify-between items-start mb-1">
            <h3 className="font-semibold text-lg text-white line-clamp-1 group-hover:text-green-400 transition-colors">
              {item.title}
            </h3>
            <div className="flex items-center gap-1 bg-white/5 border border-white/10 px-2 py-1 rounded-lg">
              <span className="text-green-400 font-bold text-sm">{item.matchScore}%</span>
              <span className="text-[10px] text-white/50 uppercase">Match</span>
            </div>
          </div>
          
          <div className="flex flex-wrap gap-2 mb-3">
            <UrgencyBadge level={item.urgency} size="sm" />
            <span className="badge bg-white/5 text-white/60 border-white/10">
              {item.category}
            </span>
          </div>
          
          <p className="text-sm text-white/50 line-clamp-1 mb-2">{item.description}</p>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-white/10">
          <div className="flex gap-4">
            <div className="flex flex-col">
              <span className="text-[10px] text-white/40 uppercase tracking-wider">Distance</span>
              <span className="text-sm font-medium text-white">{item.distanceKm ? `${item.distanceKm} km` : 'N/A'}</span>
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] text-white/40 uppercase tracking-wider">Quantity</span>
              <span className="text-sm font-medium text-white">~{item.servings} serv.</span>
            </div>
          </div>
          
          <Button 
            variant="primary" 
            size="sm" 
            className="py-1.5 px-4"
            onClick={() => window.location.href = `/food/${item.id}`}
          >
            View Details
          </Button>
        </div>
      </div>
    </motion.div>
  );
}
