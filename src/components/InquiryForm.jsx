import React, { useState } from 'react';

export default function InquiryForm({ onNavigate }) {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    city: '',
    interest: 'Residential Plot',
    budget: 'Under 1 Crore',
    plot_size: '3 Marla',
    phase_preference: 'Phase 1',
    message: '',
  });

  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setFormData({
        name: '',
        phone: '',
        email: '',
        city: '',
        interest: 'Residential Plot',
        budget: 'Under 1 Crore',
        plot_size: '3 Marla',
        phase_preference: 'Phase 1',
        message: '',
      });
    }, 4000);
  };

  return (
    <section className="py-14 md:py-20 bg-[#F7F4EE] relative" id="contact">
      <div className="max-w-[850px] mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Form Container Card */}
        <div className="bg-white rounded-2xl md:rounded-[24px] shadow-[0_10px_35px_rgba(37,35,35,0.05)] border border-[#DDD8D0] p-5 sm:p-8 md:p-9 lg:p-10">
          
          {/* Header section inside card */}
          <div className="text-center mb-6 md:mb-8">
            <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-burgundy/5 text-burgundy mb-3">
              <svg className="w-5 h-5 text-burgundy" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 001 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
            </div>
            
            <div className="w-10 h-0.5 bg-gold mx-auto mb-2.5"></div>
            
            <h2 className="text-2xl sm:text-3xl font-neue font-semibold text-charcoal mb-2 tracking-tight">
              Find Your Place at Etihad Garden
            </h2>
            <p className="text-taupe text-xs sm:text-sm max-w-xl mx-auto font-sans leading-relaxed">
              Tell us what you're looking for and our team will help you find the right property option.
            </p>
          </div>

          {submitted ? (
            <div className="bg-[#FAF8F5] border border-gold/40 text-charcoal p-6 md:p-10 rounded-2xl text-center shadow-sm">
              <div className="w-14 h-14 bg-burgundy/10 rounded-full flex items-center justify-center mx-auto mb-3">
                <svg className="w-7 h-7 text-burgundy" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="text-xl sm:text-2xl font-neue font-semibold text-charcoal mb-2">Thank You for Your Inquiry!</h3>
              <p className="text-taupe text-sm max-w-md mx-auto">
                Our sales team will review your details and contact you shortly.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
              
              {/* 2-Column Grid for Desktop / 1-Column on Mobile */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-5 gap-y-4">
                
                {/* Row 1: Full Name */}
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-charcoal mb-1" htmlFor="name">
                    Full Name
                  </label>
                  <input
                    className="w-full h-[48px] px-3.5 rounded-xl border border-[#DDD8D0] bg-white text-charcoal text-sm placeholder:text-taupe/60 focus:border-burgundy focus:ring-3 focus:ring-burgundy/10 focus:outline-none transition-all duration-200"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Enter your full name"
                    required
                    type="text"
                  />
                </div>

                {/* Row 1: Phone Number */}
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-charcoal mb-1" htmlFor="phone">
                    Phone Number
                  </label>
                  <div className="flex h-[48px] rounded-xl border border-[#DDD8D0] focus-within:border-burgundy focus-within:ring-3 focus-within:ring-burgundy/10 bg-white overflow-hidden transition-all duration-200">
                    <span className="inline-flex items-center px-3 bg-[#FAF8F5] text-charcoal/80 text-xs sm:text-sm font-medium border-r border-[#DDD8D0] select-none">
                      🇵🇰 +92
                    </span>
                    <input
                      className="w-full h-full px-3.5 text-charcoal text-sm placeholder:text-taupe/60 bg-transparent outline-none"
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="03xx xxxxxxx"
                      required
                      type="tel"
                    />
                  </div>
                </div>

                {/* Row 2: Email Address */}
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-charcoal mb-1" htmlFor="email">
                    Email Address
                  </label>
                  <input
                    className="w-full h-[48px] px-3.5 rounded-xl border border-[#DDD8D0] bg-white text-charcoal text-sm placeholder:text-taupe/60 focus:border-burgundy focus:ring-3 focus:ring-burgundy/10 focus:outline-none transition-all duration-200"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="you@example.com"
                    required
                    type="email"
                  />
                </div>

                {/* Row 2: City */}
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-charcoal mb-1" htmlFor="city">
                    City
                  </label>
                  <input
                    className="w-full h-[48px] px-3.5 rounded-xl border border-[#DDD8D0] bg-white text-charcoal text-sm placeholder:text-taupe/60 focus:border-burgundy focus:ring-3 focus:ring-burgundy/10 focus:outline-none transition-all duration-200"
                    id="city"
                    name="city"
                    value={formData.city}
                    onChange={handleChange}
                    placeholder="Enter Your City"
                    type="text"
                  />
                </div>

                {/* Row 3: Primary Interest */}
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-charcoal mb-1" htmlFor="interest">
                    Primary Interest
                  </label>
                  <div className="relative">
                    <select
                      className="w-full h-[48px] px-3.5 pr-9 rounded-xl border border-[#DDD8D0] bg-white text-charcoal text-sm focus:border-burgundy focus:ring-3 focus:ring-burgundy/10 focus:outline-none appearance-none transition-all duration-200 cursor-pointer"
                      id="interest"
                      name="interest"
                      value={formData.interest}
                      onChange={handleChange}
                    >
                      <option value="Residential Plot">Residential Plot</option>
                      <option value="Constructed Villa">Constructed Villa</option>
                      <option value="Commercial Property">Commercial Property</option>
                      <option value="General Investment">General Investment</option>
                    </select>
                    <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-burgundy">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>
                </div>

                {/* Row 3: Estimated Budget */}
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-charcoal mb-1" htmlFor="budget">
                    Estimated Budget
                  </label>
                  <div className="relative">
                    <select
                      className="w-full h-[48px] px-3.5 pr-9 rounded-xl border border-[#DDD8D0] bg-white text-charcoal text-sm focus:border-burgundy focus:ring-3 focus:ring-burgundy/10 focus:outline-none appearance-none transition-all duration-200 cursor-pointer"
                      id="budget"
                      name="budget"
                      value={formData.budget}
                      onChange={handleChange}
                    >
                      <option value="Under 1 Crore">Under 1 Crore</option>
                      <option value="1 - 3 Crore">1 - 3 Crore</option>
                      <option value="3 - 5 Crore">3 - 5 Crore</option>
                      <option value="5 Crore+">5 Crore+</option>
                    </select>
                    <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-burgundy">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>
                </div>

                {/* Row 4: Preferred Plot Size */}
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-charcoal mb-1" htmlFor="plot_size">
                    Preferred Plot Size
                  </label>
                  <div className="relative">
                    <select
                      className="w-full h-[48px] px-3.5 pr-9 rounded-xl border border-[#DDD8D0] bg-white text-charcoal text-sm focus:border-burgundy focus:ring-3 focus:ring-burgundy/10 focus:outline-none appearance-none transition-all duration-200 cursor-pointer"
                      id="plot_size"
                      name="plot_size"
                      value={formData.plot_size}
                      onChange={handleChange}
                    >
                      <option value="3 Marla">3 Marla</option>
                      <option value="5 Marla">5 Marla</option>
                      <option value="10 Marla">10 Marla</option>
                      <option value="1 Kanal">1 Kanal</option>
                      <option value="Not Sure">Not Sure</option>
                    </select>
                    <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-burgundy">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>
                </div>

                {/* Row 4: Phase Preference */}
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-charcoal mb-1" htmlFor="phase_preference">
                    Phase Preference
                  </label>
                  <div className="relative">
                    <select
                      className="w-full h-[48px] px-3.5 pr-9 rounded-xl border border-[#DDD8D0] bg-white text-charcoal text-sm focus:border-burgundy focus:ring-3 focus:ring-burgundy/10 focus:outline-none appearance-none transition-all duration-200 cursor-pointer"
                      id="phase_preference"
                      name="phase_preference"
                      value={formData.phase_preference}
                      onChange={handleChange}
                    >
                      <option value="Phase 1">Phase 1</option>
                      <option value="Phase 2">Phase 2</option>
                      <option value="Phase 3">Phase 3</option>
                      <option value="No Preference">No Preference</option>
                    </select>
                    <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-burgundy">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>
                </div>

                {/* Additional Message (Full width) */}
                <div className="md:col-span-2">
                  <label className="block text-xs sm:text-sm font-medium text-charcoal mb-1" htmlFor="message">
                    Additional Message <span className="text-taupe/70 font-normal text-xs ml-1">(Optional)</span>
                  </label>
                  <textarea
                    className="w-full h-[100px] p-3 rounded-xl border border-[#DDD8D0] bg-white text-charcoal text-sm placeholder:text-taupe/60 focus:border-burgundy focus:ring-3 focus:ring-burgundy/10 focus:outline-none transition-all duration-200 resize-y"
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    placeholder="Any specific requirements..."
                  ></textarea>
                </div>
              </div>

              {/* Submit Button & Trust Microcopy */}
              <div className="pt-2">
                <button
                  className="w-full h-[48px] sm:h-[50px] bg-burgundy hover:bg-[#521923] text-white font-semibold text-base rounded-xl shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 flex items-center justify-center gap-2 group cursor-pointer"
                  type="submit"
                >
                  <span>Submit Inquiry</span>
                </button>

                <div className="text-center text-xs text-taupe mt-3 space-y-1">
                  <p>Your information is secure and will only be used to assist you with your property inquiry.</p>
                  <p className="text-[11px] text-taupe/90">
                    By submitting this form, you acknowledge that you have read our{' '}
                    <a
                      href="/privacy-policy"
                      onClick={(e) => {
                        if (onNavigate) {
                          e.preventDefault();
                          onNavigate('/privacy-policy');
                        }
                      }}
                      className="text-burgundy font-medium underline hover:text-burgundy/80 transition-colors"
                    >
                      Privacy Policy
                    </a>{' '}
                    and agree to our{' '}
                    <a
                      href="/terms-and-conditions"
                      onClick={(e) => {
                        if (onNavigate) {
                          e.preventDefault();
                          onNavigate('/terms-and-conditions');
                        }
                      }}
                      className="text-burgundy font-medium underline hover:text-burgundy/80 transition-colors"
                    >
                      Terms &amp; Conditions
                    </a>.
                  </p>
                </div>
              </div>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}

