import React from 'react';

export default function TermsAndConditions({ onNavigate }) {
  const handleLinkClick = (e, path) => {
    e.preventDefault();
    if (onNavigate) {
      onNavigate(path);
    }
  };

  return (
    <div className="bg-[#F7F4EE] min-h-screen py-12 md:py-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Breadcrumb / Back Link */}
        <div className="mb-8">
          <a
            href="/"
            onClick={(e) => handleLinkClick(e, '/')}
            className="inline-flex items-center gap-2 text-sm font-medium text-burgundy hover:text-[#521923] transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            <span>Back to Home</span>
          </a>
        </div>

        {/* Header Card */}
        <div className="bg-white rounded-2xl md:rounded-[24px] p-6 sm:p-10 md:p-12 shadow-[0_10px_35px_rgba(37,35,35,0.05)] border border-[#DDD8D0] mb-8">
          <div className="w-12 h-0.5 bg-gold mb-4"></div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-neue font-semibold text-charcoal mb-4 tracking-tight">
            Terms &amp; Conditions
          </h1>
          <p className="text-taupe text-sm font-medium mb-6">
            Last Updated: August 14, 2026
          </p>
          <p className="text-charcoal/90 text-base md:text-lg leading-relaxed font-sans border-l-4 border-burgundy pl-4 bg-[#FAF8F5] py-3 rounded-r-lg">
            These Terms &amp; Conditions govern your use of the Etihad Garden website. By accessing or using this website, you agree to use it responsibly and in accordance with these terms.
          </p>
        </div>

        {/* Content Sections */}
        <div className="bg-white rounded-2xl md:rounded-[24px] p-6 sm:p-10 md:p-12 shadow-[0_10px_35px_rgba(37,35,35,0.05)] border border-[#DDD8D0] space-y-10 text-charcoal/90 leading-relaxed font-sans text-sm md:text-base">
          
          {/* Section 1 */}
          <section>
            <h2 className="text-xl md:text-2xl font-neue font-semibold text-charcoal mb-3 pb-2 border-b border-gray-100 flex items-center gap-2">
              <span className="text-gold font-mono text-lg">01.</span> Use of Website
            </h2>
            <p className="mb-3">
              You may access and use this website solely for lawful purposes to:
            </p>
            <ul className="list-disc list-inside space-y-1.5 pl-2 text-taupe/90">
              <li>Learn about Etihad Garden master-planned development</li>
              <li>Explore property types, plot sizes, and amenity details</li>
              <li>Submit customer inquiry forms and request project information</li>
              <li>Schedule or request physical site visits</li>
              <li>Interact with available website assistance tools</li>
            </ul>
            <p className="mt-3">
              Visitors must not misuse the website, attempt unauthorized access, or interfere with website operations.
            </p>
          </section>

          {/* Section 2 */}
          <section className="bg-[#FAF8F5] p-6 rounded-xl border border-[#DDD8D0]">
            <h2 className="text-xl md:text-2xl font-neue font-semibold text-charcoal mb-3 flex items-center gap-2">
              <span className="text-gold font-mono text-lg">02.</span> Property Information &amp; Disclaimer
            </h2>
            <p className="mb-3">
              Website information—including property descriptions, plot sizes, development layouts, facility details, estimated prices, payment plans, and availability—is provided for general informational purposes only and is subject to change without prior notice.
            </p>
            <p className="mb-3 text-burgundy font-medium">
              Property prices, plot availability, installment plans, and official commercial terms must be confirmed directly with authorized Etihad Garden representatives prior to making any financial commitment or purchase decision.
            </p>
            <p className="text-xs text-taupe/80 italic">
              * Website content does not constitute a guaranteed price quote, binding contract, or warranty of future capital appreciation or completion timelines.
            </p>
          </section>

          {/* Section 3 */}
          <section>
            <h2 className="text-xl md:text-2xl font-neue font-semibold text-charcoal mb-3 pb-2 border-b border-gray-100 flex items-center gap-2">
              <span className="text-gold font-mono text-lg">03.</span> Images and Visual Content
            </h2>
            <p>
              Photographs, 3D architectural renders, site master plans, and promotional video tours presented on this website are intended to convey the design intent of Etihad Garden. Visual materials may be illustrative and may not represent the exact final appearance of individual plots or completed structures.
            </p>
          </section>

          {/* Section 4 */}
          <section className="bg-burgundy/5 p-6 rounded-xl border border-burgundy/20">
            <h2 className="text-xl md:text-2xl font-neue font-semibold text-burgundy mb-3 flex items-center gap-2">
              <span className="text-gold font-mono text-lg">04.</span> AI Assistant — Sara
            </h2>
            <p className="mb-3">
              Our automated assistant <strong>Sara</strong> is provided as an informational self-service feature to help answer general property questions.
            </p>
            <ul className="list-disc list-inside space-y-1.5 pl-2 text-taupe/90">
              <li>Sara's automated responses do not constitute a binding offer, formal quote, or legal/financial contract.</li>
              <li>Sara does not guarantee real-time plot availability, final pricing, or investment returns.</li>
              <li>Visitors should always verify critical property details with an official Etihad Garden consultant.</li>
            </ul>
          </section>

          {/* Section 5 */}
          <section>
            <h2 className="text-xl md:text-2xl font-neue font-semibold text-charcoal mb-3 pb-2 border-b border-gray-100 flex items-center gap-2">
              <span className="text-gold font-mono text-lg">05.</span> Inquiry Submissions
            </h2>
            <p>
              Submitting an online inquiry form or request for information does not constitute a plot reservation, binding booking, or sale contract. Upon receiving your submission, an Etihad Garden sales representative may contact you to verify details and discuss your requirements.
            </p>
          </section>

          {/* Section 6 */}
          <section>
            <h2 className="text-xl md:text-2xl font-neue font-semibold text-charcoal mb-3 pb-2 border-b border-gray-100 flex items-center gap-2">
              <span className="text-gold font-mono text-lg">06.</span> Site Visits
            </h2>
            <p>
              Requests for site visits submitted through the website are subject to scheduling availability and official confirmation by Etihad Garden. Submitting a request does not guarantee an appointment at the exact requested time slot.
            </p>
          </section>

          {/* Section 7 */}
          <section>
            <h2 className="text-xl md:text-2xl font-neue font-semibold text-charcoal mb-3 pb-2 border-b border-gray-100 flex items-center gap-2">
              <span className="text-gold font-mono text-lg">07.</span> Intellectual Property
            </h2>
            <p>
              All website content—including the Etihad Garden logo, brand designs, text, graphics, images, video assets, and software code—is the property of Etihad Garden or its licensors and is protected by applicable copyright and intellectual property laws. Content may not be copied, reproduced, or commercially exploited without express written permission.
            </p>
          </section>

          {/* Section 8 */}
          <section>
            <h2 className="text-xl md:text-2xl font-neue font-semibold text-charcoal mb-3 pb-2 border-b border-gray-100 flex items-center gap-2">
              <span className="text-gold font-mono text-lg">08.</span> Third-Party Services
            </h2>
            <p>
              This website may integrate or link to external third-party services (such as mapping services or embedded players). Third-party services operate under their own terms of service and privacy policies, for which Etihad Garden assumes no responsibility.
            </p>
          </section>

          {/* Section 9 */}
          <section>
            <h2 className="text-xl md:text-2xl font-neue font-semibold text-charcoal mb-3 pb-2 border-b border-gray-100 flex items-center gap-2">
              <span className="text-gold font-mono text-lg">09.</span> Website Availability
            </h2>
            <p>
              While Etihad Garden endeavors to maintain continuous website availability, we do not guarantee uninterrupted or error-free site operation. Access may be temporarily suspended without notice for routine maintenance, system updates, or emergency repairs.
            </p>
          </section>

          {/* Section 10 */}
          <section>
            <h2 className="text-xl md:text-2xl font-neue font-semibold text-charcoal mb-3 pb-2 border-b border-gray-100 flex items-center gap-2">
              <span className="text-gold font-mono text-lg">10.</span> Prohibited Use
            </h2>
            <p className="mb-3">When using this website, you agree not to:</p>
            <ul className="list-disc list-inside space-y-1.5 pl-2 text-taupe/90">
              <li>Attempt unauthorized access to website servers or infrastructure</li>
              <li>Upload malicious code, viruses, or harmful scripts</li>
              <li>Scrape, extract, or harvest website data without prior consent</li>
              <li>Impersonate any person or submit false contact details</li>
              <li>Use the website for any unlawful, deceptive, or fraudulent purpose</li>
            </ul>
          </section>

          {/* Section 11 */}
          <section>
            <h2 className="text-xl md:text-2xl font-neue font-semibold text-charcoal mb-3 pb-2 border-b border-gray-100 flex items-center gap-2">
              <span className="text-gold font-mono text-lg">11.</span> Limitation of Liability
            </h2>
            <p>
              Website content is provided for general informational guidance. Visitors are advised to obtain independent legal and financial counsel before entering into any binding real-estate purchase agreement.
            </p>
          </section>

          {/* Section 12 */}
          <section>
            <h2 className="text-xl md:text-2xl font-neue font-semibold text-charcoal mb-3 pb-2 border-b border-gray-100 flex items-center gap-2">
              <span className="text-gold font-mono text-lg">12.</span> Changes to Terms
            </h2>
            <p>
              Etihad Garden reserves the right to amend these Terms &amp; Conditions at any time. Continued use of the website following published updates signifies acceptance of the revised terms.
            </p>
          </section>

          {/* Section 13 */}
          <section className="bg-ivory p-6 md:p-8 rounded-xl border border-[#DDD8D0]">
            <h2 className="text-xl md:text-2xl font-neue font-semibold text-charcoal mb-3 flex items-center gap-2">
              <span className="text-gold font-mono text-lg">13.</span> Governing Law &amp; Legal Review
            </h2>
            <p className="mb-3 text-taupe">
              These Terms are intended to be interpreted in accordance with applicable laws and regulations. The appropriate governing law and jurisdiction should be confirmed by Etihad Garden's legal adviser before publication.
            </p>
            <div className="p-3 bg-white rounded border border-gold/40 text-xs text-taupe font-mono">
              [Note: Final jurisdiction and governing law clause subject to formal review by Etihad Garden legal counsel.]
            </div>
          </section>

        </div>
      </div>
    </div>
  );
}
