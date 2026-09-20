import React, { useState, useEffect } from 'react';
import { Search, RotateCw, ArrowLeft, MessageSquare } from 'lucide-react';
import { supabase } from '../lib/supabase';

// Helper for empty/null field rendering
const renderVal = (val) => {
  if (val === null || val === undefined || val === '') return 'Not provided';
  return val;
};

// Normalize messages from chat_history row
const parseMessages = (row) => {
  if (!row) return [];

  // Case 1: Array
  if (Array.isArray(row.messages)) {
    return row.messages.map((m) => ({
      sender: (m.sender || m.role || '').toLowerCase().includes('user') ? 'user' : 'sara',
      text: m.text || m.content || m.message || '',
      time: m.time || m.timestamp || m.created_at || row.created_at
    }));
  }

  // Case 2: JSON string
  if (typeof row.messages === 'string') {
    try {
      const parsed = JSON.parse(row.messages);
      if (Array.isArray(parsed)) {
        return parsed.map((m) => ({
          sender: (m.sender || m.role || '').toLowerCase().includes('user') ? 'user' : 'sara',
          text: m.text || m.content || m.message || '',
          time: m.time || m.timestamp || m.created_at || row.created_at
        }));
      }
    } catch (e) {
      // not JSON array
    }
  }

  // Case 3: Individual columns (user_message / message & ai_response / response)
  const msgs = [];
  const userText = row.user_message || row.message || row.prompt || row.input;
  const saraText = row.ai_response || row.response || row.bot_message || row.reply || row.output;

  if (userText) {
    msgs.push({
      sender: 'user',
      text: userText,
      time: row.created_at
    });
  }

  if (saraText) {
    msgs.push({
      sender: 'sara',
      text: saraText,
      time: row.created_at
    });
  }

  return msgs;
};

