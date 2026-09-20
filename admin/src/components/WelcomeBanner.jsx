import React from 'react';
import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function WelcomeBanner() {
  return (
    <div className="relative rounded-xl overflow-hidden bg-gradient-to-r from-burgundy via-burgundy/95 to-burgundy/90 text-white p-5 sm:p-6 shadow-2xs mb-5 border border-burgundy/20 min-h-[140px] flex items-center">
      {/* Background Image Overlay */}
      <div className="absolute right-0 top-0 bottom-0 w-1/2 sm:w-2/5 overflow-hidden opacity-15 pointer-events-none">
        <img
          src="/images/hero.png"
          alt="Etihad Garden Aerial"
          className="w-full h-full object-cover object-center filter saturate-150 contrast-125"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-burgundy to-transparent" />
      </div>

      {/* Banner Content */}
      <div className="relative z-10 max-w-lg">
        <h2 className="text-lg sm:text-xl font-bold tracking-tight text-white mb-1">
          Lead Pipeline
        </h2>

        <p className="text-white/80 text-xs sm:text-sm leading-relaxed mb-3.5 max-w-md">
          Manage leads, calls and site visits from one place.
        </p>

        <div>
          <Link
            to="/leads"
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-gold hover:bg-gold/90 text-charcoal font-bold text-xs shadow-2xs transition-all duration-200"
          >
            <span>View Leads</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
}
