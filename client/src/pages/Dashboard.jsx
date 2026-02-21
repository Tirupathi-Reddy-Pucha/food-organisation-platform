import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import axios from 'axios';
import QRCode from 'react-qr-code';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import { Html5QrcodeScanner } from "html5-qrcode";
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { calculateDistance } from '../utils/haversine';

// Icons for the Dashboard UI
import { LayoutDashboard, Heart, History, UserCircle, PlusCircle, LogOut, Bell, ShieldAlert, MapPin, CheckCircle2, Clock, Menu, X, Info, Leaf, Trash2, HelpCircle } from 'lucide-react';

// Import Leaflet Images (Vite/Webpack compatible)
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

// ==========================================
// 1. LEAFLET ICON FIX
// ==========================================
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: markerIcon2x,
    iconUrl: markerIcon,
    shadowUrl: markerShadow,
});

function ChangeView({ center }) {
    const map = useMap();
    map.setView(center);
    return null;
}



const getStableViews = (id) => {
    if (!id) return 0;
    let hash = 0;
    for (let i = 0; i < id.length; i++) hash = id.charCodeAt(i) + ((hash << 5) - hash);
    return Math.abs(hash % 50) + 1;
};

const isSameUser = (userField, currentUserId) => {
    if (!userField || !currentUserId) return false;
    const idA = userField._id || userField;
    return idA.toString() === currentUserId.toString();
};

