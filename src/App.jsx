import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import About from './components/About';
import Properties from './components/Properties';
import Facilities from './components/Facilities';
import Location from './components/Location';
import VirtualTour from './components/VirtualTour';
import VoiceAssistant from './components/VoiceAssistant';
import InquiryForm from './components/InquiryForm';
import FinalCTA from './components/FinalCTA';
import Footer from './components/Footer';
import SaraChat from './components/SaraChat';
import SaraVoiceModal from './components/SaraVoiceModal';
import PrivacyPolicy from './components/PrivacyPolicy';
import TermsAndConditions from './components/TermsAndConditions';

export default function App() {
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isVoiceOpen, setIsVoiceOpen] = useState(false);
  const [currentPath, setCurrentPath] = useState(window.location.pathname);

  useEffect(() => {
    const handlePopState = () => {
      setCurrentPath(window.location.pathname);
      window.scrollTo(0, 0);
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const handleNavigate = (path, hash = '') => {
    const targetUrl = hash ? `${path}${hash}` : path;
    window.history.pushState({}, '', targetUrl);
    setCurrentPath(path);

    if (hash) {
      setTimeout(() => {
        const targetId = hash.replace('#', '');
        const elem = document.getElementById(targetId);
        if (elem) {
          elem.scrollIntoView({ behavior: 'smooth' });
        } else {
          window.scrollTo(0, 0);
        }
      }, 100);
    } else {
      window.scrollTo(0, 0);
    }
  };

  const handleOpenChat = () => {
    setIsChatOpen(true);
  };

  const handleCloseChat = () => {
    setIsChatOpen(false);
  };

  const handleOpenVoice = () => {
    setIsVoiceOpen(true);
  };

  const handleCloseVoice = () => {
    setIsVoiceOpen(false);
  };

  return (
    <div className="min-h-screen flex flex-col font-sans bg-ivory text-charcoal antialiased overflow-x-hidden w-full relative">
      <Navbar onNavigate={handleNavigate} />

      <main className="flex-grow pt-24">
        {currentPath === '/privacy-policy' ? (
          <PrivacyPolicy onNavigate={handleNavigate} />
        ) : currentPath === '/terms-and-conditions' ? (
          <TermsAndConditions onNavigate={handleNavigate} />
        ) : (
          <>
            <Hero />
            <About />
            <Properties />
            <Facilities />
            <Location />
            <VirtualTour />
            <div id="customer-support-section">
              <VoiceAssistant onOpenChat={handleOpenChat} onOpenVoice={handleOpenVoice} />
            </div>
            <InquiryForm onNavigate={handleNavigate} />
            <FinalCTA />
          </>
        )}
      </main>

      <Footer
        onOpenChat={handleOpenChat}
        onOpenVoice={handleOpenVoice}
        onNavigate={handleNavigate}
      />

      {/* Sara Voice Assistant Modal */}
      <SaraVoiceModal
        isOpen={isVoiceOpen}
        onClose={handleCloseVoice}
        onOpenChat={handleOpenChat}
        onNavigate={handleNavigate}
      />

      {/* Sara Chat Assistant Drawer / Modal */}
      <SaraChat isOpen={isChatOpen} onClose={handleCloseChat} />
    </div>
  );
}
