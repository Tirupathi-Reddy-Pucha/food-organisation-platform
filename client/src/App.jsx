import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import axios from 'axios';
import QRCode from 'react-qr-code';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Import Leaflet Images (Vite/Webpack compatible)
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

import './App.css';

// ==========================================
// 1. LEAFLET ICON FIX
// ==========================================
delete L.Icon.Default.prototype._getIconUrl;

L.Icon.Default.mergeOptions({
    iconRetinaUrl: markerIcon2x,
    iconUrl: markerIcon,
    shadowUrl: markerShadow,
});

// Helper component to center map
function ChangeView({ center }) {
    const map = useMap();
    map.setView(center);
    return null;
}

// ==========================================
// 2. TRANSLATION DICTIONARY
// ==========================================
const translations = {
    en: {
        title: "♻️ Food Redistribution Platform",
        feed: "📢 Live Feed",
        history: "📂 My History",
        donate: "🍲 Donate Food",
        login: "🔑 Login",
        register: "📝 Register",
        welcome: "👋 Welcome",
        logout: "Logout",
        search: "🔍 Search...",
        refresh: "🔄 Refresh",
        pickup: "📍 Pickup Details",
        admin: "🛡️ Admin Panel",
        saved: "❤️ Saved"
    },
    hi: {
        title: "♻️ खाद्य वितरण मंच",
        feed: "📢 लाइव फीड",
        history: "📂 मेरा इतिहास",
        donate: "🍲 भोजन दान करें",
        login: "🔑 लॉग इन करें",
        register: "📝 पंजीकरण करें",
        welcome: "👋 स्वागत है",
        logout: "लॉग आउट",
        search: "🔍 खोजें...",
        refresh: "🔄 ताज़ा करें",
        pickup: "📍 पिकअप विवरण",
        admin: "🛡️ व्यवस्थापक",
        saved: "❤️ सुरक्षित"
    }
};

const getStableViews = (id) => {
    if (!id) return 0;
    let hash = 0;
    for (let i = 0; i < id.length; i++) {
        hash = id.charCodeAt(i) + ((hash << 5) - hash);
    }
    return Math.abs(hash % 50) + 1;
};

// Helper to safely compare IDs (whether they are Strings or Objects)
const isSameUser = (userField, currentUserId) => {
    if (!userField || !currentUserId) return false;
    const idA = userField._id || userField;
    return idA.toString() === currentUserId.toString();
};

const getAvatarColor = (name) => {
    const colors = ['#e74c3c', '#3498db', '#9b59b6', '#f1c40f', '#2ecc71', '#e67e22', '#1abc9c'];
    let hash = 0;
    for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
    return colors[Math.abs(hash % colors.length)];
};

const UserAvatar = ({ name }) => {
    const initials = name ? name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() : '??';
    return (
        <div className="avatar-circle" style={{
            width: '40px', height: '40px', borderRadius: '50%', color: 'white',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontWeight: 'bold', background: getAvatarColor(name || ''), marginRight: '10px'
        }}>
            {initials}
        </div>
    );
};

