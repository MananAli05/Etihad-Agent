import React from 'react';
import { Search, Bell, Calendar, Menu } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Header({ mobileOpen, setMobileOpen }) {
  const { user, displayName, avatarUrl } = useAuth();
  const currentDate = new Date().toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });

  return (
    <header className="bg-white border-b border-gray-200/80 sticky top-0 z-30 h-16 px-4 sm:px-6 flex items-center justify-between font-sans">
      {/* Left: Mobile Menu Toggle & Title */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="lg:hidden p-2 rounded-xl text-gray-500 hover:text-charcoal hover:bg-ivory cursor-pointer"
          aria-label="Toggle Navigation"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div>
          <h1 className="text-base sm:text-lg font-bold tracking-tight text-charcoal leading-tight">
            Etihad Garden CRM
          </h1>
          <p className="text-[11px] sm:text-xs text-gray-500 font-medium">
            Lead management and sales activity overview
          </p>
        </div>
      </div>

      {/* Right: Search, Date, Notifications, Admin Profile */}
      <div className="flex items-center gap-3 sm:gap-4">
        {/* Date Badge */}
        <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-ivory/60 border border-gray-200/70 text-xs font-semibold text-gray-600">
          <Calendar className="w-3.5 h-3.5 text-gold" />
          <span>{currentDate}</span>
        </div>

        {/* Header Search */}
        <div className="relative hidden lg:block w-48 xl:w-56">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search CRM..."
            className="w-full pl-8 pr-3 py-1.5 bg-ivory/60 border border-gray-200/70 rounded-xl text-xs text-charcoal placeholder-gray-400 focus:outline-none focus:border-burgundy"
          />
        </div>

        {/* Notification Bell */}
        <button
          type="button"
          className="relative p-2 rounded-xl text-gray-500 hover:text-burgundy hover:bg-ivory transition-colors cursor-pointer"
          title="Notifications"
        >
          <Bell className="w-4 h-4" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-burgundy rounded-full" />
        </button>

        {/* Divider */}
        <div className="h-6 w-px bg-gray-200 hidden sm:block" />

        {/* User Profile */}
        <div className="flex items-center gap-2.5">
          {avatarUrl ? (
            <img
              src={avatarUrl}
              alt={displayName}
              className="w-8 h-8 rounded-xl object-cover border border-gray-200 shadow-2xs"
            />
          ) : (
            <div className="w-8 h-8 rounded-xl bg-burgundy text-white font-bold flex items-center justify-center text-xs shadow-2xs">
              {displayName?.charAt(0).toUpperCase() || 'A'}
            </div>
          )}

          <div className="hidden sm:block text-left">
            <span className="text-xs font-bold text-charcoal block leading-none">
              {displayName}
            </span>
            <span className="text-[10px] text-gray-400 font-medium truncate block max-w-[120px] mt-0.5">
              {user?.email || 'admin@etihadgarden.com'}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}
