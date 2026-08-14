import React, { useState } from 'react';

export default function Navbar({ onNavigate }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleNavClick = (e, href) => {
    if (onNavigate) {
      if (href === '/' || href === '#') {
        e.preventDefault();
        onNavigate('/');
      } else if (href.startsWith('#')) {
        e.preventDefault();
        onNavigate('/', href);
      }
    }
  };

  const navLinks = [
    { name: 'Home', href: '/' },
    { name: 'About', href: '/#about' },
    { name: 'Properties', href: '/#properties' },
    { name: 'Facilities', href: '/#facilities' },
    { name: 'Location', href: '/#location' },
    { name: 'Virtual Tour', href: '/#virtual-tour' },
  ];

  return (
    <header className="fixed w-full z-50 bg-white/95 backdrop-blur-sm shadow-sm transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20 sm:h-24">
          {/* Logo */}
          <div className="flex-shrink-0 flex items-center">
            <a
              className="flex items-center gap-2 py-2"
              href="/"
              onClick={(e) => handleNavClick(e, '/')}
            >
              <img
                alt="Etihad Garden Logo"
                className="h-14 sm:h-16 md:h-20 w-auto object-contain transition-all duration-300"
                src="/images/logo.png"
              />
            </a>
          </div>

          {/* Desktop Menu */}
          <nav className="hidden md:flex space-x-8">
            {navLinks.map((link) => (
              <a
                key={link.name}
                className="text-charcoal hover:text-burgundy px-3 py-2 text-sm font-medium transition-colors"
                href={link.href}
                onClick={(e) => handleNavClick(e, link.href)}
              >
                {link.name}
              </a>
            ))}
          </nav>

          {/* CTA & Mobile Toggle */}
          <div className="flex items-center gap-4">
            <div className="hidden md:flex items-center">
              <a
                className="bg-burgundy text-white hover:bg-burgundy/90 px-6 py-2.5 rounded text-sm font-medium transition-colors shadow-md hover:shadow-lg"
                href="/#contact"
                onClick={(e) => handleNavClick(e, '#contact')}
              >
                Book a Visit
              </a>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden text-charcoal hover:text-burgundy p-2 rounded-md focus:outline-none min-h-[44px] min-w-[44px] flex items-center justify-center"
              aria-label="Toggle Navigation Menu"
            >
              <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {mobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-b border-gray-200 px-4 pt-2 pb-6 space-y-2 shadow-lg animate-in fade-in slide-in-from-top-2 duration-200">
          {navLinks.map((link) => (
            <a
              key={link.name}
              onClick={(e) => {
                setMobileMenuOpen(false);
                handleNavClick(e, link.href);
              }}
              className="block text-charcoal hover:text-burgundy px-3 py-2.5 text-base font-medium transition-colors border-b border-gray-100 last:border-0"
              href={link.href}
            >
              {link.name}
            </a>
          ))}
          <a
            onClick={(e) => {
              setMobileMenuOpen(false);
              handleNavClick(e, '#contact');
            }}
            className="block text-center bg-burgundy text-white hover:bg-burgundy/90 px-6 py-3 rounded-lg text-base font-medium transition-colors shadow-md mt-4"
            href="/#contact"
          >
            Book a Visit
          </a>
        </div>
      )}
    </header>
  );
}
