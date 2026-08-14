import React from 'react';

export default function Hero() {
  return (
    <>
      {/* BEGIN: Hero Section */}
      <section className="relative h-[420px] sm:h-[460px] lg:h-[620px] flex items-center justify-center overflow-hidden">
        {/* Background Image with Overlay */}
        <div className="absolute inset-0 z-0 overflow-hidden">
          <img
            alt="Aerial view of Etihad Garden"
            className="w-full h-full object-cover object-center scale-105 sm:scale-110"
            src="https://etihadgarden.com/wp-content/uploads/2025/08/Etihad-Garden-Phase-2-.jpg"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/75 via-black/50 to-black/35"></div>
        </div>

        <div className="relative z-10 text-center px-4 max-w-4xl mx-auto animate-fade-in-up -mt-4 sm:-mt-8 md:-mt-10 pb-4">
          <h1 className="text-3xl sm:text-5xl md:text-6xl font-neue font-semibold text-white mb-3 sm:mb-5 leading-tight">
            Your Place to Live<br />
            <span className="text-gold">Your Place to Grow</span>
          </h1>
          <p className="text-sm sm:text-lg md:text-xl text-white/90 mb-6 sm:mb-10 max-w-2xl mx-auto font-light leading-relaxed px-2">
            Discover thoughtfully planned living, modern facilities and a connected community at Etihad Garden.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-3 sm:gap-4 max-w-xs sm:max-w-none mx-auto w-full">
            <a
              className="bg-burgundy text-white hover:bg-burgundy/90 px-6 sm:px-8 py-3 sm:py-3.5 rounded text-sm sm:text-base font-medium transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 text-center min-h-[48px] flex items-center justify-center"
              href="#properties"
            >
              Explore Etihad Garden
            </a>
            <a
              className="bg-white/10 backdrop-blur-md border border-white/30 text-white hover:bg-white/20 px-6 sm:px-8 py-3 sm:py-3.5 rounded text-sm sm:text-base font-medium transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 text-center min-h-[48px] flex items-center justify-center"
              href="#contact"
            >
              Book a Site Visit
            </a>
          </div>
        </div>
      </section>
      {/* END: Hero Section */}

      {/* BEGIN: Quick Actions */}
      <div className="relative z-20 -mt-10 sm:-mt-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-12 sm:mb-20">
        <div className="bg-white p-3 sm:p-4 rounded-xl shadow-xl animate-fade-in-up delay-200 border border-gray-100">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-0 md:gap-4">
            <a
              className="flex flex-col items-center justify-center py-7 px-3 sm:py-6 sm:px-4 text-center group rounded-lg hover:bg-ivory transition-colors border-r border-b border-gray-200/70 md:border-r-0 md:border-b-0"
              href="#properties"
            >
              <svg
                className="w-7 h-7 sm:w-8 sm:h-8 text-gold mb-2.5 sm:mb-3 group-hover:scale-110 transition-transform"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="1.5"
                ></path>
              </svg>
              <span className="text-sm sm:text-base font-semibold text-charcoal">Explore Properties</span>
            </a>

            <a
              className="flex flex-col items-center justify-center py-7 px-3 sm:py-6 sm:px-4 text-center group rounded-lg hover:bg-ivory transition-colors border-b border-gray-200/70 md:border-b-0 md:border-l md:border-gray-100"
              href="#location"
            >
              <svg
                className="w-7 h-7 sm:w-8 sm:h-8 text-gold mb-2.5 sm:mb-3 group-hover:scale-110 transition-transform"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.243-4.243a8 8 0 1111.314 0z"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="1.5"
                ></path>
                <path
                  d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="1.5"
                ></path>
              </svg>
              <span className="text-sm sm:text-base font-semibold text-charcoal">View Location</span>
            </a>

            <a
              className="flex flex-col items-center justify-center py-7 px-3 sm:py-6 sm:px-4 text-center group rounded-lg hover:bg-ivory transition-colors border-r border-gray-200/70 md:border-r-0 md:border-l md:border-gray-100"
              href="#virtual-tour"
            >
              <svg
                className="w-7 h-7 sm:w-8 sm:h-8 text-gold mb-2.5 sm:mb-3 group-hover:scale-110 transition-transform"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="1.5"
                ></path>
              </svg>
              <span className="text-sm sm:text-base font-semibold text-charcoal">Virtual Tour</span>
            </a>

            <a
              className="flex flex-col items-center justify-center py-7 px-3 sm:py-6 sm:px-4 text-center group rounded-lg hover:bg-ivory transition-colors md:border-l md:border-gray-100"
              href="#contact"
            >
              <svg
                className="w-7 h-7 sm:w-8 sm:h-8 text-gold mb-2.5 sm:mb-3 group-hover:scale-110 transition-transform"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="1.5"
                ></path>
              </svg>
              <span className="text-sm sm:text-base font-semibold text-charcoal">Book a Visit</span>
            </a>
          </div>
        </div>
      </div>
      {/* END: Quick Actions */}
    </>
  );
}
