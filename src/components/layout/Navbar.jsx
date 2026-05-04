import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { 
  Leaf, Menu, X, Home, Search, Heart, PlusCircle, User, 
  LogOut, Bell, ChevronDown, HandHeart, MapPin
} from 'lucide-react';
import toast from 'react-hot-toast';

const NAV_LINKS = [
  { to: '/', label: 'Home', icon: Home },
  { to: '/browse', label: 'Browse', icon: Search },
  { to: '/matches', label: 'Smart Matches', icon: MapPin },
  { to: '/donate', label: 'Donate Food', icon: Heart },
  { to: '/request', label: 'Request Food', icon: HandHeart },
];

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully');
    navigate('/');
    setProfileOpen(false);
    setMenuOpen(false);
  };

  return (
    <header
      className="fixed top-0 left-0 right-0 z-50"
      style={{
        background: 'rgba(10,15,30,0.85)',
        backdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(255,255,255,0.08)',
        boxShadow: '0 4px 30px rgba(0,0,0,0.3)',
      }}
    >
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 group" id="nav-logo">
          <div className="w-9 h-9 bg-gradient-to-br from-green-400 to-emerald-600 rounded-xl flex items-center justify-center shadow-glow-green group-hover:scale-110 transition-transform">
            <Leaf size={18} className="text-white" />
          </div>
          <span className="font-display font-bold text-xl gradient-text hidden sm:block">
            FoodShare
          </span>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden lg:flex items-center gap-1">
          {NAV_LINKS.map(link => (
            <NavItem key={link.to} {...link} />
          ))}
        </div>

        {/* Right side */}
        <div className="flex items-center gap-2">
          {user ? (
            <>
              {/* Notifications */}
              <div className="relative">
                <button
                  id="nav-notif-btn"
                  onClick={() => { setNotifOpen(!notifOpen); setProfileOpen(false); }}
                  className="p-2 rounded-xl text-white/60 hover:text-white hover:bg-white/10 transition-all relative"
                >
                  <Bell size={18} />
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-green-400 rounded-full" />
                </button>
                {notifOpen && (
                  <div className="absolute right-0 top-12 w-72 glass-card p-3 shadow-glass animate-scale-in">
                    <p className="text-sm font-semibold text-white mb-2">Notifications</p>
                    <div className="space-y-2">
                      {[
                        { msg: 'Your food request was accepted!', time: '2m ago', type: 'success' },
                        { msg: 'New food available near you', time: '1h ago', type: 'info' },
                      ].map((n, i) => (
                        <div key={i} className="p-2 rounded-lg bg-white/5 hover:bg-white/10 cursor-pointer transition-all">
                          <p className="text-xs text-white/80">{n.msg}</p>
                          <p className="text-xs text-white/40 mt-1">{n.time}</p>
                        </div>
                      ))}
                    </div>
                    <button
                      onClick={() => setNotifOpen(false)}
                      className="w-full mt-2 text-xs text-green-400 hover:text-green-300 transition-colors text-center"
                    >
                      Mark all read
                    </button>
                  </div>
                )}
              </div>

              {/* Profile dropdown */}
              <div className="relative">
                <button
                  id="nav-profile-btn"
                  onClick={() => { setProfileOpen(!profileOpen); setNotifOpen(false); }}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-xl hover:bg-white/10 transition-all"
                >
                  <div className="w-8 h-8 bg-gradient-to-br from-green-400 to-emerald-600 rounded-full flex items-center justify-center text-white font-bold text-xs">
                    {user.avatar || user.name?.[0] || 'U'}
                  </div>
                  <span className="hidden sm:block text-sm text-white/80 font-medium">
                    {user.name?.split(' ')[0]}
                  </span>
                  <ChevronDown size={14} className={`text-white/50 transition-transform ${profileOpen ? 'rotate-180' : ''}`} />
                </button>
                {profileOpen && (
                  <div className="absolute right-0 top-12 w-52 glass-card p-2 shadow-glass animate-scale-in">
                    <div className="px-3 py-2 border-b border-white/10 mb-1">
                      <p className="text-sm font-semibold text-white">{user.name}</p>
                      <p className="text-xs text-white/50 truncate">{user.email}</p>
                    </div>
                    {[
                      { icon: User, label: 'My Profile', to: '/profile' },
                      { icon: Heart, label: 'My Donations', to: '/profile?tab=donations' },
                      { icon: HandHeart, label: 'My Requests', to: '/profile?tab=requests' },
                    ].map(item => (
                      <Link
                        key={item.to}
                        to={item.to}
                        onClick={() => setProfileOpen(false)}
                        className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-white/70 hover:text-white hover:bg-white/10 transition-all"
                      >
                        <item.icon size={15} />
                        {item.label}
                      </Link>
                    ))}
                    <hr className="border-white/10 my-1" />
                    <button
                      onClick={handleLogout}
                      id="nav-logout-btn"
                      className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-all"
                    >
                      <LogOut size={15} />
                      Logout
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="hidden sm:flex items-center gap-2">
              <Link
                to="/auth"
                id="nav-login-btn"
                className="px-4 py-2 rounded-xl text-sm text-white/70 hover:text-white hover:bg-white/10 transition-all font-medium"
              >
                Log in
              </Link>
              <Link
                to="/auth?mode=register"
                id="nav-signup-btn"
                className="btn-primary px-4 py-2 text-sm font-semibold rounded-xl"
              >
                Sign up
              </Link>
            </div>
          )}

          {/* Mobile menu toggle */}
          <button
            id="nav-mobile-menu-btn"
            onClick={() => setMenuOpen(!menuOpen)}
            className="lg:hidden p-2 rounded-xl hover:bg-white/10 text-white/70 hover:text-white transition-all"
          >
            {menuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </nav>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="lg:hidden bg-slate-900/95 backdrop-blur-xl border-t border-white/10 animate-fade-in">
          <div className="max-w-7xl mx-auto px-4 py-4 space-y-1">
            {NAV_LINKS.map(link => (
              <Link
                key={link.to}
                to={link.to}
                onClick={() => setMenuOpen(false)}
                className="flex items-center gap-3 px-4 py-3 rounded-xl text-white/70 hover:text-white hover:bg-white/10 transition-all"
              >
                <link.icon size={18} />
                {link.label}
              </Link>
            ))}
            <hr className="border-white/10 my-2" />
            {user ? (
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-400 hover:bg-red-500/10 transition-all"
              >
                <LogOut size={18} />
                Logout
              </button>
            ) : (
              <div className="flex flex-col gap-2 pt-2">
                <Link to="/auth" onClick={() => setMenuOpen(false)} className="btn-secondary text-center py-3 rounded-xl">
                  Log in
                </Link>
                <Link to="/auth?mode=register" onClick={() => setMenuOpen(false)} className="btn-primary text-center py-3 rounded-xl">
                  Sign up free
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}

function NavItem({ to, label }) {
  const isActive = window.location.pathname === to;
  return (
    <Link
      to={to}
      className={`nav-link px-4 py-2 rounded-xl hover:bg-white/5 text-sm transition-all ${isActive ? 'active text-green-400 bg-green-500/10' : ''}`}
    >
      {label}
    </Link>
  );
}
