import React from 'react';

export default function PrivacyPolicy({ onNavigate }) {
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
            Privacy Policy
          </h1>
          <p className="text-taupe text-sm font-medium mb-6">
            Last Updated: August 14, 2026
          </p>
          <p className="text-charcoal/90 text-base md:text-lg leading-relaxed font-sans border-l-4 border-burgundy pl-4 bg-[#FAF8F5] py-3 rounded-r-lg">
            At Etihad Garden, we respect your privacy and are committed to handling your personal information responsibly. This Privacy Policy explains what information we may collect when you use our website, interact with our services, or contact us, and how that information may be used.
          </p>
        </div>

        {/* Content Sections */}
        <div className="bg-white rounded-2xl md:rounded-[24px] p-6 sm:p-10 md:p-12 shadow-[0_10px_35px_rgba(37,35,35,0.05)] border border-[#DDD8D0] space-y-10 text-charcoal/90 leading-relaxed font-sans text-sm md:text-base">
          
          {/* Section 1 */}
          <section>
            <h2 className="text-xl md:text-2xl font-neue font-semibold text-charcoal mb-3 pb-2 border-b border-gray-100 flex items-center gap-2">
              <span className="text-gold font-mono text-lg">01.</span> Information We Collect
            </h2>
            <p className="mb-3">
              We may collect personal information that you voluntarily provide to us through website forms, inquiry submissions, site-visit requests, or communication channels. This includes:
            </p>
            <ul className="list-disc list-inside space-y-1.5 pl-2 text-taupe/90 mb-4">
              <li>Full name</li>
              <li>Phone number</li>
              <li>Email address</li>
              <li>City</li>
              <li>Primary property interest (e.g. Residential Plot, Villa, Commercial)</li>
              <li>Estimated budget</li>
              <li>Preferred plot size</li>
              <li>Phase preference</li>
              <li>Additional message and specific requirements</li>
              <li>Site visit booking requests and follow-up preferences</li>
            </ul>
            <p>
              When you interact with our AI Voice &amp; Chat Assistant, <strong>Sara</strong>, information voluntarily provided during the conversation may be recorded and used to respond to your inquiries and assist our customer service team.
            </p>
          </section>

          {/* Section 2 */}
          <section>
            <h2 className="text-xl md:text-2xl font-neue font-semibold text-charcoal mb-3 pb-2 border-b border-gray-100 flex items-center gap-2">
              <span className="text-gold font-mono text-lg">02.</span> How We Use Your Information
            </h2>
            <p className="mb-3">
              Information collected through the website is used strictly for legitimate business purposes, including:
            </p>
            <ul className="list-disc list-inside space-y-1.5 pl-2 text-taupe/90">
              <li>Responding directly to your property inquiries</li>
              <li>Providing requested project details, brochure material, and pricing guidance</li>
              <li>Understanding your specific property preferences and budget requirements</li>
              <li>Arranging and scheduling confirmed site visits</li>
              <li>Contacting you via phone or email regarding your inquiry</li>
              <li>Providing ongoing follow-up assistance throughout your property search</li>
              <li>Improving customer experience and site functionality</li>
              <li>Protecting the website against misuse, fraud, or security threats</li>
            </ul>
          </section>

          {/* Section 3 */}
          <section className="bg-[#FAF8F5] p-6 rounded-xl border border-gold/30">
            <h2 className="text-xl md:text-2xl font-neue font-semibold text-burgundy mb-3 flex items-center gap-2">
              <span className="text-gold font-mono text-lg">03.</span> AI Voice &amp; Chat Assistant — Sara
            </h2>
            <p className="mb-3">
              Etihad Garden provides an AI-powered assistant named <strong>Sara</strong> to help visitors with general property-related questions and site navigation.
            </p>
            <ul className="list-disc list-inside space-y-2 text-taupe/90">
              <li>Sara is an artificial intelligence automated assistant.</li>
              <li>Conversations may be processed and analyzed to generate responses.</li>
              <li>Information voluntarily shared during chat interactions may be shared with authorized sales representatives to provide follow-up assistance.</li>
              <li>Sara's responses should not be treated as legally binding property, financial, or investment advice.</li>
              <li>Specific commercial terms, plot availability, and pricing must be verified through an official Etihad Garden representative.</li>
            </ul>
          </section>

          {/* Section 4 */}
          <section>
            <h2 className="text-xl md:text-2xl font-neue font-semibold text-charcoal mb-3 pb-2 border-b border-gray-100 flex items-center gap-2">
              <span className="text-gold font-mono text-lg">04.</span> How We Share Information
            </h2>
            <p className="mb-3">
              We respect the confidentiality of your personal data. Your information may only be shared with:
            </p>
            <ul className="list-disc list-inside space-y-1.5 pl-2 text-taupe/90 mb-4">
              <li>Authorized Etihad Garden sales and customer service personnel</li>
              <li>Vetted service providers assisting with website hosting or communication tools</li>
              <li>Technology providers strictly as necessary to fulfill requested services</li>
              <li>Legal or regulatory authorities when required by applicable law</li>
            </ul>
            <div className="p-4 bg-burgundy/5 border-l-4 border-burgundy rounded-r-lg font-medium text-burgundy">
              We do not sell your personal information as a product.
            </div>
          </section>

          {/* Section 5 */}
          <section>
            <h2 className="text-xl md:text-2xl font-neue font-semibold text-charcoal mb-3 pb-2 border-b border-gray-100 flex items-center gap-2">
              <span className="text-gold font-mono text-lg">05.</span> Data Security
            </h2>
            <p>
              We take reasonable steps to protect personal information against unauthorized access, misuse, alteration or disclosure using administrative, technical, and physical safeguards. However, no internet-based system or electronic transmission can be guaranteed to be completely secure.
            </p>
          </section>

          {/* Section 6 */}
          <section>
            <h2 className="text-xl md:text-2xl font-neue font-semibold text-charcoal mb-3 pb-2 border-b border-gray-100 flex items-center gap-2">
              <span className="text-gold font-mono text-lg">06.</span> Data Retention
            </h2>
            <p>
              Personal information will be retained only for as long as reasonably necessary to fulfill the purposes outlined in this policy, including responding to inquiries, facilitating site visits, maintaining business records, and complying with applicable legal or regulatory requirements.
            </p>
          </section>

          {/* Section 7 */}
          <section>
            <h2 className="text-xl md:text-2xl font-neue font-semibold text-charcoal mb-3 pb-2 border-b border-gray-100 flex items-center gap-2">
              <span className="text-gold font-mono text-lg">07.</span> Cookies
            </h2>
            <p>
              Where applicable, our website may utilize essential cookies or local session storage to maintain basic website functionality, user preferences, and performance analytics. You can adjust your browser settings to decline non-essential cookies if desired.
            </p>
          </section>

          {/* Section 8 */}
          <section>
            <h2 className="text-xl md:text-2xl font-neue font-semibold text-charcoal mb-3 pb-2 border-b border-gray-100 flex items-center gap-2">
              <span className="text-gold font-mono text-lg">08.</span> Third-Party Links
            </h2>
            <p>
              This website may contain links to third-party sites or external maps. Etihad Garden is not responsible for the privacy practices, content, or security of external websites. We encourage you to read the privacy policies of any third-party sites you visit.
            </p>
          </section>

          {/* Section 9 */}
          <section>
            <h2 className="text-xl md:text-2xl font-neue font-semibold text-charcoal mb-3 pb-2 border-b border-gray-100 flex items-center gap-2">
              <span className="text-gold font-mono text-lg">09.</span> Your Choices
            </h2>
            <p>
              You may contact Etihad Garden at any time to request updates, corrections, or deletion of personal information you have previously submitted, subject to identity verification and reasonable legal requirements. Please contact us via email at{' '}
              <a href="mailto:info@etihadgarden.pk" className="text-burgundy font-semibold hover:underline">
                info@etihadgarden.pk
              </a>.
            </p>
          </section>

          {/* Section 10 */}
          <section>
            <h2 className="text-xl md:text-2xl font-neue font-semibold text-charcoal mb-3 pb-2 border-b border-gray-100 flex items-center gap-2">
              <span className="text-gold font-mono text-lg">10.</span> Children's Privacy
            </h2>
            <p>
              Our website is intended for general adult audiences interested in real-estate opportunities and is not directed towards children. We do not knowingly collect personal information from individuals under 18 years of age.
            </p>
          </section>

          {/* Section 11 */}
          <section>
            <h2 className="text-xl md:text-2xl font-neue font-semibold text-charcoal mb-3 pb-2 border-b border-gray-100 flex items-center gap-2">
              <span className="text-gold font-mono text-lg">11.</span> Policy Updates
            </h2>
            <p>
              We reserve the right to modify or update this Privacy Policy at any time. Any changes will become effective immediately upon posting to this page with an updated "Last Updated" date.
            </p>
          </section>

          {/* Section 12 */}
          <section className="bg-ivory p-6 md:p-8 rounded-xl border border-[#DDD8D0]">
            <h2 className="text-xl md:text-2xl font-neue font-semibold text-charcoal mb-4 flex items-center gap-2">
              <span className="text-gold font-mono text-lg">12.</span> Contact Us
            </h2>
            <p className="mb-4">
              If you have questions or concerns regarding this Privacy Policy, please contact our corporate team:
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <p className="font-semibold text-charcoal mb-1">Official Email:</p>
                <a href="mailto:info@etihadgarden.pk" className="text-burgundy font-medium hover:underline">
                  info@etihadgarden.pk
                </a>
              </div>
              <div>
                <p className="font-semibold text-charcoal mb-1">Corporate Office:</p>
                <p className="text-taupe">C-157 A1, Etihad Garden Phase – I, Rahim Yar Khan</p>
              </div>
              <div className="md:col-span-2">
                <p className="font-semibold text-charcoal mb-1">Phone Helpline:</p>
                <p className="text-taupe">
                  PAK: <a href="tel:+9268111998877" className="text-burgundy font-medium hover:underline">+92 68 111-99-88-77</a> | UK: <a href="tel:+442031500958" className="text-burgundy font-medium hover:underline">+44 (0) 203 1500 958</a> | UAE: <a href="tel:+971527446451" className="text-burgundy font-medium hover:underline">+971 52 744 6451</a>
                </p>
              </div>
            </div>
          </section>

        </div>
      </div>
    </div>
  );
}
