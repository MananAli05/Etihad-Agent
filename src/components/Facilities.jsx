import React from 'react';

export default function Facilities() {
  const facilitiesList = [
    'Gated Community with 24/7 Security & CCTV',
    'Lush Green Parks, Playgrounds & Landscaping',
    'Modern Community Center & Health Club',
    'Underground Electricity & Modern Utilities',
    'Commercial Avenues & Retail Hubs',
    'Wide Asphalt Roads & Underground Sewage Systems',
  ];

  return (
    <section className="py-12 md:py-20 bg-ivory" id="facilities">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 items-center">
          <div className="order-2 md:order-1 rounded-2xl overflow-hidden shadow-2xl w-full">
            <img
              alt="Family in front of modern house"
              className="w-full h-auto max-h-[380px] md:max-h-[450px] object-cover"
              src="/images/facilities.jpg"
            />
          </div>

          <div className="order-1 md:order-2">
            <h2 className="text-xs sm:text-sm font-bold tracking-widest text-gold uppercase mb-2 sm:mb-3">
              Community Lifestyle
            </h2>
            <h3 className="text-3xl sm:text-4xl font-neue font-semibold text-charcoal mb-4 md:mb-6 leading-tight">
              A Place Where Memories Are Made
            </h3>
            <p className="text-taupe text-base sm:text-lg mb-6 leading-relaxed">
              At Etihad Garden, we believe in creating more than just houses; we build communities. Enjoy expansive green parks, dedicated children's play areas, and secure jogging tracks right outside your door.
            </p>

            <ul className="space-y-3 sm:space-y-4 mb-4 md:mb-8">
              {facilitiesList.map((facility, index) => (
                <li key={index} className="flex items-start sm:items-center text-charcoal font-medium text-sm sm:text-base">
                  <svg
                    className="w-5 h-5 text-gold mr-3 flex-shrink-0 mt-0.5 sm:mt-0"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      d="M5 13l4 4L19 7"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                    ></path>
                  </svg>
                  <span>{facility}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