export default function Dashboard() {
    const API_URL = `${import.meta.env.VITE_API_BASE_URL}` || "http://localhost:5000/api";

    // ==========================================
    // 3. FULL STATE MANAGEMENT
    // ==========================================
    const [user, setUser] = useState(() => {
        const savedId = localStorage.getItem('user_id');
        const token = localStorage.getItem('token');
        if (savedId && token) {
            const safeParse = (key) => { try { return JSON.parse(localStorage.getItem(key)); } catch (e) { return null; } };
            return {
                id: savedId,
                name: localStorage.getItem('user_name') || '',
                email: localStorage.getItem('user_email') || '',
                role: localStorage.getItem('user_role') || '',
                phone: localStorage.getItem('user_phone') || '',
                address: localStorage.getItem('user_address') || '',
                isVerified: localStorage.getItem('user_verified') === 'true',
                isTrained: localStorage.getItem('user_trained') === 'true',
                credits: parseInt(localStorage.getItem('user_credits') || '0'),
                ngoCapacity: safeParse('user_capacity') || { fridge: '', dryStorage: '' },
                notifications: safeParse('user_notifs') || { email: true, sms: false },
                verificationDocument: localStorage.getItem('user_doc') || '',
                servedGroups: localStorage.getItem('user_servedGroups') || 'General',
                isAvailable: localStorage.getItem('user_available') === 'true',
                isBanned: localStorage.getItem('user_banned') === 'true',
                banReason: localStorage.getItem('user_banReason') || '',
                location: safeParse('user_location') || null,
                serviceRadius: parseInt(localStorage.getItem('user_radius')) || 5,
                createdAt: localStorage.getItem('user_createdAt') || null,
                streakCount: parseInt(localStorage.getItem('user_streak') || '0'),
                badges: safeParse('user_badges') || [],
                totalDeliveries: parseInt(localStorage.getItem('user_totalDeliveries') || '0')
            };
        }
        return { id: null, name: '', email: '', role: '', phone: '', address: '', isVerified: false, isTrained: false, credits: 0, ngoCapacity: { fridge: '', dryStorage: '' }, notifications: { email: true, sms: false }, verificationDocument: '', servedGroups: 'General', isAvailable: false, isBanned: false, banReason: '', location: null, serviceRadius: 5, createdAt: null, streakCount: 0, badges: [], totalDeliveries: 0 };
    });

    const [listings, setListings] = useState([]);
    const [myListings, setMyListings] = useState([]);
    const [stats, setStats] = useState({ total_donations: 0, meals_saved: 0, co2_saved: 0 });
    const [leaderboard, setLeaderboard] = useState([]);
    const [reportedItems, setReportedItems] = useState([]);
    const [userStats, setUserStats] = useState({ totalDeliveries: 0, avgRating: 0 });
    const [myNeeds, setMyNeeds] = useState([]);

    const [view, setView] = useState(() => localStorage.getItem('app_view') || 'feed');
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false); // Mobile sidebar toggle
    const [showQR, setShowQR] = useState(null);
    const [isScanning, setIsScanning] = useState(false);
    const [scanTargetId, setScanTargetId] = useState(null);

    const [toast, setToast] = useState(null);
    const [appNotifications, setAppNotifications] = useState([]);
    const [showNotifDropdown, setShowNotifDropdown] = useState(false);



    // Modals & UI states
    const [showPackModal, setShowPackModal] = useState(false);
    const [showCertificate, setShowCertificate] = useState(false);
    const [showSafetyModal, setShowSafetyModal] = useState(false);
    const [showGuide, setShowGuide] = useState(false);
    const [showUSSD, setShowUSSD] = useState(false);
    const [showOnboarding, setShowOnboarding] = useState(false);
    const [showHelp, setShowHelp] = useState(false);
    const [deliveryProof, setDeliveryProof] = useState('');
    const [isEditingListing, setIsEditingListing] = useState(null);
    const [leaderboardTab, setLeaderboardTab] = useState('donors');
    const [activeRating, setActiveRating] = useState({ id: null, stars: 0, feedback: '' });
    const [isReportingBug, setIsReportingBug] = useState(false);
    const [bugContent, setBugContent] = useState('');

    const [favorites, setFavorites] = useState(JSON.parse(localStorage.getItem('user_favorites') || '[]'));
    const scannerRef = useRef(null);
    const [recentSearches, setRecentSearches] = useState(JSON.parse(localStorage.getItem('recent_searches') || '[]'));
    const [sortMethod, setSortMethod] = useState('newest');
    const [volunteerAvailable, setVolunteerAvailable] = useState(false);
    const [allUsers, setAllUsers] = useState([]);

    // Profile Edit
    const [isEditingProfile, setIsEditingProfile] = useState(false);
    const [editName, setEditName] = useState('');
    const [editPhone, setEditPhone] = useState('');
    const [editAddress, setEditAddress] = useState('');
    const [editFridge, setEditFridge] = useState('');
    const [editDry, setEditDry] = useState('');
    const [editNotifEmail, setEditNotifEmail] = useState(true);
    const [editNotifSMS, setEditNotifSMS] = useState(false);
    const [verificationDoc, setVerificationDoc] = useState('');
    const [editServedGroups, setEditServedGroups] = useState('General');
    const [volunteerSchedule, setVolunteerSchedule] = useState('');
    const [editLocation, setEditLocation] = useState(null);
    const [editServiceRadius, setEditServiceRadius] = useState(5);

    // Filters & Forms
    const [searchTerm, setSearchTerm] = useState('');
    const [filterCategory, setFilterCategory] = useState('All');
    const [filterVeg, setFilterVeg] = useState('All');
    const [showNearbyOnly, setShowNearbyOnly] = useState(false);

    // Initialize Google Translate when dashboard mounts or view changes
    useEffect(() => {
        const initTranslate = () => {
            if (window.google && window.google.translate && window.googleTranslateElementInit) {
                window.googleTranslateElementInit();
            } else if (!window.googleTranslateElementInit) {
                // Fallback: If global init is lost, define it
                window.googleTranslateElementInit = function () {
                    new window.google.translate.TranslateElement({
                        pageLanguage: 'en',
                        includedLanguages: 'en,hi,mr,bn,ta,te',
                        layout: window.google.translate.TranslateElement.InlineLayout.HORIZONTAL,
                        autoDisplay: false
                    }, 'google_translate_element');
                };
                if (window.google && window.google.translate) window.googleTranslateElementInit();
            }
        };
        const timer = setTimeout(initTranslate, 1500); // Increased delay for stability
        return () => clearTimeout(timer);
    }, [view]); // Run whenever view changes to ensure it re-renders

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
    const [foodImage, setFoodImage] = useState('');
    const [timePrepared, setTimePrepared] = useState('');
    const [bestBefore, setBestBefore] = useState('');
    const [isUploading, setIsUploading] = useState(false);
    const [donorInitials, setDonorInitials] = useState('');
    const [accessCode, setAccessCode] = useState('');

    const [location, setLocation] = useState({ lat: 20.5937, lng: 78.9629 });
    const [isLocating, setIsLocating] = useState(false);
    const [hasLocation, setHasLocation] = useState(false);

    const [dietaryType, setDietaryType] = useState('Veg');
    const [reqFridge, setReqFridge] = useState(false);
    const [temperature, setTemperature] = useState('Hot');
    const [isFresh, setIsFresh] = useState(false);
    const [isHygienic, setIsHygienic] = useState(false);
    const [hasAllergens, setHasAllergens] = useState(false);

    // Quiz
    const [showQuiz, setShowQuiz] = useState(false);
    const [quizScore, setQuizScore] = useState(0);
    const [currentQuestion, setCurrentQuestion] = useState(0);
    const safetyQuiz = [
        { q: "Hot food must be kept above what temperature?", options: ["40°C", "50°C", "60°C"], a: "60°C" },
        { q: "Cold food must be kept below what temperature?", options: ["5°C", "10°C", "15°C"], a: "5°C" },
        { q: "How long should you wash your hands with soap?", options: ["5 seconds", "10 seconds", "20 seconds"], a: "20 seconds" },
        { q: "What is the 'Danger Zone' where bacteria grows fastest?", options: ["0°C - 30°C", "5°C - 60°C", "20°C - 80°C"], a: "5°C - 60°C" },
        { q: "Cross-contamination occurs when...", options: ["Food is cooked too long", "Germs spread between surfaces", "Food is kept too cold"], a: "Germs spread between surfaces" },
        { q: "Should you clean visible dirt before sanitizing a surface?", options: ["Yes", "No", "Only for raw meat"], a: "Yes" },
        { q: "Food should ideally be picked up and delivered within...", options: ["1 Hour", "4 Hours", "24 Hours"], a: "1 Hour" },
        { q: "If food smells slightly 'off', what should you do?", options: ["Cook it more", "Dispose of it", "Give it to pets"], a: "Dispose of it" },
        { q: "Raw meat should be stored where in a fridge?", options: ["On the top shelf", "Next to vegetables", "On the bottom shelf"], a: "On the bottom shelf" },
        { q: "Insulated bags are recommended for...", options: ["Only hot food", "Only cold food", "Both hot and cold food"], a: "Both hot and cold food" }
    ];

    const [showDonationGuide, setShowDonationGuide] = useState(false);
    const [donationGuideStep, setDonationGuideStep] = useState(0);
    const donationGuideSteps = [
        {
            title: "👋 Welcome, Donor!",
            content: "Ready to share? This guide will help you list your food safely and clearly so NGOs can reach those in need faster.",
            icon: "🎁"
        },
        {
            title: "✍️ Title & Description",
            content: "Be specific! Instead of 'Food', write '5 Trays of Vegetable Lasagna'. Mention if it's leftover from an event or fresh from a kitchen.",
            icon: "📝"
        },
        {
            title: "🕒 The Safety Clock",
            content: "Accuracy is key. Set the 'Time Prepared' and a 'Best Before' date. This helps NGOs prioritize which items to deliver first.",
            icon: "⏰"
        },
        {
            title: "🌡️ Temperature & Hygiene",
            content: "Mark if food needs refrigeration. Check the hygiene boxes to confirm you've followed safe handling standards.",
            icon: "🛡️"
        },
        {
            title: "📷 Photos & Location",
            content: "A picture is worth a thousand words. Upload a clear photo and 'Pin' your exact location to help volunteers find you.",
            icon: "📍"
        }
    ];

    const [showTraining, setShowTraining] = useState(false);

    // Food Need Form States
    const [needTitle, setNeedTitle] = useState('');
    const [needDesc, setNeedDesc] = useState('');
    const [needCat, setNeedCat] = useState('Cooked Meal');
    const [needQty, setNeedQty] = useState('');
    const [needUnit, setNeedUnit] = useState('kg');
    const [needUrgency, setNeedUrgency] = useState('Standard');
    const [isNeedPerishable, setIsNeedPerishable] = useState(false);

    const [trainingStep, setTrainingStep] = useState(0);
    const trainingModules = [
        {
            title: "🌡️ Temperature Control",
            content: "Bacteria grows rapidly in the 'Danger Zone' (5°C - 60°C). Keep Hot Food > 60°C and Cold Food < 5°C. Use insulated bags during transport.",
            img: "https://images.unsplash.com/photo-1574672280600-4accfa5b6f98?auto=format&fit=crop&q=80&w=400"
        },
        {
            title: "🧼 Personal Hygiene",
            content: "Always wash hands for 20 seconds before handling food. Never volunteer if you are feeling unwell or have symptoms of illness.",
            img: "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&q=80&w=400"
        },
        {
            title: "🚫 Preventing Contamination",
            content: "Keep raw and cooked foods separate. Ensure all containers are sealed tightly and stored away from chemicals or waste.",
            img: "https://images.unsplash.com/photo-1544333346-60170460c395?auto=format&fit=crop&q=80&w=400"
        }
    ];

    // ==========================================
    // 4. CORE LOGIC
    // ==========================================
    const showToast = (msg, type = 'success') => {
        setToast({ msg, type });
        setAppNotifications(prev => [{ msg, time: new Date() }, ...prev]);
        setTimeout(() => setToast(null), 3000);
    };

    const calculateETA = (dist) => {
        const distance = parseFloat(dist);
        if (!distance || distance > 9000) return "N/A";
        const time = (distance / 30) * 60;
        return time < 60 ? `${Math.ceil(time)} min` : `${(time / 60).toFixed(1)} hrs`;
    };

    const Countdown = ({ createdAt, expiryHours }) => {
        const [timeLeft, setTimeLeft] = useState("");
        const [isUrgent, setIsUrgent] = useState(false);
        useEffect(() => {
            const interval = setInterval(() => {
                const expires = new Date(createdAt).getTime() + (expiryHours * 60 * 60 * 1000);
                const diff = expires - Date.now();
                if (diff <= 0) { setTimeLeft("EXPIRED"); setIsUrgent(false); }
                else {
                    const h = Math.floor(diff / (1000 * 60 * 60));
                    const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
                    setTimeLeft(`${h}h ${m}m`);
                    setIsUrgent(diff < 3600000);
                }
            }, 1000);
            return () => clearInterval(interval);
        }, [createdAt, expiryHours]);
        return <span className={`font-bold ${isUrgent ? 'text-red-500 animate-pulse' : 'text-gray-600'}`}>⏳ {timeLeft}</span>;
    };

    useEffect(() => {
        localStorage.setItem('user_favorites', JSON.stringify(favorites));
        const draft = JSON.parse(localStorage.getItem('draft_form'));
        if (draft) {
            if (draft.title) setFoodTitle(draft.title); if (draft.desc) setFoodDesc(draft.desc);
            if (draft.qty) setFoodQty(draft.qty); if (draft.expiry) setFoodExpiry(draft.expiry);
            if (draft.unit) setFoodUnit(draft.unit); if (draft.cat) setFoodCat(draft.cat);
            if (draft.dietaryType !== undefined) setDietaryType(draft.dietaryType);
            else if (draft.isVeg !== undefined) setDietaryType(draft.isVeg ? 'Veg' : 'Non-Veg');
            if (draft.reqFridge !== undefined) setReqFridge(draft.reqFridge);
            if (draft.temp) setTemperature(draft.temp);
            if (draft.handling) setHandlingInstructions(draft.handling);
        }
        if (!localStorage.getItem('has_seen_onboarding')) {
            setShowOnboarding(true);
            localStorage.setItem('has_seen_onboarding', 'true');
        }

        const fetchUserStats = async () => {
            try {
                const res = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/stats/user/${user.id}`);
                setUserStats(res.data);
            } catch (err) {
                console.error("Error fetching user stats:", err);
            }
        };
        if (user.id) fetchUserStats();
    }, [favorites, user.id]);

    useEffect(() => {
        localStorage.setItem('draft_form', JSON.stringify({ title: foodTitle, desc: foodDesc, qty: foodQty, expiry: foodExpiry, unit: foodUnit, cat: foodCat, dietaryType, reqFridge, temp: temperature, handling: handlingInstructions }));
    }, [foodTitle, foodDesc, foodQty, foodExpiry, foodUnit, foodCat, dietaryType, reqFridge, temperature, handlingInstructions]);

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

    const startBugVoiceInput = () => {
        if (!('webkitSpeechRecognition' in window)) return alert("Voice not supported in this browser.");
        const recognition = new window.webkitSpeechRecognition();
        recognition.lang = 'en-US';
        showToast("🎤 Listening for bug details...", "info");
        recognition.onresult = (event) => {
            const transcript = event.results[0][0].transcript;
            setBugContent(transcript);
            showToast("🎤 Bug Details Captured!");
        };
        recognition.start();
    };

    const submitBugReport = async () => {
        if (!bugContent) return showToast("Please speak to describe the bug.", "error");
        try {
            await axios.post(`${API_URL}/bugs`, { description: bugContent }, { headers: { 'x-auth-token': localStorage.getItem('token') } });
            showToast("🐞 Bug Reported Successfully!");
            setIsReportingBug(false);
            setBugContent('');
        } catch (err) {
            showToast("Failed to report bug.", "error");
        }
    };


    const toggleFavorite = (id) => { favorites.includes(id) ? setFavorites(favorites.filter(fid => fid !== id)) : setFavorites([...favorites, id]); };
    const reportTraffic = () => showToast("🚗 Traffic Alert sent to NGO/Donor.", "error");
    const reportArrived = () => showToast("📍 Arrival Notification Sent!", "success");
    const copyToClipboard = (text) => { if (!text) return; navigator.clipboard.writeText(text); showToast("📋 Address Copied!"); };

    const fetchUsers = useCallback(async () => {
        try { const token = localStorage.getItem('token'); const res = await axios.get(`${API_URL}/auth/all-users`, { headers: { 'x-auth-token': token } }); setAllUsers(res.data); } catch (err) { console.error("Admin Access Required"); }
    }, [API_URL]);

    const fetchReports = useCallback(async () => {
        try { const token = localStorage.getItem('token'); const res = await axios.get(`${API_URL}/listings/admin/reports`, { headers: { 'x-auth-token': token } }); setReportedItems(res.data); } catch (err) { console.error(err); }
    }, [API_URL]);
    const verifyUser = async (id) => {
        try { await axios.put(`${API_URL}/auth/verify/${id}`, {}, { headers: { 'x-auth-token': localStorage.getItem('token') } }); showToast("User Verified!"); fetchUsers(); } catch (err) { showToast("Failed to verify", "error"); }
    };

    const handleQuizAnswer = (answer) => {
        let score = quizScore;
        if (answer === safetyQuiz[currentQuestion].a) score += 1;
        setQuizScore(score);
        if (currentQuestion + 1 < safetyQuiz.length) setCurrentQuestion(currentQuestion + 1);
        else finishQuiz(score);
    };
    const finishQuiz = async (finalScore) => {
        if (finalScore === safetyQuiz.length) {
            try {
                await axios.put(`${API_URL}/auth/train`, {}, { headers: { 'x-auth-token': localStorage.getItem('token') } });
                const updatedUser = { ...user, isTrained: true };
                setUser(updatedUser);
                localStorage.setItem('user_trained', 'true');
                showToast("🎉 Certified! You can now claim deliveries.", "success");
                setShowQuiz(false); setQuizScore(0); setCurrentQuestion(0);
            } catch (err) { showToast("Error saving progress.", "error"); }
        } else {
            alert(`❌ Failed! You got ${finalScore}/${safetyQuiz.length}. You need 100% to pass. Review the lessons and try again.`);
            setQuizScore(0); setCurrentQuestion(0); setShowQuiz(false); setShowTraining(true); setTrainingStep(0);
        }
    };

    const markerRef = useRef(null);
    const eventHandlers = useMemo(() => ({
        dragend() { const marker = markerRef.current; if (marker != null) { const newPos = marker.getLatLng(); setLocation({ lat: newPos.lat, lng: newPos.lng }); setHasLocation(true); } },
    }), []);

    const getDonorBadge = (count) => {
        if (count >= 10) return '🏆 Legend'; if (count >= 5) return '⭐ Super Donor'; if (count >= 1) return '🥉 Contributor'; return '🌱 Newbie';
    };

    const calculateMyRating = () => {
        if (user.role !== 'Donor') return null;
        const myItems = myListings.filter(item => item.donor && (item.donor._id === user.id || item.donor === user.id));
        const ratedItems = myItems.filter(item => item.rating > 0);
        if (ratedItems.length === 0) return 'No ratings yet';
        const total = ratedItems.reduce((acc, curr) => acc + curr.rating, 0);
        return (total / ratedItems.length).toFixed(1) + ' ★';
    };

    const isUrgent = (createdAt, expiryHours) => {
        const expires = new Date(createdAt).getTime() + (expiryHours * 60 * 60 * 1000);
        const timeLeft = expires - Date.now();
        return timeLeft > 0 && timeLeft < 3600000;
    };
    const isExpired = (createdAt, expiryHours) => { return Date.now() > (new Date(createdAt).getTime() + (expiryHours * 60 * 60 * 1000)); };
    const openMap = (address) => { if (address) window.open(`http://googleusercontent.com/maps.google.com/search?q=${encodeURIComponent(address)}`, '_blank'); };

    const downloadQR = () => {
        const svg = document.getElementById("pickup-qr");
        if (!svg) return;
        const svgData = new XMLSerializer().serializeToString(svg);
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        const img = new Image();
        img.onload = () => {
            canvas.width = img.width; canvas.height = img.height; ctx.drawImage(img, 0, 0);
            const downloadLink = document.createElement("a"); downloadLink.download = "Pickup_QR.png";
            downloadLink.href = canvas.toDataURL("image/png"); downloadLink.click();
        };
        img.src = "data:image/svg+xml;base64," + btoa(svgData);
    };

    const isNewUser = (dateString) => { if (!dateString) return false; return (Date.now() - new Date(dateString).getTime()) < 86400000; };

    // API CALLS
    const fetchListings = useCallback(async () => {
        try {
            const res = await axios.get(`${API_URL}/listings/`, { params: { search: searchTerm, category: filterCategory, filterVeg: filterVeg } });
            let data = res.data;
            if (sortMethod === 'closest' && location.lat) {
                data.sort((a, b) => parseFloat(calculateDistance(location.lat, location.lng, a.location?.lat, a.location?.lng)) - parseFloat(calculateDistance(location.lat, location.lng, b.location?.lat, b.location?.lng)));
            } else if (sortMethod === 'expiry') {
                data.sort((a, b) => a.expiry_hours - b.expiry_hours);
            }
            setListings(data);
        } catch (err) { console.error("Error fetching listings", err); }
    }, [searchTerm, filterCategory, filterVeg, sortMethod, location, API_URL]);

    const fetchStats = useCallback(async (currentTab = 'donors') => {
        try {
            const resStats = await axios.get(`${API_URL}/stats/`); setStats(resStats.data);
            const resLeader = await axios.get(`${API_URL}/stats/leaderboard`, { params: { type: currentTab } });
            setLeaderboard(resLeader.data.sort((a, b) => b.count !== a.count ? b.count - a.count : a.name.localeCompare(b.name)));
        } catch (err) { console.error("Error fetching stats"); }
    }, [API_URL]);

    const fetchMyHistory = useCallback(async () => {
        if (!user.id) return;
        try { setMyListings((await axios.get(`${API_URL}/listings/history`, { headers: { 'x-auth-token': localStorage.getItem('token') } })).data); } catch (err) { console.error("Error loading history"); }
    }, [user.id, API_URL]);

    const fetchUserData = useCallback(async () => {
        const token = localStorage.getItem('token');
        if (!token) return;
        try {
            const res = await axios.get(`${API_URL}/auth/me`, { headers: { 'x-auth-token': token } });
            const userData = res.data; if (userData._id && !userData.id) userData.id = userData._id;
            setUser(userData); localStorage.setItem('user_credits', userData.credits || 0);
        } catch (err) { if (err.response && err.response.status === 401) logout(); }
    }, [API_URL]);

    const fetchNotifications = useCallback(async () => {
        const token = localStorage.getItem('token');
        if (!token) return;
        try {
            const res = await axios.get(`${API_URL}/notifications`, { headers: { 'x-auth-token': token } });
            setAppNotifications(res.data);
        } catch (err) { console.error("Error fetching notifications", err); }
    }, [API_URL]);

    const markAllRead = async () => {
        const token = localStorage.getItem('token');
        if (!token) return;
        try {
            await axios.put(`${API_URL}/notifications/read-all`, {}, { headers: { 'x-auth-token': token } });
            fetchNotifications();
        } catch (err) { console.error("Error marking all as read", err); }
    };

    useEffect(() => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (pos) => {
                    setLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
                    setHasLocation(true);
                },
                (err) => {
                    console.log("Geolocation denied or failed, using profile location as fallback.");
                    if (user.location) {
                        setLocation(user.location);
                        setHasLocation(true);
                    }
                }
            );
        } else if (user.location) {
            setLocation(user.location);
            setHasLocation(true);
        }
    }, [user.location]);

    // Initial load from cache only
    useEffect(() => {
        const cached = localStorage.getItem('cached_listings');
        if (cached) setListings(JSON.parse(cached));
    }, []);

    // Debounced listing fetch
    useEffect(() => {
        const delayDebounce = setTimeout(() => {
            fetchListings();
        }, 500);
        return () => clearTimeout(delayDebounce);
    }, [searchTerm, filterCategory, filterVeg, sortMethod, location, fetchListings]);

    useEffect(() => {
        fetchStats(leaderboardTab);
        fetchUserData();
        fetchNotifications();
        if (view === 'admin' && user.role === 'Admin') {
            fetchUsers();
            fetchReports();
        }
    }, [fetchStats, fetchUserData, fetchNotifications, fetchUsers, fetchReports, leaderboardTab, view, user.role]);
    useEffect(() => { if (user.isAvailable !== undefined) setVolunteerAvailable(user.isAvailable); }, [user]);
    useEffect(() => { if (user.id) fetchMyHistory(); }, [user.id, fetchMyHistory]);


    // Auto-trigger Safety Training for untrained volunteers
    useEffect(() => {
        if (user.role === 'Volunteer' && !user.isTrained && !localStorage.getItem('training_deferred')) {
            setShowTraining(true);
        }
    }, [user.role, user.isTrained]);

    // Automatically close mobile menu when view changes
    useEffect(() => {
        localStorage.setItem('app_view', view);
        setMobileMenuOpen(false);
    }, [view]);

    // Polling for notifications
    useEffect(() => {
        if (!user.id) return;
        const interval = setInterval(fetchNotifications, 30000); // 30 seconds
        return () => clearInterval(interval);
    }, [user.id, fetchNotifications]);

    useEffect(() => {
        let scannerInstance = null;
        let timeoutId = null;

        if (isScanning && scanTargetId) {
            // Small delay to ensure the DOM element #reader is mounted
            timeoutId = setTimeout(() => {
                try {
                    scannerInstance = new Html5QrcodeScanner("reader", {
                        fps: 10,
                        qrbox: { width: 250, height: 250 },
                        aspectRatio: 1.0
                    }, false);

                    scannerRef.current = scannerInstance;

                    scannerInstance.render(async (decodedText) => {
                        console.log("Scanned:", decodedText, "Target:", scanTargetId);
                        if (decodedText === `FOOD_ID:${scanTargetId}`) {
                            // Stop scanner before updating state to avoid race conditions
                            if (scannerRef.current) {
                                try { await scannerRef.current.clear(); } catch (e) { }
                                scannerRef.current = null;
                            }
                            setIsScanning(false); setScanTargetId(null);
                            try {
                                await axios.put(`${API_URL}/listings/${scanTargetId}/status`, { status: 'Delivered' }, { headers: { 'x-auth-token': localStorage.getItem('token') } });
                                showToast("✅ Delivery Verified via QR!"); fetchListings(); fetchMyHistory(); fetchStats();
                            } catch (err) { alert("Error updating status."); }
                        } else {
                            showToast("❌ Invalid QR Code!", "error");
                        }
                    }, (error) => { });
                } catch (err) {
                    console.error("Scanner intialization failed", err);
                    showToast("Camera access failed", "error");
                    setIsScanning(false);
                }
            }, 300);
        }

        return () => {
            if (timeoutId) clearTimeout(timeoutId);
            if (scannerRef.current) {
                try { scannerRef.current.clear(); } catch (e) { }
                scannerRef.current = null;
            }
        };
    }, [isScanning, scanTargetId, API_URL, fetchListings, fetchMyHistory, fetchStats]);

    const handleImageUpload = async (e, type = 'food') => {
        const file = e.target.files[0]; if (!file) return; setIsUploading(true);
        const formData = new FormData(); formData.append('image', file);
        try {
            const res = await axios.post(`${API_URL}/upload`, formData, { headers: { 'Content-Type': 'multipart/form-data' } });
            if (type === 'profile') {
                setVerificationDoc(res.data.imageUrl);
                showToast("Verification proof uploaded!");
            } else if (view === 'feed' || view === 'history') {
                setDeliveryProof(res.data.imageUrl);
                showToast("Proof Uploaded!");
            } else {
                setFoodImage(res.data.imageUrl);
                showToast("Image Uploaded!");
            }
            setIsUploading(false);
        } catch (err) { showToast("Image upload failed.", "error"); setIsUploading(false); }
    };

    const handleGetLocation = () => {
        if (!navigator.geolocation) return alert("Geolocation not supported.");
        setIsLocating(true);
        navigator.geolocation.getCurrentPosition(
            (pos) => { setLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude }); setIsLocating(false); setHasLocation(true); showToast("Location Found!"); },
            () => { alert("Unable to retrieve location."); setIsLocating(false); }
        );
    };

    const updateProfile = async () => {
        try {
            const res = await axios.put(`${API_URL}/auth/update`, {
                name: editName,
                phone: editPhone,
                address: editAddress,
                ngoCapacity: { fridge: editFridge, dryStorage: editDry },
                notifications: { email: editNotifEmail, sms: editNotifSMS },
                verificationDocument: verificationDoc,
                servedGroups: editServedGroups,
                volunteerSchedule: volunteerSchedule,
                // NEW MAP FIELDS ADDED HERE:
                location: editLocation,
                serviceRadius: editServiceRadius
            }, { headers: { 'x-auth-token': localStorage.getItem('token') } });

            const updatedUser = { ...user, ...res.data };
            setUser(updatedUser);

            localStorage.setItem('user_name', updatedUser.name);
            localStorage.setItem('user_phone', updatedUser.phone);
            localStorage.setItem('user_address', updatedUser.address);
            localStorage.setItem('user_capacity', JSON.stringify(updatedUser.ngoCapacity));
            localStorage.setItem('user_servedGroups', updatedUser.servedGroups);

            // NEW LOCAL STORAGE SETTERS ADDED HERE:
            if (updatedUser.location) {
                localStorage.setItem('user_location', JSON.stringify(updatedUser.location));
            }
            if (updatedUser.serviceRadius !== undefined) {
                localStorage.setItem('user_radius', updatedUser.serviceRadius);
            }

            setIsEditingProfile(false);
            showToast("Profile Updated!");
        } catch (err) {
            alert("Error updating profile.");
            console.error(err);
        }
    };

    const startEditing = () => {
        setEditName(user.name);
        setEditPhone(user.phone);
        setEditAddress(user.address);
        setEditFridge(user.ngoCapacity?.fridge || '');
        setEditDry(user.ngoCapacity?.dryStorage || '');
        setEditNotifEmail(user.notifications?.email || false);
        setEditNotifSMS(user.notifications?.sms || false);
        setVerificationDoc(user.verificationDocument || '');
        setEditServedGroups(user.servedGroups || 'General');
        setVolunteerSchedule(user.volunteerSchedule || '');

        // NEW: Load existing location or default to a center point
        setEditLocation(user.location || { lat: 20.5937, lng: 78.9629 });
        setEditServiceRadius(user.serviceRadius || 5);

        setIsEditingProfile(true);
    };

    const deactivateAccount = async () => { if (window.confirm("Deactivate account?")) { try { await axios.put(`${API_URL}/auth/deactivate`, {}, { headers: { 'x-auth-token': localStorage.getItem('token') } }); logout(); } catch (err) { alert("Error"); } } };
    const deleteAccount = async () => { if (window.prompt("Type 'DELETE' to confirm") === 'DELETE') { try { await axios.delete(`${API_URL}/auth/delete`, { headers: { 'x-auth-token': localStorage.getItem('token') } }); logout(); } catch (err) { alert("Error"); } } };
    const logout = () => { localStorage.clear(); window.location.href = '/login'; };

    const postDonation = async () => {
        if (user.role !== 'Donor') return alert("Only Donors can post!");
        if (!user.isVerified) return showToast("🔒 Verification Pending.", "error");
        const qty = parseFloat(foodQty); const expiry = parseInt(foodExpiry);
        if (isNaN(qty) || qty <= 0) return alert("⚠️ Quantity must be positive.");
        if (isUploading) return alert("⚠️ Wait for image upload.");
        if (!hasLocation) return alert("⚠️ Enable location access.");
        if (!donorInitials) return showToast("Please sign with initials", "error");

        try {
            const config = { headers: { 'x-auth-token': localStorage.getItem('token'), 'Content-Type': 'application/json' } };
            const newListing = {
                title: foodTitle, description: foodDesc, quantity: qty, unit: foodUnit, category: foodCat,
                expiry_hours: expiry, isFresh, isHygienic, hasAllergens, temperature, safetyCheck: true,
                dietaryType, requiresRefrigeration: reqFridge, image: foodImage, containerType,
                handlingInstructions, pickupNote, accessCode, allergens, lat: location.lat, lng: location.lng,
                timePrepared, bestBefore
            };

            if (isEditingListing) { await axios.put(`${API_URL}/listings/${isEditingListing}`, newListing, config); showToast("Listing Updated!"); setIsEditingListing(null); }
            else { await axios.post(`${API_URL}/listings/`, newListing, config); showToast("Food Listed!"); }

            fetchListings(); fetchStats(); fetchMyHistory(); fetchUserData();
            setFoodTitle(''); setFoodDesc(''); setFoodQty(''); setFoodExpiry(''); setFoodImage(''); setDietaryType('Veg'); setReqFridge(false); setIsFresh(false); setIsHygienic(false); setHasAllergens(false); setContainerType('Disposable'); setHandlingInstructions(''); setPickupNote(''); setAllergens([]); setDonorInitials(''); setAccessCode('');
            setTimePrepared(''); setBestBefore('');
            localStorage.removeItem('draft_form'); setView('feed');
        } catch (err) { alert("⚠️ Post Failed."); }
    };

    const fetchMyNeeds = useCallback(async () => {
        const token = localStorage.getItem('token');
        if (!token || user.role !== 'NGO') return;
        try {
            const res = await axios.get(`${API_URL}/food-needs/my`, { headers: { 'x-auth-token': token } });
            setMyNeeds(res.data);
        } catch (err) { console.error("Error fetching my needs", err); }
    }, [API_URL, user.role]);

    useEffect(() => { if (user.id && user.role === 'NGO') fetchMyNeeds(); }, [user.id, user.role, fetchMyNeeds]);

    const postFoodNeed = async () => {
        if (user.role !== 'NGO') return alert("Only NGOs can post needs!");
        if (!user.isVerified) return showToast("🔒 Verification Pending.", "error");
        if (!hasLocation) return alert("⚠️ Enable location access.");

        try {
            const config = { headers: { 'x-auth-token': localStorage.getItem('token'), 'Content-Type': 'application/json' } };
            const newNeed = {
                title: needTitle, description: needDesc, category: needCat,
                quantity: parseFloat(needQty), unit: needUnit,
                urgency: needUrgency, isPerishable: isNeedPerishable,
                lat: location.lat, lng: location.lng
            };

            await axios.post(`${API_URL}/food-needs`, newNeed, config);
            showToast("Food Need Posted!");
            fetchMyNeeds();
            setNeedTitle(''); setNeedDesc(''); setNeedQty(''); setNeedUrgency('Standard'); setIsNeedPerishable(false);
            setView('feed');
        } catch (err) { alert("⚠️ Request Failed."); }
    };

    const deleteFoodNeed = async (id) => {
        if (!window.confirm("Delete this request?")) return;
        try {
            await axios.delete(`${API_URL}/food-needs/${id}`, { headers: { 'x-auth-token': localStorage.getItem('token') } });
            showToast("Request removed");
            fetchMyNeeds();
        } catch (err) { alert("Error deleting"); }
    };

    const editListing = (item) => {
        setFoodTitle(item.title); setFoodDesc(item.description); setFoodQty(item.quantity); setFoodExpiry(item.expiry_hours); setFoodCat(item.category); setDietaryType(item.dietaryType || (item.isVeg ? 'Veg' : 'Non-Veg')); setPickupNote(item.pickupNote); setAccessCode(item.accessCode || ''); setReqFridge(item.requiresRefrigeration); setContainerType(item.containerType || 'Disposable'); setHasAllergens(item.hasAllergens || false); setAllergens(item.allergens || []);
        setTimePrepared(item.timePrepared ? new Date(item.timePrepared).toISOString().slice(0, 16) : '');
        setBestBefore(item.bestBefore ? new Date(item.bestBefore).toISOString().slice(0, 16) : '');
        setIsEditingListing(item._id); setView('donate');
    };

    const updateStatus = async (id, newStatus, proofUrl = null) => {
        let reason = null;
        if (newStatus === 'Cancelled') { reason = prompt("State reason for issue:"); if (!reason) return; }
        else if (newStatus !== 'ReadyToPickup') { if (!window.confirm(`Mark as ${newStatus}?`)) return; }
        if (newStatus === 'In Transit' && user.role === 'Volunteer' && !proofUrl) return showToast("⚠️ Upload QR photo first!", "error");
        if (newStatus === 'Delivered' && !deliveryProof && user.role === 'Volunteer') return showToast("⚠️ Upload delivery proof first!", "error");

        try {
            await axios.put(`${API_URL}/listings/${id}/status`, { status: newStatus, reason: reason, pickupProof: proofUrl || deliveryProof }, { headers: { 'x-auth-token': localStorage.getItem('token') } });
            if (newStatus === 'In Transit') showToast("🚚 En Route!", "success");
            if (newStatus === 'ReadyToPickup') showToast("📡 QR Code Generated!", "success");
            fetchListings(); fetchMyHistory(); fetchUserData(); fetchStats(); setDeliveryProof('');
        } catch (err) { alert("Update failed."); }
    };

    const deleteListing = async (id) => {
        if (!window.confirm("Delete this donation?")) return;
        try { await axios.delete(`${API_URL}/listings/${id}`, { headers: { 'x-auth-token': localStorage.getItem('token') } }); showToast("🗑️ Removed."); fetchListings(); fetchMyHistory(); } catch (err) { alert("Error deleting."); }
    };
    const reportListing = async (id) => {
        const reason = prompt("Why are you reporting this?"); if (!reason) return;
        try { await axios.post(`${API_URL}/listings/${id}/report`, { reason }, { headers: { 'x-auth-token': localStorage.getItem('token') } }); showToast("Report submitted."); } catch { alert("Error reporting."); }
    };
    const submitRating = async (id, ratingValue, feedbackText) => {
        if (!ratingValue) return showToast("Please select stars", "error");
        try {
            await axios.put(`${API_URL}/listings/${id}/rate`, { rating: ratingValue, feedback: feedbackText }, { headers: { 'x-auth-token': localStorage.getItem('token') } });
            showToast("Thanks for your feedback!");
            setActiveRating({ id: null, stars: 0, feedback: '' });
            fetchListings(); fetchUserData(); fetchMyHistory(); fetchStats();
        } catch { alert("Error rating."); }
    };

    let displayListings = (view === 'history' ? myListings : listings).filter(item => {
        // 1. Basic Status Filters
        if (item.status === 'Cancelled') return false;

        // 2. View-specific Logic
        if (view === 'favorites') {
            if (!favorites.includes(item._id || item.id)) return false;
        } else if (view === 'feed') {
            if (item.status === 'Delivered') return false; // Exclude delivered from feed
            if (item.status !== 'Available') {
                const isRelevant = user.role === 'Volunteer' || (user.role === 'NGO' && isSameUser(item.claimedBy, user.id)) || (user.role === 'Donor' && isSameUser(item.donor, user.id));
                if (!isRelevant) return false;
            }
        } else if (view === 'history') {
            // Already filtered by myListings if view is history, but just in case
            const isRelated = isSameUser(item.donor, user.id) || isSameUser(item.claimedBy, user.id) || isSameUser(item.collectedBy, user.id);
            if (!isRelated) return false;
        }

        // 3. Local Search Filter (Improves Responsiveness)
        if (searchTerm) {
            const term = searchTerm.toLowerCase();
            const matchesTitle = item.title?.toLowerCase().includes(term);
            const matchesDesc = item.description?.toLowerCase().includes(term);
            const matchesDonor = item.donor?.name?.toLowerCase().includes(term);
            if (!matchesTitle && !matchesDesc && !matchesDonor) return false;
        }

        // 4. Service Radius Filter (Volunteer & NGO Feed)
        if (showNearbyOnly && (user.role === 'Volunteer' || user.role === 'NGO') && user.location && item.location) {
            const dist = calculateDistance(location.lat, location.lng, item.location.lat, item.location.lng);
            if (dist > (user.serviceRadius || 10)) return false;
        }

        return true;
    });

    if (sortMethod === 'closest' && location.lat) {
        displayListings.sort((a, b) => parseFloat(calculateDistance(location.lat, location.lng, a.location?.lat, a.location?.lng)) - parseFloat(calculateDistance(location.lat, location.lng, b.location?.lat, b.location?.lng)));
    } else if (sortMethod === 'expiry') { displayListings.sort((a, b) => a.expiry_hours - b.expiry_hours); }

    // ==========================================
    // RENDER SAAS LAYOUT
    // ==========================================
    return (
        <div className="flex h-screen bg-gray-50 font-sans overflow-hidden">

            {/* --- SIDEBAR (Desktop) --- */}
            <aside className="w-64 bg-white border-r border-gray-200 flex-col justify-between hidden md:flex shrink-0">
                <div>
                    <div className="h-20 flex items-center px-8 border-b border-gray-100">
                        <span className="text-2xl font-black text-emerald-950 tracking-tight">
                            Give<span className="text-orange-500">Bite</span>
                        </span>
                    </div>
                    <nav className="p-4 space-y-1">
                        <button onClick={() => setView('feed')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-colors ${view === 'feed' ? 'bg-emerald-50 text-emerald-800' : 'text-gray-600 hover:bg-gray-50'}`}>
                            <LayoutDashboard size={20} /> Live Feed
                        </button>
                        <button onClick={() => setView('favorites')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-colors ${view === 'favorites' ? 'bg-emerald-50 text-emerald-800' : 'text-gray-600 hover:bg-gray-50'}`}>
                            <Heart size={20} /> Saved Items
                        </button>
                        <button onClick={() => setView('history')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-colors ${view === 'history' ? 'bg-emerald-50 text-emerald-800' : 'text-gray-600 hover:bg-gray-50'}`}>
                            <History size={20} /> History
                        </button>
                        {user.role === 'Donor' && (
                            <button onClick={() => setView('donate')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-colors mt-4 ${view === 'donate' ? 'bg-emerald-800 text-white shadow-md' : 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'}`}>
                                <PlusCircle size={20} /> Post Donation
                            </button>
                        )}
                        {user.role === 'NGO' && (
                            <>
                                <button onClick={() => setView('request')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-colors mt-4 ${view === 'request' ? 'bg-orange-600 text-white shadow-md' : 'bg-orange-100 text-orange-800 hover:bg-orange-200'}`}>
                                    <PlusCircle size={20} /> Request Food
                                </button>
                                <button onClick={() => setView('my-requests')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-colors ${view === 'my-requests' ? 'bg-emerald-50 text-emerald-800' : 'text-gray-600 hover:bg-gray-50'}`}>
                                    <History size={20} /> My Requests
                                </button>
                            </>
                        )}
                        {user.role === 'Admin' && (
                            <button onClick={() => setView('admin')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-colors mt-4 ${view === 'admin' ? 'bg-purple-50 text-purple-800' : 'text-gray-600 hover:bg-gray-50'}`}>
                                <ShieldAlert size={20} /> Admin Panel
                            </button>
                        )}
                    </nav>
                </div>
                <div className="p-4 border-t border-gray-100 space-y-1">
                    <button onClick={() => setView('profile')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-colors ${view === 'profile' ? 'bg-gray-100 text-gray-900' : 'text-gray-600 hover:bg-gray-50'}`}>
                        <UserCircle size={20} /> My Profile
                    </button>
                    <button onClick={logout} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-red-600 hover:bg-red-50 transition-colors">
                        <LogOut size={20} /> Logout
                    </button>
                </div>
            </aside>

            {/* --- MOBILE SIDEBAR DRAWER --- */}
            {mobileMenuOpen && (
                <div className="fixed inset-0 z-50 flex md:hidden">
                    <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm" onClick={() => setMobileMenuOpen(false)}></div>
                    <aside className="relative w-64 max-w-[80%] bg-white h-full flex flex-col shadow-2xl">
                        <div className="h-20 flex items-center justify-between px-6 border-b border-gray-100">
                            <span className="text-xl font-black text-emerald-950">Give<span className="text-orange-500">Bite</span></span>
                            <button onClick={() => setMobileMenuOpen(false)} className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg"><X size={24} /></button>
                        </div>
                        <nav className="flex-1 overflow-y-auto p-4 space-y-1">
                            <button onClick={() => setView('feed')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium ${view === 'feed' ? 'bg-emerald-50 text-emerald-800' : 'text-gray-600'}`}><LayoutDashboard size={20} /> Live Feed</button>
                            <button onClick={() => setView('favorites')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium ${view === 'favorites' ? 'bg-emerald-50 text-emerald-800' : 'text-gray-600'}`}><Heart size={20} /> Saved Items</button>
                            <button onClick={() => setView('history')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium ${view === 'history' ? 'bg-emerald-50 text-emerald-800' : 'text-gray-600'}`}><History size={20} /> History</button>
                            {user.role === 'Donor' && <button onClick={() => { setView('donate'); setMobileMenuOpen(false); }} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold bg-emerald-100 text-emerald-800 mt-4"><PlusCircle size={20} /> Post Donation</button>}
                            {user.role === 'NGO' && (
                                <>
                                    <button onClick={() => { setView('request'); setMobileMenuOpen(false); }} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold bg-orange-100 text-orange-800 mt-4"><PlusCircle size={20} /> Request Food</button>
                                    <button onClick={() => { setView('my-requests'); setMobileMenuOpen(false); }} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-gray-600"><History size={20} /> My Requests</button>
                                </>
                            )}
                            {user.role === 'Admin' && <button onClick={() => setView('admin')} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-purple-800 bg-purple-50 mt-4"><ShieldAlert size={20} /> Admin Panel</button>}
                        </nav>
                        <div className="p-4 border-t border-gray-100 space-y-1">
                            <button onClick={() => setView('profile')} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-gray-600"><UserCircle size={20} /> My Profile</button>
                            <button onClick={logout} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-red-600"><LogOut size={20} /> Logout</button>
                        </div>
                    </aside>
                </div>
            )}

            {/* --- MAIN CONTENT AREA --- */}
            <main className="flex-1 flex flex-col h-screen overflow-hidden relative">

                {/* TOASTS */}
                {toast && (
                    <div className={`absolute top-6 left-1/2 -translate-x-1/2 z-[60] px-6 py-3 rounded-full font-bold shadow-xl flex items-center gap-2 transition-all ${toast.type === 'error' ? 'bg-red-500 text-white' : 'bg-emerald-600 text-white'}`}>
                        {toast.type === 'error' ? <ShieldAlert size={18} /> : <CheckCircle2 size={18} />} {toast.msg}
                    </div>
                )}

                {showTraining && (
                    <div className="fixed inset-0 bg-gray-900/90 backdrop-blur-md z-[80] flex items-center justify-center p-4">
                        <div className="bg-white rounded-[2.5rem] max-w-2xl w-full shadow-2xl overflow-hidden flex flex-col md:flex-row h-auto md:h-[500px] relative">
                            <div className="md:w-1/2 relative bg-emerald-950 min-h-[200px]">
                                <img src={trainingModules[trainingStep].img} alt="Training" className="w-full h-full object-cover opacity-60" />
                                <div className="absolute inset-0 bg-gradient-to-t from-emerald-950 p-8 flex flex-col justify-end">
                                    <h3 className="text-white text-3xl font-black leading-tight mb-2">{trainingModules[trainingStep].title}</h3>
                                    <div className="flex gap-1">
                                        {trainingModules.map((_, i) => (
                                            <div key={i} className={`h-1.5 rounded-full transition-all ${i === trainingStep ? 'w-8 bg-emerald-400' : 'w-2 bg-emerald-800'}`}></div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                            <div className="md:w-1/2 p-10 flex flex-col justify-between bg-white text-left">
                                <div>
                                    <span className="text-[10px] font-black uppercase tracking-widest text-emerald-600 bg-emerald-50 px-2 py-1 rounded-md mb-4 inline-block">Module {trainingStep + 1} of 3</span>
                                    <h4 className="text-xl font-bold text-gray-900 mb-4">Handling & Hygiene</h4>
                                    <p className="text-gray-600 leading-relaxed text-sm">{trainingModules[trainingStep].content}</p>
                                </div>
                                <div className="flex gap-3 mt-8">
                                    {trainingStep > 0 && (
                                        <button onClick={() => setTrainingStep(t => t - 1)} className="flex-1 py-4 px-6 rounded-2xl bg-gray-100 text-gray-700 font-bold hover:bg-gray-200 transition-all">Back</button>
                                    )}
                                    {trainingStep < trainingModules.length - 1 ? (
                                        <button onClick={() => setTrainingStep(t => t + 1)} className="flex-[2] py-4 px-6 rounded-2xl bg-emerald-800 text-white font-bold hover:bg-emerald-900 transition-all shadow-lg shadow-emerald-900/20">Next Lesson</button>
                                    ) : (
                                        <button onClick={() => { setShowTraining(false); setShowQuiz(true); }} className="flex-[2] py-4 px-6 rounded-2xl bg-orange-500 text-white font-bold hover:bg-orange-600 transition-all shadow-lg shadow-orange-500/20">Start Quiz ✍️</button>
                                    )}
                                </div>
                            </div>
                            <button onClick={() => { setShowTraining(false); localStorage.setItem('training_deferred', 'true'); }} className="absolute top-6 right-6 p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-all"><X size={24} /></button>
                        </div>
                    </div>
                )}

                {/* ---> NEW: Volunteer Anniversary Banner <--- */}
                {user.role === 'Volunteer' && user.createdAt && (
                    (() => {
                        const joinDate = new Date(user.createdAt);
                        const today = new Date();

                        const isAnniversary = joinDate.getMonth() === today.getMonth() && joinDate.getDate() === today.getDate();
                        const yearsActive = today.getFullYear() - joinDate.getFullYear();

                        if (isAnniversary && yearsActive > 0) {
                            return (
                                <div className="m-4 md:m-8 mb-4 bg-gradient-to-r from-orange-400 to-orange-500 rounded-2xl p-6 shadow-lg shadow-orange-500/20 text-white flex items-center justify-between border border-orange-300 relative overflow-hidden">
                                    <div className="absolute -top-10 -right-10 w-32 h-32 bg-white opacity-10 rounded-full blur-2xl"></div>
                                    <div className="relative z-10 flex items-center gap-4">
                                        <div className="bg-white/20 p-3 rounded-xl backdrop-blur-sm">
                                            <Heart className="text-white" size={32} />
                                        </div>
                                        <div>
                                            <h3 className="text-xl font-bold tracking-tight">Happy GiveBite Anniversary, {user.name}! 🎉</h3>
                                            <p className="text-orange-50 text-sm font-medium mt-1">Thank you for {yearsActive} {yearsActive === 1 ? 'year' : 'years'} of incredible service. You've made a huge impact on food rescue!</p>
                                        </div>
                                    </div>
                                    <div className="hidden md:block relative z-10 bg-white text-orange-600 font-bold px-4 py-2 rounded-xl text-sm shadow-sm">
                                        +50 Bonus Credits
                                    </div>
                                </div>
                            );
                        }
                        return null;
                    })()
                )}
                {/* ------------------------------------------- */}

                {/* MODALS */}
                {showSafetyModal && (
                    <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm z-[70] flex items-center justify-center p-4">
                        <div className="bg-white rounded-3xl p-8 max-w-sm w-full text-center shadow-2xl">
                            <h3 className="text-xl font-bold text-gray-900 mb-4">🌡️ Food Safety Guide</h3>
                            <div className="text-left space-y-3 mb-6 text-gray-600 text-sm bg-gray-50 p-4 rounded-xl border border-gray-100">
                                <p><strong className="text-gray-900">Hot Food:</strong> Keep above 60°C.</p>
                                <p><strong className="text-gray-900">Cold Food:</strong> Keep below 5°C.</p>
                                <p className="text-orange-600 font-medium">Danger Zone: Bacteria grows fast between 5°C - 60°C.</p>
                            </div>
                            <button onClick={() => setShowSafetyModal(false)} className="w-full bg-emerald-800 text-white font-bold py-3 rounded-xl hover:bg-emerald-900">Got it</button>
                        </div>
                    </div>
                )}

                {isScanning && (
                    <div className="fixed inset-0 bg-gray-900/90 z-[70] flex flex-col items-center justify-center p-4">
                        <div className="bg-white p-6 rounded-3xl w-full max-w-md text-center shadow-2xl">
                            <h3 className="text-xl font-bold text-gray-900 mb-4">📷 Scan QR Code</h3>
                            <div className="relative">
                                <div id="reader" className="w-full rounded-xl overflow-hidden mb-4 border-2 border-dashed border-gray-200 min-h-[250px] bg-gray-50 flex items-center justify-center">
                                    <p className="text-gray-400 text-sm italic">Starting camera...</p>
                                </div>
                            </div>
                            <button onClick={() => { setIsScanning(false); setScanTargetId(null); }} className="w-full bg-red-100 text-red-600 font-bold py-3 rounded-xl hover:bg-red-200 transition-colors">Cancel Scan</button>
                        </div>
                    </div>
                )}

                {showQuiz && (
                    <div className="fixed inset-0 bg-gray-900/80 backdrop-blur-sm z-[9000] flex items-center justify-center p-4">
                        <div className="bg-white p-8 rounded-3xl max-w-md w-full shadow-2xl text-center">
                            <h3 className="text-emerald-800 font-bold mb-2">🎓 Safety Training ({currentQuestion + 1}/{safetyQuiz.length})</h3>
                            <p className="text-lg font-bold text-gray-900 mb-6">{safetyQuiz[currentQuestion].q}</p>
                            <div className="space-y-3">
                                {safetyQuiz[currentQuestion].options.map(opt => (
                                    <button key={opt} onClick={() => handleQuizAnswer(opt)} className="w-full py-3 bg-gray-50 border border-gray-200 rounded-xl hover:bg-emerald-50 hover:border-emerald-200 font-medium text-gray-700 transition-colors">{opt}</button>
                                ))}
                            </div>
                            <button onClick={() => setShowQuiz(false)} className="mt-6 text-gray-400 font-medium hover:text-gray-600 text-sm">Cancel Training</button>
                        </div>
                    </div>
                )}

                {showDonationGuide && (
                    <div className="fixed inset-0 bg-gray-900/90 backdrop-blur-md z-[9500] flex items-center justify-center p-4">
                        <div className="bg-white rounded-[2.5rem] max-w-lg w-full shadow-2xl overflow-hidden relative border border-gray-100">
                            <div className="bg-emerald-950 p-12 text-center relative overflow-hidden">
                                <div className="absolute top-0 left-0 w-32 h-32 bg-emerald-800 rounded-full blur-3xl opacity-30 -translate-x-1/2 -translate-y-1/2"></div>
                                <div className="text-6xl mb-6 relative z-10">{donationGuideSteps[donationGuideStep].icon}</div>
                                <h3 className="text-white text-3xl font-black mb-2 relative z-10">{donationGuideSteps[donationGuideStep].title}</h3>
                                <div className="flex justify-center gap-1.5 mt-4 relative z-10">
                                    {donationGuideSteps.map((_, i) => (
                                        <div key={i} className={`h-1.5 rounded-full transition-all duration-300 ${i === donationGuideStep ? 'w-8 bg-emerald-400' : 'w-2 bg-emerald-800'}`}></div>
                                    ))}
                                </div>
                            </div>
                            <div className="p-10 text-center">
                                <p className="text-gray-600 leading-relaxed text-lg font-medium mb-10">
                                    {donationGuideSteps[donationGuideStep].content}
                                </p>
                                <div className="flex gap-4">
                                    {donationGuideStep > 0 && (
                                        <button
                                            onClick={() => setDonationGuideStep(s => s - 1)}
                                            className="flex-1 py-4 bg-gray-100 text-gray-700 font-bold rounded-2xl hover:bg-gray-200 transition-all border border-gray-200"
                                        >
                                            Previous
                                        </button>
                                    )}
                                    {donationGuideStep < donationGuideSteps.length - 1 ? (
                                        <button
                                            onClick={() => setDonationGuideStep(s => s + 1)}
                                            className="flex-[2] py-4 bg-emerald-800 text-white font-bold rounded-2xl hover:bg-emerald-900 transition-all shadow-lg shadow-emerald-900/20"
                                        >
                                            Next Step
                                        </button>
                                    ) : (
                                        <button
                                            onClick={() => setShowDonationGuide(false)}
                                            className="flex-[2] py-4 bg-orange-500 text-white font-bold rounded-2xl hover:bg-orange-600 transition-all shadow-lg shadow-orange-500/20"
                                        >
                                            Got it, Let's Post! 🚀
                                        </button>
                                    )}
                                </div>
                            </div>
                            <button
                                onClick={() => setShowDonationGuide(false)}
                                className="absolute top-6 right-6 p-2 text-white/50 hover:text-white hover:bg-white/10 rounded-full transition-all"
                            >
                                <X size={24} />
                            </button>
                        </div>
                    </div>
                )}

                {isReportingBug && (
                    <div className="fixed inset-0 bg-gray-900/80 backdrop-blur-sm z-[9999] flex items-center justify-center p-4">
                        <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl border border-gray-100">
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">🐞 Report a Bug</h3>
                                <button onClick={() => setIsReportingBug(false)} className="p-2 text-gray-400 hover:bg-gray-100 rounded-full transition-colors"><X size={20} /></button>
                            </div>

                            <div className="mb-6">
                                <label className="block text-sm font-bold text-gray-700 mb-2">Bug Description</label>
                                <div className="relative">
                                    <textarea
                                        value={bugContent}
                                        onChange={(e) => setBugContent(e.target.value)}
                                        className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 h-32 resize-none focus:ring-2 focus:ring-emerald-500 outline-none pr-10"
                                        placeholder="Speak or type the issue..."
                                    />
                                    <button
                                        onClick={startBugVoiceInput}
                                        className="absolute bottom-3 right-3 p-2 bg-emerald-100 text-emerald-800 rounded-full hover:bg-emerald-200 transition-colors"
                                        title="Use Voice"
                                    >
                                        🎤
                                    </button>
                                </div>
                                <p className="text-[10px] text-gray-500 mt-2 italic">Tip: Click the mic and speak clearly to describe the problem.</p>
                            </div>

                            <button
                                onClick={submitBugReport}
                                className="w-full bg-emerald-800 text-white font-bold py-4 rounded-xl hover:bg-emerald-900 transition-all shadow-lg shadow-emerald-900/20"
                            >
                                Send Ticket
                            </button>
                        </div>
                    </div>
                )}

                {/* --- TOP HEADER --- */}
                <header className="h-20 bg-white border-b border-gray-200 flex items-center justify-between px-4 md:px-8 shrink-0">
                    <div className="flex items-center gap-4 md:hidden">
                        <button onClick={() => setMobileMenuOpen(true)} className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg"><Menu size={24} /></button>
                        <span className="text-xl font-black text-emerald-950">Give<span className="text-orange-500">Bite</span></span>
                    </div>
                    <div className="hidden md:block">
                        <h1 className="text-2xl font-bold text-gray-900 capitalize tracking-tight">
                            {view === 'feed' ? 'Live Donations' : view === 'history' ? 'Your Impact History' : view}
                        </h1>
                    </div>

                    <div className="flex items-center gap-4 md:gap-6">
                        <div id="google_translate_element" className="block shrink-0 min-h-[38px] min-w-[170px] border border-gray-200 rounded-xl overflow-hidden shadow-sm"></div>
                        {/* Notifications */}
                        <div className="relative">
                            <button onClick={() => setShowNotifDropdown(!showNotifDropdown)} className="p-2 text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-full transition-colors relative">
                                <Bell size={24} />
                                {appNotifications.some(n => !n.isRead) && <span className="absolute top-1 right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-white"></span>}
                            </button>
                            {showNotifDropdown && (
                                <div className="absolute right-0 mt-2 w-72 bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden z-[60]">
                                    <div className="px-4 py-3 border-b border-gray-100 font-bold text-gray-900 flex justify-between items-center">
                                        <span>Notifications</span>
                                        {appNotifications.some(n => !n.isRead) && (
                                            <button onClick={markAllRead} className="text-xs text-emerald-600 hover:text-emerald-700 font-bold">Mark all read</button>
                                        )}
                                    </div>
                                    <div className="max-h-64 overflow-y-auto">
                                        {appNotifications.length === 0 ? (
                                            <p className="p-4 text-sm text-gray-500 text-center">No new alerts</p>
                                        ) : (
                                            appNotifications.map((n, i) => (
                                                <div key={n._id || i} className={`p-4 border-b border-gray-50 text-sm ${n.isRead ? 'text-gray-500 opacity-70' : 'text-gray-900 bg-emerald-50/30'}`}>
                                                    <div className="font-medium mb-0.5">{n.msg}</div>
                                                    <span className="text-[10px] text-gray-400">{new Date(n.createdAt).toLocaleString()}</span>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Donor Streak Counter */}
                        {user.role === 'Donor' && user.streakCount > 0 && (
                            <div className="hidden lg:flex items-center gap-1.5 bg-orange-50 text-orange-600 px-3 py-1.5 rounded-full border border-orange-100 shadow-sm">
                                <span className="text-lg">🔥</span>
                                <span className="font-bold text-xs uppercase tracking-tight">{user.streakCount} Week Streak</span>
                            </div>
                        )}

                        {/* Volunteer Badges */}
                        {user.role === 'Volunteer' && user.badges && user.badges.length > 0 && (
                            <div className="hidden md:flex items-center gap-2">
                                {user.badges.map((badge, idx) => (
                                    <div key={idx} className="flex items-center gap-1 bg-emerald-50 text-emerald-700 px-2 py-1 rounded-lg border border-emerald-100 shadow-sm transition-transform hover:scale-110 cursor-help" title={badge}>
                                        <span className="text-sm">
                                            {badge === 'Night Owl' ? '🦉' : badge === 'Weekend Warrior' ? '⚔️' : badge === 'Early Bird' ? '☀️' : badge === 'Community Hero' ? '🏅' : '🏆'}
                                        </span>
                                        <span className="text-[10px] font-bold uppercase tracking-tight">{badge}</span>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* User Snippet */}
                        <button onClick={() => setView('profile')} className="flex items-center gap-3 pl-4 border-l border-gray-200 hover:opacity-80 transition-opacity text-left">
                            <div className="hidden sm:block">
                                <p className="text-sm font-bold text-gray-900 leading-tight">{user.name}</p>
                                <p className="text-xs text-emerald-600 font-medium">{user.role} {user.isVerified && '✓'}</p>
                            </div>
                            <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-lg border border-emerald-200">
                                {user?.name?.charAt(0).toUpperCase() || '?'}
                            </div>
                        </button>
                    </div>
                </header>

                {/* --- SCROLLABLE CONTENT AREA --- */}
                <div className="flex-1 overflow-y-auto p-4 md:p-8 bg-gray-50/50">
                    <div className="max-w-6xl mx-auto space-y-8 pb-20">

                        {/* VIEW: FEED, FAVORITES, HISTORY */}
                        {(view === 'feed' || view === 'favorites' || view === 'history') && (
                            <>
                                {/* Stats Bento Box */}
                                {view === 'feed' && (
                                    <>
                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-center">
                                                <span className="text-sm text-gray-500 font-medium mb-1">Total Deliveries</span>
                                                <span className="text-3xl font-black text-gray-900">{stats.total_donations || 0}</span>
                                            </div>
                                            <div className="bg-emerald-50 p-6 rounded-2xl border border-emerald-100 flex flex-col justify-center">
                                                <span className="text-sm text-emerald-800 font-medium mb-1">Meals Saved</span>
                                                <span className="text-3xl font-black text-emerald-900">{stats.meals_saved || 0}</span>
                                            </div>
                                            <div className="bg-orange-50 p-6 rounded-2xl border border-orange-100 flex flex-col justify-center">
                                                <span className="text-sm text-orange-800 font-medium mb-1">CO₂ Diverted (kg)</span>
                                                <span className="text-3xl font-black text-orange-900">{stats.co2_saved || 0}</span>
                                            </div>
                                            <div className="bg-blue-50 p-6 rounded-2xl border border-blue-100 flex flex-col justify-center">
                                                <span className="text-sm text-blue-800 font-medium mb-1">Water Saved (L)</span>
                                                <span className="text-3xl font-black text-blue-900">{stats.water_saved || 0}</span>
                                            </div>
                                        </div>

                                        {/* Leaderboard Section */}
                                        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
                                            <div className="p-6 border-b border-gray-50 flex flex-col sm:flex-row justify-between items-center gap-4">
                                                <div>
                                                    <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">🏆 Community Impact Leaderboard</h3>
                                                    <p className="text-xs text-gray-500 font-medium">Top contributors this month</p>
                                                </div>
                                                <div className="flex bg-gray-100 p-1 rounded-xl">
                                                    <button
                                                        onClick={() => { setLeaderboardTab('donors'); fetchStats('donors'); }}
                                                        className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${leaderboardTab === 'donors' ? 'bg-white text-emerald-800 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                                                    >
                                                        TOP DONORS
                                                    </button>
                                                    <button
                                                        onClick={() => { setLeaderboardTab('volunteers'); fetchStats('volunteers'); }}
                                                        className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${leaderboardTab === 'volunteers' ? 'bg-white text-emerald-800 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                                                    >
                                                        TOP VOLUNTEERS
                                                    </button>
                                                </div>
                                            </div>
                                            <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
                                                {leaderboard.length === 0 ? (
                                                    <p className="col-span-3 text-center py-4 text-gray-400 text-sm italic">Join the movement and start donating!</p>
                                                ) : leaderboard.map((rank, idx) => (
                                                    <div key={idx} className="flex items-center gap-4 p-4 rounded-2xl bg-gray-50 border border-gray-100 border-dashed relative">
                                                        <div className={`w-10 h-10 rounded-full flex items-center justify-center font-black text-lg ${idx === 0 ? 'bg-yellow-100 text-yellow-700' : idx === 1 ? 'bg-gray-200 text-gray-600' : 'bg-orange-100 text-orange-700'}`}>
                                                            {idx + 1}
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <p className="font-bold text-gray-900 truncate">{rank.name}</p>
                                                            <p className="text-xs text-emerald-600 font-semibold uppercase tracking-wider">{rank.count} Deliveries</p>
                                                        </div>
                                                        {idx === 0 && <span className="absolute -top-2 -right-2 text-2xl">👑</span>}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </>
                                )}

                                {/* Toolbar */}
                                <div className="flex flex-col md:flex-row gap-4 justify-between items-center bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
                                    <div className="flex-1 w-full relative">
                                        <input
                                            type="text" placeholder="Search available food..."
                                            value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
                                            className="w-full bg-gray-50 border border-gray-200 text-gray-900 text-sm rounded-xl focus:ring-emerald-500 focus:border-emerald-500 block p-3 outline-none"
                                        />
                                    </div>
                                    <div className="flex w-full md:w-auto gap-3 flex-wrap">
                                        {(user.role === 'Volunteer' || user.role === 'NGO') && (
                                            <label className="flex items-center gap-2 cursor-pointer bg-gray-50 border border-gray-200 rounded-xl px-4 py-2 hover:bg-gray-100 transition-colors">
                                                <input
                                                    type="checkbox"
                                                    checked={showNearbyOnly}
                                                    onChange={e => setShowNearbyOnly(e.target.checked)}
                                                    className="w-4 h-4 text-emerald-600 rounded border-gray-300 focus:ring-emerald-500"
                                                />
                                                <span className="text-xs font-bold text-gray-700 whitespace-nowrap">Nearby Only</span>
                                            </label>
                                        )}
                                        <select value={sortMethod} onChange={e => setSortMethod(e.target.value)} className="bg-gray-50 border border-gray-200 text-gray-700 text-sm rounded-xl focus:ring-emerald-500 p-3 outline-none w-full md:w-auto">
                                            <option value="newest">Newest First</option>
                                            <option value="closest">Closest Distance</option>
                                            <option value="expiry">Expiring Soon</option>
                                        </select>
                                        <select value={filterCategory} onChange={e => setFilterCategory(e.target.value)} className="bg-gray-50 border border-gray-200 text-gray-700 text-sm rounded-xl focus:ring-emerald-500 p-3 outline-none w-full md:w-auto">
                                            <option value="All">All Types</option><option value="Cooked">Cooked</option><option value="Raw">Raw</option>
                                        </select>
                                    </div>
                                </div>

                                {/* Listings Grid */}
                                {displayListings.length === 0 ? (
                                    <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-gray-300">
                                        <div className="text-gray-400 mb-3 flex justify-center"><Info size={48} className="opacity-50" /></div>
                                        <h3 className="text-lg font-bold text-gray-900">No surplus food found here</h3>
                                        <p className="text-gray-500 text-sm mt-1">Try adjusting your filters or check back later.</p>
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                                        {displayListings.map(item => (
                                            <div key={item._id || item.id} className={`bg-white rounded-3xl border ${isUrgent(item.createdAt, item.expiry_hours) && item.status === 'Available' ? 'border-orange-300 shadow-orange-100 shadow-lg' : 'border-gray-200 shadow-sm'} overflow-hidden flex flex-col hover:shadow-md transition-shadow relative`}>

                                                {/* Card Image */}
                                                <div className="h-48 bg-gray-100 relative">
                                                    {item.image ? (
                                                        <img src={item.image} alt={item.title} className="w-full h-full object-cover" />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center text-gray-400 font-medium bg-gray-100">No Image</div>
                                                    )}
                                                    {/* Status Badge Over Image */}
                                                    <div className="absolute top-4 left-4 bg-white/90 backdrop-blur text-sm font-bold px-3 py-1 rounded-full shadow-sm text-gray-800">
                                                        {item.status}
                                                    </div>
                                                    {isUrgent(item.createdAt, item.expiry_hours) && item.status === 'Available' && (
                                                        <div className="absolute top-4 right-4 bg-orange-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-md animate-pulse">URGENT</div>
                                                    )}
                                                </div>

                                                {/* Card Content */}
                                                <div className="p-6 flex flex-col flex-1">
                                                    <div className="flex justify-between items-start mb-2">
                                                        <h3 className="text-lg font-bold text-gray-900 leading-tight pr-2">
                                                            {item.title}
                                                        </h3>
                                                        <div className="flex gap-2 shrink-0">
                                                            <button onClick={() => setShowSafetyModal(true)} className="text-gray-400 hover:text-emerald-600 transition-colors shrink-0" title="Safety Guide">
                                                                <HelpCircle size={20} />
                                                            </button>
                                                            {!isSameUser(item.donor, user.id) && (
                                                                <button onClick={() => reportListing(item._id || item.id)} className="text-gray-400 hover:text-orange-600 transition-colors shrink-0" title="Report Issue">
                                                                    <ShieldAlert size={20} />
                                                                </button>
                                                            )}
                                                            {isSameUser(item.donor, user.id) && (item.status === 'Available' || isExpired(item.createdAt, item.expiry_hours)) && (
                                                                <button onClick={() => deleteListing(item._id || item.id)} className="text-gray-400 hover:text-red-600 transition-colors" title="Delete Donation">
                                                                    <Trash2 size={20} />
                                                                </button>
                                                            )}
                                                            <button onClick={() => toggleFavorite(item._id || item.id)} className="text-gray-400 hover:text-rose-500 transition-colors shrink-0">
                                                                <Heart size={20} fill={favorites.includes(item._id || item.id) ? "currentColor" : "none"} className={favorites.includes(item._id || item.id) ? "text-rose-500" : ""} />
                                                            </button>
                                                        </div>
                                                    </div>

                                                    <p className="text-sm text-gray-500 mb-4 flex items-center gap-1">
                                                        <UserCircle size={14} /> {item.donor?.name || 'Unknown'} {item.donor?.isVerified && <CheckCircle2 size={14} className="text-blue-500" />}
                                                    </p>

                                                    {/* Meta Tags */}
                                                    <div className="flex flex-wrap gap-2 mb-6">
                                                        <span className="bg-gray-100 text-gray-600 text-xs font-semibold px-2.5 py-1 rounded-lg">📦 {item.quantity} {item.unit}</span>
                                                        <span className="bg-gray-100 text-gray-600 text-xs font-semibold px-2.5 py-1 rounded-lg">🌡️ {item.temperature}</span>
                                                        {item.dietaryType === 'Veg' && <span className="bg-emerald-50 text-emerald-700 text-xs font-semibold px-2.5 py-1 rounded-lg border border-emerald-100">🟢 Veg</span>}
                                                        {item.dietaryType === 'Non-Veg' && <span className="bg-red-50 text-red-700 text-xs font-semibold px-2.5 py-1 rounded-lg border border-red-100">🔴 Non-Veg</span>}
                                                        {item.dietaryType === 'Vegan' && <span className="bg-purple-50 text-purple-700 text-xs font-semibold px-2.5 py-1 rounded-lg border border-purple-100">🌱 Vegan</span>}
                                                    </div>

                                                    {(item.timePrepared || item.bestBefore) && (
                                                        <div className="bg-gray-50 p-3 rounded-2xl border border-gray-100 mb-4 space-y-1">
                                                            {item.timePrepared && (
                                                                <div className="flex justify-between items-center text-[10px]">
                                                                    <span className="text-gray-400 font-bold uppercase tracking-tight">Cooked/Prep:</span>
                                                                    <span className="text-gray-700 font-bold">{new Date(item.timePrepared).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}</span>
                                                                </div>
                                                            )}
                                                            {item.bestBefore && (
                                                                <div className="flex justify-between items-center text-[10px]">
                                                                    <span className="text-orange-500 font-bold uppercase tracking-tight">Best Before:</span>
                                                                    <span className="text-orange-600 font-bold">{new Date(item.bestBefore).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}</span>
                                                                </div>
                                                            )}
                                                        </div>
                                                    )}

                                                    <div className="mt-auto pt-4 border-t border-gray-100 space-y-3">
                                                        <div className="flex justify-between text-sm items-center">
                                                            {item.status !== 'Delivered' && item.status !== 'Cancelled' ? (
                                                                <Countdown createdAt={item.createdAt} expiryHours={item.expiry_hours} />
                                                            ) : (
                                                                <span className="text-gray-400 font-medium">Finished</span>
                                                            )}
                                                            {item.location && location.lat && (
                                                                <span className="text-emerald-600 font-bold flex items-center gap-1">
                                                                    <MapPin size={14} /> {calculateDistance(location.lat, location.lng, item.location.lat, item.location.lng)} km
                                                                </span>
                                                            )}
                                                        </div>

                                                        {/* Rating & Feedback Section for Delivered Items */}
                                                        {item.status === 'Delivered' && (
                                                            <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100 mt-2">
                                                                {item.rating > 0 ? (
                                                                    <div className="space-y-1">
                                                                        <div className="flex gap-1 text-orange-400">
                                                                            {[...Array(5)].map((_, i) => (
                                                                                <span key={i} className="text-lg">{i < item.rating ? '★' : '☆'}</span>
                                                                            ))}
                                                                        </div>
                                                                        {item.feedback && <p className="text-xs text-gray-600 italic">"{item.feedback}"</p>}
                                                                    </div>
                                                                ) : user.role === 'NGO' && isSameUser(item.claimedBy, user.id) ? (
                                                                    <div className="space-y-3">
                                                                        <div className="flex justify-between items-center">
                                                                            <span className="text-xs font-bold text-gray-700">Rate this donation:</span>
                                                                            <div className="flex gap-1">
                                                                                {[1, 2, 3, 4, 5].map((star) => (
                                                                                    <button
                                                                                        key={star}
                                                                                        onClick={() => setActiveRating(prev => ({ ...prev, id: item._id, stars: star }))}
                                                                                        className={`text-xl transition-transform hover:scale-110 ${(activeRating.id === item._id ? activeRating.stars : 0) >= star ? 'text-orange-400' : 'text-gray-300'}`}
                                                                                    >★</button>
                                                                                ))}
                                                                            </div>
                                                                        </div>
                                                                        {activeRating.id === item._id && (
                                                                            <div className="space-y-2 animate-in fade-in slide-in-from-top-2 duration-300">
                                                                                <textarea
                                                                                    placeholder="Any comments on the food quality? (Optional)"
                                                                                    className="w-full text-xs p-2 rounded-lg border border-gray-200 outline-none focus:ring-1 focus:ring-emerald-500 bg-white"
                                                                                    value={activeRating.feedback}
                                                                                    onChange={(e) => setActiveRating(prev => ({ ...prev, feedback: e.target.value }))}
                                                                                />
                                                                                <button
                                                                                    onClick={() => submitRating(item._id, activeRating.stars, activeRating.feedback)}
                                                                                    className="w-full bg-emerald-800 text-white text-xs font-bold py-2 rounded-lg hover:bg-emerald-900 transition-colors"
                                                                                >
                                                                                    Submit Review
                                                                                </button>
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                ) : (
                                                                    <p className="text-xs text-gray-400 italic">No feedback provided yet.</p>
                                                                )}
                                                            </div>
                                                        )}

                                                        {/* ACTION BUTTONS BASED ON STATUS & ROLE */}
                                                        {item.status === 'Available' && user.role === 'NGO' && (
                                                            <button
                                                                onClick={() => {
                                                                    if (!user.isVerified) return showToast("🔒 Verification Pending.", "error");
                                                                    updateStatus(item._id || item.id, 'Claimed');
                                                                }}
                                                                className={`w-full ${!user.isVerified ? 'bg-gray-400 cursor-not-allowed' : 'bg-emerald-800 hover:bg-emerald-900'} text-white font-bold py-3 rounded-xl transition-colors mt-2 shadow-sm`}
                                                            >
                                                                {user.isVerified ? 'Claim Donation' : '🔒 Verification Pending'}
                                                            </button>
                                                        )}

                                                        {item.status === 'Claimed' && user.role === 'Donor' && isSameUser(item.donor, user.id) && (
                                                            !item.isReadyForPickup ? (
                                                                <button onClick={() => updateStatus(item._id || item.id, 'ReadyToPickup')} className="w-full bg-orange-500 text-white font-bold py-3 rounded-xl hover:bg-orange-600 transition-colors mt-2 shadow-sm">Mark Ready for Pickup</button>
                                                            ) : (
                                                                <div className="bg-emerald-50 p-4 rounded-xl border border-emerald-200 text-center mt-2">
                                                                    <p className="font-bold text-emerald-800 mb-3 text-sm">Show QR to Volunteer</p>
                                                                    <div className="bg-white p-2 inline-block rounded-lg shadow-sm border border-emerald-100"><QRCode value={`FOOD_ID:${item._id}`} size={160} /></div>
                                                                    <p className="text-[10px] text-emerald-500 mt-2 font-mono">ID: {item._id.substring(item._id.length - 6)}</p>
                                                                </div>
                                                            )
                                                        )}

                                                        {item.status === 'Claimed' && user.role === 'Volunteer' && (
                                                            !item.isReadyForPickup ? (
                                                                <div className="w-full bg-orange-50 text-orange-800 font-medium text-sm text-center py-3 rounded-xl border border-orange-200 mt-2">Waiting for Donor</div>
                                                            ) : (
                                                                <div className="space-y-2 mt-2">
                                                                    <input type="file" accept="image/*" onChange={(e) => handleImageUpload(e)} className="text-xs w-full mb-2 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-bold file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100" />
                                                                    {!user.isVerified ? (
                                                                        <button onClick={() => showToast("🔒 Verification Pending.", "error font-bold")} className="w-full bg-gray-400 text-white font-bold py-3 rounded-xl cursor-not-allowed">🔒 Verification Pending</button>
                                                                    ) : user.isTrained ? (
                                                                        <button onClick={() => updateStatus(item._id || item.id, 'In Transit', deliveryProof)} disabled={!deliveryProof} className="w-full bg-emerald-800 text-white font-bold py-3 rounded-xl disabled:opacity-50 transition-colors shadow-sm">Confirm Pickup</button>
                                                                    ) : (
                                                                        <button onClick={() => alert("Complete training in your profile!")} className="w-full bg-gray-200 text-gray-500 font-bold py-3 rounded-xl cursor-not-allowed">🔒 Training Required</button>
                                                                    )}
                                                                </div>
                                                            )
                                                        )}

                                                        {item.status === 'In Transit' && user.role === 'NGO' && isSameUser(item.claimedBy, user.id) && (
                                                            <button onClick={() => { setScanTargetId(item._id || item.id); setIsScanning(true); }} className="w-full bg-emerald-800 text-white font-bold py-3 rounded-xl hover:bg-emerald-900 transition-colors mt-2 shadow-sm flex justify-center items-center gap-2">📷 Scan QR to Receive</button>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </>
                        )}

                        {/* VIEW: REQUEST FOOD FORM (NGO Only) */}
                        {user.role === 'NGO' && view === 'request' && (
                            <div className="max-w-3xl mx-auto">
                                <div className="bg-white rounded-3xl border border-gray-200 shadow-sm overflow-hidden">
                                    <div className="bg-orange-600 p-8 text-white relative overflow-hidden">
                                        <div className="absolute top-0 right-0 w-64 h-64 bg-orange-500 rounded-full blur-3xl opacity-50 translate-x-1/2 -translate-y-1/2"></div>
                                        <h2 className="text-2xl font-bold mb-2">Request Food</h2>
                                        <p className="text-orange-100 text-sm">Post what your community needs. We'll match you with nearby donors.</p>
                                    </div>
                                    <div className="p-8 space-y-6">
                                        <div>
                                            <label className="block text-sm font-bold text-gray-700 mb-2">Title / Item Needed</label>
                                            <input type="text" value={needTitle} onChange={e => setNeedTitle(e.target.value)} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-orange-500 outline-none" placeholder="e.g. 50 Meals for Shelter" />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-bold text-gray-700 mb-2">Description</label>
                                            <textarea value={needDesc} onChange={e => setNeedDesc(e.target.value)} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-orange-500 outline-none h-28 resize-none" placeholder="Details about this request..." />
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div>
                                                <label className="block text-sm font-bold text-gray-700 mb-2">Quantity Needed</label>
                                                <div className="flex">
                                                    <input type="number" value={needQty} onChange={e => setNeedQty(e.target.value)} className="w-full bg-gray-50 border border-gray-200 rounded-l-xl px-4 py-3 focus:ring-2 focus:ring-orange-500 outline-none" />
                                                    <select value={needUnit} onChange={e => setNeedUnit(e.target.value)} className="bg-gray-100 border border-gray-200 border-l-0 rounded-r-xl px-3 outline-none font-bold text-gray-600">
                                                        <option>kg</option><option>servings</option><option>litres</option>
                                                    </select>
                                                </div>
                                            </div>
                                            <div>
                                                <label className="block text-sm font-bold text-gray-700 mb-2">Category</label>
                                                <select value={needCat} onChange={e => setNeedCat(e.target.value)} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-orange-500 outline-none">
                                                    <option>Cooked Meal</option><option>Raw Ingredients</option><option>Bakery Item</option>
                                                </select>
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div>
                                                <label className="block text-sm font-bold text-gray-700 mb-2">Urgency</label>
                                                <select value={needUrgency} onChange={e => setNeedUrgency(e.target.value)} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-orange-500 outline-none">
                                                    <option>Standard</option><option>High</option><option>Urgent</option>
                                                </select>
                                            </div>
                                            <div className="flex items-center gap-3 pt-8">
                                                <input type="checkbox" checked={isNeedPerishable} onChange={e => setIsNeedPerishable(e.target.checked)} className="w-5 h-5 accent-orange-600" id="perish" />
                                                <label htmlFor="perish" className="text-sm font-bold text-gray-700">Perishable items?</label>
                                            </div>
                                        </div>
                                        <button onClick={postFoodNeed} className="w-full bg-orange-600 text-white font-black py-4 rounded-xl hover:bg-orange-700 transition-all shadow-lg shadow-orange-600/20 text-lg">
                                            Post Request
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* VIEW: MY REQUESTS (NGO Only) */}
                        {user.role === 'NGO' && view === 'my-requests' && (
                            <div className="space-y-6">
                                <div className="flex justify-between items-center">
                                    <h2 className="text-2xl font-black text-gray-900">Your Active Requests</h2>
                                    <button onClick={() => setView('request')} className="bg-orange-600 text-white px-4 py-2 rounded-xl font-bold flex items-center gap-2 hover:bg-orange-700 transition-all"><PlusCircle size={18} /> New Request</button>
                                </div>
                                {myNeeds.length === 0 ? (
                                    <div className="bg-white p-12 rounded-3xl border border-dashed border-gray-300 text-center">
                                        <p className="text-gray-500 font-medium">No active food requests.</p>
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                        {myNeeds.map(need => (
                                            <div key={need._id} className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-md transition-shadow">
                                                <div className="p-6">
                                                    <div className="flex justify-between items-start mb-4">
                                                        <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${need.urgency === 'Urgent' ? 'bg-red-100 text-red-600' : 'bg-orange-100 text-orange-600'}`}>
                                                            {need.urgency}
                                                        </span>
                                                        <span className="text-xs text-gray-400 font-medium">{new Date(need.createdAt).toLocaleDateString()}</span>
                                                    </div>
                                                    <h3 className="font-bold text-gray-900 mb-1">{need.title}</h3>
                                                    <p className="text-xs text-gray-500 mb-4 line-clamp-2">{need.description}</p>
                                                    <div className="flex items-center gap-4 text-xs font-bold text-gray-700 border-t border-gray-50 pt-4">
                                                        <span>📦 {need.quantity} {need.unit}</span>
                                                        <span>🏷️ {need.category}</span>
                                                    </div>
                                                    <button onClick={() => deleteFoodNeed(need._id)} className="w-full mt-4 bg-gray-50 text-red-600 py-2 rounded-xl hover:bg-red-50 font-bold transition-colors">Cancel Request</button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}

                        {/* VIEW: DONATE FORM (Donor Only) */}
                        {user.role === 'Donor' && view === 'donate' && (
                            <div className="max-w-3xl mx-auto">
                                {user.isBanned ? (
                                    <div className="bg-white rounded-3xl border border-red-200 shadow-xl overflow-hidden p-12 text-center">
                                        <div className="w-20 h-20 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-6">
                                            <ShieldAlert size={40} />
                                        </div>
                                        <h2 className="text-3xl font-black text-gray-900 mb-4">Account Suspended</h2>
                                        <p className="text-gray-600 mb-8 max-w-lg mx-auto">
                                            Your access to post new donations has been restricted due to:
                                            <br />
                                            <span className="font-bold text-red-600 mt-2 inline-block">"{user.banReason || 'Low quality ratings'}"</span>
                                        </p>
                                        <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100 text-sm text-gray-500 mb-8 max-w-md mx-auto">
                                            We maintain high standards for food safety and donor reliability. If you believe this is an error, please contact our support team.
                                        </div>
                                        <button onClick={() => setView('feed')} className="bg-emerald-800 text-white font-bold py-4 px-8 rounded-xl hover:bg-emerald-900 transition-all shadow-lg">
                                            Return to Live Feed
                                        </button>
                                    </div>
                                ) : (
                                    <div className="bg-white rounded-3xl border border-gray-200 shadow-sm overflow-hidden">
                                        <div className="bg-emerald-900 p-8 text-white relative overflow-hidden">
                                            <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-800 rounded-full blur-3xl opacity-50 translate-x-1/2 -translate-y-1/2"></div>
                                            <div className="flex justify-between items-start relative z-10">
                                                <div>
                                                    <h2 className="text-2xl font-bold mb-2">Post a Donation</h2>
                                                    <p className="text-emerald-100 text-sm">Help reduce waste by listing your safe, surplus food.</p>
                                                </div>
                                                <button
                                                    onClick={() => { setShowDonationGuide(true); setDonationGuideStep(0); }}
                                                    className="bg-white/10 hover:bg-white/20 p-2 rounded-xl transition-all border border-white/10 group flex items-center gap-2"
                                                    title="Donation Guide"
                                                >
                                                    <HelpCircle size={20} className="text-emerald-100 group-hover:text-white" />
                                                    <span className="text-sm font-bold text-emerald-100 group-hover:text-white pr-2">Guide</span>
                                                </button>
                                            </div>
                                        </div>
                                        <div className="p-8 space-y-6">
                                            <div>
                                                <label className="block text-sm font-bold text-gray-700 mb-2">Food Title / Name</label>
                                                <div className="flex gap-2">
                                                    <input type="text" value={foodTitle} onChange={e => setFoodTitle(e.target.value)} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-emerald-500 outline-none" placeholder="e.g. 5 Trays of Vegetable Lasagna" />
                                                    <button onClick={startVoiceInput} className="bg-orange-100 text-orange-600 hover:bg-orange-200 px-4 rounded-xl transition-colors font-bold text-xl" title="Voice Input">🎤</button>
                                                </div>
                                            </div>

                                            <div>
                                                <label className="block text-sm font-bold text-gray-700 mb-2">Description</label>
                                                <div className="relative">
                                                    <textarea value={foodDesc} onChange={e => setFoodDesc(e.target.value)} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-emerald-500 outline-none h-28 resize-none" placeholder="Briefly describe the food..." maxLength="300" />
                                                    <span className="absolute bottom-3 right-3 text-xs text-gray-400 font-medium">{foodDesc.length}/300</span>
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                                <div>
                                                    <label className="block text-sm font-bold text-gray-700 mb-2">Quantity</label>
                                                    <div className="flex">
                                                        <input type="number" min="0.1" step="0.1" value={foodQty} onChange={e => setFoodQty(e.target.value)} className="w-full bg-gray-50 border border-gray-200 rounded-l-xl px-4 py-3 focus:ring-2 focus:ring-emerald-500 outline-none" />
                                                        <select value={foodUnit} onChange={e => setFoodUnit(e.target.value)} className="bg-gray-100 border border-gray-200 border-l-0 rounded-r-xl px-3 outline-none font-bold text-gray-600 focus:ring-2 focus:ring-emerald-500">
                                                            <option>kg</option><option>servings</option><option>litres</option>
                                                        </select>
                                                    </div>
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-bold text-gray-700 mb-2">Safe to eat for (Hours)</label>
                                                    <input type="number" min="1" value={foodExpiry} onChange={e => setFoodExpiry(e.target.value)} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-emerald-500 outline-none" />
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-bold text-gray-700 mb-2">Category</label>
                                                    <select value={foodCat} onChange={e => setFoodCat(e.target.value)} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-emerald-500 outline-none text-gray-700 font-medium">
                                                        <option>Cooked Meal</option><option>Raw Ingredients</option><option>Bakery Item</option>
                                                    </select>
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6 bg-emerald-50/50 rounded-2xl border border-emerald-100">
                                                <div>
                                                    <label className="block text-sm font-bold text-emerald-900 mb-2">🕒 Time Prepared</label>
                                                    <input
                                                        type="datetime-local"
                                                        value={timePrepared}
                                                        onChange={e => setTimePrepared(e.target.value)}
                                                        className="w-full bg-white border border-emerald-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-emerald-500 outline-none transition-all shadow-sm"
                                                    />
                                                    <p className="text-[10px] text-emerald-600 mt-1 font-medium italic">When was this food cooked or prepared?</p>
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-bold text-emerald-900 mb-2">⌛ Best Before</label>
                                                    <input
                                                        type="datetime-local"
                                                        value={bestBefore}
                                                        onChange={e => setBestBefore(e.target.value)}
                                                        className="w-full bg-white border border-emerald-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-emerald-500 outline-none transition-all shadow-sm"
                                                    />
                                                    <p className="text-[10px] text-emerald-600 mt-1 font-medium italic">Recommended deadline for safe consumption.</p>
                                                </div>
                                            </div>

                                            <div className="bg-orange-50 p-6 rounded-2xl border border-orange-100">
                                                <div className="flex items-center justify-between mb-4">
                                                    <h4 className="font-bold text-orange-900 flex items-center gap-2"><ShieldAlert size={18} /> Safety & Hygiene Checklist</h4>
                                                    <button onClick={() => setShowSafetyModal(true)} className="text-orange-600 hover:bg-orange-100 p-1.5 rounded-lg text-sm font-bold">Guidelines</button>
                                                </div>
                                                <div className="space-y-4">
                                                    <label className="flex items-center gap-3 cursor-pointer p-2 hover:bg-orange-100/50 rounded-lg transition-colors">
                                                        <input type="checkbox" checked={isFresh} onChange={e => setIsFresh(e.target.checked)} className="w-5 h-5 text-orange-600 rounded border-orange-300 focus:ring-orange-500" />
                                                        <span className="text-orange-900 font-medium text-sm">Food was prepared in the last 6 hours.</span>
                                                    </label>
                                                    <label className="flex items-center gap-3 cursor-pointer p-2 hover:bg-orange-100/50 rounded-lg transition-colors">
                                                        <input type="checkbox" checked={isHygienic} onChange={e => setIsHygienic(e.target.checked)} className="w-5 h-5 text-orange-600 rounded border-orange-300 focus:ring-orange-500" />
                                                        <span className="text-orange-900 font-medium text-sm">Stored in clean, food-grade containers.</span>
                                                    </label>
                                                    <div className="flex flex-col sm:flex-row sm:items-center gap-4 mt-2 pt-4 border-t border-orange-200/50">
                                                        <div className="flex items-center gap-3">
                                                            <label className="font-bold text-orange-900 text-sm">Dietary:</label>
                                                            <select value={dietaryType} onChange={e => setDietaryType(e.target.value)} className="bg-white border border-orange-200 rounded-lg px-3 py-2 text-sm outline-none font-bold text-gray-700 focus:ring-2 focus:ring-orange-500">
                                                                <option value="Veg">Veg 🟢</option>
                                                                <option value="Non-Veg">Non-Veg 🔴</option>
                                                                <option value="Vegan">Vegan 🌱</option>
                                                            </select>
                                                        </div>
                                                        <div className="flex items-center gap-3">
                                                            <label className="font-bold text-orange-900 text-sm">Temp:</label>
                                                            <select value={temperature} onChange={e => setTemperature(e.target.value)} className="bg-white border border-orange-200 rounded-lg px-3 py-2 text-sm outline-none font-bold text-gray-700 focus:ring-2 focus:ring-orange-500"><option>Hot</option><option>Cold</option></select>
                                                        </div>
                                                        <label className="flex items-center gap-2 cursor-pointer sm:ml-4 bg-white px-3 py-2 rounded-lg border border-orange-200">
                                                            <input type="checkbox" checked={reqFridge} onChange={e => setReqFridge(e.target.checked)} className="w-4 h-4 text-emerald-600 rounded focus:ring-emerald-500" />
                                                            <span className="text-orange-900 font-bold text-sm">Needs Fridge?</span>
                                                        </label>
                                                    </div>
                                                    <div className="pt-4 border-t border-orange-200/50">
                                                        <label className="flex items-center gap-3 cursor-pointer p-2 hover:bg-orange-100/50 rounded-lg transition-colors">
                                                            <input type="checkbox" checked={hasAllergens} onChange={e => setHasAllergens(e.target.checked)} className="w-5 h-5 text-orange-600 rounded border-orange-300 focus:ring-orange-500" />
                                                            <span className="text-orange-900 font-bold text-sm">Contains Allergens? (Nuts, Dairy, etc.)</span>
                                                        </label>
                                                        {hasAllergens && (
                                                            <div className="mt-2 pl-10 animate-in fade-in slide-in-from-top-2 duration-300">
                                                                <input
                                                                    type="text"
                                                                    placeholder="List allergens (e.g. Peanuts, Milk, Soy)"
                                                                    className="w-full bg-white border border-orange-200 rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-orange-500 outline-none text-orange-900 font-medium"
                                                                    value={Array.isArray(allergens) ? allergens.join(', ') : allergens}
                                                                    onChange={(e) => setAllergens(e.target.value.split(',').map(s => s.trim()))}
                                                                />
                                                            </div>
                                                        )}
                                                        <div className="pt-4 border-t border-orange-200/50">
                                                            <label className="block text-xs font-bold text-orange-900 mb-2">Specific Handling Instructions (Optional)</label>
                                                            <textarea
                                                                value={handlingInstructions}
                                                                onChange={e => setHandlingInstructions(e.target.value)}
                                                                className="w-full bg-white border border-orange-200 rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-orange-500 outline-none text-orange-900 font-medium h-20 resize-none"
                                                                placeholder="e.g. Keep flat, refrigerate immediately upon arrival, contains fragile containers..."
                                                                maxLength="200"
                                                            />
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            <div>
                                                <label className="block text-sm font-bold text-gray-700 mb-2">Upload Photo</label>
                                                <div className="border-2 border-dashed border-gray-300 rounded-2xl p-6 bg-gray-50 text-center hover:bg-gray-100 transition-colors">
                                                    <input type="file" accept="image/*" onChange={(e) => handleImageUpload(e)} className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-bold file:bg-emerald-100 file:text-emerald-800 hover:file:bg-emerald-200 transition-colors cursor-pointer" />
                                                </div>
                                                {isUploading && <p className="text-orange-600 font-bold text-sm mt-2 flex items-center gap-2">Uploading Image...</p>}
                                                {foodImage && <div className="mt-4"><img src={foodImage} alt="Preview" className="w-32 h-32 object-cover rounded-xl shadow-sm border border-gray-200" /><p className="text-emerald-600 font-bold text-sm mt-1">✓ Uploaded</p></div>}
                                            </div>

                                            {/* Map Section */}
                                            <div>
                                                <div className="flex justify-between items-center mb-2">
                                                    <label className="block text-sm font-bold text-gray-700">Pickup Location</label>
                                                    <button onClick={handleGetLocation} type="button" className="text-sm font-bold text-emerald-600 hover:text-emerald-800 bg-emerald-50 px-3 py-1 rounded-lg transition-colors">
                                                        {isLocating ? 'Locating...' : '📍 Use My Location'}
                                                    </button>
                                                </div>
                                                <div className="h-[250px] w-full rounded-2xl overflow-hidden border border-gray-200 shadow-inner bg-gray-100">
                                                    {hasLocation ? (
                                                        <MapContainer center={[location.lat, location.lng]} zoom={14} style={{ height: '100%', width: '100%' }}>
                                                            <ChangeView center={[location.lat, location.lng]} />
                                                            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                                                            <Marker draggable={true} eventHandlers={eventHandlers} position={[location.lat, location.lng]} ref={markerRef}>
                                                                <Popup>Drag to adjust. <br />{location.lat.toFixed(4)}, {location.lng.toFixed(4)}</Popup>
                                                            </Marker>
                                                        </MapContainer>
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center text-gray-400 font-medium">Click 'Use My Location' to load map.</div>
                                                    )}
                                                </div>
                                                <input type="text" placeholder="Gate Code / Landmark instructions (Optional)" value={pickupNote} onChange={e => setPickupNote(e.target.value)} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-emerald-500 outline-none mt-3" />
                                            </div>

                                            <div className="pt-6 border-t border-gray-100 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                                                <div>
                                                    <label className="block text-sm font-bold text-gray-700 mb-2">Digital Signature (Initials) *</label>
                                                    <input type="text" value={donorInitials} onChange={e => setDonorInitials(e.target.value)} className={`w-24 bg-gray-50 border ${donorInitials ? 'border-emerald-500 bg-emerald-50' : 'border-gray-300'} rounded-xl px-4 py-3 focus:ring-2 focus:ring-emerald-500 outline-none text-center font-black text-xl uppercase tracking-widest`} placeholder="JD" maxLength="3" />
                                                </div>
                                                <button onClick={postDonation} disabled={isUploading || !donorInitials} className="w-full sm:w-auto bg-emerald-800 hover:bg-emerald-900 text-white font-bold px-8 py-4 rounded-xl shadow-lg shadow-emerald-900/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed">
                                                    {isUploading ? 'Waiting...' : (isEditingListing ? 'Update Donation' : 'Post to Live Feed')}
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* VIEW: PROFILE */}
                        {view === 'profile' && (
                            <div className="max-w-3xl mx-auto bg-white rounded-3xl border border-gray-200 shadow-sm overflow-hidden">
                                <div className="bg-gray-50 px-6 py-5 border-b border-gray-200 flex justify-between items-center">
                                    <h2 className="text-xl font-bold text-gray-900">Account Profile</h2>
                                    <button onClick={startEditing} className="text-sm font-bold bg-white border border-gray-200 px-4 py-2 rounded-xl hover:bg-gray-100 transition-colors shadow-sm">✏️ Edit Details</button>
                                </div>
                                <div className="p-6 md:p-8">
                                    {!isEditingProfile ? (
                                        <div className="space-y-8">
                                            {/* Top info */}
                                            <div className="flex items-center gap-6 pb-6 border-b border-gray-100">
                                                <div className="w-20 h-20 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center font-black text-3xl border-4 border-emerald-50 shadow-sm">
                                                    {user?.name?.charAt(0).toUpperCase() || '?'}
                                                </div>
                                                <div>
                                                    <h3 className="text-2xl font-bold text-gray-900">{user.name}</h3>
                                                    <div className="flex items-center gap-2 mt-1">
                                                        <span className="bg-gray-100 text-gray-700 text-xs font-bold px-2 py-1 rounded-md">{user.role}</span>
                                                        {user.isVerified ? <span className="text-emerald-600 text-xs font-bold flex items-center gap-1"><CheckCircle2 size={14} /> Verified</span> : <span className="text-orange-500 text-xs font-bold flex items-center gap-1"><ShieldAlert size={14} /> Pending Verification</span>}
                                                        {user.isBanned && <span className="text-red-600 bg-red-50 text-[10px] font-black px-2 py-1 rounded-md border border-red-100 flex items-center gap-1 animate-pulse"><ShieldAlert size={12} /> BANNED</span>}
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Stats / Details grid */}
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-8 text-sm">
                                                <div><span className="text-gray-400 font-medium block mb-1">Email Address</span><span className="font-bold text-gray-900">{user.email || 'Not provided'}</span></div>
                                                <div><span className="text-gray-400 font-medium block mb-1">Phone Number</span><span className="font-bold text-gray-900">{user.phone || 'Not provided'}</span></div>
                                                <div className="col-span-1 md:col-span-2"><span className="text-gray-400 font-medium block mb-1">Primary Address</span><span className="font-bold text-gray-900">{user.address || 'Not provided'}</span></div>
                                                {user.role === 'NGO' && (
                                                    <>
                                                        <div><span className="text-gray-400 font-medium block mb-1">❄️ Fridge Capacity</span><span className="font-bold text-gray-900">{user.ngoCapacity?.fridge || 'Not specified'}</span></div>
                                                        <div><span className="text-gray-400 font-medium block mb-1">📦 Dry Storage</span><span className="font-bold text-gray-900">{user.ngoCapacity?.dryStorage || 'Not specified'}</span></div>
                                                        <div className="col-span-1 md:col-span-2 border-t border-gray-50 pt-4">
                                                            <span className="text-gray-400 font-medium block mb-2 text-xs uppercase tracking-wider">🤝 Populations Served</span>
                                                            <div className="flex flex-wrap gap-2">
                                                                {(user.servedGroups || 'General').split(',').map((tag, i) => (
                                                                    <span key={i} className="bg-emerald-50 text-emerald-700 text-xs font-bold px-3 py-1.5 rounded-full border border-emerald-100 flex items-center gap-1">
                                                                        {tag.trim()}
                                                                    </span>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    </>
                                                )}
                                            </div>

                                            {/* Donation Stats */}
                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100 flex flex-col justify-center">
                                                    <span className="text-sm text-gray-500 font-medium mb-1">Total Deliveries</span>
                                                    <span className="text-3xl font-black text-gray-900">{user.totalDeliveries || 0}</span>
                                                </div>
                                                <div className="bg-emerald-50 p-6 rounded-2xl border border-emerald-100 flex flex-col justify-center">
                                                    <span className="text-sm text-emerald-800 font-medium mb-1">Average Rating</span>
                                                    <span className="text-3xl font-black text-emerald-900">
                                                        {userStats.avgRating > 0 ? `⭐ ${userStats.avgRating}` : 'N/A'}
                                                    </span>
                                                </div>
                                            </div>

                                            {/* Badges Section */}
                                            {user.role === 'Volunteer' && (
                                                <div className="pt-6 border-t border-gray-100">
                                                    <h4 className="text-sm font-bold text-gray-900 mb-4 flex items-center gap-2">🏆 Achievement Badges</h4>
                                                    {user.badges && user.badges.length > 0 ? (
                                                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                                            {user.badges.map((badge, idx) => (
                                                                <div key={idx} className="flex flex-col items-center p-4 bg-emerald-50 rounded-2xl border border-emerald-100 text-center">
                                                                    <span className="text-3xl mb-2">
                                                                        {badge === 'Night Owl' ? '🦉' : badge === 'Weekend Warrior' ? '⚔️' : badge === 'Early Bird' ? '☀️' : badge === 'Community Hero' ? '🏅' : '🏆'}
                                                                    </span>
                                                                    <span className="text-[10px] font-bold text-emerald-900 uppercase tracking-tighter">{badge}</span>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    ) : (
                                                        <div className="bg-gray-50 p-6 rounded-2xl border border-dashed border-gray-200 text-center">
                                                            <p className="text-sm text-gray-500 italic">No badges earned yet. Complete deliveries at different times to unlock achievements! ✨</p>
                                                        </div>
                                                    )}
                                                </div>
                                            )}

                                            {/* Account Statistics / ESG Banner */}
                                            <div className="bg-gradient-to-br from-emerald-800 to-emerald-950 p-8 rounded-3xl text-white flex justify-between items-center shadow-lg relative overflow-hidden">
                                                <div className="absolute -right-4 -top-4 opacity-10"><Leaf size={120} /></div>
                                                <div className="relative z-10">
                                                    <h4 className="text-emerald-200 font-medium text-sm mb-2 uppercase tracking-widest">Sustainability Credits</h4>
                                                    <div className="text-5xl font-black">{user.credits || 0}</div>
                                                </div>
                                                <div className="relative z-10 text-right">
                                                    {user.role === 'Donor' && <div className="text-sm font-bold text-orange-400 bg-emerald-900/50 px-3 py-1.5 rounded-lg border border-emerald-700/50">Rank: {getDonorBadge(myListings.length)}</div>}
                                                </div>
                                            </div>

                                            {/* Danger Zone */}
                                            <div className="bg-red-50 p-6 rounded-2xl border border-red-100 mt-8">
                                                <div className="flex items-center gap-2 mb-4 text-red-900 font-bold">
                                                    <Trash2 size={18} /> Danger Zone
                                                </div>
                                                <div className="flex flex-col sm:flex-row gap-4">
                                                    <div className="flex-1">
                                                        <h5 className="text-sm font-bold text-red-900 mb-1">Deactivate Account</h5>
                                                        <p className="text-xs text-red-700">Temporarily hide your profile. Logging back in will reactivate it.</p>
                                                    </div>
                                                    <button onClick={deactivateAccount} className="bg-white text-red-600 border border-red-200 px-4 py-2 rounded-xl text-sm font-bold hover:bg-red-50 transition-colors">Deactivate</button>
                                                </div>
                                                <div className="mt-6 pt-6 border-t border-red-200/50 flex flex-col sm:flex-row gap-4">
                                                    <div className="flex-1">
                                                        <h5 className="text-sm font-bold text-red-900 mb-1">Permanently Delete</h5>
                                                        <p className="text-xs text-red-700">Wipe all your data from our database. This cannot be undone.</p>
                                                    </div>
                                                    <button onClick={deleteAccount} className="bg-red-600 text-white px-4 py-2 rounded-xl text-sm font-bold hover:bg-red-700 transition-colors shadow-sm">Delete Forever</button>
                                                </div>
                                            </div>

                                            {/* Volunteer Availability Toggle */}
                                            {user.role === 'Volunteer' && (
                                                <div className="bg-gray-50 p-6 rounded-2xl border border-gray-200 flex flex-col sm:flex-row justify-between items-center gap-4">
                                                    <div>
                                                        <span className="font-bold text-gray-900 block mb-1">Dispatch Availability</span>
                                                        <span className="text-xs text-gray-500 font-medium">Turn off if you are taking a break.</span>
                                                    </div>
                                                    <label className="relative inline-flex items-center cursor-pointer">
                                                        <input type="checkbox" checked={volunteerAvailable} onChange={async (e) => { const newVal = e.target.checked; setVolunteerAvailable(newVal); try { await axios.put(`${API_URL}/auth/update`, { isAvailable: newVal }, { headers: { 'x-auth-token': localStorage.getItem('token') } }); } catch { console.error("Availability update failed"); } }} className="sr-only peer" />
                                                        <div className="w-14 h-7 bg-gray-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-emerald-600 shadow-inner"></div>
                                                    </label>
                                                </div>
                                            )}
                                        </div>
                                    ) : (
                                        <div className="space-y-5">
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                                <div><label className="block text-sm font-bold text-gray-700 mb-1">Full Name</label><input type="text" value={editName} onChange={e => setEditName(e.target.value)} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-emerald-500 outline-none text-gray-900" /></div>
                                                <div><label className="block text-sm font-bold text-gray-700 mb-1">Phone</label><input type="text" value={editPhone} onChange={e => setEditPhone(e.target.value)} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-emerald-500 outline-none text-gray-900" /></div>
                                            </div>
                                            <div><label className="block text-sm font-bold text-gray-700 mb-1">Address</label><input type="text" value={editAddress} onChange={e => setEditAddress(e.target.value)} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-emerald-500 outline-none text-gray-900" /></div>

                                            {user.role === 'NGO' && (
                                                <div className="space-y-4">
                                                    <div className="bg-blue-50/50 p-6 rounded-2xl border border-blue-100 space-y-4">
                                                        <h4 className="text-sm font-bold text-blue-900 flex items-center gap-2">🏢 Storage Capacity (NGO Only)</h4>
                                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                            <div>
                                                                <label className="block text-xs font-bold text-blue-700 mb-1">Fridge Capacity (e.g. 50kg, 2 Fridges)</label>
                                                                <input type="text" placeholder="e.g. 50kg / 2 units" value={editFridge} onChange={e => setEditFridge(e.target.value)} className="w-full bg-white border border-blue-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 outline-none text-gray-900" />
                                                            </div>
                                                            <div>
                                                                <label className="block text-xs font-bold text-blue-700 mb-1">Dry Storage (e.g. 100 sq ft, 20 Crates)</label>
                                                                <input type="text" placeholder="e.g. 100 sq ft / 20 crates" value={editDry} onChange={e => setEditDry(e.target.value)} className="w-full bg-white border border-blue-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 outline-none text-gray-900" />
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <div className="bg-emerald-50/50 p-6 rounded-2xl border border-emerald-100">
                                                        <h4 className="text-sm font-bold text-emerald-900 mb-3">🤝 Who do you serve? (NGO Only)</h4>
                                                        <div className="flex flex-wrap gap-2">
                                                            {['General', 'Children', 'Elderly', 'Homeless', 'Refugees', 'Low Income Families', 'Disaster Victims', 'Single Parents'].map((tag) => (
                                                                <button
                                                                    key={tag}
                                                                    onClick={() => {
                                                                        const tags = editServedGroups.split(',').map(t => t.trim()).filter(t => t !== '');
                                                                        if (tags.includes(tag)) {
                                                                            setEditServedGroups(tags.filter(t => t !== tag).join(', ') || 'General');
                                                                        } else {
                                                                            setEditServedGroups([...tags.filter(t => t !== 'General'), tag].join(', '));
                                                                        }
                                                                    }}
                                                                    type="button"
                                                                    className={`px-4 py-2 rounded-xl text-xs font-bold border transition-all ${editServedGroups.includes(tag) ? 'bg-emerald-600 border-emerald-700 text-white shadow-sm' : 'bg-white border-emerald-100 text-emerald-800 hover:bg-emerald-50'}`}
                                                                >
                                                                    {tag}
                                                                </button>
                                                            ))}
                                                        </div>
                                                        <input type="hidden" value={editServedGroups} />
                                                        <p className="text-[10px] text-emerald-600 mt-3 font-medium italic">* Selected populations will appear on your public profile tags.</p>
                                                    </div>
                                                </div>
                                            )}

                                            {(user.role === 'NGO' || user.role === 'Volunteer') && (
                                                <div className="bg-orange-50/50 p-6 rounded-2xl border border-orange-100 mt-4">
                                                    <div className="flex justify-between items-start mb-4">
                                                        <div>
                                                            <h4 className="text-sm font-bold text-orange-900">📍 Service Area Definition</h4>
                                                            <p className="text-xs text-orange-700">Set your base location and service radius.</p>
                                                        </div>
                                                        <button
                                                            type="button"
                                                            onClick={() => {
                                                                if (navigator.geolocation) {
                                                                    navigator.geolocation.getCurrentPosition((pos) => {
                                                                        setEditLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
                                                                    });
                                                                }
                                                            }}
                                                            className="text-xs font-bold text-orange-600 hover:text-orange-800 bg-orange-100 px-3 py-1.5 rounded-lg transition-colors"
                                                        >
                                                            Use My Location
                                                        </button>
                                                    </div>

                                                    {/* Radius Slider */}
                                                    <div className="mb-4 bg-white p-4 rounded-xl border border-orange-200 shadow-sm">
                                                        <div className="flex justify-between items-center mb-2">
                                                            <label className="text-xs font-bold text-orange-800">Maximum Service Distance</label>
                                                            <span className="text-sm font-black text-orange-600">{editServiceRadius} km</span>
                                                        </div>
                                                        <input
                                                            type="range"
                                                            min="1"
                                                            max="50"
                                                            value={editServiceRadius}
                                                            onChange={(e) => setEditServiceRadius(Number(e.target.value))}
                                                            className="w-full h-2 bg-orange-200 rounded-lg appearance-none cursor-pointer accent-orange-600"
                                                        />
                                                    </div>

                                                    {/* Interactive Leaflet Map */}
                                                    <div className="h-[250px] w-full rounded-xl overflow-hidden border border-orange-200 shadow-inner bg-gray-100 relative z-0">
                                                        {editLocation ? (
                                                            <MapContainer center={[editLocation.lat, editLocation.lng]} zoom={11} style={{ height: '100%', width: '100%', zIndex: 0 }}>
                                                                <ChangeView center={[editLocation.lat, editLocation.lng]} />
                                                                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                                                                <Marker
                                                                    draggable={true}
                                                                    position={[editLocation.lat, editLocation.lng]}
                                                                    eventHandlers={{
                                                                        dragend: (e) => {
                                                                            const marker = e.target;
                                                                            const position = marker.getLatLng();
                                                                            setEditLocation({ lat: position.lat, lng: position.lng });
                                                                        }
                                                                    }}
                                                                >
                                                                    <Popup>Drag to set your base location.</Popup>
                                                                </Marker>
                                                            </MapContainer>
                                                        ) : (
                                                            <div className="w-full h-full flex items-center justify-center text-gray-400 text-sm font-medium">Loading map...</div>
                                                        )}
                                                    </div>
                                                </div>
                                            )}

                                            {/* Profile Verification Document Section (Only for Unverified Users) */}
                                            {!user.isVerified && (
                                                <div className="bg-emerald-50/50 p-6 rounded-2xl border border-emerald-100 mt-4">
                                                    <label className="block text-sm font-bold text-emerald-900 mb-2">Verification Document (ID/Certificate/Proof) *</label>
                                                    <p className="text-xs text-emerald-700 mb-4 font-medium italic">Please upload a valid document to verify your account and gain full access.</p>
                                                    <div className="border-2 border-dashed border-emerald-200 rounded-xl p-4 bg-white text-center">
                                                        <input type="file" accept="image/*" onChange={(e) => handleImageUpload(e, 'profile')} className="w-full text-xs text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-emerald-100 file:text-emerald-800 hover:file:bg-emerald-200 cursor-pointer" />
                                                    </div>
                                                    {isUploading && <p className="text-emerald-600 font-bold text-xs mt-2 animate-pulse">Uploading Document...</p>}
                                                    {verificationDoc && (
                                                        <div className="mt-4 flex items-center gap-4 bg-white p-3 rounded-xl border border-emerald-100">
                                                            <img src={verificationDoc} alt="Document Preview" className="w-16 h-16 object-cover rounded-lg border border-gray-100 shadow-sm" />
                                                            <div>
                                                                <p className="text-xs font-bold text-emerald-700">✓ Document Ready</p>
                                                                <p className="text-[10px] text-gray-400">Will be saved upon profile update.</p>
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            )}

                                            <div className="pt-6 border-t border-gray-100 flex gap-3">
                                                <button onClick={updateProfile} className="bg-emerald-800 text-white font-bold py-3 px-8 rounded-xl hover:bg-emerald-900 transition-colors shadow-md">Save Changes</button>
                                                <button onClick={() => setIsEditingProfile(false)} className="bg-gray-100 text-gray-700 font-bold py-3 px-8 rounded-xl hover:bg-gray-200 transition-colors border border-gray-200">Cancel</button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* VIEW: ADMIN */}
                        {view === 'admin' && user.role === 'Admin' && (
                            <div className="max-w-5xl mx-auto space-y-8">
                                <div className="bg-white rounded-3xl border border-gray-200 shadow-sm overflow-hidden p-8">
                                    <h3 className="text-xl font-bold text-gray-900 mb-6 border-b border-gray-100 pb-4">🛡️ User Verifications</h3>
                                    <div className="divide-y divide-gray-100">
                                        {allUsers.length === 0 ? <p className="text-gray-500 text-sm py-4">No users found.</p> : allUsers.map(u => (
                                            <div key={u._id} className="py-4 flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                                                <div>
                                                    <p className="font-bold text-gray-900">{u.name} <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded ml-2">{u.role}</span></p>
                                                    <p className="text-sm mt-1">{u.verificationDocument ? <a href={u.verificationDocument} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline font-medium">📄 View Document</a> : <span className="text-red-500 font-medium">No Document Uploaded</span>}</p>
                                                </div>
                                                <div className="flex gap-2">
                                                    {u.isVerified ? <span className="text-emerald-600 font-bold bg-emerald-50 px-4 py-2 rounded-xl text-sm border border-emerald-100">✓ Verified</span> : <button onClick={() => verifyUser(u._id)} className="bg-emerald-600 text-white font-bold px-6 py-2 rounded-xl hover:bg-emerald-700 transition-colors text-sm">Approve User</button>}
                                                    {u.isBanned && (
                                                        <button
                                                            onClick={async () => {
                                                                try {
                                                                    await axios.put(`${API_URL}/auth/admin/unban/${u._id}`, {}, { headers: { 'x-auth-token': localStorage.getItem('token') } });
                                                                    showToast('User unbanned successfully', 'success');
                                                                    fetchUsers();
                                                                } catch {
                                                                    showToast('Unban failed', 'error');
                                                                }
                                                            }}
                                                            className="bg-orange-500 text-white font-bold px-6 py-2 rounded-xl hover:bg-orange-600 transition-colors text-sm"
                                                        >
                                                            Unban
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="bg-white rounded-3xl border border-gray-200 shadow-sm overflow-hidden p-8">
                                    <h3 className="text-xl font-bold text-gray-900 mb-6 border-b border-gray-100 pb-4">🚩 Reported Content</h3>
                                    <div className="space-y-4">
                                        {reportedItems.length === 0 ? <p className="text-gray-500 text-sm py-4">No active reports.</p> : reportedItems.map(item => (
                                            <div key={item._id} className="bg-red-50 p-6 rounded-2xl border border-red-100">
                                                <div className="flex justify-between items-start mb-2">
                                                    <strong className="text-red-900 font-bold text-lg">{item.title}</strong>
                                                    <span className="text-xs text-red-500 font-bold bg-white px-2 py-1 rounded border border-red-200">ID: {item._id.substring(0, 6)}...</span>
                                                </div>
                                                <p className="text-sm text-red-800 mb-1">Posted by: <strong>{item.donor?.name || 'Unknown'}</strong></p>
                                                <p className="text-sm text-red-800 mb-4 bg-white/50 p-3 rounded-lg inline-block font-medium border border-red-200/50">Reason: {item.reports[0]?.reason}</p>
                                                <div className="flex gap-3">
                                                    <button onClick={() => deleteListing(item._id)} className="bg-red-600 text-white font-bold py-2 px-6 rounded-xl hover:bg-red-700 transition-colors text-sm shadow-sm">Delete Item</button>
                                                    <button onClick={() => alert("Warning sent to user.")} className="bg-white text-gray-700 border border-gray-300 font-bold py-2 px-6 rounded-xl hover:bg-gray-50 transition-colors text-sm shadow-sm">Warn User</button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}

                        <div className="flex justify-center pt-8 pb-4">
                            <button
                                onClick={() => { setIsReportingBug(true); setBugContent(''); }}
                                className="text-[10px] text-gray-400 hover:text-emerald-600 transition-colors uppercase tracking-widest font-bold"
                            >
                                Report Bug
                            </button>
                        </div>
                    </div>
                </div>
            </main >
        </div >
    );
}