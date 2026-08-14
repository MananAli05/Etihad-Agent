import React from 'react';

export default function Properties() {
  const propertyCards = [
    {
      title: 'Residential Plots',
      description: 'Build your dream home on perfectly sized, fully developed plots.',
      image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRN-SoMi7eb8dj-Zt-t7taW46H0AeyvIJmixpJ5dBRx6IcCPhPvaojFGbuq&s=10',
    },
    {
      title: 'Family Homes',
      description: 'Spacious, thoughtfully designed homes ready for your family.',
      image: '/images/family-homes.jpg',
    },
    {
      title: 'Premium Villas',
      description: 'Experience ultimate luxury and privacy in our exclusive villa community.',
      image: '/images/premium-villas.jpg',
    },
    {
      title: 'Commercial Plots',
      description: 'Prime commercial locations to grow your business or invest.',
      image: '/images/commercial-plots.jpg',
    },
  ];

  return (
    <section className="py-12 md:py-20 bg-white" id="properties">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-10 md:mb-16">
          <h2 className="text-xs sm:text-sm font-bold tracking-widest text-gold uppercase mb-2 sm:mb-3">Explore</h2>
          <h3 className="text-3xl sm:text-4xl font-neue font-semibold text-charcoal mb-4 md:mb-6">
            Find a Place That Fits Your Future
          </h3>
          <p className="text-taupe text-base sm:text-lg">
            Choose from a diverse range of property options tailored to meet your family's needs and investment goals.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
          {propertyCards.map((card) => (
            <div key={card.title} className="group cursor-pointer">
              <div className="relative h-56 sm:h-64 rounded-xl overflow-hidden mb-3.5 shadow-md">
                <img
                  alt={card.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  src={card.image}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent"></div>
                <h4 className="absolute bottom-4 left-4 text-white text-lg sm:text-xl font-neue font-semibold">
                  {card.title}
                </h4>
              </div>
              <p className="text-taupe text-sm leading-relaxed">{card.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