export default function ChatsPage() {
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedChat, setSelectedChat] = useState(null);
  const [showMobileDetail, setShowMobileDetail] = useState(false);

  // Fetch real data from Supabase chat_history
  const loadChatHistory = async (isManualRefresh = false) => {
    if (isManualRefresh) setRefreshing(true);
    else setLoading(true);

    try {
      console.log(`[SUPABASE REQUEST] ChatsPage + chat_history + ${new Date().toISOString()}`);
      const { data, error } = await supabase
        .from('chat_history')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      const loadedData = data || [];
      setConversations(loadedData);

      if (loadedData.length > 0 && !selectedChat) {
        setSelectedChat(loadedData[0]);
      }
    } catch (err) {
      console.error('Error fetching chat_history from Supabase:', err);
      setConversations([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadChatHistory();
  }, []);

  // Filter real conversations
  const filteredConversations = conversations.filter((chat) => {
    const term = searchTerm.toLowerCase().trim();
    if (!term) return true;

    const nameMatch = chat.customer_name && chat.customer_name.toLowerCase().includes(term);
    const phoneMatch = chat.phone && chat.phone.includes(term);
    const emailMatch = chat.email && chat.email.toLowerCase().includes(term);
    const sessionMatch = (chat.session_id || chat.id) && String(chat.session_id || chat.id).toLowerCase().includes(term);

    const msgs = parseMessages(chat);
    const msgMatch = msgs.some((m) => m.text && m.text.toLowerCase().includes(term));

    return nameMatch || phoneMatch || emailMatch || sessionMatch || msgMatch;
  });

  return (
    <div className="space-y-4 font-sans text-charcoal pb-10">
      {/* Page Header */}
      <div className="flex items-center justify-between bg-white p-4 sm:p-5 rounded-xl border border-gray-200/80 shadow-2xs">
        <div>
          <h1 className="text-lg sm:text-xl font-bold tracking-tight text-charcoal">
            Sara Chat History
          </h1>
          <p className="text-xs text-gray-500 mt-0.5">
            Review customer conversations handled by Sara.
          </p>
        </div>

        <button
          type="button"
          onClick={() => loadChatHistory(true)}
          disabled={refreshing}
          className="p-2 rounded-lg border border-gray-200 bg-ivory/60 hover:bg-ivory text-gray-600 hover:text-burgundy transition-colors cursor-pointer disabled:opacity-50"
          title="Refresh Data"
        >
          <RotateCw className={`w-4 h-4 ${refreshing ? 'animate-spin text-burgundy' : ''}`} />
        </button>
      </div>

      {/* Main Chat Workspace Container */}
      <div className="bg-white border border-gray-200/80 rounded-xl overflow-hidden shadow-2xs h-[calc(100vh-200px)] min-h-[520px] flex">
        {loading ? (
          <div className="w-full flex flex-col items-center justify-center p-12">
            <div className="w-8 h-8 border-3 border-burgundy/20 border-t-burgundy rounded-full animate-spin mb-2" />
            <span className="text-xs font-semibold text-gray-500">Loading chat history from Supabase...</span>
          </div>
        ) : conversations.length === 0 ? (
          /* Global Empty State (Zero records in Supabase) */
          <div className="w-full flex flex-col items-center justify-center p-8 sm:p-12 text-center bg-ivory/20">
            <div className="w-12 h-12 rounded-xl bg-ivory border border-burgundy/20 text-burgundy flex items-center justify-center mb-3">
              <MessageSquare className="w-6 h-6 text-burgundy" />
            </div>
            <h3 className="text-base font-bold text-charcoal">No conversations yet</h3>
            <p className="text-xs text-gray-500 max-w-sm mt-1 leading-relaxed">
              Customer conversations with Sara will appear here once customers interact with the chatbot.
            </p>
          </div>
        ) : (
          /* Split Workspace Layout */
          <div className="w-full flex h-full overflow-hidden">
            {/* LEFT CONVERSATION PANEL */}
            <div
              className={`w-full lg:w-[340px] shrink-0 bg-ivory/30 border-r border-gray-200 flex flex-col h-full ${
                showMobileDetail ? 'hidden lg:flex' : 'flex'
              }`}
            >
              {/* Panel Header & Search */}
              <div className="p-3.5 border-b border-gray-200 bg-white space-y-2.5">
                <h2 className="text-xs font-bold text-charcoal uppercase tracking-wider">
                  Conversations
                </h2>

                <div className="relative">
                  <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search conversations..."
                    className="w-full pl-8 pr-3 py-1.5 bg-ivory/60 border border-gray-200 rounded-lg text-xs text-charcoal placeholder-gray-400 focus:outline-none focus:border-burgundy"
                  />
                </div>
              </div>

              {/* Conversation List */}
              <div className="flex-1 overflow-y-auto divide-y divide-gray-100">
                {filteredConversations.length > 0 ? (
                  filteredConversations.map((chat) => {
                    const isSelected = selectedChat?.id === chat.id;
                    const msgs = parseMessages(chat);
                    const lastMsg = msgs.length > 0 ? msgs[msgs.length - 1].text : 'No message preview';
                    const custName = chat.customer_name || chat.name || 'Unknown Customer';

                    return (
                      <div
                        key={chat.id}
                        onClick={() => {
                          setSelectedChat(chat);
                          setShowMobileDetail(true);
                        }}
                        className={`p-3.5 cursor-pointer transition-colors space-y-1 border-b border-gray-100 ${
                          isSelected
                            ? 'bg-white border-l-4 border-burgundy shadow-2xs font-semibold'
                            : 'hover:bg-ivory/60'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-xs text-charcoal truncate max-w-[170px]">
                            {custName}
                          </span>
                          <span className="text-[10px] text-gray-400 whitespace-nowrap">
                            {chat.created_at
                              ? new Date(chat.created_at).toLocaleDateString('en-US', {
                                  month: 'short',
                                  day: 'numeric'
                                })
                              : ''}
                          </span>
                        </div>

                        <p className="text-[11px] text-gray-500 line-clamp-2 leading-snug">
                          {lastMsg}
                        </p>

                        <div className="flex items-center justify-between text-[10px] text-gray-400 pt-1">
                          <span className="truncate max-w-[140px]">
                            {chat.phone || chat.email || 'No contact'}
                          </span>
                          {chat.source && (
                            <span className="px-1.5 py-0.5 rounded bg-gray-100 text-gray-600 font-medium">
                              {chat.source}
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="p-6 text-center text-xs text-gray-400">
                    No matching conversations.
                  </div>
                )}
              </div>
            </div>

            {/* RIGHT CHAT TRANSCRIPT PANEL */}
            <div
              className={`flex-1 bg-white flex flex-col h-full overflow-hidden ${
                !showMobileDetail ? 'hidden lg:flex' : 'flex'
              }`}
            >
              {selectedChat ? (
                <>
                  {/* Top Transcript Header */}
                  <div className="p-3.5 sm:p-4 border-b border-gray-200 bg-white flex items-center justify-between shrink-0">
                    <div className="flex items-center gap-3">
                      {/* Mobile Back Button */}
                      <button
                        onClick={() => setShowMobileDetail(false)}
                        className="lg:hidden flex items-center gap-1 text-xs font-semibold text-burgundy hover:underline cursor-pointer"
                      >
                        <ArrowLeft className="w-3.5 h-3.5" />
                        <span>Back to conversations</span>
                      </button>

                      <div className="hidden lg:block">
                        <h3 className="font-bold text-sm text-charcoal">
                          {selectedChat.customer_name || selectedChat.name || 'Unknown Customer'}
                        </h3>
                        <p className="text-xs text-gray-500 mt-0.5">
                          Phone: <span className="font-semibold text-charcoal">{renderVal(selectedChat.phone)}</span> • Email: <span className="font-semibold text-charcoal">{renderVal(selectedChat.email)}</span>
                        </p>
                      </div>
                    </div>

                    <div className="text-right text-[11px] text-gray-500 hidden sm:block">
                      <span className="block font-mono text-[10px] text-gray-400">
                        Session ID: {selectedChat.session_id || selectedChat.id}
                      </span>
                      <span>Source: <strong className="text-burgundy font-semibold">{renderVal(selectedChat.source)}</strong></span>
                    </div>
                  </div>

                  {/* Horizontal 1px Divider */}
                  <div className="h-px bg-gray-200 w-full" />

                  {/* Chat Messages Transcript Area */}
                  <div className="flex-1 p-4 sm:p-5 overflow-y-auto space-y-3 bg-ivory/20">
                    {parseMessages(selectedChat).length > 0 ? (
                      parseMessages(selectedChat).map((msg, idx) => {
                        const isUser = msg.sender === 'user';

                        return (
                          <div
                            key={idx}
                            className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}
                          >
                            <div className="flex items-center gap-1.5 mb-1 text-[10px] text-gray-400 font-semibold px-1">
                              <span>{isUser ? 'Customer' : 'Sara AI'}</span>
                              {msg.time && (
                                <span>
                                  • {new Date(msg.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </span>
                              )}
                            </div>

                            <div
                              className={`max-w-[85%] sm:max-w-[75%] p-3 rounded-lg text-xs leading-relaxed ${
                                isUser
                                  ? 'bg-burgundy text-white rounded-tr-none shadow-2xs'
                                  : 'bg-white border border-burgundy/30 text-charcoal rounded-tl-none shadow-2xs'
                              }`}
                            >
                              <p className="whitespace-pre-wrap">{msg.text}</p>
                            </div>
                          </div>
                        );
                      })
                    ) : (
                      <div className="p-8 text-center text-xs text-gray-400">
                        No message history found for this chat.
                      </div>
                    )}
                  </div>

                  {/* Bottom Footer Info */}
                  <div className="p-3 border-t border-gray-200 bg-white flex items-center justify-between text-[11px] text-gray-500 shrink-0">
                    <span>
                      Date: {' '}
                      {selectedChat.created_at
                        ? new Date(selectedChat.created_at).toLocaleString()
                        : 'Not provided'}
                    </span>
                    <span className="font-bold text-burgundy">
                      {parseMessages(selectedChat).length} Messages
                    </span>
                  </div>
                </>
              ) : (
                /* Empty Selection State */
                <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-white">
                  <div className="w-10 h-10 rounded-lg bg-ivory text-burgundy font-bold flex items-center justify-center mb-2 border border-gray-200">
                    <MessageSquare className="w-5 h-5 text-burgundy" />
                  </div>
                  <h4 className="text-xs font-bold text-charcoal">Select a conversation</h4>
                  <p className="text-[11px] text-gray-500 mt-0.5">
                    Choose a customer conversation from the list to view the transcript.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
