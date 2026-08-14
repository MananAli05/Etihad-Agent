import React from 'react';

export default function About() {
  return (
    <section className="py-12 md:py-20 bg-ivory" id="about">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-16 items-center">
          <div>
            <h2 className="text-xs sm:text-sm font-bold tracking-widest text-gold uppercase mb-2 sm:mb-3">
              About Etihad Garden
            </h2>
            <h3 className="text-3xl sm:text-4xl md:text-5xl font-neue font-semibold text-charcoal mb-4 md:mb-6 leading-tight">
              Designed for Better Living
            </h3>
            <p className="text-taupe text-base sm:text-lg mb-4 md:mb-6 leading-relaxed">
              Experience a new standard of community living in a master-planned environment. Etihad Garden integrates premium residential plots, luxury villas, and commercial hubs with world-class infrastructure.
            </p>
            <p className="text-taupe text-base sm:text-lg mb-6 md:mb-8 leading-relaxed">
              Our vision is to provide a secure, green, and vibrant community where families can thrive and investments flourish. Discover a lifestyle where every detail is crafted for your comfort.
            </p>
            <a
              className="inline-flex items-center text-burgundy font-semibold hover:text-burgundy/80 transition-colors min-h-[44px]"
              href="#contact"
            >
              Learn more about our master plan
              <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path d="M17 8l4 4m0 0l-4 4m4-4H3" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path>
              </svg>
            </a>
          </div>

          <div className="relative mt-4 md:mt-0">
            <div className="rounded-2xl overflow-hidden shadow-2xl w-full">
              <img
                alt="Etihad Garden Sales Office Model"
                className="object-cover w-full h-auto max-h-[380px] md:max-h-[450px]"
                src="/images/about.jpg"
              />
            </div>
            <div className="absolute -bottom-4 -left-4 sm:-bottom-6 sm:-left-6 bg-white p-4 sm:p-6 rounded-xl shadow-xl border border-gray-100">
              <p className="text-2xl sm:text-4xl font-neue font-semibold text-burgundy mb-0.5 sm:mb-1">100%</p>
              <p className="text-xs sm:text-sm font-medium text-taupe uppercase tracking-wide">LDA Approved</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
