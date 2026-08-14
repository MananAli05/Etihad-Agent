import React from 'react';

export default function Footer({ onOpenChat, onOpenVoice, onNavigate }) {
  const handleLegalClick = (e, path) => {
    if (onNavigate) {
      e.preventDefault();
      onNavigate(path);
    }
  };

  return (
    <>
      <footer className="bg-charcoal text-white pt-16 pb-8 border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
            <div className="md:col-span-1">
              <div className="bg-white inline-block p-3 rounded-lg mb-6 shadow-sm">
                <img
                  alt="Etihad Garden Logo"
                  className="h-14 md:h-16 w-auto object-contain transition-all duration-300"
                  src="/images/logo.png"
                />
              </div>
              <p className="text-gray-400 text-sm leading-relaxed">
                Premium housing society offering a luxurious lifestyle, modern amenities, and secure investment opportunities in Pakistan.
              </p>
            </div>

            <div>
              <h4 className="text-gold font-semibold mb-6">Quick Links</h4>
              <ul className="space-y-3 text-sm text-gray-300">
                <li>
                  <a
                    className="hover:text-white transition-colors"
                    href="/"
                    onClick={(e) => handleLegalClick(e, '/')}
                  >
                    Home
                  </a>
                </li>
                <li>
                  <a className="hover:text-white transition-colors" href="/#about">
                    About Us
                  </a>
                </li>
                <li>
                  <a className="hover:text-white transition-colors" href="/#properties">
                    Properties
                  </a>
                </li>
                <li>
                  <a className="hover:text-white transition-colors" href="/#facilities">
                    Facilities &amp; Amenities
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="text-gold font-semibold mb-6">Resources</h4>
              <ul className="space-y-3 text-sm text-gray-300">
                <li>
                  <a className="hover:text-white transition-colors" href="/#about">
                    Master Plan
                  </a>
                </li>
                <li>
                  <a className="hover:text-white transition-colors" href="/#properties">
                    Payment Plans
                  </a>
                </li>
                <li>
                  <a
                    className="hover:text-white transition-colors"
                    href="/privacy-policy"
                    onClick={(e) => handleLegalClick(e, '/privacy-policy')}
                  >
                    Privacy Policy
                  </a>
                </li>
                <li>
                  <a
                    className="hover:text-white transition-colors"
                    href="/terms-and-conditions"
                    onClick={(e) => handleLegalClick(e, '/terms-and-conditions')}
                  >
                    Terms &amp; Conditions
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="text-gold font-semibold text-base mb-5">Contact Us</h4>
              <div className="space-y-4 text-sm text-gray-300">
                {/* Phone Numbers Block */}
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-burgundy/30 text-gold mt-0.5 flex-shrink-0 border border-gold/20">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                  </div>
                  <div className="space-y-1.5 text-xs sm:text-sm">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-gold/90 w-8">PAK:</span>
                      <a href="tel:+9268111998877" className="hover:text-white transition-colors text-gray-300 font-sans">
                        +92 30 367-22-500
                      </a>
                    </div>
                  </div>
                </div>

                {/* Email Block */}
                <div className="flex items-start gap-3 pt-1">
                  <div className="p-2 rounded-lg bg-burgundy/30 text-gold mt-0.5 flex-shrink-0 border border-gold/20">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div>
                    <span className="block text-xs font-semibold text-gold/90 mb-0.5">Mail:</span>
                    <a href="mailto:info@etihadgarden.pk" className="text-xs sm:text-sm text-gray-300 hover:text-white transition-colors">
                      info@etihadgarden.pk
                    </a>
                  </div>
                </div>

                {/* Corporate Office Block */}
                <div className="flex items-start gap-3 pt-1">
                  <div className="p-2 rounded-lg bg-burgundy/30 text-gold mt-0.5 flex-shrink-0 border border-gold/20">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0H5m14 0h2M5 21H3m9-11v4m-2-2h4" />
                    </svg>
                  </div>
                  <div>
                    <span className="block text-xs font-semibold text-gold/90 mb-0.5">Corporate Office:</span>
                    <p className="text-xs sm:text-sm text-gray-300 leading-relaxed">
                      C-157 A1, Etihad Garden Phase Rahim Yar Khan
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center text-xs text-gray-500">
            <p>© 2026 Etihad Garden. All rights reserved.</p>
            <div className="flex space-x-4 mt-4 md:mt-0">
              <a
                className="hover:text-white transition-colors"
                href="/privacy-policy"
                onClick={(e) => handleLegalClick(e, '/privacy-policy')}
              >
                Privacy Policy
              </a>
              <a
                className="hover:text-white transition-colors"
                href="/terms-and-conditions"
                onClick={(e) => handleLegalClick(e, '/terms-and-conditions')}
              >
                Terms &amp; Conditions
              </a>
            </div>
          </div>
        </div>
      </footer>

      {/* Floating Support Buttons */}
      <div className="fixed bottom-4 sm:bottom-6 right-4 sm:right-6 z-40 flex flex-col items-end gap-2.5 sm:gap-3">
        {/* Button 1: Talk to Sara (Voice Assistant) */}
        <div className="relative group">
          <div className="absolute right-full mr-3 top-1/2 -translate-y-1/2 hidden group-hover:block bg-charcoal text-white text-xs py-1.5 px-3 rounded-lg shadow-md whitespace-nowrap border border-gold/30">
            Talk to Sara
          </div>
          <button
            onClick={onOpenVoice}
            aria-label="Talk to Sara"
            className="bg-burgundy text-white p-3 sm:p-3.5 rounded-full shadow-xl hover:bg-burgundy/90 transition-all duration-300 hover:scale-105 flex items-center justify-center border border-gold/40 cursor-pointer group min-w-[48px] min-h-[48px]"
          >
            <svg className="w-6 h-6 group-hover:animate-pulse text-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
              ></path>
            </svg>
          </button>
        </div>

        {/* Button 2: Chat with Sara (Chatbot) */}
        <div className="relative group">
          <div className="absolute right-full mr-3 top-1/2 -translate-y-1/2 hidden group-hover:block bg-charcoal text-white text-xs py-1.5 px-3 rounded-lg shadow-md whitespace-nowrap border border-gold/30">
            Chat with Sara
          </div>
          <button
            onClick={onOpenChat}
            aria-label="Chat with Sara"
            className="bg-gradient-to-r from-burgundy to-[#521923] text-white p-3 sm:p-3.5 rounded-full shadow-2xl hover:shadow-burgundy/40 transition-all duration-300 hover:scale-105 flex items-center justify-center border-2 border-gold/60 cursor-pointer min-w-[48px] min-h-[48px]"
          >
            <div className="relative">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                ></path>
              </svg>
              <span className="w-2.5 h-2.5 bg-emerald-400 rounded-full absolute -top-1 -right-1 border border-burgundy"></span>
            </div>
          </button>
        </div>
      </div>
    </>
  );
}
