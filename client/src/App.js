import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import QRCode from 'react-qr-code'; 
import './App.css'; 

// ==========================================
// 1. TRANSLATION DICTIONARY
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
        pickup: "📍 Pickup Details"
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
        pickup: "📍 पिकअप विवरण"
    }
};

function App() {
  const API_URL = "http://localhost:5000/api";

  // ==========================================
  // 2. STATE MANAGEMENT
  // ==========================================
  
  // User Data
  const [user, setUser] = useState({ 
      id: null, 
      name: '', 
      role: '', 
      phone: '', 
      address: '' 
  });
  
  // App Data
  const [listings, setListings] = useState([]);      
  const [myListings, setMyListings] = useState([]);  
  const [stats, setStats] = useState({ 
      total_donations: 0, 
      meals_saved: 0, 
      co2_saved: 0 
  });
  const [leaderboard, setLeaderboard] = useState([]); 
  
  // Navigation & UI
  const [view, setView] = useState('feed');          
  const [showQR, setShowQR] = useState(null);
  const [showPassword, setShowPassword] = useState(false); 
  const [showStats, setShowStats] = useState(true); // NEW: Toggle Stats State
  
  // UX Settings
  const [lang, setLang] = useState('en'); 
  const [highContrast, setHighContrast] = useState(false); 
  const [showTerms, setShowTerms] = useState(false); 
  const t = translations[lang]; 

  // Auth Forms
  const [isRegistering, setIsRegistering] = useState(false); 
  const [isEditingProfile, setIsEditingProfile] = useState(false);

  // Profile Edit Inputs
  const [editName, setEditName] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editAddress, setEditAddress] = useState('');

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
  
  // Donation Details
  const [isVeg, setIsVeg] = useState(true);          
  const [reqFridge, setReqFridge] = useState(false); 
  const [temperature, setTemperature] = useState('Hot');

  // Safety Checklist Inputs
  const [isFresh, setIsFresh] = useState(false);
  const [isHygienic, setIsHygienic] = useState(false);
  const [hasAllergens, setHasAllergens] = useState(false);


  // ==========================================
  // 3. AUTO-SAVE LOGIC
  // ==========================================
  
  // Load Draft on Startup
  useEffect(() => {
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
  }, []);

  // Save Draft on Change
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
  // 4. API CALLS
  // ==========================================
  const fetchListings = useCallback(async () => {
    try {
      const res = await axios.get(`${API_URL}/listings/`, {
          params: { search: searchTerm, category: filterCategory, filterVeg: filterVeg }
      });
      setListings(res.data);
    } catch (err) { console.error("Error fetching listings", err); }
  }, [searchTerm, filterCategory, filterVeg]);

  const fetchStats = useCallback(async () => {
    try {
      const resStats = await axios.get(`${API_URL}/stats/`);
      setStats(resStats.data);
      const resLeader = await axios.get(`${API_URL}/stats/leaderboard`);
      setLeaderboard(resLeader.data);
    } catch (err) { console.error("Error fetching stats", err); }
  }, []);

  const fetchMyHistory = useCallback(async () => {
    if (!user.id) return;
    try {
      const res = await axios.get(`${API_URL}/listings/`); 
      setMyListings(res.data);
    } catch (err) { console.error("Error loading history"); }
  }, [user.id]);

  useEffect(() => {
    fetchListings();
    fetchStats();
    
    const savedId = localStorage.getItem('user_id');
    const savedRole = localStorage.getItem('user_role');
    const savedName = localStorage.getItem('user_name');
    const savedPhone = localStorage.getItem('user_phone'); 
    const savedAddress = localStorage.getItem('user_address');
    const token = localStorage.getItem('token');
    
    if (savedId && token) {
        setUser({ 
            id: savedId, 
            role: savedRole, 
            name: savedName, 
            phone: savedPhone || '', 
            address: savedAddress || '' 
        });
    }
  }, [fetchListings, fetchStats]); 

  useEffect(() => { 
      if(user.id) fetchMyHistory(); 
  }, [user.id, fetchMyHistory]);


  // ==========================================
  // 5. HELPER FUNCTIONS
  // ==========================================
  const getDonorBadge = (count) => {
      if (count >= 10) return '🏆 Legend';
      if (count >= 5) return '⭐ Super Donor';
      if (count >= 1) return '🥉 Contributor';
      return '🌱 Newbie';
  };

  // NEW: Category Icons Helper (Task 3.1.2)
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
      alert("📋 Impact stats copied to clipboard!");
  };

  const isUrgent = (createdAt, expiryHours) => {
      const created = new Date(createdAt).getTime();
      const expires = created + (expiryHours * 60 * 60 * 1000);
      const now = Date.now();
      const timeLeft = expires - now;
      return timeLeft > 0 && timeLeft < 3600000;
  };

  const timeAgo = (dateString) => {
      const seconds = Math.floor((new Date() - new Date(dateString)) / 1000);
      let interval = seconds / 31536000;
      if (interval > 1) return Math.floor(interval) + "y ago";
      interval = seconds / 2592000;
      if (interval > 1) return Math.floor(interval) + "mo ago";
      interval = seconds / 86400;
      if (interval > 1) return Math.floor(interval) + "d ago";
      interval = seconds / 3600;
      if (interval > 1) return Math.floor(interval) + "h ago";
      interval = seconds / 60;
      if (interval > 1) return Math.floor(interval) + "m ago";
      return "Just now";
  };

  const openMap = (address) => {
      if(!address) return;
      const url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;
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
  // 6. AUTH ACTIONS
  // ==========================================
  const registerUser = async () => {
    if (!agreeTerms) {
        return alert("⚠️ You must agree to the Terms & Conditions.");
    }
    
    if (regRole === 'NGO' && !regNgoNumber) {
        return alert("⚠️ NGOs must provide a Registration Number.");
    }

    try {
      const res = await axios.post(`${API_URL}/auth/register`, { 
          name: regName, email: regEmail, password: regPassword, role: regRole,
          phone: regPhone, address: regAddress,
          ngoRegNumber: regNgoNumber 
      });
      handleAuthSuccess(res.data);
      alert(`✅ Registration successful!`);
    } catch (err) { alert("Registration failed."); }
  };

  const loginUser = async () => {
    try {
      const res = await axios.post(`${API_URL}/auth/login`, { email: regEmail, password: regPassword });
      handleAuthSuccess(res.data);
      alert(`✅ Login successful!`);
    } catch (err) { alert("Login failed."); }
  };

  const updateProfile = async () => {
    try {
        const token = localStorage.getItem('token');
        const config = { headers: { 'x-auth-token': token } };
        const res = await axios.put(`${API_URL}/auth/update`, { name: editName, phone: editPhone, address: editAddress }, config);
        const updatedUser = { ...user, ...res.data };
        setUser(updatedUser);
        localStorage.setItem('user_name', updatedUser.name);
        localStorage.setItem('user_phone', updatedUser.phone);
        localStorage.setItem('user_address', updatedUser.address);
        setIsEditingProfile(false);
        alert("✅ Profile Updated!");
    } catch (err) { alert("Error updating profile."); }
  };

  const startEditing = () => {
      setEditName(user.name);
      setEditPhone(user.phone);
      setEditAddress(user.address);
      setIsEditingProfile(true);
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
    setRegPassword('');
    fetchMyHistory();
  };

  const logout = () => {
    localStorage.clear();
    setUser({ id: null, name: '', role: '', phone: '', address: '' });
    window.location.reload(); 
  };


  // ==========================================
  // 7. LISTING ACTIONS
  // ==========================================
  const postDonation = async () => {
    if (user.role !== 'Donor') return alert("Only Donors can post!");
    
    const qty = parseFloat(foodQty);
    const expiry = parseInt(foodExpiry);
    
    if (isNaN(qty) || qty <= 0) return alert("⚠️ Quantity must be positive.");
    
    // FEATURE: Character Count Check
    if (foodDesc.length > 300) return alert("⚠️ Description too long (max 300 chars).");
    
    try {
      const token = localStorage.getItem('token');
      const config = { headers: { 'x-auth-token': token, 'Content-Type': 'application/json' } };
      
      await axios.post(`${API_URL}/listings/`, {
        title: foodTitle, description: foodDesc, quantity: qty,
        unit: foodUnit, category: foodCat, expiry_hours: expiry,
        isFresh, isHygienic, hasAllergens, temperature, safetyCheck: true,
        isVeg, 
        requiresRefrigeration: reqFridge
      }, config);

      alert("✅ Food Listed!");
      fetchListings(); fetchStats(); fetchMyHistory(); 
      
      setFoodTitle(''); setFoodDesc(''); setFoodQty(''); setFoodExpiry(''); 
      setIsVeg(true); setReqFridge(false); setIsFresh(false); setIsHygienic(false); setHasAllergens(false);
      localStorage.removeItem('draft_form'); 

    } catch (err) { alert("Error posting donation."); }
  };

  // UPDATED: Handle Cancellation Reason (Task 2.4.1)
  const updateStatus = async (id, newStatus) => {
    let reason = null;
    
    if (newStatus === 'Cancelled') {
        reason = prompt("⚠️ Please state the reason for reporting this issue:");
        if (!reason) return; // Cancel action if no reason given
    } else {
        if (!window.confirm(`Mark as ${newStatus}?`)) return;
    }

    try { 
        await axios.put(`${API_URL}/listings/${id}/status`, 
            { status: newStatus, reason: reason }, 
            { headers: { 'x-auth-token': localStorage.getItem('token') } }
        ); 
        fetchListings(); fetchMyHistory(); 
    } catch (err) { alert("Update failed."); }
  };

  const deleteListing = async (id) => {
    if (!window.confirm("Delete this donation?")) return;
    try {
      const token = localStorage.getItem('token');
      const config = { headers: { 'x-auth-token': token } };
      await axios.delete(`${API_URL}/listings/${id}`, config);
      alert("🗑️ Removed.");
      fetchListings(); fetchMyHistory();
    } catch (err) { alert("Error deleting."); }
  };

  const submitRating = async (id, ratingValue) => {
    const feedback = prompt("Optional: Leave a comment:");
    if(!window.confirm(`Rate ${ratingValue} stars?`)) return;
    try {
        await axios.put(`${API_URL}/listings/${id}/rate`, { rating: ratingValue, feedback: feedback || '' });
        alert("Thanks!");
        fetchListings(); 
    } catch (err) { alert("Error submitting rating."); }
  };

  // ==========================================
  // FILTER LOGIC
  // ==========================================
  const visibleListings = listings.filter(item => {
    if (item.status === 'Cancelled') return false; 
    
    if (view === 'history') {
        if (item.donor && (item.donor._id === user.id || item.donor === user.id)) return true;
        if (item.claimedBy && (item.claimedBy === user.id || item.claimedBy._id === user.id)) return true;
        if (item.collectedBy && (item.collectedBy === user.id || item.collectedBy._id === user.id)) return true;
        return false;
    }

    if (item.status === 'Available') return true;
    
    if (item.status === 'Claimed') {
        if (user.role === 'Volunteer') return true;
        if (user.role === 'NGO' && item.claimedBy && (item.claimedBy === user.id || item.claimedBy._id === user.id)) return true;
        return false;
    }
    
    if (item.status === 'In Transit') {
        if (user.role === 'NGO' && item.claimedBy && (item.claimedBy === user.id || item.claimedBy._id === user.id)) return true;
        if (user.role === 'Volunteer' && item.collectedBy && (item.collectedBy === user.id || item.collectedBy._id === user.id)) return true;
        return false;
    }
    
    if (item.status === 'Delivered') {
        if (user.role === 'NGO' && !item.rating) return true;
        return false;
    }
    
    return false;
  });

  // Dynamic Styles
  const currentCardStyle = highContrast 
    ? { background: 'black', color: '#ffd700', border: '2px solid #ffd700', padding: '25px', marginBottom: '25px', borderRadius: '12px' }
    : { background: 'rgba(255, 255, 255, 0.95)', padding: '25px', marginBottom: '25px', borderRadius: '12px', boxShadow: '0 8px 30px rgba(0,0,0,0.08)', backdropFilter: 'blur(5px)' };
    
  const currentBodyStyle = highContrast
    ? { backgroundColor: '#111', minHeight: '100vh', color: '#ffd700' }
    : { backgroundColor: '#f4f4f4', minHeight: '100vh' };


  // ==========================================
  // 8. MAIN RENDER
  // ==========================================
  return (
    <div className="App" style={{ ...currentBodyStyle, padding: '30px 20px', maxWidth: '850px', margin: '0 auto' }}>
      
      {/* HEADER: Language & Contrast */}
      <div style={{display:'flex', justifyContent:'flex-end', gap:'10px', marginBottom:'10px'}}>
        <button onClick={() => setLang(lang === 'en' ? 'hi' : 'en')} style={{background: highContrast ? '#ffd700' : '#eee', color: highContrast ? 'black' : 'black', border:'none', padding:'5px 10px', borderRadius:'5px', cursor:'pointer', fontWeight:'bold', fontSize:'0.9em'}}>
            {lang === 'en' ? '🇮🇳 Hindi' : '🇺🇸 English'}
        </button>
        <button onClick={() => setHighContrast(!highContrast)} style={{background: highContrast ? '#fff' : '#2c3e50', color: highContrast ? '#000' : '#fff', border:'none', padding:'5px 10px', borderRadius:'5px', cursor:'pointer', fontWeight:'bold', fontSize:'0.9em'}}>
            {highContrast ? '☀️ Normal' : '🌗 High Contrast'}
        </button>
      </div>

      <h1 style={{ color: highContrast ? '#ffd700' : '#2c3e50', textAlign: 'center', marginBottom: '30px', textShadow: highContrast ? 'none' : '1px 1px 2px rgba(0,0,0,0.1)' }}>
        {t.title}
      </h1>
      
      {/* NEW: Stats Toggle Button (Task 6.1.1) */}
      <div style={{textAlign:'center', marginBottom:'10px'}}>
          <button 
            onClick={() => setShowStats(!showStats)}
            style={{background:'none', border:'none', cursor:'pointer', color: highContrast?'#ffd700':'#555', textDecoration:'underline'}}
          >
              {showStats ? 'Hide Stats ▲' : 'Show Stats ▼'}
          </button>
      </div>

      {/* NEW: Collapsible Stats Container */}
      {showStats && (
        <div style={{ display: 'flex', gap: '20px', marginBottom: '25px' }}>
            <div style={statBoxStyle(highContrast ? '#333' : 'linear-gradient(135deg, #27ae60, #2ecc71)', highContrast)}>
                <h2>{stats.total_donations}</h2><p>Active</p>
            </div>
            <div style={statBoxStyle(highContrast ? '#333' : 'linear-gradient(135deg, #e67e22, #f39c12)', highContrast)}>
                <h2>{stats.meals_saved}</h2><p>Saved</p>
            </div>
            <div style={statBoxStyle(highContrast ? '#333' : 'linear-gradient(135deg, #2c3e50, #34495e)', highContrast)}>
                <h2>{stats.co2_saved} kg</h2><p>CO2 Saved</p>
            </div>
        </div>
      )}

      {/* LEADERBOARD */}
      <div className="card" style={currentCardStyle}>
        <h3 style={{borderBottom:'2px solid #eee', paddingBottom:'10px', margin:'0 0 15px 0'}}>🏆 Top Donors</h3>
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

      {/* AUTH & PROFILE */}
      <div className="card" style={currentCardStyle}>
        {!user.id ? (
          <div>
            {/* LOGIN / REGISTER FORM */}
            <h3 style={{marginBottom:'15px', color: highContrast ? '#ffd700' : '#2c3e50'}}>
                {isRegistering ? t.register : t.login}
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {isRegistering && (
                  <input placeholder="Full Name" value={regName} onChange={e => setRegName(e.target.value)} style={inputStyle} />
              )}
              <input placeholder="Email Address" value={regEmail} onChange={e => setRegEmail(e.target.value)} style={inputStyle} />
              
              {/* PASSWORD TOGGLE */}
              <div style={{position:'relative'}}>
                  <input 
                    type={showPassword ? "text" : "password"} 
                    placeholder="Password" 
                    value={regPassword} 
                    onChange={e => setRegPassword(e.target.value)} 
                    style={{...inputStyle, paddingRight:'40px'}} 
                  />
                  <span 
                    onClick={() => setShowPassword(!showPassword)}
                    style={{position:'absolute', right:'10px', top:'12px', cursor:'pointer', fontSize:'1.2em'}}
                  >
                    {showPassword ? '🙈' : '👁️'}
                  </span>
              </div>
              
              {isRegistering && (
                <>
                  <input placeholder="📍 Pickup Address" value={regAddress} onChange={e => setRegAddress(e.target.value)} style={inputStyle} />
                  <input placeholder="📞 Phone Number" value={regPhone} onChange={e => setRegPhone(e.target.value)} style={inputStyle} />
                  <select value={regRole} onChange={e => setRegRole(e.target.value)} style={inputStyle}>
                      <option>Donor</option>
                      <option>NGO</option>
                      <option value="Volunteer">Volunteer</option>
                  </select>

                  {/* NGO REG NUMBER */}
                  {regRole === 'NGO' && (
                      <input 
                        placeholder="🏢 NGO Govt Reg. Number (Required)" 
                        value={regNgoNumber} 
                        onChange={e => setRegNgoNumber(e.target.value)} 
                        style={{...inputStyle, border:'2px solid #3498db'}} 
                      />
                  )}
                  
                  {/* Terms Checkbox */}
                  <div style={{display:'flex', alignItems:'center', gap:'10px', marginTop:'5px'}}>
                      <input 
                          type="checkbox" 
                          checked={agreeTerms} 
                          onChange={e => setAgreeTerms(e.target.checked)} 
                          id="terms" 
                      />
                      <label htmlFor="terms" style={{fontSize:'0.9em', color: highContrast ? '#fff' : '#555'}}>
                          I agree to the <span onClick={(e) => { e.preventDefault(); setShowTerms(true); }} style={{color: highContrast ? '#ffd700' : '#3498db', textDecoration:'underline', cursor:'pointer'}}>Terms & Conditions</span>
                      </label>
                  </div>
                </>
              )}

              <div style={{ marginTop: '10px' }}>
                <button onClick={isRegistering ? registerUser : loginUser} style={buttonStyle(highContrast ? '#555' : '#2c3e50')}>
                    {isRegistering ? t.register : t.login}
                </button>
              </div>

              <div style={{textAlign:'center', marginTop:'15px', fontSize:'0.9em'}}>
                <span onClick={() => setIsRegistering(!isRegistering)} style={{color: highContrast ? '#fff' : '#3498db', cursor:'pointer', textDecoration:'underline'}}>
                    {isRegistering ? "Login here" : "Create account"}
                </span>
              </div>
            </div>
          </div>
        ) : (
          <div>
            {/* LOGGED IN VIEW */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom:'10px' }}>
                <h3>{t.welcome}, {user.name}</h3>
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
                        
                        {/* BADGES & RATING */}
                        {user.role === 'Donor' && (
                             <div style={{marginTop:'15px', padding:'15px', background: highContrast ? '#000' : 'white', border: highContrast ? '1px solid #ffd700' : '1px solid #ddd', borderRadius:'6px', display:'flex', justifyContent:'space-around', alignItems:'center'}}>
                                <div style={{textAlign:'center'}}>
                                    <span style={{fontSize:'0.8em', color: highContrast ? '#ccc' : '#777'}}>RANK</span>
                                    {/* Calculated from local state */}
                                    <div style={{fontWeight:'bold', color: highContrast ? '#ffd700' : '#e67e22'}}>{getDonorBadge(myListings.length)}</div>
                                </div>
                                <div style={{borderLeft: highContrast ? '1px solid #ffd700' : '1px solid #eee', height:'40px'}}></div>
                                <div style={{textAlign:'center'}}>
                                    <span style={{fontSize:'0.8em', color: highContrast ? '#ccc' : '#777'}}>RATING</span>
                                    <div style={{fontWeight:'bold', color: highContrast ? '#ffd700' : '#f1c40f'}}>{calculateMyRating()}</div>
                                </div>
                             </div>
                        )}
                        {user.role === 'Donor' && <button onClick={shareImpact} style={{...buttonStyle('#8e44ad'), marginTop:'15px'}}>📢 Share My Impact</button>}
                        
                        <div style={{marginTop:'20px', borderTop:'1px solid #ccc', paddingTop:'15px'}}>
                            <button onClick={deleteAccount} style={{...buttonStyle('#c0392b'), width:'auto', fontSize:'0.8em', padding:'8px 15px'}}>⚠️ Delete Account</button>
                        </div>
                    </div>
                ) : (
                    <div>
                         <h4>✏️ Edit Profile</h4>
                         <input placeholder="Name" value={editName} onChange={e => setEditName(e.target.value)} style={inputStyle} />
                         <input placeholder="Phone" value={editPhone} onChange={e => setEditPhone(e.target.value)} style={inputStyle} />
                         <input placeholder="Address" value={editAddress} onChange={e => setEditAddress(e.target.value)} style={inputStyle} />
                         <div style={{display:'flex', gap:'10px'}}>
                            <button onClick={updateProfile} style={buttonStyle('#27ae60')}>Save</button>
                            <button onClick={() => setIsEditingProfile(false)} style={buttonStyle('#95a5a6')}>Cancel</button>
                         </div>
                    </div>
                )}
            </div>
          </div>
        )}
      </div>

      {/* DONOR FORM */}
      {user.role === 'Donor' && (
        <div className="card" style={currentCardStyle}>
          <h2 style={{borderBottom:'2px solid #eee', paddingBottom:'10px', margin:'0 0 20px 0'}}>{t.donate}</h2>
          <input placeholder="Item Name" value={foodTitle} onChange={e => setFoodTitle(e.target.value)} style={inputStyle} />
          
          {/* FEATURE: Description with Char Count */}
          <div style={{position:'relative'}}>
              <textarea 
                placeholder="Instructions..." 
                maxLength="300"
                value={foodDesc} 
                onChange={e => setFoodDesc(e.target.value)} 
                style={{...inputStyle, height: '70px', fontFamily:'inherit'}} 
              />
              <small style={{position:'absolute', bottom:'5px', right:'10px', color: '#999', fontSize:'0.8em'}}>
                  {foodDesc.length}/300
              </small>
          </div>
          
          <div style={{ display: 'flex', gap: '15px', marginTop:'15px' }}>
            <div style={{flex:1, display:'flex'}}>
                <input 
                    type="number" 
                    placeholder="Qty" 
                    min="0.1" 
                    step="0.1" 
                    value={foodQty} 
                    onChange={e => setFoodQty(e.target.value)} 
                    onKeyDown={(e) => {
                        if(e.key === '-' || e.key === 'e') e.preventDefault();
                    }}
                    style={{...inputStyle, borderRadius:'4px 0 0 4px'}} 
                />
                <select value={foodUnit} onChange={e => setFoodUnit(e.target.value)} style={{...inputStyle, width:'auto', borderRadius:'0 4px 4px 0', borderLeft:'none', background:'#f8f9fa'}}>
                    <option>kg</option>
                    <option>servings</option>
                </select>
            </div>
            <div style={{flex:1}}>
                 <input type="number" placeholder="Exp Hours" min="1" value={foodExpiry} onChange={e => setFoodExpiry(e.target.value)} style={inputStyle} />
            </div>
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
            <label style={{display:'block', color: highContrast ? '#fff' : '#d63384'}}><input type="checkbox" checked={hasAllergens} onChange={e => setHasAllergens(e.target.checked)}/> Allergens?</label>
            <label style={{display:'block', marginTop:'10px'}}>Temp: <select value={temperature} onChange={e => setTemperature(e.target.value)}><option>Hot</option><option>Cold</option></select></label>
          </div>
          <button onClick={postDonation} style={buttonStyle('linear-gradient(to right, #27ae60, #2ecc71)')}>Post Donation</button>
        </div>
      )}

      {/* TABS */}
      <div className="card" style={{...currentCardStyle, display: 'flex', gap: '15px', padding:'15px'}}>
        <button onClick={() => setView('feed')} style={{...tabButtonStyle, background: view === 'feed' ? '#2c3e50' : '#f9f9f9', color: view === 'feed' ? 'white' : 'black'}}>{t.feed}</button>
        <button onClick={() => { setView('history'); fetchMyHistory(); }} style={{...tabButtonStyle, background: view === 'history' ? '#2c3e50' : '#f9f9f9', color: view === 'history' ? 'white' : 'black'}}>
            {view === 'history' ? t.history : 'Activity'}
        </button>
      </div>

      {/* FEED (With Filters & Urgency) */}
      <div className="card" style={currentCardStyle}>
        
        {/* FILTERS */}
        <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'20px'}}>
             <h2 style={{margin:0}}>{view === 'feed' ? t.feed : t.history}</h2>
             <button onClick={fetchListings} style={{ ...buttonStyle('#95a5a6'), width: 'auto', padding:'8px 15px', fontSize:'0.9em' }}>{t.refresh}</button>
        </div>
        
        {view === 'feed' && (
            <div style={{display:'flex', gap:'12px', marginBottom:'25px', background: highContrast ? '#222' : '#f8f9fa', padding:'15px', borderRadius:'8px', flexWrap:'wrap', border: highContrast ? '1px solid #ffd700' : 'none'}}>
                <input placeholder={t.search} value={searchTerm} onChange={e => setSearchTerm(e.target.value)} style={{...inputStyle, flex: 2, background:'white', minWidth:'200px'}} />
                <select value={filterCategory} onChange={e => setFilterCategory(e.target.value)} style={{...inputStyle, flex: 1, background:'white'}}>
                    <option value="All">All Categories</option><option value="Cooked">Cooked</option><option value="Raw">Raw</option><option value="Bakery">Bakery</option>
                </select>
                <select value={filterVeg} onChange={e => setFilterVeg(e.target.value)} style={{...inputStyle, flex: 1, background:'white'}}>
                    <option value="All">Any Diet</option><option value="Veg">🟢 Veg Only</option><option value="Non-Veg">🔴 Non-Veg</option>
                </select>
            </div>
        )}

        {visibleListings.map(item => (
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
            
            {isUrgent(item.createdAt, item.expiry_hours) && item.status === 'Available' && (
                <div style={{position:'absolute', top:'-10px', right:'10px', background:'#e74c3c', color:'white', padding:'4px 10px', borderRadius:'15px', fontSize:'0.8em', fontWeight:'bold'}}>
                    🔥 URGENT
                </div>
            )}
            
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <div>
                  <h3 style={{ margin: '0 0 5px 0' }}>
                      {/* NEW: Category Icons (Task 3.1.2) */}
                      <span style={{marginRight:'5px'}}>{getCategoryIcon(item.category)}</span>
                      <span style={{marginRight:'8px', fontSize:'0.8em'}}>{item.isVeg ? '🟢' : '🔴'}</span>
                      {item.title}
                  </h3>
                  
                  <span style={{fontSize:'0.8em', color:'#888', display:'block', marginTop:'3px'}}>
                      by {item.donor ? item.donor.name : 'Unknown'} 
                      {/* FEATURE: New Donor Badge (Task 6.2.3) */}
                      {item.donor && isNewUser(item.donor.createdAt) && (
                          <span style={{background:'#27ae60', color:'white', padding:'2px 6px', borderRadius:'10px', marginLeft:'5px', fontSize:'0.8em'}}>🌱 New</span>
                      )}
                      {' '}• {timeAgo(item.createdAt)}
                  </span>
              </div>
              <span style={statusBadgeStyle(item.status)}>{item.status}</span>
            </div>
            
            <div style={{display:'flex', gap:'10px', margin:'15px 0', flexWrap:'wrap'}}>
                 <span style={infoTagStyle}>📦 {item.quantity} {item.unit}</span>
                 <span style={infoTagStyle}>🕒 {item.expiry_hours}h</span>
                 <span style={{...infoTagStyle, background: highContrast ? '#333' : '#e3f2fd', color: highContrast ? '#ffd700' : '#1976d2'}}>🌡️ {item.temperature}</span>
                 {item.requiresRefrigeration && <span style={{...infoTagStyle, background: highContrast ? '#333' : '#e3f2fd', color: highContrast ? '#ffd700' : '#2980b9'}}>❄️ Fridge Req.</span>}
            </div>
            
            {/* LOGISTICS & MAPS */}
            {(item.status === 'Claimed' || item.status === 'In Transit') && user.role === 'Volunteer' && (
                <div style={{background: highContrast ? '#222' : '#f3e5f5', padding:'15px', borderRadius:'8px', margin:'15px 0', borderLeft:'5px solid #8e44ad'}}>
                    <h4 style={{margin:'0 0 10px 0', color:'#8e44ad'}}>🚚 Logistics</h4>
                    {item.donor && (
                        <p style={{cursor:'pointer', textDecoration:'underline', color:'#c0392b'}} onClick={() => openMap(item.donor.address)}>
                            📍 From: {item.donor.address} (Click to Map)
                        </p>
                    )}
                    {item.claimedBy && (
                        <p style={{cursor:'pointer', textDecoration:'underline', color:'#27ae60'}} onClick={() => openMap(item.claimedBy.address)}>
                            {/* FEATURE: Verified NGO Tick (Task 4.1.3) */}
                            📍 To: {item.claimedBy.name} {item.claimedBy.ngoRegNumber && '✅'} (Click to Map)
                        </p>
                    )}
                </div>
            )}
            
            {/* ACTION BUTTONS */}
            {item.status === 'Claimed' && user.role === 'Volunteer' && (
                <div style={{marginTop:'10px', display:'flex', gap:'10px'}}>
                    <button onClick={() => updateStatus(item._id || item.id, 'In Transit')} style={actionButtonStyle('#8e44ad')}>📷 Pickup</button>
                    {/* NEW: Report Button with Prompt (Task 2.4.1) */}
                    <button onClick={() => updateStatus(item._id || item.id, 'Cancelled')} style={{...actionButtonStyle('#c0392b'), marginLeft:'10px'}}>⚠️ Report</button>
                </div>
            )}
            
            {item.status === 'Available' && user.role === 'NGO' && (
                <button onClick={() => updateStatus(item._id || item.id, 'Claimed')} style={actionButtonStyle('#e67e22')}>✋ Claim</button>
            )}
            
            {item.status === 'In Transit' && user.role === 'NGO' && item.claimedBy && (item.claimedBy === user.id || item.claimedBy._id === user.id) && (
                <button onClick={() => updateStatus(item._id || item.id, 'Delivered')} style={actionButtonStyle('#27ae60')}>✅ Confirm</button>
            )}
            
            {item.status === 'Delivered' && user.role === 'NGO' && !item.rating && (
                <div style={{marginTop:'15px', background: highContrast ? '#222' : '#fff8e1', padding:'15px', textAlign:'center'}}>
                    <p>Rate:</p>
                    {[1, 2, 3, 4, 5].map(star => (
                        <span key={star} onClick={() => submitRating(item._id || item.id, star)} style={{cursor:'pointer', fontSize:'2em', color:'#f1c40f', margin:'0 5px'}}>☆</span>
                    ))}
                </div>
            )}
            
            {view === 'history' && item.status === 'Available' && (
                <button onClick={() => deleteListing(item._id || item.id)} style={{...buttonStyle('#e74c3c'), width:'auto', padding:'8px 15px', marginTop:'10px'}}>🗑️ Delete</button>
            )}
            
            {/* QR CODE WITH DOWNLOAD */}
            {view === 'history' && (item.status === 'Claimed' || item.status === 'In Transit') && (
                <div style={{marginTop:'10px'}}>
                    <button onClick={() => setShowQR(showQR === item._id ? null : item._id)} style={{...buttonStyle('#34495e'), width:'auto', padding:'5px 15px', fontSize:'0.8em'}}>
                        {showQR === item._id ? '❌ Hide' : '📱 QR'}
                    </button>
                    {showQR === item._id && (
                        <div style={{marginTop:'15px', background:'white', padding:'20px', borderRadius:'12px', display:'inline-block', textAlign:'center'}}>
                            <QRCode id="pickup-qr" value={`PICKUP:${item._id}:${user.id}`} size={120} />
                            <br/>
                            <button onClick={downloadQR} style={{...buttonStyle('#27ae60'), width:'auto', marginTop:'10px', fontSize:'0.8em', padding:'5px 10px'}}>
                                💾 Save QR
                            </button>
                        </div>
                    )}
                </div>
            )}

          </div>
        ))}
      </div>

      {/* TERMS MODAL */}
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
                    <p><strong>4. Accuracy:</strong> Donors must accurately describe food (Veg/Non-Veg, Allergens).</p>
                    <p><strong>5. Privacy:</strong> Do not misuse phone numbers or addresses provided for logistics.</p>
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

