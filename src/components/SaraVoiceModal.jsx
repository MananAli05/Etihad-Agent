import React, { useState, useEffect } from 'react';
import { ConversationProvider, useConversation } from '@elevenlabs/react';

const API_BASE_URL = 'http://localhost:8000';

function VoiceModalInner({ isOpen, onClose, onOpenChat, onNavigate }) {
  const [callState, setCallState] = useState('ready'); // 'ready' | 'connecting' | 'active' | 'ended' | 'error'
  const [isMuted, setIsMuted] = useState(false);
  const [slowConnectionNotice, setSlowConnectionNotice] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // ElevenLabs SDK Hook
  const conversation = useConversation({
    onConnect: () => {
      setCallState('active');
    },
    onDisconnect: () => {
      if (callState === 'active' || callState === 'connecting') {
        setCallState('ended');
      }
    },
    onError: (err) => {
      console.error('[Developer Debug] ElevenLabs Conversation Error:', err);
      setErrorMessage(typeof err === 'string' ? err : err?.message || 'Connection error with ElevenLabs voice service.');
      setCallState('error');
    },
  });

  // Slow connection timer during 'connecting' state
  useEffect(() => {
    let timer;
    if (callState === 'connecting') {
      timer = setTimeout(() => {
        setSlowConnectionNotice(true);
      }, 3500);
    } else {
      setSlowConnectionNotice(false);
    }
    return () => clearTimeout(timer);
  }, [callState]);

  // Clean up call on modal unmount / close
  useEffect(() => {
    if (!isOpen && (callState === 'active' || callState === 'connecting')) {
      try {
        conversation.endSession();
      } catch (e) {
        // Safe cleanup
      }
      setCallState('ready');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleStartCall = async () => {
    setCallState('connecting');
    setSlowConnectionNotice(false);
    setErrorMessage('');

    // 1. Request microphone permission upfront
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      try {
        await navigator.mediaDevices.getUserMedia({ audio: true });
      } catch (micErr) {
        console.warn('Microphone permission denied:', micErr);
        setErrorMessage('Microphone access is required to talk with Sara. Please allow microphone access and try again.');
        setCallState('error');
        return;
      }
    }

    try {
      // 2. Request temporary signed URL or agentId from backend
      const res = await fetch(`${API_BASE_URL}/api/voice/signed-url`);
      
      if (!res.ok) {
        throw new Error(`Backend GET /api/voice/signed-url returned HTTP ${res.status}`);
      }

      const data = await res.json();
      const signedUrl = data.signedUrl || data.signed_url;
      const agentId = data.agentId || data.agent_id;

      if (signedUrl) {
        await conversation.startSession({ signedUrl });
      } else if (agentId) {
        await conversation.startSession({ agentId });
      } else {
        throw new Error(data.message || 'ElevenLabs credentials missing from backend.');
      }
    } catch (err) {
      console.error('[Developer Debug] Voice call initialization error:', err);
      setErrorMessage(err.message || 'Sorry, Sara is temporarily unavailable.');
      setCallState('error');
    }
  };

  const handleEndCall = async () => {
    try {
      await conversation.endSession();
    } catch (err) {
      // safe fallback
    }
    setCallState('ended');
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
    try {
      conversation.setVolume({ volume: isMuted ? 1.0 : 0.0 });
    } catch (e) {
      // safe toggle
    }
  };

  const handleResetToReady = () => {
    setCallState('ready');
  };

  const handleSubmitInquiryClick = () => {
    onClose();
    if (onNavigate) {
      onNavigate('/', '#inquiry-form');
    } else {
      const elem = document.getElementById('inquiry-form');
      if (elem) elem.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const isSpeaking = conversation.isSpeaking || false;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      
      {/* Modal Container */}
      <div className="bg-[#F7F4EE] rounded-2xl sm:rounded-3xl shadow-2xl w-[calc(100vw-24px)] max-w-[460px] max-h-[calc(100dvh-24px)] overflow-y-auto border border-[#DDD8D0] flex flex-col relative animate-in fade-in zoom-in-95 duration-200">
        
        {/* Top Bar Header */}
        <div className="bg-burgundy text-white px-6 py-4 flex items-center justify-between shadow-sm border-b border-gold/20">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-gold/20 flex items-center justify-center border border-gold/40">
              <svg className="w-4 h-4 text-gold animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path>
              </svg>
            </div>
            <div>
              <h3 className="font-neue font-semibold text-lg leading-tight text-white tracking-wide">
                Sara
              </h3>
              <p className="text-xs text-white/80">Etihad Garden Property Assistant</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-white/80 hover:text-white p-1.5 rounded-full hover:bg-white/10 transition-colors focus:outline-none"
            aria-label="Close Modal"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Modal Main Body */}
        <div className="p-6 sm:p-8 flex flex-col items-center text-center">
          
          {/* Sara Avatar Container with Pulse Rings */}
          <div className="relative mb-6">
            {/* Outer Animated Glow Ring */}
            <div
              className={`absolute -inset-3 rounded-full transition-all duration-500 ${
                callState === 'active'
                  ? isSpeaking
                    ? 'bg-gradient-to-r from-gold via-amber-300 to-burgundy opacity-70 animate-ping'
                    : 'bg-gold/30 animate-pulse'
                  : callState === 'connecting'
                  ? 'border-2 border-gold border-t-transparent animate-spin'
                  : 'bg-gold/10'
              }`}
            ></div>

            {/* Avatar Circle */}
            <div className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-full p-1 bg-gradient-to-tr from-gold to-amber-200 shadow-xl overflow-hidden">
              <img
                alt="Sara - Property Assistant"
                className="w-full h-full rounded-full object-cover object-top"
                src="/images/sara.jpg"
              />
            </div>

            {/* Status Dot */}
            <span
              className={`w-4 h-4 rounded-full absolute bottom-1 right-1 border-2 border-[#F7F4EE] shadow-sm ${
                callState === 'active'
                  ? 'bg-emerald-500 animate-pulse'
                  : callState === 'connecting'
                  ? 'bg-amber-400'
                  : 'bg-emerald-500'
              }`}
              title={callState === 'active' ? 'Live Call' : 'Online'}
            ></span>
          </div>

          {/* STATE 1: READY */}
          {callState === 'ready' && (
            <div className="w-full space-y-5 animate-in fade-in duration-200">
              <div>
                <span className="text-xs font-semibold uppercase tracking-wider text-burgundy bg-burgundy/10 px-3 py-1 rounded-full border border-burgundy/20">
                  Ready to talk
                </span>
              </div>

              <button
                onClick={handleStartCall}
                className="w-full bg-gradient-to-r from-burgundy to-[#521923] text-white py-3.5 px-6 rounded-2xl font-semibold text-base shadow-lg hover:shadow-burgundy/30 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 flex items-center justify-center gap-2.5 cursor-pointer border border-gold/30"
              >
                <svg className="w-5 h-5 text-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path>
                </svg>
                Start Conversation
              </button>
            </div>
          )}

          {/* STATE 2: CONNECTING */}
          {callState === 'connecting' && (
            <div className="w-full space-y-4 py-2 animate-in fade-in duration-200">
              <div className="flex justify-center">
                <div className="w-8 h-8 border-3 border-burgundy border-t-gold rounded-full animate-spin"></div>
              </div>
              <h4 className="text-lg font-semibold text-burgundy">
                Connecting to Sara...
              </h4>
              {slowConnectionNotice && (
                <p className="text-xs text-taupe animate-pulse">
                  Just a moment...
                </p>
              )}
            </div>
          )}

          {/* STATE 3: ACTIVE CALL */}
          {callState === 'active' && (
            <div className="w-full space-y-6 animate-in fade-in duration-200">
              <div>
                <div className="inline-flex items-center gap-2 bg-emerald-50 text-emerald-700 px-3 py-1 rounded-full text-xs font-semibold border border-emerald-200 mb-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
                  Live conversation
                </div>

                {/* Animated Waveform Visualization */}
                <div className="flex items-center justify-center gap-1.5 h-10 my-4">
                  {[...Array(9)].map((_, i) => (
                    <span
                      key={i}
                      className={`w-1.5 rounded-full transition-all duration-200 ${
                        isSpeaking
                          ? 'bg-gold animate-pulse'
                          : 'bg-burgundy/60'
                      }`}
                      style={{
                        height: isSpeaking
                          ? `${Math.max(12, Math.sin(i * 0.8 + Date.now() * 0.005) * 36 + 10)}px`
                          : `${10 + (i % 3) * 6}px`,
                        animationDelay: `${i * 0.15}s`,
                      }}
                    ></span>
                  ))}
                </div>

                <p className="text-sm font-medium text-charcoal">
                  {isSpeaking ? 'Sara is speaking...' : 'Listening...'}
                </p>
              </div>

              {/* Call Control Buttons */}
              <div className="flex items-center justify-center gap-4 pt-2">
                {/* Mute Button */}
                <button
                  onClick={toggleMute}
                  aria-label={isMuted ? 'Unmute Microphone' : 'Mute Microphone'}
                  className={`p-3.5 rounded-2xl border transition-all duration-200 shadow-sm cursor-pointer ${
                    isMuted
                      ? 'bg-amber-100 border-amber-300 text-amber-800'
                      : 'bg-white border-[#DDD8D0] text-charcoal hover:bg-gray-50'
                  }`}
                  title={isMuted ? 'Unmute' : 'Mute'}
                >
                  {isMuted ? (
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
                    </svg>
                  ) : (
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                    </svg>
                  )}
                </button>

                {/* End Call Button */}
                <button
                  onClick={handleEndCall}
                  className="bg-burgundy hover:bg-[#521923] text-white px-6 py-3.5 rounded-2xl font-semibold text-sm transition-all duration-200 shadow-md flex items-center gap-2 cursor-pointer border border-gold/30"
                >
                  <svg className="w-5 h-5 text-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  End Call
                </button>
              </div>
            </div>
          )}

          {/* STATE 4: ENDED */}
          {callState === 'ended' && (
            <div className="w-full space-y-4 animate-in fade-in duration-200">
              <h4 className="text-lg font-semibold text-charcoal">
                Thank you for speaking with Sara.
              </h4>
              <p className="text-sm text-taupe leading-relaxed">
                If you'd like more information, you can submit your inquiry and our team will contact you.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <button
                  onClick={handleSubmitInquiryClick}
                  className="flex-1 bg-burgundy text-white py-3 px-4 rounded-xl font-semibold text-sm hover:bg-[#521923] transition-colors shadow-sm cursor-pointer"
                >
                  Submit Inquiry
                </button>
                <button
                  onClick={onClose}
                  className="flex-1 bg-white border border-[#DDD8D0] text-charcoal py-3 px-4 rounded-xl font-semibold text-sm hover:bg-gray-50 transition-colors cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>
          )}

          {/* STATE 5: ERROR */}
          {callState === 'error' && (
            <div className="w-full space-y-4 animate-in fade-in duration-200">
              <h4 className="text-lg font-semibold text-burgundy">
                Notice
              </h4>
              <p className="text-sm text-taupe leading-relaxed">
                {errorMessage || 'Sorry, Sara is temporarily unavailable. Please try again or use the chat assistant.'}
              </p>
              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <button
                  onClick={handleStartCall}
                  className="flex-1 bg-burgundy text-white py-3 px-4 rounded-xl font-semibold text-sm hover:bg-[#521923] transition-colors shadow-sm cursor-pointer"
                >
                  Try Again
                </button>
                <button
                  onClick={() => {
                    onClose();
                    if (onOpenChat) onOpenChat();
                  }}
                  className="flex-1 bg-white border border-burgundy/40 text-burgundy py-3 px-4 rounded-xl font-semibold text-sm hover:bg-burgundy/5 transition-colors cursor-pointer"
                >
                  Chat with Sara
                </button>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}

export default function SaraVoiceModal(props) {
  if (!props.isOpen) return null;

  return (
    <ConversationProvider>
      <VoiceModalInner {...props} />
    </ConversationProvider>
  );
}
