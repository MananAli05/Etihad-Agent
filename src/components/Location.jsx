import React from 'react';

export default function Location() {
  const connectivityHighlights = [
    {
      title: 'Rahim Yar Khan Airport',
      time: '5 Mins Drive',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="1.8"
            d="M21 16v-2l-8-5V3.5A1.5 1.5 0 0011.5 2 1.5 1.5 0 0010 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z"
          />
        </svg>
      ),
    },
    {
      title: 'Sheikh Zayed Hospital',
      time: '8 Mins Drive',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="1.8"
            d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0H5m14 0h2M5 21H3m9-11v4m-2-2h4"
          />
        </svg>
      ),
    },
    {
      title: 'City Commercial Hub',
      time: '10 Mins Drive',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="1.8"
            d="M3 21h18M6 21V9a1 1 0 011-1h3a1 1 0 011 1v12m0 0h8a1 1 0 001-1V5a1 1 0 00-1-1h-6a1 1 0 00-1 1v16M9 12h.01M9 16h.01M15 8h.01M15 12h.01M15 16h.01"
          />
        </svg>
      ),
    },
    {
      title: 'Leading Schools & Colleges',
      time: 'Within 3-7 Mins',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="1.8"
            d="M12 3L1 9l11 6 9-4.91V17h2V9L12 3z"
          />
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="1.8"
            d="M5 13.18v4c0 1.66 3.13 3 7 3s7-1.34 7-3v-4"
          />
        </svg>
      ),
    },
  ];

  return (
    <section className="py-12 md:py-20 bg-white" id="location">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 items-center">
          <div>
            <h2 className="text-xs sm:text-sm font-bold tracking-widest text-gold uppercase mb-2 sm:mb-3">
              Strategic Location
            </h2>
            <h3 className="text-3xl sm:text-4xl font-neue font-semibold text-charcoal mb-4 md:mb-6 leading-tight">
              Connected to Everything That Matters
            </h3>
            <p className="text-taupe text-base sm:text-lg mb-6 md:mb-8 leading-relaxed">
              Situated prominently on Airport Road, Rahim Yar Khan, Etihad Garden offers unprecedented access to key transport links, medical facilities, premier educational institutions, and shopping districts.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 sm:gap-4">
              {connectivityHighlights.map((spot, idx) => (
                <div key={idx} className="bg-ivory p-3.5 sm:p-4 rounded-xl border border-gray-100 shadow-sm">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-burgundy/10 flex items-center justify-center text-burgundy flex-shrink-0">
                      {spot.icon}
                    </div>
                    <div>
                      <p className="font-semibold text-charcoal text-sm">{spot.title}</p>
                      <p className="text-gold text-xs font-medium">{spot.time}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-2xl overflow-hidden shadow-2xl border border-gray-100 bg-ivory p-4 sm:p-6 relative">
            <div className="flex items-center justify-between mb-3.5">
              <div className="flex items-center gap-2 overflow-hidden">
                <span className="w-3 h-3 bg-burgundy rounded-full animate-ping flex-shrink-0"></span>
                <span className="font-neue font-semibold text-charcoal text-base sm:text-lg truncate">Etihad Garden — Airport Road</span>
              </div>
            </div>
            <a
              href="https://www.google.com/maps/search/?api=1&query=Etihad+Garden,+Airport+Road,+Rahim+Yar+Khan,+Pakistan"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Open Etihad Garden location on Google Maps"
              className="block relative h-60 sm:h-72 rounded-xl overflow-hidden bg-gray-200 shadow-inner flex items-center justify-center text-center p-4 sm:p-6 bg-cover bg-center group transition-transform duration-300 hover:scale-[1.01]"
              style={{ backgroundImage: `url('/images/location-map.jpg')` }}
            >
              <div className="absolute inset-0 bg-black/60 group-hover:bg-black/50 transition-colors"></div>
              <div className="relative z-10 text-white">
                <svg className="w-10 h-10 sm:w-12 sm:h-12 text-gold mx-auto mb-2 animate-bounce" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.243-4.243a8 8 0 1111.314 0z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path>
                  <path d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path>
                </svg>
                <p className="font-neue font-semibold text-lg sm:text-xl">Etihad Garden</p>
                <p className="text-xs text-white/80 mt-1">Airport Road, Rahim Yar Khan, Pakistan</p>
              </div>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
