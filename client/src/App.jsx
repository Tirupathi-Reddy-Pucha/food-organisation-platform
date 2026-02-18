import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Landing from './pages/Landing';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import Register from './pages/Register';
import About from './pages/About'; 
import HowItWorks from './pages/HowItWorks';
import Impact from './pages/Impact';
import Blog from './pages/Blog';
import Contact from './pages/Contact';
import Restaurants from './pages/solutions/Restaurants';

// Protects the Dashboard: If no token, kick to Login
const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  if (!token) return <Navigate to="/login" replace />;
  return children;
};

// Protects Auth/Landing pages: If logged in, kick to Dashboard
const PublicRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  if (token) return <Navigate to="/dashboard" replace />;
  return children;
};

export default function App() {
  return (
    <Router>
      <div className="min-h-screen bg-white font-sans selection:bg-emerald-200">
        <Routes>
          
          {/* --- PUBLIC ROUTES (Logged Out Only) --- */}
          <Route path="/" element={
            <PublicRoute>
              <>
                <Navbar />
                <div className="pt-20"><Landing /></div>
              </>
            </PublicRoute>
          } />

          {/*about page*/}
          <Route path="/about" element={
            <PublicRoute>
              <>
                <Navbar />
                <div className="pt-20"><About /></div>
              </>
            </PublicRoute>
          } />
        {/*How it works*/}
        <Route path="/how-it-works" element={
          <PublicRoute>
            <>
              <Navbar />
              <div className="pt-20"><HowItWorks /></div>
            </>
          </PublicRoute>
        } />
        {/*Impact page*/}
        <Route path="/impact" element={
          <PublicRoute>
            <>
              <Navbar />
              <div className="pt-20"><Impact /></div>
            </>
          </PublicRoute>
        } />
        {/*Blog page*/}
        <Route path="/blog" element={
          <PublicRoute>
            <>
              <Navbar />
              <div className="pt-20"><Blog /></div>
            </>
          </PublicRoute>
        } />
        {/*Contact page*/}
        <Route path="/contact" element={
          <PublicRoute>
            <>
              <Navbar />
              <div className="pt-20"><Contact /></div>
            </>
          </PublicRoute>
        } />
        {/*Restaurants page*/}
        <Route path="/solutions/restaurants" element={
          <PublicRoute>
            <>
              <Navbar />
              <div className="pt-20"><Restaurants /></div>
            </>
          </PublicRoute>
        } />

          
          <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
          <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />

          {/* --- PROTECTED ROUTE (Logged In Only) --- */}
          {/* Notice NO Navbar here! The Dashboard is a full-screen standalone app */}
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </Router>
  );
}