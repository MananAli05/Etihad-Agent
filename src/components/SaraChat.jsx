import React, { useState, useEffect, useRef } from 'react';

// In production the API is served from this same domain, so an empty base
// resolves to /api/... Only development needs an absolute URL, because the
// site and the FastAPI server run on different ports there.
//
// Defaulting to localhost in production made every visitor's browser call
// their own machine. It appeared to work purely because a local backend
// happened to be running on the developer's laptop.
const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ?? (import.meta.env.DEV ? 'http://localhost:8000' : '');

export default function SaraChat({ isOpen, onClose }) {
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const [conversationId, setConversationId] = useState('');
  const chatEndRef = useRef(null);

  // Lock body scroll when chat is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // Initialize conversation session & welcome message
  useEffect(() => {
    let savedConvId = sessionStorage.getItem('etihad_sara_conv_id');
    if (!savedConvId) {
      savedConvId = 'sara-' + Math.random().toString(36).substring(2, 11) + '-' + Date.now();
      sessionStorage.setItem('etihad_sara_conv_id', savedConvId);
    }
    setConversationId(savedConvId);

    // Initial greeting
    setMessages([
      {
        id: 'welcome-msg',
        sender: 'Sara',
        text: 'Assalam-o-Alaikum! Main Sara hoon, Etihad Garden ki property assistant. Aap Etihad Garden ke baare mein kya maloom karna chahtay hain?',
        time: formatCurrentTime(),
        isInitial: true,
      },
    ]);
  }, []);

  // Auto-scroll to bottom on new message
  useEffect(() => {
    if (isOpen) {
      chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, loading, isOpen]);

  if (!isOpen) return null;

  function formatCurrentTime() {
    const now = new Date();
    return now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }

  const quickQuestions = [
    'Location',
    'Property Options',
    'Plot Sizes',
    'Book a Site Visit',
  ];

  const sendMessageToBackend = async (userText) => {
    if (!userText.trim() || loading) return;

    const userMsgObj = {
      id: 'user-' + Date.now(),
      sender: 'User',
      text: userText.trim(),
      time: formatCurrentTime(),
    };

    setMessages((prev) => [...prev, userMsgObj]);
    setInputText('');
    setLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/api/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: userText.trim(),
          conversation_id: conversationId,
        }),
      });

      if (!response.ok) {
        throw new Error(`Backend API returned HTTP ${response.status}`);
      }

      const data = await response.json();
      
      if (data.conversation_id) {
        setConversationId(data.conversation_id);
        sessionStorage.setItem('etihad_sara_conv_id', data.conversation_id);
      }

      const botReply = data.reply || 'Maazrat, Sara abhi temporarily available nahi hain. Please try again.';

      setMessages((prev) => [
        ...prev,
        {
          id: 'sara-' + Date.now(),
          sender: 'Sara',
          text: botReply,
          time: formatCurrentTime(),
        },
      ]);
    } catch (err) {
      console.error('[Developer Debug] SaraChat API request failed:', err);
      // Controlled customer error fallback
      setMessages((prev) => [
        ...prev,
        {
          id: 'err-' + Date.now(),
          sender: 'Sara',
          text: 'Maazrat, Sara abhi temporarily available nahi hain. Please try again.',
          time: formatCurrentTime(),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    sendMessageToBackend(inputText);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessageToBackend(inputText);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center sm:justify-end sm:pr-6 sm:pb-6 p-3 bg-black/50 sm:bg-black/30 backdrop-blur-xs transition-opacity duration-300">
      
      {/* Main Chat Drawer Window */}
      <div className="bg-white rounded-2xl shadow-2xl w-[calc(100vw-24px)] sm:w-[420px] max-w-[420px] flex flex-col h-[min(620px,calc(100dvh-100px))] sm:h-[620px] overflow-hidden border border-[#DDD8D0] animate-in fade-in slide-in-from-bottom-4 duration-200">
        
        {/* Fixed Header */}
        <div className="bg-burgundy text-white px-4 sm:px-5 py-3 sm:py-3.5 flex items-center justify-between shadow-sm relative border-b border-gold/20 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-10 h-10 rounded-full p-0.5 bg-gradient-to-tr from-gold to-amber-200 shadow-sm">
                <img
                  alt="Sara AI Assistant"
                  className="w-full h-full rounded-full object-cover"
                  src="/images/sara.jpg"
                />
              </div>
              <span className="w-3 h-3 bg-emerald-500 rounded-full absolute bottom-0 right-0 border-2 border-burgundy shadow-sm" title="Online"></span>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h3 className="font-neue font-semibold text-base sm:text-lg leading-tight tracking-wide text-white">
                  Sara
                </h3>
                <span className="text-[10px] bg-gold/30 text-gold px-2 py-0.5 rounded-full font-medium border border-gold/40">
                  Property Assistant
                </span>
              </div>
              <p className="text-[11px] sm:text-xs text-white/80 font-sans mt-0.5">
                Etihad Garden Property Assistant • <span className="text-emerald-300 font-medium">Online</span>
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-white/80 hover:text-white p-1.5 rounded-full hover:bg-white/10 transition-colors focus:outline-none cursor-pointer"
            aria-label="Close Chat"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Message History Body */}
        <div className="flex-1 p-3.5 sm:p-5 overflow-y-auto space-y-3.5 bg-[#F7F4EE]/60 font-sans">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex flex-col ${msg.sender === 'User' ? 'items-end' : 'items-start'}`}
            >
              <div
                className={`max-w-[85%] sm:max-w-[80%] rounded-2xl px-4 py-2.5 sm:py-3 shadow-sm text-sm leading-relaxed ${
                  msg.sender === 'User'
                    ? 'bg-burgundy text-white rounded-br-none'
                    : 'bg-white text-charcoal border border-[#DDD8D0] rounded-bl-none shadow-xs'
                }`}
              >
                <p className="whitespace-pre-wrap">{msg.text}</p>
                <p
                  className={`text-[10px] mt-1 text-right ${
                    msg.sender === 'User' ? 'text-white/70' : 'text-taupe'
                  }`}
                >
                  {msg.time}
                </p>
              </div>

              {/* Quick Questions Shortcuts after initial message */}
              {msg.isInitial && messages.length === 1 && (
                <div className="mt-3 w-full">
                  <p className="text-xs font-medium text-taupe mb-2 pl-1">Popular questions:</p>
                  <div className="flex flex-wrap gap-1.5">
                    {quickQuestions.map((q, idx) => (
                      <button
                        key={idx}
                        onClick={() => sendMessageToBackend(q)}
                        disabled={loading}
                        className="text-xs bg-white text-burgundy hover:bg-burgundy hover:text-white border border-burgundy/30 px-3 py-1 rounded-full shadow-2xs transition-all duration-200 cursor-pointer disabled:opacity-50"
                      >
                        {q}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}

          {/* Typing Indicator */}
          {loading && (
            <div className="flex items-start gap-2">
              <div className="bg-white border border-[#DDD8D0] rounded-2xl rounded-bl-none px-4 py-2.5 shadow-xs">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs text-taupe font-medium mr-1">Sara is typing</span>
                  <span className="w-1.5 h-1.5 bg-burgundy rounded-full animate-bounce"></span>
                  <span className="w-1.5 h-1.5 bg-burgundy rounded-full animate-bounce [animation-delay:0.2s]"></span>
                  <span className="w-1.5 h-1.5 bg-burgundy rounded-full animate-bounce [animation-delay:0.4s]"></span>
                </div>
              </div>
            </div>
          )}

          <div ref={chatEndRef} />
        </div>

        {/* Fixed Input Form Footer */}
        <form onSubmit={handleFormSubmit} className="p-3 sm:p-4 bg-white border-t border-[#DDD8D0] flex-shrink-0">
          <div className="flex items-center gap-2 relative">
            <textarea
              rows="1"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={loading}
              placeholder="Apna sawal likhein..."
              className="flex-1 resize-none rounded-xl border border-[#DDD8D0] px-3.5 py-2.5 text-sm text-charcoal placeholder:text-taupe/60 focus:border-burgundy focus:ring-2 focus:ring-burgundy/10 focus:outline-none disabled:bg-gray-50 transition-all"
            />
            <button
              type="submit"
              disabled={loading || !inputText.trim()}
              className="bg-burgundy hover:bg-[#521923] text-white p-2.5 sm:p-3 rounded-xl transition-colors shadow-sm disabled:opacity-50 cursor-pointer flex-shrink-0 min-w-[44px] min-h-[44px] flex items-center justify-center"
              aria-label="Send Message"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            </button>
          </div>
          <p className="text-[10px] text-center text-taupe/70 mt-1.5">
            Sara provides general property information. Please verify prices and availability with the official sales team.
          </p>
        </form>
      </div>
    </div>
  );
}