// ==========================================
// 10. STYLES
// ==========================================
const inputStyle = { width: '100%', padding: '12px 15px', borderRadius: '6px', border: '1px solid #e0e0e0', boxSizing: 'border-box', fontSize:'1em', outline: 'none' };
const statBoxStyle = (background, highContrast) => ({ flex: 1, background: background, color: highContrast ? '#ffd700' : 'white', border: highContrast ? '1px solid #ffd700' : 'none', padding: '20px', borderRadius: '12px', textAlign: 'center', boxShadow: '0 4px 15px rgba(0,0,0,0.15)' });
const buttonStyle = (background) => ({ width: '100%', padding: '12px', background: background, color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', marginTop: '5px', fontWeight: 'bold', fontSize:'1em' });
const actionButtonStyle = (background) => ({ ...buttonStyle(background), width: 'auto', padding: '10px 20px', borderRadius:'30px', fontSize:'0.9em' });
const tabButtonStyle = { flex: 1, padding: '12px', border: '2px solid #2c3e50', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' };
const statusBadgeStyle = (status) => ({ background: status === 'Available' ? '#d4edda' : status === 'Claimed' ? '#fff3cd' : status === 'In Transit' ? '#e2e3ff' : '#d1e7dd', color: status === 'Available' ? '#155724' : status === 'Claimed' ? '#856404' : status === 'In Transit' ? '#4a56a6' : '#0f5132', padding: '6px 12px', borderRadius: '20px', fontSize: '0.85em', fontWeight: 'bold' });
const infoTagStyle = { background:'#f5f5f5', padding:'5px 10px', borderRadius:'15px', fontSize:'0.85em', color:'#555', border:'1px solid #eee' };

export default App;