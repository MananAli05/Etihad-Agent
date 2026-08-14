import React from 'react';

export default function FinalCTA() {
  return (
    <section className="py-16 bg-ivory border-t border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h3 className="text-3xl md:text-4xl font-neue font-semibold text-charcoal mb-4">
          Ready to Step Into Your Future Home?
        </h3>
        <p className="text-taupe text-lg max-w-2xl mx-auto mb-8">
          Join hundreds of families already thriving in Pakistan's premier master-planned community.
        </p>
        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <a
            className="bg-burgundy text-white hover:bg-burgundy/90 px-8 py-3.5 rounded text-base font-medium transition-all shadow-lg hover:shadow-xl"
            href="#contact"
          >
            Book a Site Visit Now
          </a>
          <a
            className="bg-white border border-gray-300 text-charcoal hover:bg-gray-50 px-8 py-3.5 rounded text-base font-medium transition-all shadow-sm"
            href="tel:03111ETIHAD"
          >
            Call Hotline: 03111-374723
          </a>
        </div>
      </div>
    </section>
  );
}