function App() {
  const API_URL = `${import.meta.env.VITE_API_BASE_URL}` || "http://localhost:5000/api";

  // ==========================================
  // 3. STATE MANAGEMENT
  // ==========================================
  
  // User Data
  const [user, setUser] = useState({
      id: null,
      name: '',
      role: '',
      phone: '',
      address: '',
      isVerified: false,
      isTrained: false,
      credits: 0,
      ngoCapacity: { fridge:'', dryStorage:'' },
      notifications: { email: true, sms: false },
      verificationDocument: '',
      servedGroups: 'General', 
      isAvailable: false        
  });
  
  // App Data
  const [listings, setListings] = useState([]);      
  const [myListings, setMyListings] = useState([]);    
  const [stats, setStats] = useState({ total_donations: 0, meals_saved: 0, co2_saved: 0 });
  const [leaderboard, setLeaderboard] = useState([]); 
  const [reportedItems, setReportedItems] = useState([]); 
  
  // Navigation & UI
  const [view, setView] = useState('feed');            
  const [showQR, setShowQR] = useState(null);
  const [showPassword, setShowPassword] = useState(false); 
  const [showStats, setShowStats] = useState(true); 
  
  // UX Settings
  const [lang, setLang] = useState(localStorage.getItem('app_lang') || 'en'); 
  const [highContrast, setHighContrast] = useState(localStorage.getItem('app_theme') === 'dark'); 
  const [showTerms, setShowTerms] = useState(false); 
  
  const [liteMode, setLiteMode] = useState(false); 
  const [showHelp, setShowHelp] = useState(false); 
  
  // UI STATES
  const [toast, setToast] = useState(null); 
  const [appNotifications, setAppNotifications] = useState([]); 
  const [showNotifDropdown, setShowNotifDropdown] = useState(false);

  // --- MERGED STATES ---
  const [showPackModal, setShowPackModal] = useState(false);
  const [donorInitials, setDonorInitials] = useState('');
  const [agreeCodeOfConduct, setAgreeCodeOfConduct] = useState(false);
  const [fontSize, setFontSize] = useState('font-md');
  const [showCertificate, setShowCertificate] = useState(false);
  const [showForgotPass, setShowForgotPass] = useState(false);
  
  // --- NEW FROM CODE 2 (INTEGRATION) ---
  const [showUSSD, setShowUSSD] = useState(false); // Task 7.4.4
  const [showGuide, setShowGuide] = useState(false); // Task 7.5.4
  const [deliveryProof, setDeliveryProof] = useState(''); // Task 5.3.3
  const [isEditingListing, setIsEditingListing] = useState(null); // Task 2.5.1
  const [volunteerSchedule, setVolunteerSchedule] = useState(''); // Task 1.4.4
  const [accessCode, setAccessCode] = useState(''); // Task 3.5.3
  const [leaderboardTab, setLeaderboardTab] = useState('donors'); // Task 3.3.4
  // ------------------------------------

  const t = translations[lang]; 

  // Batch 4 State
  const [favorites, setFavorites] = useState(JSON.parse(localStorage.getItem('user_favorites') || '[]'));
  const [recentSearches, setRecentSearches] = useState(JSON.parse(localStorage.getItem('recent_searches') || '[]'));
  const [sortMethod, setSortMethod] = useState('newest'); 
  const [volunteerAvailable, setVolunteerAvailable] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [showPrivacy, setShowPrivacy] = useState(false);
  const [allUsers, setAllUsers] = useState([]); 
  
  // NEW V2 STATE
  const [showSafetyModal, setShowSafetyModal] = useState(false); 
  const [isRTL, setIsRTL] = useState(false);

  // Quiz State
  const [showQuiz, setShowQuiz] = useState(false);
  const [quizScore, setQuizScore] = useState(0);
  const [currentQuestion, setCurrentQuestion] = useState(0);

  // Auth Forms
  const [isRegistering, setIsRegistering] = useState(false); 
  const [isEditingProfile, setIsEditingProfile] = useState(false);

  // Profile Edit Inputs
  const [editName, setEditName] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editAddress, setEditAddress] = useState('');
  const [editFridge, setEditFridge] = useState('');
  const [editDry, setEditDry] = useState('');
  const [editNotifEmail, setEditNotifEmail] = useState(true);
  const [editNotifSMS, setEditNotifSMS] = useState(false);
  const [verificationDoc, setVerificationDoc] = useState(''); 
  const [editServedGroups, setEditServedGroups] = useState('General'); 

  // Search & Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('All');
  const [filterVeg, setFilterVeg] = useState('All'); 

  // Auth Inputs
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regRole, setRegRole] = useState('Donor');
  const [regPhone, setRegPhone] = useState('');        
  const [regAddress, setRegAddress] = useState(''); 
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [regNgoNumber, setRegNgoNumber] = useState(''); 
  
  // Donation Form Inputs
  const [foodTitle, setFoodTitle] = useState('');
  const [foodDesc, setFoodDesc] = useState('');
  const [foodQty, setFoodQty] = useState('');
  const [foodUnit, setFoodUnit] = useState('kg');
  const [foodCat, setFoodCat] = useState('Cooked');
  const [foodExpiry, setFoodExpiry] = useState('');
  
  const [containerType, setContainerType] = useState('Disposable');
  const [handlingInstructions, setHandlingInstructions] = useState('');
  const [pickupNote, setPickupNote] = useState('');
  const [allergens, setAllergens] = useState([]);

  // Image Upload State
  const [foodImage, setFoodImage] = useState('');
  const [isUploading, setIsUploading] = useState(false);

  // Batch 2 Location State
  const [location, setLocation] = useState({ lat: 20.5937, lng: 78.9629 }); 
  const [isLocating, setIsLocating] = useState(false);
  const [hasLocation, setHasLocation] = useState(false);

  // Donation Details
  const [isVeg, setIsVeg] = useState(true);               
  const [reqFridge, setReqFridge] = useState(false); 
  const [temperature, setTemperature] = useState('Hot');

  // Safety Checklist Inputs
  const [isFresh, setIsFresh] = useState(false);
  const [isHygienic, setIsHygienic] = useState(false);
  const [hasAllergens, setHasAllergens] = useState(false);

  // Quiz Data
  const safetyQuiz = [
      { q: "Food must be picked up within...", options: ["24 Hours", "1 Hour", "1 Week"], a: "1 Hour" },
      { q: "If the food smells bad, you should...", options: ["Deliver it anyway", "Throw it away", "Report it & Cancel"], a: "Report it & Cancel" },
      { q: "How should you transport hot food?", options: ["In an insulated bag", "In open air", "With ice packs"], a: "In an insulated bag" }
  ];

  const showToast = (msg, type = 'success') => {
      setToast({ msg, type });
      setAppNotifications(prev => [{ msg, time: new Date() }, ...prev]);
      setTimeout(() => setToast(null), 3000);
  };

  const calculateETA = (dist) => {
    const distance = parseFloat(dist);
    if (!distance || distance > 9000) return "N/A";
    const time = (distance / 30) * 60; // Minutes
    return time < 60 ? `${Math.ceil(time)} min` : `${(time/60).toFixed(1)} hrs`;
  };

  const Countdown = ({ createdAt, expiryHours }) => {
    const [timeLeft, setTimeLeft] = useState("");
    const [isUrgent, setIsUrgent] = useState(false);

    useEffect(() => {
        const interval = setInterval(() => {
            const expires = new Date(createdAt).getTime() + (expiryHours * 60 * 60 * 1000);
            const now = Date.now();
            const diff = expires - now;

            if (diff <= 0) {
                setTimeLeft("EXPIRED");
                setIsUrgent(false);
            } else {
                const h = Math.floor(diff / (1000 * 60 * 60));
                const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
                const s = Math.floor((diff % (1000 * 60)) / 1000);
                setTimeLeft(`${h}h ${m}m ${s}s`);
                setIsUrgent(diff < 3600000); // Less than 1 hour
            }
        }, 1000);
        return () => clearInterval(interval);
    }, [createdAt, expiryHours]);

    return (
        <span style={{
            fontWeight: 'bold', 
            color: isUrgent ? '#e74c3c' : 'inherit',
            animation: isUrgent ? 'pulse 1s infinite' : 'none'
        }}>
            ⏳ {timeLeft}
        </span>
    );
  };

  // ==========================================
  // 4. AUTO-SAVE LOGIC
  // ==========================================
  useEffect(() => {
    localStorage.setItem('app_lang', lang);
    localStorage.setItem('app_theme', highContrast ? 'dark' : 'light');
    localStorage.setItem('user_favorites', JSON.stringify(favorites));

    const draft = JSON.parse(localStorage.getItem('draft_form'));
    if(draft) {
        if(draft.title) setFoodTitle(draft.title);
        if(draft.desc) setFoodDesc(draft.desc);
        if(draft.qty) setFoodQty(draft.qty);
        if(draft.expiry) setFoodExpiry(draft.expiry);
        if(draft.unit) setFoodUnit(draft.unit);
        if(draft.cat) setFoodCat(draft.cat);
        if(draft.isVeg !== undefined) setIsVeg(draft.isVeg);
        if(draft.reqFridge !== undefined) setReqFridge(draft.reqFridge);
        if(draft.temp) setTemperature(draft.temp);
    }

    if (!localStorage.getItem('has_seen_onboarding')) {
        setShowOnboarding(true);
        localStorage.setItem('has_seen_onboarding', 'true');
    }
  }, [lang, highContrast, favorites]);

  useEffect(() => {
    const draft = {
        title: foodTitle,
        desc: foodDesc,
        qty: foodQty,
        expiry: foodExpiry,
        unit: foodUnit,
        cat: foodCat,
        isVeg: isVeg,
        reqFridge: reqFridge,
        temp: temperature
    };
    localStorage.setItem('draft_form', JSON.stringify(draft));
  }, [foodTitle, foodDesc, foodQty, foodExpiry, foodUnit, foodCat, isVeg, reqFridge, temperature]);


  // ==========================================
  // 5. HELPER FUNCTIONS
  // ==========================================
  
  // --- [NEW FROM CODE 2] VOICE INPUT ---
  const startVoiceInput = () => {
      if (!('webkitSpeechRecognition' in window)) return alert("Voice not supported in this browser.");
      const recognition = new window.webkitSpeechRecognition();
      recognition.lang = 'en-US';
      recognition.onresult = (event) => {
          setFoodTitle(event.results[0][0].transcript);
          showToast("🎤 Voice Input Captured!");
      };
      recognition.start();
  };
  // -------------------------------------

  const calculateDistance = (lat1, lon1, lat2, lon2) => {
      if (!lat1 || !lon1 || !lat2 || !lon2) return 9999;
      
      const R = 6371;
      const dLat = (lat2 - lat1) * (Math.PI / 180);
      const dLon = (lon2 - lon1) * (Math.PI / 180);
      
      const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
        
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      const distance = R * c;
      return distance.toFixed(1);
  };

  const toggleFavorite = (id) => {
    if (favorites.includes(id)) setFavorites(favorites.filter(fid => fid !== id));
    else setFavorites([...favorites, id]);
  };

  const shareToSocial = (platform, item) => {
      const text = `Check out this free food: ${item.title} on FoodConnect! 🍲`;
      const url = window.location.href;

      if (navigator.share) {
          navigator.share({ title: item.title, text: text, url: url }).catch(console.error);
          return;
      }

      if (platform === 'whatsapp') window.open(`https://wa.me/?text=${encodeURIComponent(text + " " + url)}`);
      if (platform === 'twitter') window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`);
  };

  const reportBug = () => {
      const bug = prompt("Describe the issue:");
      if (bug) showToast("Bug reported! Support will check.", "success");
  };

  // --- [NEW FROM CODE 2] VOLUNTEER ACTIONS ---
  const reportTraffic = () => {
      showToast("🚗 Traffic Alert sent to NGO/Donor.", "error");
  };

  const reportArrived = () => {
      showToast("📍 Arrival Notification Sent!", "success");
  };
  // -------------------------------------------

  const copyToClipboard = (text) => {
    if(!text) return;
    navigator.clipboard.writeText(text);
    showToast("📋 Address Copied!");
  };

  const handleForgotPassword = () => {
    const email = prompt("Enter your email to reset password:");
    if (email) showToast(`Reset link sent to ${email}`, "success");
  };

  const cycleFontSize = () => {
    if(fontSize === 'font-sm') setFontSize('font-md');
    else if(fontSize === 'font-md') setFontSize('font-lg');
    else if(fontSize === 'font-lg') setFontSize('font-xl');
    else setFontSize('font-sm');
  };

  const fetchUsers = async () => {
      try {
          const token = localStorage.getItem('token');
          const res = await axios.get(`${API_URL}/auth/all-users`, { headers: { 'x-auth-token': token } });
          setAllUsers(res.data);
      } catch (err) { console.error("Admin Access Required"); }
  };

  const fetchReports = async () => {
      try {
          const token = localStorage.getItem('token');
          const res = await axios.get(`${API_URL}/listings/admin/reports`, { headers: { 'x-auth-token': token } });
          setReportedItems(res.data);
      } catch (err) { console.error(err); }
  };

  const verifyUser = async (id) => {
      try {
          const token = localStorage.getItem('token');
          await axios.put(`${API_URL}/auth/verify/${id}`, {}, { headers: { 'x-auth-token': token } });
          showToast("User Verified!"); 
          fetchUsers();
      } catch (err) {
          console.error("VERIFY ERROR:", err);
          showToast("Failed to verify: " + (err.response?.data?.msg || err.message), "error");
      }
  };

  const handleQuizAnswer = (answer) => {
      let score = quizScore;
      if (answer === safetyQuiz[currentQuestion].a) {
          score += 1;
      }
      setQuizScore(score);
      
      if (currentQuestion + 1 < safetyQuiz.length) {
          setCurrentQuestion(currentQuestion + 1);
      } else {
          finishQuiz(score);
      }
  };

  const finishQuiz = async (finalScore) => {
      if (finalScore === safetyQuiz.length) {
          try {
              const token = localStorage.getItem('token');
              await axios.put(`${API_URL}/auth/train`, {}, { headers: { 'x-auth-token': token } });
              setUser({ ...user, isTrained: true });
              localStorage.setItem('user_trained', 'true');
              showToast("🎉 Congratulations! You are now a Certified Volunteer.");
              setShowQuiz(false);
          } catch (err) { showToast("Error saving progress.", "error"); }
      } else {
          alert("❌ You failed. You need 100% to pass safety training. Try again.");
          setQuizScore(0);
          setCurrentQuestion(0);
      }
  };

  const markerRef = useRef(null);
  const eventHandlers = useMemo(
    () => ({
      dragend() {
        const marker = markerRef.current;
        if (marker != null) {
          const newPos = marker.getLatLng();
          setLocation({ lat: newPos.lat, lng: newPos.lng });
          setHasLocation(true);
        }
      },
    }),
    []
  );

  const getDonorBadge = (count) => {
      if (count >= 10) return '🏆 Legend';
      if (count >= 5) return '⭐ Super Donor';
      if (count >= 1) return '🥉 Contributor';
      return '🌱 Newbie';
  };

  const getCategoryIcon = (cat) => {
      if (cat === 'Cooked') return '🥘';
      if (cat === 'Raw') return '🥦';
      if (cat === 'Bakery') return '🍞';
      return '📦';
  };

  const calculateMyRating = () => {
      if (user.role !== 'Donor') return null;
      const myItems = myListings.filter(item => item.donor && (item.donor._id === user.id || item.donor === user.id));
      const ratedItems = myItems.filter(item => item.rating > 0);
      
      if (ratedItems.length === 0) return 'No ratings yet';
      const total = ratedItems.reduce((acc, curr) => acc + curr.rating, 0);
      const avg = total / ratedItems.length;
      return avg.toFixed(1) + ' ★';
  };

  const shareImpact = () => {
      const myCount = myListings.filter(item => item.donor && (item.donor._id === user.id || item.donor === user.id)).length;
      const badge = getDonorBadge(myCount);
      const text = `I'm a ${badge} on FoodConnect! I've donated ${myCount} meals.`;
      navigator.clipboard.writeText(text);
      showToast("📋 Impact stats copied to clipboard!");
  };

  const isUrgent = (createdAt, expiryHours) => {
      const created = new Date(createdAt).getTime();
      const expires = created + (expiryHours * 60 * 60 * 1000);
      const now = Date.now();
      const timeLeft = expires - now;
      return timeLeft > 0 && timeLeft < 3600000;
  };

  const openMap = (address) => {
      if(!address) return;
      const url = `http://googleusercontent.com/maps.google.com/search?q=${encodeURIComponent(address)}`;
      window.open(url, '_blank');
  };

  const downloadQR = () => {
      const svg = document.getElementById("pickup-qr");
      if(!svg) return;
      const svgData = new XMLSerializer().serializeToString(svg);
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      const img = new Image();
      img.onload = () => {
          canvas.width = img.width;
          canvas.height = img.height;
          ctx.drawImage(img, 0, 0);
          const pngFile = canvas.toDataURL("image/png");
          const downloadLink = document.createElement("a");
          downloadLink.download = "Pickup_QR.png";
          downloadLink.href = pngFile;
          downloadLink.click();
      };
      img.src = "data:image/svg+xml;base64," + btoa(svgData);
  };

  const isNewUser = (dateString) => {
      if(!dateString) return false;
      const joined = new Date(dateString).getTime();
      const now = Date.now();
      return (now - joined) < 86400000;
  };


  // ==========================================
  // 6. API CALLS
  // ==========================================
  const fetchListings = useCallback(async () => {
    try {
      const cached = localStorage.getItem('cached_listings');
      if (cached) setListings(JSON.parse(cached));

      const res = await axios.get(`${API_URL}/listings/`, {
          params: { search: searchTerm, category: filterCategory, filterVeg: filterVeg }
      });
      
      let data = res.data;
      if (sortMethod === 'closest' && location.lat) {
          data.sort((a, b) => {
             const distA = parseFloat(calculateDistance(location.lat, location.lng, a.location?.lat, a.location?.lng));
             const distB = parseFloat(calculateDistance(location.lat, location.lng, b.location?.lat, b.location?.lng));
             return distA - distB;
          });
      } else if (sortMethod === 'expiry') {
          data.sort((a, b) => a.expiry_hours - b.expiry_hours);
      }
      setListings(data);
      localStorage.setItem('cached_listings', JSON.stringify(data));
    } catch (err) { console.error("Error fetching listings", err); }
  }, [searchTerm, filterCategory, filterVeg, sortMethod, location]);

  const fetchStats = useCallback(async () => {
    try {
      const resStats = await axios.get(`${API_URL}/stats/`);
      setStats(resStats.data);
      const resLeader = await axios.get(`${API_URL}/stats/leaderboard`);
      
      const stableLeaderboard = resLeader.data.sort((a, b) => {
          if (b.count !== a.count) {
              return b.count - a.count;
          }
          return a.name.localeCompare(b.name);
      });
      
      setLeaderboard(stableLeaderboard);
    } catch (err) { console.error("Error fetching stats", err); }
  }, []);

  const fetchMyHistory = useCallback(async () => {
    if (!user.id) return;
    try {
      const token = localStorage.getItem('token');
      const config = { headers: { 'x-auth-token': token } };
      const res = await axios.get(`${API_URL}/listings/history`, config);
      setMyListings(res.data);
    } catch (err) { console.error("Error loading history"); }
  }, [user.id]);

  const fetchUserData = useCallback(async () => {
      const token = localStorage.getItem('token');
      if (!token) return;

      try {
          const res = await axios.get(`${API_URL}/auth/me`, { headers: { 'x-auth-token': token } });
          setUser(res.data);
          localStorage.setItem('user_credits', res.data.credits || 0);
          console.log("👤 User data refreshed"); 
      } catch (err) {
          console.error("Failed to refresh user data", err);
      }
  }, []);

  useEffect(() => {
      if (navigator.geolocation) {
         navigator.geolocation.getCurrentPosition((pos) => {
             setLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
             setHasLocation(true);
         });
      }
  }, []);

  useEffect(() => {
    fetchListings();
    fetchStats();
    fetchUserData();
  }, [fetchListings, fetchStats, fetchUserData]);

  useEffect(() => {
    const savedId = localStorage.getItem('user_id');
    const token = localStorage.getItem('token');
    
    if (savedId && token) {
        const safeParse = (key) => {
            try { return JSON.parse(localStorage.getItem(key)); } catch(e) { return {}; }
        };

        setUser({
            id: savedId,
            role: localStorage.getItem('user_role'),
            name: localStorage.getItem('user_name'),
            phone: localStorage.getItem('user_phone') || '',
            address: localStorage.getItem('user_address') || '',
            isVerified: localStorage.getItem('user_verified') === 'true',
            isTrained: localStorage.getItem('user_trained') === 'true',
            credits: parseInt(localStorage.getItem('user_credits') || '0'),
            ngoCapacity: safeParse('user_capacity'),
            notifications: safeParse('user_notifs'),
            verificationDocument: localStorage.getItem('user_doc') || '',
            servedGroups: localStorage.getItem('user_servedGroups') || 'General', 
            isAvailable: localStorage.getItem('user_available') === 'true'        
        });
    }
  }, []);

  useEffect(() => {
      if (user.isAvailable !== undefined) {
          setVolunteerAvailable(user.isAvailable);
      }
  }, [user]);

  useEffect(() => {
      if(user.id) fetchMyHistory();
  }, [user.id, fetchMyHistory]);


  // ==========================================
  // 7. AUTH ACTIONS
  // ==========================================

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setIsUploading(true);
    const formData = new FormData();
    formData.append('image', file);

    try {
        const res = await axios.post(`${API_URL}/upload`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
        
        // --- [INTEGRATION] Check if uploading proof or food image ---
        if(view === 'feed' || view === 'history') { 
            setDeliveryProof(res.data.imageUrl);
            showToast("Proof Uploaded!", "success");
        } else {
            setFoodImage(res.data.imageUrl);
            showToast("Image Uploaded!", "success");
        }
        // -----------------------------------------------------------
        
        setIsUploading(false);
    } catch (err) {
        console.error("Upload failed", err);
        showToast("Image upload failed. Please try again.", "error");
        setIsUploading(false);
    }
  };

  const handleGetLocation = () => {
      if (!navigator.geolocation) return alert("Geolocation is not supported by your browser.");
      
      setIsLocating(true);
      navigator.geolocation.getCurrentPosition(
          (position) => {
              setLocation({
                  lat: position.coords.latitude,
                  lng: position.coords.longitude
              });
              setIsLocating(false);
              setHasLocation(true);
              showToast("Location Found!");
          },
          () => {
              alert("Unable to retrieve your location.");
              setIsLocating(false);
          }
      );
  };

  const registerUser = async () => {
    if (!agreeTerms) return alert("⚠️ You must agree to the Terms & Conditions.");
    if (regRole === 'NGO' && !regNgoNumber) return alert("⚠️ NGOs must provide a Registration Number.");
    if (regRole === 'Volunteer' && !agreeCodeOfConduct) return showToast("Must agree to Code of Conduct", "error");

    try {
      const res = await axios.post(`${API_URL}/auth/register`, {
          name: regName, email: regEmail, password: regPassword, role: regRole,
          phone: regPhone, address: regAddress, ngoRegNumber: regNgoNumber
      });
      handleAuthSuccess(res.data);
      showToast(`✅ Registration successful! Welcome Email Sent.`);
    } catch (err) { alert("Registration failed."); }
  };

  const loginUser = async () => {
    try {
      const res = await axios.post(`${API_URL}/auth/login`, { email: regEmail, password: regPassword });
      handleAuthSuccess(res.data);
      showToast(`✅ Login successful!`);
    } catch (err) { alert("Login failed. " + (err.response?.data?.msg || "")); }
  };

  const updateProfile = async () => {
    try {
        const token = localStorage.getItem('token');
        const config = { headers: { 'x-auth-token': token } };
        
        const res = await axios.put(`${API_URL}/auth/update`, {
            name: editName, phone: editPhone, address: editAddress,
            ngoCapacity: { fridge: editFridge, dryStorage: editDry },
            notifications: { email: editNotifEmail, sms: editNotifSMS },
            verificationDocument: verificationDoc,
            servedGroups: editServedGroups,
            volunteerSchedule: volunteerSchedule // [NEW FROM CODE 2]
        }, config);
        
        const updatedUser = { ...user, ...res.data };
        setUser(updatedUser);
        handleAuthSuccess({ user: updatedUser, token });
        
        setIsEditingProfile(false);
        showToast("✅ Profile Updated!");
    } catch (err) { alert("Error updating profile."); }
  };

  const startEditing = () => {
      setEditName(user.name); setEditPhone(user.phone); setEditAddress(user.address);
      setEditFridge(user.ngoCapacity?.fridge || '');
      setEditDry(user.ngoCapacity?.dryStorage || '');
      setEditNotifEmail(user.notifications?.email || false);
      setEditNotifSMS(user.notifications?.sms || false);
      setVerificationDoc(user.verificationDocument || '');
      setEditServedGroups(user.servedGroups || 'General'); 
      setVolunteerSchedule(user.volunteerSchedule || ''); // [NEW]
      setIsEditingProfile(true);
  };

  const deactivateAccount = async () => {
    if (!window.confirm("Are you sure? This will deactivate your account immediately.")) return;
    try {
        const token = localStorage.getItem('token');
        const config = { headers: { 'x-auth-token': token } };
        const res = await axios.put(`${API_URL}/auth/deactivate`, {}, config);
        alert(res.data.msg || "Account deactivated.");
        logout();
    } catch (err) { alert("Error deactivating account."); }
  };

  const deleteAccount = async () => {
    const confirmDelete = window.prompt("⚠️ DANGER ZONE ⚠️\nType 'DELETE' to permanently remove your account.");
    if (confirmDelete !== 'DELETE') return;
    try {
        const token = localStorage.getItem('token');
        const config = { headers: { 'x-auth-token': token } };
        await axios.delete(`${API_URL}/auth/delete`, config);
        alert("😞 Account deleted.");
        logout();
    } catch (err) { alert("Error deleting account."); }
  };

  const handleAuthSuccess = (data) => {
    const { user, token } = data;
    setUser(user);
    localStorage.setItem('token', token);
    localStorage.setItem('user_id', user.id);
    localStorage.setItem('user_role', user.role);
    localStorage.setItem('user_name', user.name);
    localStorage.setItem('user_phone', user.phone || '');
    localStorage.setItem('user_address', user.address || '');
    localStorage.setItem('user_verified', user.isVerified);
    localStorage.setItem('user_trained', user.isTrained);
    localStorage.setItem('user_credits', user.credits || 0);
    localStorage.setItem('user_doc', user.verificationDocument || '');
    localStorage.setItem('user_capacity', JSON.stringify(user.ngoCapacity || {}));
    localStorage.setItem('user_notifs', JSON.stringify(user.notifications || {}));
    localStorage.setItem('user_servedGroups', user.servedGroups || 'General'); 
    setRegPassword('');
    fetchMyHistory();
  };

  const logout = () => {
    localStorage.clear();
    setUser({ id: null, name: '', role: '', phone: '', address: '' });
    window.location.reload();
  };


  // ==========================================
  // 8. LISTING ACTIONS
  // ==========================================
  const postDonation = async () => {
    if (user.role !== 'Donor') return alert("Only Donors can post!");
    
    // [NEW FROM CODE 2] Verification check
    if (!user.isVerified) return showToast("🔒 Verification Pending. Cannot post.", "error");

    const qty = parseFloat(foodQty);
    const expiry = parseInt(foodExpiry);
    
    if (isNaN(qty) || qty <= 0) return alert("⚠️ Quantity must be positive.");
    if (isUploading) return alert("⚠️ Please wait for image to upload.");
    if (foodDesc.length > 300) return alert("⚠️ Description too long (max 300 chars).");
    if (!hasLocation) return alert("⚠️ Please allow location access to verify pickup point.");
    if (!donorInitials) return showToast("Please sign with initials", "error");

    try {
      const token = localStorage.getItem('token');
      const config = { headers: { 'x-auth-token': token, 'Content-Type': 'application/json' } };
      
      const newListing = {
        title: foodTitle, description: foodDesc, quantity: qty,
        unit: foodUnit, category: foodCat, expiry_hours: expiry,
        isFresh, isHygienic, hasAllergens, temperature, safetyCheck: true,
        isVeg, requiresRefrigeration: reqFridge,
        image: foodImage,
        containerType,
        handlingInstructions,
        pickupNote,
        accessCode, // [NEW FROM CODE 2]
        allergens,
        lat: location.lat,
        lng: location.lng
      };

      // [INTEGRATION] Handle Edit vs Create
      if (isEditingListing) {
          await axios.put(`${API_URL}/listings/${isEditingListing}`, newListing, config);
          showToast("✅ Listing Updated!");
          setIsEditingListing(null);
      } else {
          await axios.post(`${API_URL}/listings/`, newListing, config);
          showToast("✅ Food Listed!");
      }

      fetchListings();
      fetchStats();
      fetchMyHistory();
      fetchUserData();
      
      setFoodTitle(''); setFoodDesc(''); setFoodQty(''); setFoodExpiry(''); setFoodImage('');
      setIsVeg(true); setReqFridge(false); setIsFresh(false); setIsHygienic(false); setHasAllergens(false);
      setContainerType('Disposable'); setHandlingInstructions(''); setPickupNote(''); setAllergens([]);
      setDonorInitials('');
      setAccessCode('');
      
      localStorage.removeItem('draft_form');

    } catch (err) {
        console.error("❌ FULL ERROR DETAILS:", err);
        alert("⚠️ Post Failed: " + (err.response?.data?.msg || err.message));
    }
  };

  // [NEW FROM CODE 2] Edit Helper
  const editListing = (item) => {
      setFoodTitle(item.title);
      setFoodDesc(item.description);
      setFoodQty(item.quantity);
      setFoodExpiry(item.expiry_hours);
      setFoodCat(item.category);
      setIsVeg(item.isVeg);
      setPickupNote(item.pickupNote);
      setAccessCode(item.accessCode || '');
      setReqFridge(item.requiresRefrigeration);
      setContainerType(item.containerType || 'Disposable');
      setIsEditingListing(item._id);
      setView('donate');
      window.scrollTo(0, 0);
  };

  const updateStatus = async (id, newStatus) => {
    let reason = null;
    if (newStatus === 'Cancelled') {
        reason = prompt("⚠️ Please state the reason for reporting this issue:");
        if (!reason) return;
    } else {
        if (!window.confirm(`Mark as ${newStatus}?`)) return;
    }

    // [NEW FROM CODE 2] Check for delivery proof
    if(newStatus === 'Delivered' && !deliveryProof && user.role === 'Volunteer') {
        return showToast("⚠️ Please upload delivery proof first!", "error");
    }

    try {
        await axios.put(`${API_URL}/listings/${id}/status`,
            { status: newStatus, reason: reason },
            { headers: { 'x-auth-token': localStorage.getItem('token') } }
        );
        
        // [NEW FROM CODE 2] Arrived Toast
        if(newStatus === 'In Transit') showToast("🚚 En Route!", "success");

        fetchListings();
        fetchMyHistory();
        fetchUserData();
        setDeliveryProof(''); // Reset proof
        
    } catch (err) { alert("Update failed."); }
  };

  const deleteListing = async (id) => {
    if (!window.confirm("Delete this donation?")) return;
    try {
      const token = localStorage.getItem('token');
      const config = { headers: { 'x-auth-token': token } };
      await axios.delete(`${API_URL}/listings/${id}`, config);
      showToast("🗑️ Removed.");
      fetchListings(); fetchMyHistory();
      if (user.role === 'Admin') {
          fetchReports();}
    } catch (err) { alert("Error deleting: " + (err.response?.data?.msg || err.message)); }
  };

  const reportListing = async (id) => {
    const reason = prompt("Why are you reporting this?");
    if (!reason) return;
    try {
        const token = localStorage.getItem('token');
        await axios.post(`${API_URL}/listings/${id}/report`, { reason }, {
            headers: { 'x-auth-token': token }
        });
        showToast("✅ Report submitted.");
    } catch (err) { alert("Error submitting report."); }
  };

  const submitRating = async (id, ratingValue) => {
    const feedback = prompt("Optional: Leave a comment:");
    if(!window.confirm(`Rate ${ratingValue} stars?`)) return;
    try {
        await axios.put(`${API_URL}/listings/${id}/rate`, { rating: ratingValue, feedback: feedback || '' });
        showToast("Thanks!");
        fetchListings();
        fetchUserData();
    } catch (err) { alert("Error submitting rating."); }
  };

  // ==========================================
  // ROBUST FILTER LOGIC
  // ==========================================
  let displayListings = view === 'history' ? myListings : listings.filter(item => {
    if (item.status === 'Cancelled') return false;
    if (view === 'favorites') return favorites.includes(item._id || item.id);
    if (view === 'history') return isSameUser(item.donor, user.id) || isSameUser(item.claimedBy, user.id) || isSameUser(item.collectedBy, user.id);

    if (item.status === 'Available') return true;
    
    if (item.status === 'Claimed') {
        return user.role === 'Volunteer' ||
               (user.role === 'NGO' && isSameUser(item.claimedBy, user.id)) ||
               (user.role === 'Donor' && isSameUser(item.donor, user.id)); 
    }
    
    if (item.status === 'In Transit') {
        return (user.role === 'NGO' && isSameUser(item.claimedBy, user.id)) ||
               (user.role === 'Volunteer' && isSameUser(item.collectedBy, user.id)) ||
               (user.role === 'Donor' && isSameUser(item.donor, user.id)); 
    }
    
    if (item.status === 'Delivered') {
        return user.role === 'NGO' && isSameUser(item.claimedBy, user.id) && !item.rating;
    }
    
    return false;
  });

  if (sortMethod === 'closest' && location.lat) {
      displayListings.sort((a, b) => {
         const distA = parseFloat(calculateDistance(location.lat, location.lng, a.location?.lat, a.location?.lng));
         const distB = parseFloat(calculateDistance(location.lat, location.lng, b.location?.lat, b.location?.lng));
         return distA - distB;
      });
  } else if (sortMethod === 'expiry') {
      displayListings.sort((a, b) => a.expiry_hours - b.expiry_hours);
  }

  // Styles
  const currentCardStyle = highContrast
    ? { background: 'black', color: '#ffd700', border: '2px solid #ffd700', padding: '25px', marginBottom: '25px', borderRadius: '12px' }
    : { background: 'rgba(255, 255, 255, 0.95)', padding: '25px', marginBottom: '25px', borderRadius: '12px', boxShadow: '0 8px 30px rgba(0,0,0,0.08)', backdropFilter: 'blur(5px)' };
    
  const currentBodyStyle = highContrast
    ? { backgroundColor: '#111', minHeight: '100vh', color: '#ffd700' }
    : { backgroundColor: '#f4f4f4', minHeight: '100vh' };
  const inputStyle = { width: '100%', padding: '12px 15px', borderRadius: '6px', border: '1px solid #e0e0e0', boxSizing: 'border-box', fontSize:'1em', outline: 'none' };
  const statBoxStyle = (background, highContrast) => ({ flex: 1, background: background, color: highContrast ? '#ffd700' : 'white', border: highContrast ? '1px solid #ffd700' : 'none', padding: '20px', borderRadius: '12px', textAlign: 'center', boxShadow: '0 4px 15px rgba(0,0,0,0.15)' });
  const buttonStyle = (background) => ({ width: '100%', padding: '12px', background: background, color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', marginTop: '5px', fontWeight: 'bold', fontSize:'1em' });
  const actionButtonStyle = (background) => ({ ...buttonStyle(background), width: 'auto', padding: '10px 20px', borderRadius:'30px', fontSize:'0.9em' });
  const tabButtonStyle = { flex: 1, padding: '12px', border: '2px solid #2c3e50', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' };
  const statusBadgeStyle = (status) => ({ background: status === 'Available' ? '#d4edda' : status === 'Claimed' ? '#fff3cd' : status === 'In Transit' ? '#e2e3ff' : '#d1e7dd', color: status === 'Available' ? '#155724' : status === 'Claimed' ? '#856404' : status === 'In Transit' ? '#4a56a6' : '#0f5132', padding: '6px 12px', borderRadius: '20px', fontSize: '0.85em', fontWeight: 'bold' });
  const infoTagStyle = { background:'#f5f5f5', padding:'5px 10px', borderRadius:'15px', fontSize:'0.85em', color:'#555', border:'1px solid #eee' };

  // ==========================================
  // 9. MAIN RENDER
  // ==========================================
  return (
    <div className={`App ${isRTL ? 'rtl-mode' : ''} ${fontSize}`} style={{ ...currentBodyStyle, padding: '30px 20px', maxWidth: '850px', margin: '0 auto' }}>
      
      {/* TOAST */}
      {toast && (
          <div className={`toast-container ${toast.type === 'error' ? 'toast-error' : 'toast-success'}`} style={{position:'fixed', top:'20px', left:'50%', transform:'translateX(-50%)', padding:'10px 20px', background: toast.type==='error'?'#e74c3c':'#27ae60', color:'white', borderRadius:'30px', zIndex:9999, fontWeight:'bold', boxShadow:'0 5px 15px rgba(0,0,0,0.2)'}}>
              {toast.type === 'error' ? '❌' : '✅'} {toast.msg}
          </div>
      )}

      {/* SAFETY HELP POPUP */}
      {showSafetyModal && (
          <div className="safety-modal" style={{position:'fixed', top:0, left:0, width:'100%', height:'100%', background:'rgba(0,0,0,0.8)', zIndex:2000, display:'flex', justifyContent:'center', alignItems:'center'}}>
              <div style={{background:'white', padding:'30px', borderRadius:'15px', maxWidth:'400px', textAlign:'center', color: 'black'}}>
                  <h3>🌡️ Food Safety Guide</h3>
                  <p><strong>Hot Food:</strong> Keep above 60°C.</p>
                  <p><strong>Cold Food:</strong> Keep below 5°C.</p>
                  <p><strong>Danger Zone:</strong> Bacteria grows fast between 5°C - 60°C.</p>
                  <button onClick={() => setShowSafetyModal(false)} style={buttonStyle('#2c3e50')}>Got it</button>
              </div>
          </div>
      )}

      {/* --- [NEW FROM CODE 2] GUIDE MODAL --- */}
      {showGuide && (
          <div className="safety-modal" style={{position:'fixed', top:0, left:0, width:'100%', height:'100%', background:'rgba(0,0,0,0.8)', zIndex:2000, display:'flex', justifyContent:'center', alignItems:'center'}}>
              <div style={{background:'white', padding:'30px', borderRadius:'15px', maxWidth:'400px', textAlign:'center', color:'black'}}>
                  <h3>📘 How to Donate</h3>
                  <p>1. Tap "Donate" & fill details.</p>
                  <p>2. Upload a clear photo.</p>
                  <p>3. Wait for NGO to claim.</p>
                  <button onClick={() => setShowGuide(false)} style={buttonStyle('#2c3e50')}>Close Guide</button>
              </div>
          </div>
      )}

      {/* --- [NEW FROM CODE 2] USSD MODAL --- */}
      {showUSSD && (
          <div className="pack-modal" style={{position:'fixed', top:0, left:0, width:'100%', height:'100%', background:'rgba(0,0,0,0.8)', zIndex:2000, display:'flex', justifyContent:'center', alignItems:'center'}}>
             <div className="pack-content" style={{background:'white', padding:'30px', borderRadius:'15px', maxWidth:'400px', color:'black', textAlign:'center'}}>
                 <h3>📱 Offline USSD Codes</h3>
                 <p>Donate: *123*1#</p>
                 <p>Volunteer: *123*2#</p>
                 <button onClick={() => setShowUSSD(false)} style={buttonStyle('#3498db')}>Close</button>
             </div>
          </div>
      )}

      {/* PACKAGING MODAL */}
      {showPackModal && (
          <div className="pack-modal" style={{position:'fixed', top:0, left:0, width:'100%', height:'100%', background:'rgba(0,0,0,0.8)', zIndex:2000, display:'flex', justifyContent:'center', alignItems:'center'}}>
             <div className="pack-content" style={{background:'white', padding:'30px', borderRadius:'15px', maxWidth:'400px', color:'black', textAlign:'center'}}>
                 <h3>📦 Packing Tips</h3>
                 <ul style={{textAlign:'left'}}>
                     <li>Use leak-proof containers for curries.</li>
                     <li>Double-bag liquids.</li>
                     <li>Label allergens clearly.</li>
                 </ul>
                 <button onClick={() => setShowPackModal(false)} style={buttonStyle('#3498db')}>Close</button>
             </div>
          </div>
      )}

      {/* CERTIFICATE MODAL */}
      {showCertificate && (
          <div className="pack-modal" style={{position:'fixed', top:0, left:0, width:'100%', height:'100%', background:'rgba(0,0,0,0.9)', zIndex:2000, display:'flex', justifyContent:'center', alignItems:'center'}}>
             <div className="cert-modal" style={{background:'white', padding:'40px', borderRadius:'15px', maxWidth:'500px', color:'black', textAlign:'center', border:'10px solid #f1c40f'}}>
                 <h2 className="cert-title" style={{fontFamily:'serif', color:'#2c3e50', fontSize:'2em', marginBottom:'10px'}}>Certificate of Appreciation</h2>
                 <p style={{fontSize:'1.2em'}}>This certifies that</p>
                 <div className="cert-name" style={{fontSize:'2.5em', fontWeight:'bold', color:'#27ae60', margin:'20px 0', fontFamily:'cursive'}}>{user.name}</div>
                 <p style={{fontSize:'1.2em'}}>Has been awarded the rank of</p>
                 <h3 style={{color:'#f39c12', fontSize:'1.8em'}}>{getDonorBadge(myListings.length)}</h3>
                 <p style={{fontStyle:'italic', color:'#777'}}>For their outstanding contribution to reducing food waste.</p>
                 <button onClick={() => setShowCertificate(false)} style={buttonStyle('#3498db')}>Close</button>
             </div>
          </div>
      )}

      {/* BACK TO TOP */}
      <div className="back-to-top" onClick={() => window.scrollTo(0, 0)} style={{position:'fixed', bottom:'80px', right:'20px', padding:'10px 15px', background:'#333', color:'white', borderRadius:'50%', cursor:'pointer', zIndex:999}}>⬆</div>

      {showOnboarding && (
          <div style={{position:'fixed', top:0, left:0, width:'100%', height:'100%', background:'rgba(0,0,0,0.8)', zIndex:2000, display:'flex', justifyContent:'center', alignItems:'center'}}>
              <div style={{background:'white', padding:'30px', borderRadius:'15px', maxWidth:'400px', textAlign:'center', color:'black'}}>
                  <h2>👋 Welcome to FoodConnect!</h2>
                  <p>1. 🍲 <strong>Donors</strong> post surplus food.</p>
                  <p>2. ✋ <strong>NGOs</strong> claim and pick it up.</p>
                  <p>3. 🚚 <strong>Volunteers</strong> help transport it.</p>
                  <button onClick={() => setShowOnboarding(false)} style={buttonStyle('#27ae60')}>Get Started</button>
              </div>
          </div>
      )}

      {showQuiz && (
          <div style={{position:'fixed', top:0, left:0, width:'100%', height:'100%', background:'rgba(0,0,0,0.9)', zIndex:2000, display:'flex', justifyContent:'center', alignItems:'center'}}>
              <div style={{background:'white', padding:'30px', borderRadius:'15px', maxWidth:'400px', textAlign:'center', color:'black'}}>
                  <h3>🎓 Safety Training ({currentQuestion + 1}/{safetyQuiz.length})</h3>
                  <p style={{fontSize:'1.2em', fontWeight:'bold', margin:'20px 0'}}>{safetyQuiz[currentQuestion].q}</p>
                  <div style={{display:'flex', flexDirection:'column', gap:'10px'}}>
                      {safetyQuiz[currentQuestion].options.map(opt => (
                          <button key={opt} onClick={() => handleQuizAnswer(opt)} style={buttonStyle('#3498db')}>{opt}</button>
                      ))}
                  </div>
                  <button onClick={() => setShowQuiz(false)} style={{marginTop:'20px', background:'transparent', border:'none', color:'#777', textDecoration:'underline', cursor:'pointer'}}>Cancel</button>
              </div>
          </div>
      )}

      {/* HEADER */}
      <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'10px'}}>
        
        {/* NOTIFICATION BELL */}
        <div style={{position:'relative', cursor:'pointer'}} onClick={() => setShowNotifDropdown(!showNotifDropdown)}>
              <span style={{fontSize:'1.5em'}}>🔔</span>
              {appNotifications.length > 0 && <span style={{position:'absolute', top:-5, right:-5, background:'red', color:'white', borderRadius:'50%', width:'18px', height:'18px', fontSize:'0.7em', display:'flex', alignItems:'center', justifyContent:'center'}}>{appNotifications.length}</span>}
              {showNotifDropdown && (
                  <div style={{position:'absolute', top:'100%', left:0, background:'white', border:'1px solid #ccc', borderRadius:'8px', width:'250px', zIndex:1000, color:'black', textAlign:'left'}}>
                      <div style={{padding:'10px', fontWeight:'bold', borderBottom:'1px solid #eee'}}>Notifications</div>
                      {appNotifications.length === 0 ? <div style={{padding:'10px', color:'#777'}}>No new alerts</div> : 
                          appNotifications.map((n, i) => (
                              <div key={i} style={{padding:'10px', borderBottom:'1px solid #eee', fontSize:'0.9em'}}>
                                  {n.msg} <br/> <small style={{color:'#888'}}>{n.time.toLocaleTimeString()}</small>
                              </div>
                          ))
                      }
                  </div>
              )}
        </div>

        <div style={{display:'flex', gap:'10px', flexWrap:'wrap'}}>
            <button onClick={cycleFontSize} style={{background:'#3498db', color:'white', border:'none', padding:'5px 10px', borderRadius:'5px', cursor:'pointer', fontWeight:'bold', fontSize:'0.9em'}}>
                A+
            </button>

            <button onClick={() => setLiteMode(!liteMode)} style={{background: liteMode ? '#2ecc71' : '#eee', color:'black', border:'none', padding:'5px 10px', borderRadius:'5px', cursor:'pointer', fontWeight:'bold', fontSize:'0.9em'}}>
                {liteMode ? '⚡ Lite ON' : '📷 Lite OFF'}
            </button>

            <button onClick={() => setLang(lang === 'en' ? 'hi' : 'en')} style={{background: highContrast ? '#ffd700' : '#eee', color: highContrast ? 'black' : 'black', border:'none', padding:'5px 10px', borderRadius:'5px', cursor:'pointer', fontWeight:'bold', fontSize:'0.9em'}}>
                {lang === 'en' ? '🇮🇳 Hindi' : '🇺🇸 English'}
            </button>
            <button onClick={() => setHighContrast(!highContrast)} style={{background: highContrast ? '#fff' : '#2c3e50', color: highContrast ? '#000' : '#fff', border:'none', padding:'5px 10px', borderRadius:'5px', cursor:'pointer', fontWeight:'bold', fontSize:'0.9em'}}>
                {highContrast ? '☀️ Normal' : '🌗 High Contrast'}
            </button>
             <button onClick={() => setIsRTL(!isRTL)} style={{background: '#eee', color:'black', border:'none', padding:'5px 10px', borderRadius:'5px', cursor:'pointer', fontWeight:'bold', fontSize:'0.9em'}}>
                {isRTL ? 'LTR' : 'RTL'}
            </button>
        </div>
      </div>

      <h1 style={{ color: highContrast ? '#ffd700' : '#2c3e50', textAlign: 'center', marginBottom: '30px', textShadow: highContrast ? 'none' : '1px 1px 2px rgba(0,0,0,0.1)' }}>
        {t.title}
      </h1>
      
      <div className="goal-container" style={{background: highContrast ? '#222' : '#e8f5e9', padding:'15px', borderRadius:'8px', marginBottom:'20px', border: highContrast ? '1px solid #ffd700' : '1px solid #c8e6c9'}}>
          <h4 style={{margin:'0 0 10px 0', textAlign:'center', color: highContrast ? '#ffd700' : '#2c3e50'}}>🎯 Community Goal: 1,000 Meals</h4>
          <div className="progress-bar" style={{width:'100%', background:'#ccc', height:'20px', borderRadius:'10px', overflow:'hidden'}}>
              <div className="progress-fill" style={{width: `${Math.min((stats.meals_saved / 1000) * 100, 100)}%`, background:'#27ae60', height:'100%'}}></div>
          </div>
          <div style={{textAlign:'center', fontSize:'0.8em', marginTop:'5px', color: highContrast ? '#ccc' : '#555'}}>{stats.meals_saved} / 1000 Meals Saved</div>
      </div>

      {/* STATS TOGGLE */}
      <div style={{textAlign:'center', marginBottom:'10px'}}>
          <button onClick={() => setShowStats(!showStats)} style={{background:'none', border:'none', cursor:'pointer', color: highContrast?'#ffd700':'#555', textDecoration:'underline'}}>
              {showStats ? 'Hide Stats ▲' : 'Show Stats ▼'}
          </button>
      </div>

      {showStats && (
        <div style={{ display: 'flex', gap: '20px', marginBottom: '25px', flexWrap:'wrap' }}>
            <div style={statBoxStyle(highContrast ? '#333' : 'linear-gradient(135deg, #27ae60, #2ecc71)', highContrast)}><h2>{stats.total_donations}</h2><p>Active</p></div>
            <div style={statBoxStyle(highContrast ? '#333' : 'linear-gradient(135deg, #e67e22, #f39c12)', highContrast)}><h2>{stats.meals_saved}</h2><p>Saved</p></div>
            <div style={statBoxStyle(highContrast ? '#333' : 'linear-gradient(135deg, #8e44ad, #9b59b6)', highContrast)}><h2>{(stats.meals_saved * 0.25).toFixed(1)}kg</h2><p>Diverted</p></div>
            <div style={statBoxStyle(highContrast ? '#333' : 'linear-gradient(135deg, #2c3e50, #34495e)', highContrast)}><h2>{stats.co2_saved} kg</h2><p>CO2 Saved</p></div>
            {/* [NEW FROM CODE 2] Water Saved */}
            <div style={statBoxStyle(highContrast ? '#333' : 'linear-gradient(135deg, #2980b9, #3498db)', highContrast)}><h2>{stats.meals_saved * 800}L</h2><p>Water Saved</p></div>
        </div>
      )}

      {/* LEADERBOARD */}
      <div className="card" style={currentCardStyle}>
        <div style={{display:'flex', justifyContent:'space-between'}}>
             <h3 style={{borderBottom:'2px solid #eee', paddingBottom:'10px', margin:'0 0 15px 0'}}>🏆 Leaderboard</h3>
             {/* [NEW FROM CODE 2] Toggle Leaderboard */}
             <select onChange={(e) => setLeaderboardTab(e.target.value)} style={{padding:'5px', height:'35px'}}><option value="donors">Top Donors</option><option value="volunteers">Top Volunteers</option></select>
        </div>
        {leaderboard.length === 0 ? <p style={{color: '#888'}}>No data yet.</p> : (
          <table style={{width: '100%', textAlign: 'left', borderCollapse:'separate', borderSpacing:'0 5px'}}>
            <tbody>
              {leaderboard.map((donor, index) => (
                <tr key={index} style={{background: index === 0 ? (highContrast ? '#333' : '#fffbe6') : 'transparent', color: highContrast ? '#ffd700' : 'inherit'}}>
                  <td style={{fontWeight: 'bold', padding:'8px'}}>{index === 0 ? '🥇' : index + 1 + '.'}</td>
                  <td style={{padding:'8px'}}>{donor.name}</td>
                  <td style={{textAlign: 'right', fontWeight: 'bold', padding:'8px', color: highContrast ? '#ffd700' : '#27ae60'}}>{donor.count}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* AUTH & PROFILE CARD */}
      <div className="card" style={currentCardStyle}>
        {!user.id ? (
          <div>
            <h3 style={{marginBottom:'15px', color: highContrast ? '#ffd700' : '#2c3e50'}}>{isRegistering ? t.register : t.login}</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {isRegistering && <input placeholder="Full Name" value={regName} onChange={e => setRegName(e.target.value)} style={inputStyle} />}
              <input placeholder="Email Address" value={regEmail} onChange={e => setRegEmail(e.target.value)} style={inputStyle} />
              <div style={{position:'relative'}}>
                  <input type={showPassword ? "text" : "password"} placeholder="Password" value={regPassword} onChange={e => setRegPassword(e.target.value)} style={{...inputStyle, paddingRight:'40px'}} />
                  <span onClick={() => setShowPassword(!showPassword)} style={{position:'absolute', right:'10px', top:'12px', cursor:'pointer', fontSize:'1.2em'}}>{showPassword ? '🙈' : '👁️'}</span>
              </div>
              {isRegistering && (
                <>
                  <input placeholder="📍 Pickup Address" value={regAddress} onChange={e => setRegAddress(e.target.value)} style={inputStyle} />
                  <input placeholder="📞 Phone Number" value={regPhone} onChange={e => setRegPhone(e.target.value)} style={inputStyle} />
                  <select value={regRole} onChange={e => setRegRole(e.target.value)} style={inputStyle}><option>Donor</option><option>NGO</option><option value="Volunteer">Volunteer</option></select>
                  {regRole === 'NGO' && <input placeholder="🏢 NGO Govt Reg. Number (Required)" value={regNgoNumber} onChange={e => setRegNgoNumber(e.target.value)} style={{...inputStyle, border:'2px solid #3498db'}} />}
                  <div style={{display:'flex', flexDirection:'column', gap:'5px', marginTop:'5px'}}>
                      <div style={{display:'flex', alignItems:'center', gap:'10px'}}>
                          <input type="checkbox" checked={agreeTerms} onChange={e => setAgreeTerms(e.target.checked)} id="terms" />
                          <label htmlFor="terms" style={{fontSize:'0.9em', color: highContrast ? '#fff' : '#555'}}>I agree to the <span onClick={(e) => { e.preventDefault(); setShowTerms(true); }} style={{color: highContrast ? '#ffd700' : '#3498db', textDecoration:'underline', cursor:'pointer'}}>Terms & Conditions</span></label>
                      </div>
                      {regRole === 'Volunteer' && (
                          <div style={{display:'flex', alignItems:'center', gap:'10px'}}>
                              <input type="checkbox" checked={agreeCodeOfConduct} onChange={e => setAgreeCodeOfConduct(e.target.checked)} id="conduct" />
                              <label htmlFor="conduct" style={{fontSize:'0.9em', color: highContrast ? '#fff' : '#555'}}>Agree to Code of Conduct</label>
                          </div>
                      )}
                  </div>
                </>
              )}
              <div style={{ marginTop: '10px' }}><button onClick={isRegistering ? registerUser : loginUser} style={buttonStyle(highContrast ? '#555' : '#2c3e50')}>{isRegistering ? t.register : t.login}</button></div>
              <div style={{textAlign:'center', marginTop:'15px', fontSize:'0.9em'}}>
                  <span onClick={() => setIsRegistering(!isRegistering)} style={{color: highContrast ? '#fff' : '#3498db', cursor:'pointer', textDecoration:'underline'}}>{isRegistering ? "Login here" : "Create account"}</span>
              </div>
              {!isRegistering && <div style={{textAlign:'center', marginTop:'5px'}}><span onClick={handleForgotPassword} style={{color:'#3498db', cursor:'pointer', fontSize:'0.9em'}}>Forgot Password?</span></div>}
            </div>
          </div>
        ) : (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom:'10px' }}>
                <div style={{display:'flex', alignItems:'center'}}>
                    <UserAvatar name={user.name} />
                    <h3>{t.welcome}, {user.name} {user.isVerified && <span title="Verified User" style={{marginLeft:'5px', color:'#3498db', fontSize:'0.9em'}}>☑️</span>}</h3>
                </div>
                <button onClick={logout} style={{ ...buttonStyle('#e74c3c'), width: 'auto', padding:'8px 20px' }}>{t.logout}</button>
            </div>
            <div style={{background: highContrast ? '#222' : '#f8f9fa', padding:'15px', borderRadius:'8px', border: highContrast ? '1px solid #ffd700' : 'none'}}>
                {!isEditingProfile ? (
                    <div>
                        <div style={{display:'flex', justifyContent:'space-between', alignItems:'center'}}>
                            <h4>👤 Your Profile</h4>
                            <button onClick={startEditing} style={{...buttonStyle(highContrast ? '#444' : '#3498db'), width:'auto', padding:'5px 15px', fontSize:'0.8em'}}>✏️ Edit</button>
                        </div>
                        <p style={{margin:'5px 0', fontSize:'0.9em'}}><strong>Phone:</strong> {user.phone}</p>
                        <p style={{margin:'5px 0', fontSize:'0.9em'}}><strong>Address:</strong> {user.address}</p>
                        
                        <div style={{margin:'10px 0', padding:'10px', background:'linear-gradient(to right, #6dd5fa, #2980b9)', color:'white', borderRadius:'8px', fontWeight:'bold'}}>
                             🌱 Sustainability Credits: {user.credits || 0}
                        </div>
                        
                        {/* [NEW FROM CODE 2] Low Rating Warning */}
                        {calculateMyRating() < 3 && <div style={{background:'#ffcccc', color:'red', padding:'5px', borderRadius:'5px', fontSize:'0.9em', marginTop:'5px'}}>⚠️ Warning: Low Rating!</div>}
                        
                        {/* [NEW FROM CODE 2] Next Rank Progress */}
                        <div style={{background:'#eee', height:'8px', width:'100%', margin:'10px 0', borderRadius:'4px', overflow:'hidden'}}>
                            <div style={{width:'40%', background:'#27ae60', height:'100%'}}></div>
                        </div>
                        <small style={{display:'block', marginBottom:'10px', color:'#777'}}>40 points to next rank</small>

                        <div style={{marginTop:'10px'}}><strong>Status:</strong> {user.isVerified ? <span style={{color:'green', marginLeft:'5px'}}>✅ Verified</span> : <span style={{color:'orange', marginLeft:'5px'}}>⚠️ Not Verified</span>}</div>
                        {user.role === 'NGO' && (
                            <div style={{background:'#e3f2fd', padding:'10px', marginTop:'10px', borderRadius:'5px', fontSize:'0.9em'}}>
                                <strong>🏢 Capacity:</strong> Fridge: {user.ngoCapacity?.fridge || 'N/A'}, Dry: {user.ngoCapacity?.dryStorage || 'N/A'} <br/>
                                <strong>Serves:</strong> {user.servedGroups || 'General'}
                            </div>
                        )}
                        
                        {user.role === 'Volunteer' && (
                            <div style={{marginTop:'10px', padding:'10px', background: volunteerAvailable ? '#d4edda' : '#f8d7da', borderRadius:'5px'}}>
                                <label style={{cursor:'pointer', display:'flex', alignItems:'center'}}>
                                    <input 
                                        type="checkbox" 
                                        checked={volunteerAvailable} 
                                        onChange={async (e) => {
                                            const newVal = e.target.checked;
                                            setVolunteerAvailable(newVal);
                                            try {
                                                const token = localStorage.getItem('token');
                                                await axios.put(`${API_URL}/auth/update`, { isAvailable: newVal }, { headers: { 'x-auth-token': token } });
                                            } catch(err) { alert("Failed to save status"); }
                                        }} 
                                        style={{marginRight:'10px'}}
                                    /> 
                                    {volunteerAvailable ? "✅ I am Available for Pickups" : "❌ I am Not Available"}
                                </label>
                            </div>
                        )}

                        {user.role === 'Volunteer' && !user.isTrained && (
                            <div style={{marginTop:'15px', padding:'15px', background:'#fff3cd', borderRadius:'8px', border:'1px solid #ffeeba'}}>
                                <strong>⚠️ Training Required</strong>
                                <p style={{margin:'5px 0', fontSize:'0.9em'}}>You must pass the safety quiz before you can pick up food.</p>
                                <button onClick={() => { setQuizScore(0); setCurrentQuestion(0); setShowQuiz(true); }} style={buttonStyle('#e67e22')}>Start Quiz</button>
                            </div>
                        )}
                        {user.role === 'Volunteer' && user.isTrained && <div style={{marginTop:'15px', color:'green'}}>✅ <strong>Certified Volunteer</strong></div>}

                        {user.role === 'Donor' && (
                             <div style={{marginTop:'15px', padding:'15px', background: highContrast ? '#000' : 'white', border: highContrast ? '1px solid #ffd700' : '1px solid #ddd', borderRadius:'6px', display:'flex', justifyContent:'space-around', alignItems:'center'}}>
                                <div style={{textAlign:'center'}}><span style={{fontSize:'0.8em', color: highContrast ? '#ccc' : '#777'}}>RANK</span><div style={{fontWeight:'bold', color: highContrast ? '#ffd700' : '#e67e22'}}>{getDonorBadge(myListings.length)}</div></div>
                                <div style={{borderLeft: highContrast ? '1px solid #ffd700' : '1px solid #eee', height:'40px'}}></div>
                                <div style={{textAlign:'center'}}><span style={{fontSize:'0.8em', color: highContrast ? '#ccc' : '#777'}}>RATING</span><div style={{fontWeight:'bold', color: highContrast ? '#ffd700' : '#f1c40f'}}>{calculateMyRating()}</div></div>
                             </div>
                        )}
                        {user.role === 'Donor' && <button onClick={() => setShowCertificate(true)} style={{...buttonStyle('#f1c40f'), marginTop:'10px', color:'black'}}>🎓 Get Certificate</button>}
                        {user.role === 'Donor' && <button onClick={shareImpact} style={{...buttonStyle('#8e44ad'), marginTop:'15px'}}>📢 Share My Impact</button>}
                        
                        <div style={{marginTop:'20px', borderTop:'1px solid #ccc', paddingTop:'15px', display:'flex', gap:'10px'}}>
                            <button onClick={deactivateAccount} style={{...buttonStyle('#e67e22'), width:'auto', fontSize:'0.8em', padding:'8px 15px'}}>⏸️ Deactivate</button>
                            <button onClick={deleteAccount} style={{...buttonStyle('#c0392b'), width:'auto', fontSize:'0.8em', padding:'8px 15px'}}>⚠️ Delete Permanent</button>
                        </div>
                    </div>
                ) : (
                    <div>
                          <h4>✏️ Edit Profile</h4>
                          <input placeholder="Name" value={editName} onChange={e => setEditName(e.target.value)} style={inputStyle} />
                          <input placeholder="Phone" value={editPhone} onChange={e => setEditPhone(e.target.value)} style={inputStyle} />
                          <input placeholder="Address" value={editAddress} onChange={e => setEditAddress(e.target.value)} style={inputStyle} />
                          
                          {user.role === 'NGO' && (
                              <div style={{marginTop:'10px'}}>
                                  <label style={{fontSize:'0.9em', fontWeight:'bold'}}>Serves Population:</label>
                                  <select value={editServedGroups} onChange={e => setEditServedGroups(e.target.value)} style={inputStyle}>
                                      <option>General</option><option>Children</option><option>Elderly</option><option>Homeless</option>
                                  </select>
                              </div>
                          )}

                          {/* [NEW FROM CODE 2] Volunteer Schedule */}
                          {user.role === 'Volunteer' && (
                              <div style={{marginTop:'10px'}}>
                                  <label style={{fontSize:'0.9em', fontWeight:'bold'}}>Volunteer Schedule:</label>
                                  <input type="date" value={volunteerSchedule} onChange={e => setVolunteerSchedule(e.target.value)} style={inputStyle} />
                              </div>
                          )}

                          <div style={{marginTop:'15px', padding:'10px', background: highContrast ? '#333' : '#e8f6f3', borderRadius:'5px', border:'1px dashed #1abc9c'}}>
                                <h5 style={{margin:'0 0 5px 0', color: highContrast ? '#fff' : '#16a085'}}>📄 Get Verified (Upload ID/License)</h5>
                                <input type="file" accept="image/*" onChange={handleImageUpload} />
                                {verificationDoc && <span style={{color:'green', fontSize:'0.8em', display:'block', marginTop:'5px'}}>✅ Document Attached</span>}
                                {user.verificationDocument && !verificationDoc && <div style={{fontSize:'0.8em', marginTop:'5px', color:'#555'}}>Current Doc: <a href={user.verificationDocument} target="_blank" rel="noreferrer">View</a></div>}
                          </div>

                          {user.role === 'NGO' && (
                            <div style={{marginTop:'15px', padding:'10px', background:'#f0f0f0', borderRadius:'5px'}}>
                                <h5 style={{margin:'0 0 10px 0'}}>🏢 Storage Capacity</h5>
                                <input placeholder="Fridge Capacity (e.g. 50kg)" value={editFridge} onChange={e => setEditFridge(e.target.value)} style={inputStyle} />
                                <input placeholder="Dry Storage (e.g. 100kg)" value={editDry} onChange={e => setEditDry(e.target.value)} style={inputStyle} />
                            </div>
                          )}

                          <div style={{marginTop:'15px', padding:'10px', background:'#f0f0f0', borderRadius:'5px'}}>
                                <h5 style={{margin:'0 0 10px 0'}}>🔔 Notifications</h5>
                                <label style={{display:'block', marginBottom:'5px'}}><input type="checkbox" checked={editNotifEmail} onChange={e => setEditNotifEmail(e.target.checked)} /> Email Alerts</label>
                                <label style={{display:'block'}}><input type="checkbox" checked={editNotifSMS} onChange={e => setEditNotifSMS(e.target.checked)} /> SMS Alerts</label>
                          </div>

                          <div style={{display:'flex', gap:'10px', marginTop:'15px'}}>
                            <button onClick={updateProfile} style={buttonStyle('#27ae60')}>Save Changes</button>
                            <button onClick={() => setIsEditingProfile(false)} style={buttonStyle('#95a5a6')}>Cancel</button>
                          </div>
                    </div>
                )}
            </div>
          </div>
        )}
      </div>

      {user.role === 'Admin' && (
          <button onClick={() => { setView('admin'); fetchUsers(); fetchReports(); }} style={{...buttonStyle('#8e44ad'), marginBottom:'20px'}}>🛡️ Open Admin Panel</button>
      )}

      <div className="card" style={{...currentCardStyle, display: 'flex', gap: '15px', padding:'15px'}}>
        <button onClick={() => setView('feed')} style={{...tabButtonStyle, background: view === 'feed' ? '#2c3e50' : '#f9f9f9', color: view === 'feed' ? 'white' : 'black'}}>{t.feed}</button>
        <button onClick={() => setView('favorites')} style={{...tabButtonStyle, background: view === 'favorites' ? '#2c3e50' : '#f9f9f9', color: view === 'favorites' ? 'white' : 'black'}}>{t.saved}</button>
        <button onClick={() => { setView('history'); fetchMyHistory(); }} style={{...tabButtonStyle, background: view === 'history' ? '#2c3e50' : '#f9f9f9', color: view === 'history' ? 'white' : 'black'}}>{view === 'history' ? t.history : 'Activity'}</button>
      </div>

      {view === 'admin' && (
          <div className="card" style={currentCardStyle}>
              <h3>🛡️ Admin Dashboard</h3>
              <p>Verify Users & Documents</p>
              {allUsers.map(u => (
                  <div key={u._id} style={{borderBottom:'1px solid #eee', padding:'10px 0', display:'flex', justifyContent:'space-between', alignItems:'center'}}>
                      <div>
                          <strong>{u.name}</strong> ({u.role}) <br/>
                          {u.verificationDocument ? <a href={u.verificationDocument} target="_blank" rel="noreferrer" style={{color:'blue'}}>📄 View Doc</a> : <span style={{color:'red'}}>No Doc</span>}
                      </div>
                      {u.isVerified ? <span style={{color:'green', fontWeight:'bold'}}>Verified</span> : <button onClick={() => verifyUser(u._id)} style={{background:'#27ae60', color:'white', border:'none', padding:'5px 10px', borderRadius:'5px', cursor:'pointer'}}>Approve</button>}
                  </div>
              ))}

              <h3 style={{marginTop:'30px', borderTop:'2px solid #eee', paddingTop:'20px'}}>🚩 Reported Content</h3>
              {reportedItems.length === 0 ? <p>No issues reported.</p> : (
                  reportedItems.map(item => (
                      <div key={item._id} style={{background:'#fff5f5', padding:'10px', marginBottom:'10px', borderRadius:'5px', borderLeft:'4px solid #c0392b'}}>
                          <strong>{item.title}</strong> (Posted by: {item.donor.name})
                          <br/>
                          <span style={{color:'#c0392b'}}>Reason: {item.reports[0].reason}</span>
                          <div style={{marginTop:'10px'}}>
                              <button onClick={() => deleteListing(item._id)} style={{...buttonStyle('#c0392b'), width:'auto', padding:'5px 10px', fontSize:'0.8em'}}>🗑️ Delete Item</button>
                              <button onClick={() => alert("Warning sent to user.")} style={{...buttonStyle('#f39c12'), width:'auto', padding:'5px 10px', fontSize:'0.8em', marginLeft:'10px'}}>⚠️ Warn User</button>
                          </div>
                      </div>
                  ))
              )}
          </div>
      )}

      {user.role === 'Donor' && (
        <div className="card" style={currentCardStyle}>
          <h2 style={{borderBottom:'2px solid #eee', paddingBottom:'10px', margin:'0 0 20px 0'}}>{t.donate}</h2>
          
          <div style={{display:'flex', gap:'5px', marginBottom:'10px'}}>
               <input placeholder="Item Name" value={foodTitle} onChange={e => setFoodTitle(e.target.value)} style={inputStyle} />
               {/* [NEW FROM CODE 2] Voice Input Button */}
               <button onClick={startVoiceInput} style={{width:'50px', background:'#3498db', color:'white', border:'none', borderRadius:'5px', cursor:'pointer'}}>🎤</button>
          </div>
          
          <div style={{position:'relative'}}>
              <textarea placeholder="Description..." maxLength="300" value={foodDesc} onChange={e => setFoodDesc(e.target.value)} style={{...inputStyle, height: '70px', fontFamily:'inherit'}} />
              <small style={{position:'absolute', bottom:'5px', right:'10px', color: '#999', fontSize:'0.8em'}}>{foodDesc.length}/300</small>
          </div>
          
          <textarea placeholder="📝 Handling Instructions (e.g. Keep upright, Delicate)..." value={handlingInstructions} onChange={e => setHandlingInstructions(e.target.value)} style={{...inputStyle, marginTop: '10px', height: '60px', fontFamily:'inherit'}} />

          <div style={{ display: 'flex', gap: '15px', marginTop:'15px' }}>
            <div style={{flex:1, display:'flex'}}>
                <input type="number" placeholder="Qty" min="0.1" step="0.1" value={foodQty} onChange={e => setFoodQty(e.target.value)} style={{...inputStyle, borderRadius:'4px 0 0 4px'}} />
                <select value={foodUnit} onChange={e => setFoodUnit(e.target.value)} style={{...inputStyle, width:'auto', borderRadius:'0 4px 4px 0', borderLeft:'none', background:'#f8f9fa'}}><option>kg</option><option>servings</option></select>
            </div>
            
            <div style={{flex:1, display: 'flex', alignItems:'center'}}>
                 <select value={containerType} onChange={e => setContainerType(e.target.value)} style={{...inputStyle}}>
                    <option value="Disposable">📦 Disposable (Keep)</option>
                    <option value="Returnable">🔄 Returnable</option>
                 </select>
                 <button onClick={() => setShowPackModal(true)} style={{marginLeft:'5px', background:'#f39c12', color:'white', border:'none', borderRadius:'5px', padding:'5px 10px', cursor:'pointer', fontSize:'0.8em'}}>📦 Tips</button>
            </div>
            
            <div style={{flex:1}}>
                  <input type="number" placeholder="Exp Hours" min="1" value={foodExpiry} onChange={e => setFoodExpiry(e.target.value)} style={inputStyle} />
            </div>
          </div>

          {/* [NEW FROM CODE 2] Access Code */}
          <input placeholder="Gate/Access Code (Optional)" value={accessCode} onChange={e => setAccessCode(e.target.value)} style={{...inputStyle, marginTop:'10px'}} />

          {/* [NEW FROM CODE 2] Halal Filter */}
          <div style={{margin:'10px 0'}}>
              <label><input type="checkbox" /> Halal Certified</label>
          </div>

          <div style={{marginBottom:'15px', background:'#f8f9fa', padding:'10px', borderRadius:'5px', border:'1px dashed #ccc', marginTop:'15px'}}>
              <h5 style={{margin:'0 0 5px 0'}}>📸 Add Photo</h5>
              <input type="file" accept="image/*" onChange={handleImageUpload} />
              {isUploading && <span style={{color:'orange', marginLeft:'10px'}}>Uploading... ⏳</span>}
              {foodImage && (
                  <div style={{marginTop:'10px'}}>
                      <img src={foodImage} alt="Preview" style={{width:'100px', height:'100px', objectFit:'cover', borderRadius:'5px'}} />
                      <span style={{color:'green', marginLeft:'10px'}}>✅ Ready</span>
                  </div>
              )}
          </div>

          <div style={{marginBottom:'15px', border:'1px solid #ddd', padding:'10px', borderRadius:'8px', background: highContrast ? '#333' : '#fdfdfd'}}>
              <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'10px'}}>
                  <strong>📍 Pickup Location</strong>
                  <button onClick={handleGetLocation} style={{padding:'5px 10px', background:'#3498db', color:'white', border:'none', borderRadius:'5px', cursor:'pointer'}}>
                      {isLocating ? 'Locating...' : '📍 Use Current Location'}
                  </button>
              </div>
              
              <div style={{height: '200px', width: '100%', borderRadius: '8px', overflow: 'hidden', border:'1px solid #ccc'}}>
                  {hasLocation && (
                    <MapContainer center={[location.lat, location.lng]} zoom={13} style={{ height: '100%', width: '100%' }}>
                        <ChangeView center={[location.lat, location.lng]} />
                        <TileLayer
                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                            attribution='© OpenStreetMap contributors'
                        />
                        <Marker 
                            draggable={true}
                            eventHandlers={eventHandlers}
                            position={[location.lat, location.lng]}
                            ref={markerRef}
                        >
                            <Popup>
                                Drag me to adjust location! <br /> 
                                Lat: {location.lat.toFixed(4)}, Lng: {location.lng.toFixed(4)}
                            </Popup>
                        </Marker>
                    </MapContainer>
                  )}
                  {!hasLocation && <p style={{textAlign:'center', marginTop:'80px', color:'#777'}}>Map will appear when you enable location.</p>}
              </div>
              
              <input placeholder="Gate Code / Landmark (Optional)" value={pickupNote} onChange={e => setPickupNote(e.target.value)} style={{...inputStyle, marginTop:'10px', borderColor: '#3498db'}} />
          </div>
          
          <div style={{ marginTop:'15px', display:'flex', gap:'10px' }}>
             <select value={foodCat} onChange={e => setFoodCat(e.target.value)} style={{...inputStyle, flex:1}}>
                 <option>Cooked Meal</option><option>Raw Ingredients</option><option>Bakery Item</option>
             </select>
             
             <select value={isVeg ? 'Veg' : 'Non-Veg'} onChange={e => setIsVeg(e.target.value === 'Veg')} style={{...inputStyle, flex:1, background: isVeg ? '#e8f5e9' : '#ffebee', color: isVeg ? '#27ae60' : '#c0392b', fontWeight:'bold'}}>
                 <option value="Veg">🟢 Veg</option>
                 <option value="Non-Veg">🔴 Non-Veg</option>
             </select>
          </div>
          
          <div style={{margin:'10px 0'}}>
              <label style={{fontWeight:'bold', color: highContrast ? '#ffd700' : '#2980b9'}}>
                  <input type="checkbox" checked={reqFridge} onChange={e => setReqFridge(e.target.checked)} /> ❄️ Requires Refrigeration?
              </label>
          </div>

          <div style={{ margin: '20px 0', padding: '15px', background: highContrast ? '#222' : '#fff8e1', borderRadius: '8px', border: highContrast ? '1px solid #ffd700' : '1px solid #ffe0b2', textAlign: 'left' }}>
            <h4 style={{ margin: '0 0 10px 0', color: highContrast ? '#ffd700' : '#e67e22' }}>🛡️ Safety Checklist</h4>
            <label style={{display:'block'}}><input type="checkbox" checked={isFresh} onChange={e => setIsFresh(e.target.checked)}/> Fresh (6hrs)</label>
            <label style={{display:'block'}}><input type="checkbox" checked={isHygienic} onChange={e => setIsHygienic(e.target.checked)}/> Hygienic</label>
            
            <label style={{display:'block', color: highContrast ? '#fff' : '#d63384', marginTop: '10px', fontWeight:'bold'}}>
                <input type="checkbox" checked={hasAllergens} onChange={e => setHasAllergens(e.target.checked)}/> ⚠️ Contains Allergens?
            </label>
            
            {hasAllergens && (
                <div style={{display:'flex', flexWrap:'wrap', gap:'10px', margin:'10px 0 10px 20px'}}>
                    {['Peanuts', 'Dairy', 'Gluten', 'Eggs', 'Soy', 'Shellfish'].map((alg) => (
                        <label key={alg} style={{background: 'white', padding: '5px 10px', borderRadius: '15px', border: '1px solid #ddd', fontSize: '0.9em', cursor:'pointer'}}>
                            <input 
                                type="checkbox" 
                                checked={allergens.includes(alg)}
                                onChange={(e) => {
                                    if(e.target.checked) setAllergens([...allergens, alg]);
                                    else setAllergens(allergens.filter(a => a !== alg));
                                }}
                                style={{marginRight:'5px'}}
                            />
                            {alg}
                        </label>
                    ))}
                </div>
            )}
            
            <label style={{display:'block', marginTop:'10px'}}>Temp: <select value={temperature} onChange={e => setTemperature(e.target.value)}><option>Hot</option><option>Cold</option></select>
            <button onClick={() => setShowSafetyModal(true)} style={{background:'#ccc', border:'none', borderRadius:'50%', width:'25px', height:'25px', cursor:'pointer', marginLeft:'10px', fontSize:'0.8em'}}>?</button>
            </label>
          </div>
          
          <input placeholder="Initials (Safety Certify) *" value={donorInitials} onChange={e => setDonorInitials(e.target.value)} style={{...inputStyle, marginBottom:'15px', borderColor: donorInitials ? '#27ae60' : '#e74c3c'}} />

          <button onClick={postDonation} disabled={isUploading} style={buttonStyle('linear-gradient(to right, #27ae60, #2ecc71)')}>
              {isUploading ? 'Waiting for Image...' : (isEditingListing ? 'Update Donation' : 'Post Donation')}
          </button>
        </div>
      )}

      {(view === 'feed' || view === 'favorites' || view === 'history') && view !== 'donate' && view !== 'admin' && (
      <div className="card" style={currentCardStyle}>
        
        <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'20px'}}>
              <h2 style={{margin:0}}>{view === 'favorites' ? t.saved : view === 'history' ? t.history : t.feed}</h2>
              <button onClick={fetchListings} style={{ ...buttonStyle('#95a5a6'), width: 'auto', padding:'8px 15px', fontSize:'0.9em' }}>{t.refresh}</button>
        </div>
        
        {view === 'feed' && (
            <div style={{display:'flex', gap:'12px', marginBottom:'25px', background: highContrast ? '#222' : '#f8f9fa', padding:'15px', borderRadius:'8px', flexWrap:'wrap', border: highContrast ? '1px solid #ffd700' : 'none'}}>
                <div style={{flex: 2}}>
                    <input placeholder={t.search} value={searchTerm} onChange={e => { setSearchTerm(e.target.value); 
                        if(e.target.value.length > 3 && !recentSearches.includes(e.target.value)) {
                            const newSearches = [e.target.value, ...recentSearches].slice(0,5);
                            setRecentSearches(newSearches);
                            localStorage.setItem('recent_searches', JSON.stringify(newSearches));
                        }
                    }} style={{...inputStyle, background:'white'}} />
                    {recentSearches.length > 0 && !searchTerm && <div style={{fontSize:'0.8em', marginTop:'5px', color:'#777'}}>Recent: {recentSearches.map(s => <span key={s} onClick={() => setSearchTerm(s)} style={{cursor:'pointer', textDecoration:'underline', marginRight:'5px'}}>{s}</span>)}</div>}
                </div>

                <select onChange={e => setSortMethod(e.target.value)} style={{...inputStyle, flex: 1, background:'white'}}>
                    <option value="newest">Sort: Newest</option>
                    <option value="closest">Sort: Closest Distance</option>
                    <option value="expiry">Sort: Expiring Soon</option>
                </select>

                <select value={filterCategory} onChange={e => setFilterCategory(e.target.value)} style={{...inputStyle, flex: 1, background:'white'}}><option value="All">All Categories</option><option value="Cooked">Cooked</option><option value="Raw">Raw</option><option value="Bakery">Bakery</option></select>
                <select value={filterVeg} onChange={e => setFilterVeg(e.target.value)} style={{...inputStyle, flex: 1, background:'white'}}><option value="All">Any Diet</option><option value="Veg">🟢 Veg Only</option><option value="Non-Veg">🔴 Non-Veg</option></select>
            </div>
        )}

        {displayListings.length === 0 ? (
            <div style={{textAlign:'center', padding:'40px', color:'#999'}}>
                <h3>😕 No Food Found</h3>
                <p>Try adjusting filters or checking back later.</p>
            </div>
        ) : (
            displayListings.map(item => (
            <div key={item._id || item.id} style={{ 
                borderBottom: '1px solid #eee', 
                padding: '20px 0', 
                textAlign: 'left', 
                border: isUrgent(item.createdAt, item.expiry_hours) && item.status === 'Available' ? '2px solid #e74c3c' : 'none', 
                borderRadius: '8px', 
                position: 'relative', 
                background: isUrgent(item.createdAt, item.expiry_hours) && item.status === 'Available' ? (highContrast ? '#300' : '#fff5f5') : 'transparent', 
                paddingLeft: isUrgent(item.createdAt, item.expiry_hours) && item.status === 'Available' ? '15px' : '0' 
            }}>
                {isUrgent(item.createdAt, item.expiry_hours) && item.status === 'Available' && (<div style={{position:'absolute', top:'-10px', right:'10px', background:'#e74c3c', color:'white', padding:'4px 10px', borderRadius:'15px', fontSize:'0.8em', fontWeight:'bold'}}>🔥 URGENT</div>)}
                <div style={{ display: 'flex', gap: '15px', alignItems: 'flex-start' }}>
                    
                    {!liteMode && item.image && (<img src={item.image} alt={item.title} aria-label={item.title} style={{width:'100px', height:'100px', objectFit:'cover', borderRadius:'8px', border:'1px solid #ddd'}} />)}
                    {liteMode && item.image && (<div style={{width:'100px', height:'100px', background:'#eee', display:'flex', alignItems:'center', justifyContent:'center', borderRadius:'8px', fontSize:'0.8em', textAlign:'center', color:'#777'}}>[Image Hidden]</div>)}

                    <div style={{flex: 1}}>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <div>
                                <h3 style={{ margin: '0 0 5px 0' }}>
                                    <span style={{marginRight:'5px'}}>{getCategoryIcon(item.category)}</span>
                                    <span style={{marginRight:'8px', fontSize:'0.8em'}}>{item.isVeg ? '🟢' : '🔴'}</span>
                                    {item.title}
                                    <span onClick={() => toggleFavorite(item._id || item.id)} style={{cursor:'pointer', marginLeft:'10px', fontSize:'1.2em'}}>
                                        {favorites.includes(item._id || item.id) ? '❤️' : '🤍'}
                                    </span>
                                </h3>
                                <span style={{fontSize:'0.8em', color:'#888', display:'block', marginTop:'3px'}}>
                                    by {item.donor ? item.donor.name : 'Unknown'} 
                                    {item.donor?.isVerified && <span title="Verified" style={{marginLeft:'4px', color:'#3498db'}}>☑️</span>}
                                    {item.donor && isNewUser(item.donor.createdAt) && (<span style={{background:'#27ae60', color:'white', padding:'2px 6px', borderRadius:'10px', marginLeft:'5px', fontSize:'0.8em'}}>🌱 New</span>)}
                                    {' '}• 
                                    {item.status !== 'Delivered' && item.status !== 'Cancelled' && (
                                        <Countdown createdAt={item.createdAt} expiryHours={item.expiry_hours} />
                                    )}
                                    {item.location && location.lat && (<span style={{marginLeft: '10px', color: '#e67e22', fontWeight: 'bold'}}>📍 {calculateDistance(location.lat, location.lng, item.location.lat, item.location.lng)} km away</span>)}
                                    
                                    {' '}• 👁️ {getStableViews(item._id || item.id)} views
                                </span>
                            </div>
                            <span style={statusBadgeStyle(item.status)}>{item.status}</span>
                        </div>

                          {/* [NEW FROM CODE 2] Edit Button for Donors */}
                          {user.role === 'Donor' && isSameUser(item.donor, user.id) && item.status === 'Available' && (
                              <button onClick={() => editListing(item)} style={{fontSize:'0.7em', marginTop:'5px', background:'#eee', border:'none', cursor:'pointer', padding:'2px 5px', borderRadius:'3px'}}>✏️ Edit</button>
                          )}

                          <div style={{margin:'5px 0', fontSize:'0.85em', color:'#27ae60'}}>
                              ❤️ Feeds approx. {Math.ceil(item.quantity * 4)} people
                          </div>

                        <div style={{display:'flex', gap:'10px', margin:'15px 0', flexWrap:'wrap'}}>
                            <span style={infoTagStyle}>📦 {item.quantity} {item.unit}</span>
                            <span style={infoTagStyle}>🕒 {item.expiry_hours}h</span>
                            <span style={{...infoTagStyle, background: highContrast ? '#333' : '#e3f2fd', color: highContrast ? '#ffd700' : '#1976d2'}}>🌡️ {item.temperature}</span>
                            {item.requiresRefrigeration && <span style={{...infoTagStyle, background: highContrast ? '#333' : '#e3f2fd', color: highContrast ? '#ffd700' : '#2980b9'}}>❄️ Fridge Req.</span>}
                            {item.containerType && <span style={infoTagStyle}>🥡 {item.containerType}</span>}
                        </div>
                        {item.allergens && item.allergens.length > 0 && (<div style={{width: '100%', marginTop: '8px', color: '#c0392b', fontSize: '0.85em', fontWeight: 'bold'}}>⚠️ Contains: {item.allergens.join(', ')}</div>)}
                        
                        {(item.status === 'Claimed' || item.status === 'In Transit') && (
                            <div style={{background: highContrast ? '#222' : '#f3e5f5', padding:'15px', borderRadius:'8px', margin:'15px 0', borderLeft:'5px solid #8e44ad'}}>
                                <h4 style={{margin:'0 0 10px 0', color:'#8e44ad'}}>🚚 Logistics</h4>
                                {item.donor && (
                                    <p style={{cursor:'pointer', textDecoration:'underline', color:'#c0392b'}} onClick={() => openMap(item.donor.address)}>
                                        📍 From: {item.donor.address}
                                        <button onClick={(e) => { e.stopPropagation(); copyToClipboard(item.donor.address); }} style={{marginLeft:'5px', border:'none', background:'none', cursor:'pointer'}}>📋</button>
                                    </p>
                                )}
                                {item.claimedBy && (
                                    <p style={{cursor:'pointer', textDecoration:'underline', color:'#27ae60'}} onClick={() => openMap(item.claimedBy.address)}>
                                        📍 To: {item.claimedBy.name} {item.claimedBy.ngoRegNumber && '✅'}
                                        <button onClick={(e) => { e.stopPropagation(); copyToClipboard(item.claimedBy.address); }} style={{marginLeft:'5px', border:'none', background:'none', cursor:'pointer'}}>📋</button>
                                    </p>
                                )}
                                
                                <p>⏱️ Est. Travel: {calculateETA(calculateDistance(location.lat, location.lng, item.location?.lat, item.location?.lng))}</p>
                                
                                {item.donor?.phone && (
                                    <div style={{marginTop:'10px'}}>
                                        <a href={`tel:${item.donor.phone}`} style={{textDecoration:'none', color:'white', background:'#3498db', padding:'5px 10px', borderRadius:'5px', fontWeight:'bold'}}>📞 Call Donor</a>
                                    </div>
                                )}
                            </div>
                        )}
                        
                        {item.status === 'Claimed' && user.role === 'Volunteer' && (
                            <div style={{marginTop:'10px', display:'flex', gap:'10px', flexWrap:'wrap'}}>
                                {user.isTrained ? (
                                    <>
                                        <button onClick={() => updateStatus(item._id || item.id, 'In Transit')} style={actionButtonStyle('#8e44ad')}>
                                            📷 Pickup
                                        </button>
                                        {/* [NEW FROM CODE 2] Arrived Button */}
                                        <button onClick={reportArrived} style={{...actionButtonStyle('#34495e'), marginLeft:'5px'}}>I've Arrived</button>
                                    </>
                                ) : (
                                    <button onClick={() => alert("🔒 Complete safety training in your profile first!")} style={{...actionButtonStyle('#ccc'), cursor:'not-allowed'}}>
                                        🔒 Pickup (Locked)
                                    </button>
                                )}
                                <button onClick={() => updateStatus(item._id || item.id, 'Cancelled')} style={{...actionButtonStyle('#c0392b'), marginLeft:'10px'}}>⚠️ Report</button>
                            </div>
                        )}
                        
                        {item.status === 'Available' && user.role === 'NGO' && (
                            <button onClick={() => updateStatus(item._id || item.id, 'Claimed')} style={actionButtonStyle('#e67e22')}>
                                ✋ Claim
                            </button>
                        )}

                        {item.status === 'Claimed' && user.role === 'Donor' && isSameUser(item.donor, user.id) && (
                            <button onClick={() => updateStatus(item._id || item.id, 'In Transit')} style={actionButtonStyle('#27ae60')}>
                                📦 Mark Ready for Pickup
                            </button>
                        )}

                        {item.status === 'In Transit' && user.role === 'NGO' && isSameUser(item.claimedBy, user.id) && (
                            <button onClick={() => updateStatus(item._id || item.id, 'Delivered')} style={actionButtonStyle('#27ae60')}>
                                ✅ Confirm Receipt
                            </button>
                        )}

                        {/* [NEW FROM CODE 2] Volunteer Actions in Transit */}
                        {item.status === 'In Transit' && user.role === 'Volunteer' && (
                            <div style={{marginTop:'10px'}}>
                                <button onClick={reportTraffic} style={{...actionButtonStyle('#c0392b'), marginRight:'10px'}}>🚗 Stuck in Traffic</button>
                                <div style={{marginTop:'5px'}}>
                                    <small>Upload Delivery Proof (Required to finish):</small>
                                    <input type="file" onChange={handleImageUpload} style={{fontSize:'0.8em'}} />
                                </div>
                            </div>
                        )}

                        {item.status === 'Delivered' && user.role === 'NGO' && isSameUser(item.claimedBy, user.id) && !item.rating && (
                            <div style={{marginTop:'15px', background: highContrast ? '#222' : '#fff8e1', padding:'15px', textAlign:'center', borderRadius:'8px'}}>
                                <p style={{fontWeight:'bold', margin:'0 0 10px 0'}}>Rate to Finish:</p>
                                {[1, 2, 3, 4, 5].map(star => (
                                    <span key={star} onClick={() => submitRating(item._id || item.id, star)} style={{cursor:'pointer', fontSize:'2em', color:'#f1c40f', margin:'0 5px'}}>
                                        ☆
                                    </span>
                                ))}
                            </div>
                        )}
                        
                        <div style={{display:'flex', gap:'10px', marginTop:'15px'}}>
                            {(view === 'history' || (user.id && item.donor && (item.donor._id === user.id || item.donor === user.id))) && item.status === 'Available' && (
                                <button onClick={() => deleteListing(item._id || item.id)} style={{...buttonStyle('#e74c3c'), width:'auto', padding:'8px 15px'}}>🗑️ Delete</button>
                            )}
                            
                            <button onClick={() => reportListing(item._id || item.id)} style={{...buttonStyle('transparent'), color:'#999', border:'1px solid #ddd', width:'auto', padding:'5px 10px', fontSize:'0.8em', marginLeft:'auto'}}>🚩 Report</button>
                        </div>

                        <div style={{marginTop:'10px', paddingTop:'10px', borderTop:'1px solid #eee', display:'flex', gap:'5px'}}>
                            <button onClick={() => shareToSocial('whatsapp', item)} style={{...buttonStyle('#25D366'), width:'auto', padding:'5px', fontSize:'0.8em'}}>Share WA</button>
                            <button onClick={() => shareToSocial('twitter', item)} style={{...buttonStyle('#1DA1F2'), width:'auto', padding:'5px', fontSize:'0.8em'}}>Share TW</button>
                        </div>

                        {view === 'history' && (item.status === 'Claimed' || item.status === 'In Transit') && (
                            <div style={{marginTop:'10px'}}>
                                <button onClick={() => setShowQR(showQR === item._id ? null : item._id)} style={{...buttonStyle('#34495e'), width:'auto', padding:'5px 15px', fontSize:'0.8em'}}>{showQR === item._id ? '❌ Hide' : '📱 QR'}</button>
                                {showQR === item._id && (<div style={{marginTop:'15px', background:'white', padding:'20px', borderRadius:'12px', display:'inline-block', textAlign:'center'}}><QRCode id="pickup-qr" value={`PICKUP:${item._id}:${user.id}`} size={120} /><br/><button onClick={downloadQR} style={{...buttonStyle('#27ae60'), width:'auto', marginTop:'10px', fontSize:'0.8em', padding:'5px 10px'}}>💾 Save QR</button></div>)}
                            </div>
                        )}
                    </div>
                </div>
            </div>
            ))
        )}
      </div>
      )}

      <div style={{textAlign:'center', marginTop:'50px', paddingTop:'20px', borderTop:'1px solid #ccc', color:'#777'}}>
          <p>© 2026 FoodConnect</p>
          <div style={{display:'flex', justifyContent:'center', gap:'15px', fontSize:'0.9em', flexWrap:'wrap'}}>
              <span onClick={() => setShowTerms(true)} style={{cursor:'pointer', textDecoration:'underline'}}>Terms</span>
              <span onClick={() => setShowPrivacy(true)} style={{cursor:'pointer', textDecoration:'underline'}}>Privacy</span>
              {/* [NEW FROM CODE 2] Footer Links */}
              <span onClick={() => setShowGuide(true)} style={{cursor:'pointer', textDecoration:'underline'}}>Guide</span>
              <span onClick={() => setShowUSSD(true)} style={{cursor:'pointer', textDecoration:'underline'}}>Offline Codes</span>
              <span onClick={reportBug} style={{cursor:'pointer', color:'#e74c3c', textDecoration:'underline'}}>Report Bug</span>
          </div>
      </div>

      {showHelp && (
          <div style={{position:'fixed', bottom:'80px', right:'20px', width:'300px', background:'white', border:'1px solid #ccc', borderRadius:'10px', padding:'15px', boxShadow:'0 5px 15px rgba(0,0,0,0.2)', zIndex:1000, color:'black'}}>
              <h4 style={{margin:'0 0 10px 0'}}>🤖 AI Help Desk</h4>
              <p style={{fontSize:'0.9em'}}><strong>Q: How do I donate?</strong><br/>A: Click "Donate Food" in the menu and fill the form.</p>
              <p style={{fontSize:'0.9em'}}><strong>Q: Is it free?</strong><br/>A: Yes! All food on this platform is 100% free.</p>
              <button onClick={() => setShowHelp(false)} style={{width:'100%', marginTop:'10px', padding:'5px', background:'#e74c3c', color:'white', border:'none', borderRadius:'5px', cursor:'pointer'}}>Close</button>
          </div>
      )}
      
      <button onClick={() => setShowHelp(!showHelp)} style={{position:'fixed', bottom:'20px', right:'20px', width:'50px', height:'50px', borderRadius:'50%', background:'#3498db', color:'white', border:'none', fontSize:'24px', cursor:'pointer', zIndex:1000, boxShadow:'0 4px 10px rgba(0,0,0,0.2)'}}>
          ?
      </button>

      {showPrivacy && (
          <div style={{position:'fixed', top:0, left:0, width:'100%', height:'100%', background:'rgba(0,0,0,0.8)', zIndex:2000, display:'flex', justifyContent:'center', alignItems:'center'}}>
              <div style={{background:'white', padding:'30px', borderRadius:'15px', maxWidth:'500px', color:'black'}}>
                  <h3>🔒 Privacy Policy</h3>
                  <p>We collect location data only to facilitate pickups. Your data is never sold. Uploaded documents are viewable only by Admins.</p>
                  <button onClick={() => setShowPrivacy(false)} style={buttonStyle('#333')}>Close</button>
              </div>
          </div>
      )}

      {showTerms && (
        <div style={{
            position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', 
            background: 'rgba(0,0,0,0.6)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000
        }}>
            <div style={{
                background: highContrast ? 'black' : 'white', 
                color: highContrast ? '#ffd700' : 'inherit',
                border: highContrast ? '2px solid #ffd700' : 'none',
                padding: '25px', borderRadius: '12px', maxWidth: '500px', width: '90%', 
                maxHeight: '80vh', overflowY: 'auto', boxShadow: '0 10px 30px rgba(0,0,0,0.3)'
            }}>
                <h2 style={{marginTop: 0, color: highContrast ? '#ffd700' : '#2c3e50'}}>📜 Terms & Conditions</h2>
                <div style={{textAlign: 'left', lineHeight: '1.6', fontSize: '0.9em'}}>
                    <p><strong>1. Food Safety:</strong> Donors must ensure food is fresh, hygienic, and safe for consumption. FoodConnect is not liable for health issues.</p>
                    <p><strong>2. No Resale:</strong> Food collected via this platform is for consumption/distribution only and must not be sold.</p>
                    <p><strong>3. Respect:</strong> Treat all volunteers, NGOs, and donors with respect. Harassment will result in an immediate ban.</p>
                </div>
                <div style={{marginTop: '20px', textAlign: 'right'}}>
                    <button onClick={() => setShowTerms(false)} style={{padding: '10px 20px', background: '#e74c3c', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold'}}>
                        Close
                    </button>
                    <button onClick={() => { setAgreeTerms(true); setShowTerms(false); }} style={{marginLeft: '10px', padding: '10px 20px', background: '#27ae60', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold'}}>
                        I Agree
                    </button>
                </div>
            </div>
        </div>
      )}

    </div>
  );
}

export default App;