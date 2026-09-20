import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  PhoneCall,
  MessageSquare,
  MapPin,
  CalendarCheck,
  Share2,
  TrendingUp,
  Settings,
  LogOut,
  X
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const navItems = [
  { name: 'Dashboard', path: '/', icon: LayoutDashboard },
  { name: 'Leads', path: '/leads', icon: Users },
  { name: 'Call History', path: '/calls', icon: PhoneCall },
  { name: 'Chat History', path: '/chats', icon: MessageSquare },
  { name: 'Site Visits', path: '/site-visits', icon: MapPin },
  { name: 'Follow-ups', path: '/follow-ups', icon: CalendarCheck },
  { name: 'Lead Sources', path: '/sources', icon: Share2 },
  { name: 'Analytics', path: '/analytics', icon: TrendingUp },
  { name: 'Settings', path: '/settings', icon: Settings },
];

export default function Sidebar({ mobileOpen, setMobileOpen }) {
  const { user, displayName, avatarUrl, signOut } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await signOut();
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      navigate('/admin/login', { replace: true });
    }
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {mobileOpen && (
        <div
          onClick={() => setMobileOpen(false)}
          className="fixed inset-0 bg-charcoal/40 backdrop-blur-xs z-40 lg:hidden"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-[250px] bg-white border-r border-gray-200/80 flex flex-col justify-between transition-transform duration-300 ease-in-out font-sans ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Top Branding & Nav */}
        <div>
          {/* Header & Logo */}
          <div className="h-16 px-5 flex items-center justify-between border-b border-gray-100">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-burgundy flex items-center justify-center p-1.5 shadow-2xs shrink-0">
                <img
                  src="/images/logo.png"
                  alt="Etihad Garden"
                  className="w-full h-full object-contain filter brightness-0 invert"
                />
              </div>
              <div>
                <span className="text-sm font-bold tracking-tight text-burgundy block leading-none">
                  ETIHAD GARDEN
                </span>
                <span className="text-[10px] font-bold text-gold tracking-wider uppercase block mt-0.5">
                  Sales CRM
                </span>
              </div>
            </div>

            {/* Mobile Close */}
            <button
              onClick={() => setMobileOpen(false)}
              className="lg:hidden p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="p-3 space-y-1 overflow-y-auto max-h-[calc(100vh-140px)]">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.name}
                  to={item.path}
                  end={item.path === '/'}
                  onClick={() => setMobileOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold transition-all duration-150 ${
                      isActive
                        ? 'bg-burgundy text-white shadow-2xs font-bold'
                        : 'text-gray-600 hover:text-burgundy hover:bg-ivory/80'
                    }`
                  }
                >
                  {({ isActive }) => (
                    <>
                      <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-gray-400'}`} />
                      <span>{item.name}</span>
                    </>
                  )}
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* Bottom Profile & Sign Out Footer */}
        <div className="p-3 border-t border-gray-100 bg-ivory/30">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5 overflow-hidden">
              {avatarUrl ? (
                <img
                  src={avatarUrl}
                  alt={displayName}
                  className="w-8 h-8 rounded-full object-cover border border-burgundy/20 shrink-0"
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-burgundy/10 border border-burgundy/20 flex items-center justify-center font-bold text-burgundy text-xs shrink-0">
                  {displayName?.charAt(0).toUpperCase() || 'A'}
                </div>
              )}
              <div className="text-left overflow-hidden">
                <p className="text-xs font-bold text-charcoal leading-tight truncate">{displayName}</p>
                <p className="text-[10px] text-gray-400 truncate">{user?.email || 'admin@etihadgarden.com'}</p>
              </div>
            </div>
            <button
              type="button"
              onClick={handleLogout}
              title="Sign Out"
              className="p-1.5 text-gray-400 hover:text-burgundy hover:bg-white rounded-lg transition-colors cursor-pointer shrink-0"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
