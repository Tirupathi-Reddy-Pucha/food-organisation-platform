import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import axios from 'axios';
import L from 'leaflet';
import { Navigation, MapPin, List, Play, CheckCircle2, Clock, Navigation2, X, AlertTriangle, Package, Users } from 'lucide-react';
import { calculateDistance } from '../utils/haversine';

// Fix Leaflet marker icon issue
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: markerIcon,
    shadowUrl: markerShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

// Component to auto-center map
function ChangeView({ center }) {
    const map = useMap();
    useEffect(() => {
        if (center) map.setView(center);
    }, [center, map]);
    return null;
}

const RouteOptimization = () => {
    const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';
    const [listings, setListings] = useState([]);
    const [selectedPoints, setSelectedPoints] = useState([]);
    const [userLocation, setUserLocation] = useState(null);
    const [user, setUser] = useState(null);
    const [optimizedRoute, setOptimizedRoute] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [stats, setStats] = useState({ distance: 0, duration: 0, sequence: [], fullCoords: [] });

    // Capacity & Range State
    const [capacity, setCapacity] = useState({
        maxWeight: parseFloat(localStorage.getItem('user_maxWeight') || '0'),
        maxServings: parseInt(localStorage.getItem('user_maxServings') || '0'),
        radius: parseInt(localStorage.getItem('user_radius') || '5')
    });

    const [currentLoad, setCurrentLoad] = useState({ weight: 0, servings: 0 });

    useEffect(() => {
        const userId = localStorage.getItem('user_id');
        if (userId) {
            let loc = null;
            try {
                loc = JSON.parse(localStorage.getItem('user_location'));
            } catch (e) {
                console.error("Error parsing user location");
            }

            setUser({
                id: userId,
                name: localStorage.getItem('user_name'),
                role: localStorage.getItem('user_role'),
                location: loc
            });
            if (loc && loc.lat && loc.lng) {
                setUserLocation(loc);
            }
        }
    }, []);

    // Fetch listings when userLocation or radius changes
    useEffect(() => {
        if (userLocation) {
            fetchListings();
        }
    }, [userLocation, capacity.radius]);

    // Update current load whenever selectedPoints change
    useEffect(() => {
        const load = selectedPoints.reduce((acc, p) => {
            const weight = p.unit === 'kg' || p.unit === 'litres' ? p.quantity : 0;
            const servings = p.unit === 'servings' ? p.quantity : 0;
            return {
                weight: acc.weight + weight,
                servings: acc.servings + servings
            };
        }, { weight: 0, servings: 0 });
        setCurrentLoad(load);
    }, [selectedPoints]);

    const fetchListings = async () => {
        try {
            const res = await axios.get(`${API_BASE_URL}/listings`);
            const claimedListings = res.data.filter(l => {
                if (!l.location || !l.location.lat || !l.location.lng) return false;

                // 1. Volunteer only sees claimed items ready for delivery
                const isClaimed = l.status === 'Claimed' || l.status === 'In Transit';
                if (!isClaimed) return false;

                // 2. Filter by distance (Service Radius)
                const dist = calculateDistance(userLocation.lat, userLocation.lng, l.location.lat, l.location.lng);
                l.distanceFromVolunteer = dist; // Attach distance for UI

                return dist <= capacity.radius;
            });
            setListings(claimedListings);
        } catch (err) {
            console.error('Error fetching listings:', err);
            setError('Failed to load listings');
        }
    };

    const handleOptimize = async () => {
        if (!userLocation) {
            setError('Please set your location in your profile first');
            return;
        }
        if (selectedPoints.length === 0) {
            setError('Select at least one food listing to optimize');
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const coords = [];
            coords.push({ lat: userLocation.lat, lng: userLocation.lng, type: 'volunteer', label: 'Start (You)' });

            selectedPoints.forEach(p => {
                coords.push({ lat: p.location.lat, lng: p.location.lng, id: p._id, type: 'pickup', label: `Pickup: ${p.title}` });
                if (p.claimedBy?.location) {
                    coords.push({ lat: p.claimedBy.location.lat, lng: p.claimedBy.location.lng, id: `ngo-${p._id}`, type: 'ngo', label: `NGO: ${p.claimedBy.name}` });
                }
            });

            const uniqueCoords = [];
            const seenStr = new Set();
            coords.forEach(c => {
                const str = `${c.lat},${c.lng}`;
                if (!seenStr.has(str)) {
                    uniqueCoords.push(c);
                    seenStr.add(str);
                }
            });

            const res = await axios.post(`${API_BASE_URL}/routing/optimize`, { coordinates: uniqueCoords });

            setOptimizedRoute(res.data.geojson);
            const dist = parseFloat(res.data.totalDistance) || 0;
            const dur = parseFloat(res.data.totalDuration) || 0;

            setStats({
                distance: (dist / 1000).toFixed(2),
                duration: (dur / 60).toFixed(0),
                sequence: res.data.optimizedSequence,
                fullCoords: uniqueCoords
            });
        } catch (err) {
            console.error('Optimization error:', err);
            setError(err.response?.data?.message || 'Failed to optimize route');
        } finally {
            setLoading(false);
        }
    };

    const volunteerIcon = new L.Icon({
        iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-gold.png',
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
        iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34], shadowSize: [41, 41]
    });

    const ngoIcon = new L.Icon({
        iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
        iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34], shadowSize: [41, 41]
    });

    const pickupIcon = new L.Icon({
        iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
        iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34], shadowSize: [41, 41]
    });

    return (
        <div className="flex flex-col h-[calc(100vh-80px)] bg-gray-50">
            <div className="bg-white border-b px-6 py-4 flex justify-between items-center shadow-sm z-10">
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <Link to="/dashboard" className="text-emerald-600 hover:text-emerald-700 font-bold text-sm bg-emerald-50 px-3 py-1 rounded-lg transition-all flex items-center gap-1">
                            ← Back to Dashboard
                        </Link>
                    </div>
                    <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                        <Navigation className="text-emerald-600" />
                        Volunteer Route Optimizer
                    </h1>
                    <p className="text-sm text-gray-500">Pickups from donors ➔ Drop-offs to NGOs</p>
                </div>
                <div className="flex gap-4">
                    <button
                        onClick={handleOptimize}
                        disabled={loading || selectedPoints.length === 0}
                        className="bg-emerald-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-600/20 disabled:opacity-50 flex items-center gap-2"
                    >
                        {loading ? 'Calculating...' : 'Optimize Full Delivery Route'}
                    </button>
                </div>
            </div>

            <div className="flex-1 flex overflow-hidden">
                <div className="w-80 bg-white border-r overflow-y-auto p-4 lg:block hidden">
                    {/* Capacity Monitor */}
                    <div className="mb-6 bg-slate-900 rounded-3xl p-5 text-white shadow-xl">
                        <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-4 flex items-center gap-2">
                            <Package size={14} /> Batch Capacity
                        </h3>

                        <div className="space-y-4">
                            {/* Weight Progress */}
                            <div>
                                <div className="flex justify-between text-[10px] mb-1">
                                    <span className="font-bold">TOTAL WEIGHT</span>
                                    <span className={currentLoad.weight > capacity.maxWeight ? 'text-red-400' : 'text-emerald-400'}>
                                        {currentLoad.weight} / {capacity.maxWeight} kg
                                    </span>
                                </div>
                                <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
                                    <div
                                        className={`h-full transition-all duration-500 ${currentLoad.weight > capacity.maxWeight ? 'bg-red-500' : 'bg-emerald-500'}`}
                                        style={{ width: `${Math.min((currentLoad.weight / (capacity.maxWeight || 1)) * 100, 100)}%` }}
                                    ></div>
                                </div>
                            </div>

                            {/* Servings Progress */}
                            <div>
                                <div className="flex justify-between text-[10px] mb-1">
                                    <span className="font-bold">TOTAL SERVINGS</span>
                                    <span className={currentLoad.servings > capacity.maxServings ? 'text-red-400' : 'text-emerald-400'}>
                                        {currentLoad.servings} / {capacity.maxServings}
                                    </span>
                                </div>
                                <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
                                    <div
                                        className={`h-full transition-all duration-500 ${currentLoad.servings > capacity.maxServings ? 'bg-red-500' : 'bg-blue-500'}`}
                                        style={{ width: `${Math.min((currentLoad.servings / (capacity.maxServings || 1)) * 100, 100)}%` }}
                                    ></div>
                                </div>
                            </div>
                        </div>

                        {(currentLoad.weight > capacity.maxWeight || currentLoad.servings > capacity.maxServings) && (
                            <div className="mt-4 flex items-center gap-2 text-[10px] text-red-400 font-bold bg-red-400/10 p-2 rounded-lg border border-red-400/20">
                                <AlertTriangle size={12} />
                                <span>Capacity Exceeded!</span>
                            </div>
                        )}
                    </div>

                    <h2 className="font-bold text-gray-700 mb-4 flex items-center gap-2">
                        📦 Claimed Listings ({listings.length})
                    </h2>
                    {listings.length === 0 ? (
                        <div className="bg-gray-50 p-6 rounded-2xl text-center border border-dashed border-gray-200">
                            <p className="text-sm text-gray-400 italic">No claimed listings within {capacity.radius}km.</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {listings.map(item => {
                                const isSelected = selectedPoints.find(p => p._id === item._id);
                                const itemWeight = item.unit === 'kg' || item.unit === 'litres' ? item.quantity : 0;
                                const itemServings = item.unit === 'servings' ? item.quantity : 0;

                                return (
                                    <div
                                        key={item._id}
                                        onClick={() => {
                                            if (isSelected) {
                                                setSelectedPoints(selectedPoints.filter(p => p._id !== item._id));
                                            } else {
                                                // Validation check before selecting
                                                const willExceedWeight = (currentLoad.weight + itemWeight) > capacity.maxWeight;
                                                const willExceedServings = (currentLoad.servings + itemServings) > capacity.maxServings;

                                                if (willExceedWeight || willExceedServings) {
                                                    setError(`Adding this would exceed your ${willExceedWeight ? 'weight' : 'servings'} capacity!`);
                                                    return;
                                                }
                                                setSelectedPoints([...selectedPoints, item]);
                                                setError(null);
                                            }
                                        }}
                                        className={`p-4 rounded-2xl border cursor-pointer transition-all ${isSelected ? 'bg-emerald-50 border-emerald-500 shadow-sm' : 'bg-white border-gray-100 hover:border-emerald-200'}`}
                                    >
                                        <div className="flex justify-between items-start mb-1">
                                            <h3 className="font-bold text-gray-900 text-sm truncate flex-1">{item.title}</h3>
                                            <span className="text-[10px] font-bold bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">
                                                {item.distanceFromVolunteer} km
                                            </span>
                                        </div>

                                        <div className="flex items-center gap-3 text-[10px] text-gray-500 mb-2">
                                            <div className="flex items-center gap-1 font-semibold">
                                                <Package size={10} className="text-gray-400" />
                                                {item.quantity} {item.unit}
                                            </div>
                                            <div className="flex items-center gap-1 font-semibold">
                                                <Users size={10} className="text-gray-400" />
                                                Target: {item.claimedBy?.name || 'NGO'}
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-1">
                                            <MapPin size={12} className="text-gray-400" />
                                            <p className="text-[10px] text-gray-500 truncate">{item.donor?.address || 'Pickup address unknown'}</p>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}

                    {stats.distance > 0 && (
                        <div className="mt-8 bg-emerald-900 text-white p-6 rounded-3xl shadow-xl">
                            <h3 className="font-black text-lg mb-4 flex items-center gap-2">
                                <Clock size={20} /> Route Stats
                            </h3>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-emerald-300 text-[10px] font-bold uppercase tracking-wider">Distance</p>
                                    <p className="text-2xl font-black">{stats.distance} <span className="text-sm font-normal">km</span></p>
                                </div>
                                <div>
                                    <p className="text-emerald-300 text-[10px] font-bold uppercase tracking-wider">Duration</p>
                                    <p className="text-2xl font-black">{stats.duration} <span className="text-sm font-normal">min</span></p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                <div className="flex-1 relative">
                    {error && (
                        <div className="absolute top-4 left-4 right-4 z-[1000] bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl shadow-lg flex justify-between items-center">
                            <span className="text-sm font-bold">{error}</span>
                            <button onClick={() => setError(null)}><X size={18} /></button>
                        </div>
                    )}

                    <MapContainer
                        center={userLocation ? [userLocation.lat, userLocation.lng] : [19.076, 72.877]}
                        zoom={13}
                        style={{ height: '100%', width: '100%' }}
                    >
                        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

                        {userLocation && (
                            <Marker position={[userLocation.lat, userLocation.lng]} icon={volunteerIcon}>
                                <Popup>
                                    <div className="font-bold">You are here</div>
                                    <div className="text-xs">Starting Point (Profile Location)</div>
                                </Popup>
                            </Marker>
                        )}

                        {listings.map(item => (
                            <Marker
                                key={item._id}
                                position={[item.location.lat, item.location.lng]}
                                icon={pickupIcon}
                            >
                                <Popup>
                                    <div className="font-bold">{item.title}</div>
                                    <div className="text-[10px] text-emerald-600 font-bold mb-1">Status: {item.status}</div>
                                    <div className="text-[10px] text-gray-500 mb-2">
                                        Donor: {item.donor?.name || 'Unknown'}<br />
                                        Distance: {item.distanceFromVolunteer} km<br />
                                        Load: {item.quantity} {item.unit}
                                    </div>
                                    <button
                                        onClick={() => {
                                            const isSelected = selectedPoints.find(p => p._id === item._id);
                                            if (isSelected) {
                                                setSelectedPoints(selectedPoints.filter(p => p._id !== item._id));
                                            } else {
                                                const itemWeight = item.unit === 'kg' || item.unit === 'litres' ? item.quantity : 0;
                                                const itemServings = item.unit === 'servings' ? item.quantity : 0;

                                                if ((currentLoad.weight + itemWeight) > capacity.maxWeight || (currentLoad.servings + itemServings) > capacity.maxServings) {
                                                    setError("This exceeds your carrying capacity!");
                                                    return;
                                                }
                                                setSelectedPoints([...selectedPoints, item]);
                                                setError(null);
                                            }
                                        }}
                                        className={`w-full py-1 text-[10px] rounded-lg font-bold border ${selectedPoints.find(p => p._id === item._id) ? 'bg-red-50 text-red-600 border-red-200' : 'bg-emerald-600 text-white border-emerald-700'}`}
                                    >
                                        {selectedPoints.find(p => p._id === item._id) ? 'Remove from Batch' : 'Add to Batch'}
                                    </button>
                                </Popup>
                            </Marker>
                        ))}

                        {selectedPoints.map(p => p.claimedBy?.location && (
                            <Marker
                                key={`ngo-marker-${p._id}`}
                                position={[p.claimedBy.location.lat, p.claimedBy.location.lng]}
                                icon={ngoIcon}
                            >
                                <Popup>
                                    <div className="font-bold text-red-600">Drop-off: {p.claimedBy.name}</div>
                                    <div className="text-xs">NGO Location for "{p.title}"</div>
                                </Popup>
                            </Marker>
                        ))}

                        {optimizedRoute && (
                            <Polyline
                                positions={optimizedRoute.features[0].geometry.coordinates.map(c => [c[1], c[0]])}
                                color="#059669"
                                weight={5}
                                opacity={0.7}
                            />
                        )}

                        {optimizedRoute && stats.sequence.map((step, idx) => {
                            if (step.type === 'job') {
                                const pt = stats.fullCoords[step.id - 1];
                                return (pt &&
                                    <Marker
                                        key={`step-${idx}`}
                                        position={[pt.lat, pt.lng]}
                                        icon={new L.DivIcon({
                                            className: 'custom-div-icon',
                                            html: `<div style="background: white; border: 2px solid #059669; color: #059669; font-weight: bold; width: 24px; height: 24px; border-radius: 50%; display: flex; align-items: center; justify-content: center; transform: translate(-12px, -45px); box-shadow: 0 2px 4px rgba(0,0,0,0.2)">${idx}</div>`,
                                            iconSize: [0, 0]
                                        })}
                                    />
                                );
                            }
                            return null;
                        })}

                        <ChangeView center={userLocation ? [userLocation.lat, userLocation.lng] : [19.076, 72.877]} />
                    </MapContainer>
                </div>
            </div>
        </div>
    );
};

export default RouteOptimization;
