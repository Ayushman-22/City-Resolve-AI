import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Menu, X, Bell, ChevronDown, LogOut, LayoutDashboard, User } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from 'react-i18next';

const NAV_LINKS = [
  { label: 'Home', to: '/' },
  { label: 'Issues', to: '/issues' },
  { label: 'Map View', to: '/map' },
  { label: 'Dashboard', to: '/dashboard' },
];

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // ✅ YAHAN ANDAR HAI — sahi jagah
  const { i18n } = useTranslation();

  // ✅ YAHAN ANDAR HAI — sahi jagah
  const toggleLang = () => {
    const newLang = i18n.language === 'en' ? 'hi' : 'en';
    i18n.changeLanguage(newLang);
    localStorage.setItem('lang', newLang);
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const isActive = (to: string) =>
    to === '/' ? location.pathname === '/' : location.pathname.startsWith(to);

  const userName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'User';
  const userInitial = userName.charAt(0).toUpperCase();

  return (
    <nav className="sticky top-0 z-50 bg-white/90 backdrop-blur border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          {/* ── LOGO ── */}
          <Link to="/" className="flex items-center gap-3 group flex-shrink-0">
            <svg width="42" height="42" viewBox="0 0 42 42" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M21 2L38 11.5V30.5L21 40L4 30.5V11.5L21 2Z" fill="url(#grad1)"/>
              <rect x="9"  y="22" width="4" height="10" rx="0.5" fill="white" fillOpacity="0.9"/>
              <rect x="10" y="18" width="2" height="4"  rx="0.5" fill="white" fillOpacity="0.7"/>
              <rect x="14" y="19" width="5" height="13" rx="0.5" fill="white"/>
              <rect x="15.5" y="16" width="2" height="3" rx="0.5" fill="white" fillOpacity="0.8"/>
              <rect x="20" y="21" width="4" height="11" rx="0.5" fill="white" fillOpacity="0.9"/>
              <rect x="25" y="17" width="5" height="15" rx="0.5" fill="white"/>
              <rect x="26.5" y="14" width="2" height="3" rx="0.5" fill="white" fillOpacity="0.7"/>
              <rect x="31" y="23" width="3" height="9"  rx="0.5" fill="white" fillOpacity="0.8"/>
              <circle cx="21" cy="12" r="4"   fill="white" fillOpacity="0.2"/>
              <circle cx="21" cy="12" r="2.5" fill="#FCD34D"/>
              <circle cx="21" cy="12" r="1"   fill="white"/>
              <defs>
                <linearGradient id="grad1" x1="4" y1="2" x2="38" y2="40" gradientUnits="userSpaceOnUse">
                  <stop offset="0%"   stopColor="#1D4ED8"/>
                  <stop offset="100%" stopColor="#0EA5E9"/>
                </linearGradient>
              </defs>
            </svg>
            <div className="flex flex-col leading-none">
              <div className="flex items-end gap-0.5">
                <span className="text-xl font-black text-gray-900 tracking-tight">City</span>
                <span className="text-xl font-black bg-gradient-to-r from-blue-600 to-sky-500 bg-clip-text text-transparent tracking-tight">Resolve</span>
              </div>
              <span className="text-[8px] font-bold text-gray-400 tracking-[0.2em] uppercase mt-0.5">Smart Civic Tech</span>
            </div>
          </Link>

          {/* ── DESKTOP NAV LINKS ── */}
          <div className="hidden md:flex items-center gap-1">
            {NAV_LINKS.map(link => (
              <Link
                key={link.to}
                to={link.to}
                className={`px-4 py-2 rounded-xl text-sm font-semibold transition-colors ${
                  isActive(link.to)
                    ? 'bg-blue-50 text-blue-600'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* ── RIGHT SIDE ── */}
          <div className="hidden md:flex items-center gap-3">

            {/* 🌐 Language Toggle — always visible */}
            <button
              onClick={toggleLang}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-gray-200 text-sm font-bold text-gray-600 hover:bg-gray-100 transition-colors"
            >
              {i18n.language === 'en' ? '🇮🇳 हिं' : '🇬🇧 EN'}
            </button>

            {user ? (
              <>
                {/* Report button */}
                <Link
                  to="/report"
                  className="bg-blue-600 text-white text-sm font-bold px-4 py-2 rounded-xl hover:bg-blue-700 transition-colors"
                >
                  + Report Issue
                </Link>

                {/* Bell */}
                <button className="relative w-9 h-9 flex items-center justify-center text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-xl transition-colors">
                  <Bell size={18} />
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
                </button>

                {/* User dropdown */}
                <div className="relative">
                  <button
                    onClick={() => setDropdownOpen(!dropdownOpen)}
                    className="flex items-center gap-2 pl-1 pr-3 py-1 rounded-xl hover:bg-gray-100 transition-colors"
                  >
                    <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-500 to-sky-400 flex items-center justify-center text-white font-bold text-sm">
                      {userInitial}
                    </div>
                    <span className="text-sm font-semibold text-gray-700 max-w-[100px] truncate">{userName}</span>
                    <ChevronDown size={14} className={`text-gray-400 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} />
                  </button>

                  {dropdownOpen && (
                    <div className="absolute right-0 top-12 w-52 bg-white border border-gray-200 rounded-2xl shadow-xl py-2 z-50">
                      <div className="px-4 py-2 border-b border-gray-100 mb-1">
                        <p className="text-xs font-bold text-gray-900 truncate">{userName}</p>
                        <p className="text-xs text-gray-400 truncate">{user.email}</p>
                      </div>
                      <Link
                        to="/dashboard"
                        onClick={() => setDropdownOpen(false)}
                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                      >
                        <LayoutDashboard size={15} className="text-gray-400" />
                        Dashboard
                      </Link>
                      <Link
                        to="/profile"
                        onClick={() => setDropdownOpen(false)}
                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                      >
                        <User size={15} className="text-gray-400" />
                        My Profile
                      </Link>
                      <div className="border-t border-gray-100 mt-1 pt-1">
                        <button
                          onClick={handleSignOut}
                          className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
                        >
                          <LogOut size={15} />
                          Sign Out
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <>
                <Link to="/auth" className="text-sm font-semibold text-gray-600 hover:text-gray-900 px-4 py-2 rounded-xl hover:bg-gray-100 transition-colors">
                  Sign In
                </Link>
                <Link to="/auth" className="bg-blue-600 text-white text-sm font-bold px-4 py-2 rounded-xl hover:bg-blue-700 transition-colors">
                  Get Started
                </Link>
              </>
            )}
          </div>

          {/* ── MOBILE MENU BUTTON ── */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="md:hidden w-9 h-9 flex items-center justify-center text-gray-600 hover:bg-gray-100 rounded-xl transition-colors"
          >
            {menuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* ── MOBILE MENU ── */}
      {menuOpen && (
        <div className="md:hidden border-t border-gray-200 bg-white px-4 py-4 flex flex-col gap-1">
          {NAV_LINKS.map(link => (
            <Link
              key={link.to}
              to={link.to}
              onClick={() => setMenuOpen(false)}
              className={`px-4 py-3 rounded-xl text-sm font-semibold transition-colors ${
                isActive(link.to)
                  ? 'bg-blue-50 text-blue-600'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              {link.label}
            </Link>
          ))}
          <div className="border-t border-gray-100 pt-3 mt-2 flex flex-col gap-2">

            {/* Mobile Language Toggle */}
            <button
              onClick={toggleLang}
              className="flex items-center justify-center gap-2 text-sm font-bold text-gray-600 px-4 py-3 rounded-xl border border-gray-200 hover:bg-gray-100 transition-colors"
            >
              {i18n.language === 'en' ? '🇮🇳 हिंदी में देखें' : '🇬🇧 View in English'}
            </button>

            {user ? (
              <>
                <Link to="/report" onClick={() => setMenuOpen(false)}
                  className="bg-blue-600 text-white text-sm font-bold px-4 py-3 rounded-xl text-center hover:bg-blue-700 transition-colors">
                  + Report Issue
                </Link>
                <button onClick={handleSignOut}
                  className="flex items-center justify-center gap-2 text-sm text-red-600 font-semibold px-4 py-3 rounded-xl hover:bg-red-50 transition-colors">
                  <LogOut size={15} /> Sign Out
                </button>
              </>
            ) : (
              <>
                <Link to="/auth" onClick={() => setMenuOpen(false)}
                  className="text-center text-sm font-semibold text-gray-700 px-4 py-3 rounded-xl hover:bg-gray-100 transition-colors">
                  Sign In
                </Link>
                <Link to="/auth" onClick={() => setMenuOpen(false)}
                  className="bg-blue-600 text-white text-sm font-bold px-4 py-3 rounded-xl text-center hover:bg-blue-700 transition-colors">
                  Get Started
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}