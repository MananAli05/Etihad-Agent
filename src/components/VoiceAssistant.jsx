import React, { useState } from 'react';

export default function VoiceAssistant({ onOpenChat, onOpenVoice }) {
  return (
    <section className="py-12 lg:py-16 bg-burgundy text-white overflow-hidden relative">
      <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 bg-gold/10 rounded-full blur-3xl"></div>
      <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-72 h-72 bg-white/5 rounded-full blur-2xl"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12 items-center">
          {/* Meet Sara */}
          <div>
            <h2 className="text-xs sm:text-sm font-bold tracking-widest text-gold uppercase mb-2">
              Customer Support
            </h2>
            <h3 className="text-2xl sm:text-3xl lg:text-4xl font-neue font-semibold mb-3 sm:mb-4">
              Have Questions? Meet Sara.
            </h3>
            <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 sm:p-5 mb-5 sm:mb-6 border border-white/20">
              <p className="text-sm sm:text-lg italic font-light leading-relaxed">
                "Assalam-o-Alaikum! Main Sara hoon. Aap Etihad Garden ke baare mein kya maloom karna chahtay hain?"
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 w-full sm:w-auto">
              <button
                onClick={onOpenChat}
                className="bg-white text-burgundy hover:bg-ivory px-6 sm:px-8 py-3 rounded-xl text-sm sm:text-base font-semibold transition-all shadow-lg flex items-center justify-center cursor-pointer min-h-[48px] w-full sm:w-auto"
              >
                <svg className="w-5 h-5 mr-2 text-burgundy" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                  ></path>
                </svg>
                Chat With Sara
              </button>

              {/* Voice Assistant Trigger */}
              <button
                onClick={onOpenVoice}
                className="bg-transparent border border-gold/60 text-white hover:bg-white/10 px-6 sm:px-8 py-3 rounded-xl text-sm sm:text-base font-semibold transition-all flex items-center justify-center group cursor-pointer shadow-md min-h-[48px] w-full sm:w-auto"
              >
                <svg
                  className="w-5 h-5 mr-2 group-hover:animate-pulse text-gold"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                  ></path>
                </svg>
                Talk to Sara
              </button>
            </div>

            {/* Mock Voice Call Preview */}
            <div className="mt-5 sm:mt-6 flex items-center gap-3.5 bg-black/20 p-3 sm:p-3.5 rounded-xl border border-white/10 inline-flex max-w-full">
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full overflow-hidden border-2 border-gold flex-shrink-0">
                <img
                  alt="Sara Avatar"
                  className="w-full h-full object-cover"
                  src="/images/sara.jpg"
                />
              </div>
              <div>
                <p className="text-xs text-white/70">
                  Voice Assistant Available
                </p>
                <div className="flex items-end gap-1 h-3.5 mt-1">
                  <div className="w-1 bg-gold rounded wave-bar"></div>
                  <div className="w-1 bg-gold rounded wave-bar"></div>
                  <div className="w-1 bg-gold rounded wave-bar"></div>
                  <div className="w-1 bg-gold rounded wave-bar"></div>
                  <div className="w-1 bg-gold rounded wave-bar"></div>
                </div>
              </div>
            </div>
          </div>

          {/* Sara Portrait */}
          <div className="relative flex justify-center md:justify-end mt-4 md:mt-0">
            <div className="relative w-full max-w-sm lg:max-w-md">
              <div className="h-[280px] sm:h-[380px] lg:h-[450px] rounded-2xl overflow-hidden shadow-2xl border-4 border-white/10">
                <img
                  alt="Sara - Sales Consultant"
                  className="w-full h-full object-cover object-top"
                  src="/images/sara.jpg"
                />
              </div>
              <div className="absolute -bottom-3 -left-3 sm:-bottom-4 sm:-left-4 bg-white text-charcoal px-4 sm:px-5 py-2 sm:py-2.5 rounded-lg shadow-xl font-medium text-xs sm:text-sm flex items-center gap-2 sm:gap-2.5">
                <span className="w-2.5 h-2.5 bg-green-500 rounded-full animate-pulse"></span>
                Online Now
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
