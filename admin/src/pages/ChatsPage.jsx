import React, { useState, useEffect, useMemo } from 'react';
import { Search, RotateCw, ArrowLeft, MessageSquare, Phone, User, Inbox } from 'lucide-react';
import { supabase } from '../lib/supabase';

/**
 * Conversation history.
 *
 * chat_history holds one row per message. This page groups them into
 * conversations by session_id. Previously each row rendered as its own card,
 * so a ten-message chat looked like ten separate "Unknown Customer" enquiries.
 *
 * The voice webhook writes sessions as voice-<direction>-<id>, which is what
 * tells a phone call apart from a website chat.
 */

const CHANNELS = {
  chat: {
    label: 'Chat',
    Icon: MessageSquare,
    tone: 'bg-burgundy/10 text-burgundy border-burgundy/20'
  },
  voice: {
    label: 'Voice',
    Icon: Phone,
    tone: 'bg-emerald-50 text-emerald-700 border-emerald-200'
  }
};

const channelOf = (sessionId) => (String(sessionId).startsWith('voice-') ? 'voice' : 'chat');

const isUserSender = (sender) => String(sender || '').toLowerCase().includes('user');

const fmtTime = (iso) => {
  if (!iso) return '';
  return new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

const fmtDay = (iso) => {
  if (!iso) return '';
  const d = new Date(iso);
  const sameDay = d.toDateString() === new Date().toDateString();
  return sameDay ? fmtTime(iso) : d.toLocaleDateString([], { month: 'short', day: 'numeric' });
};

/** Group message rows into conversations and attach whatever lead they produced. */
function buildConversations(rows, leadsById) {
  const bySession = new Map();

  rows.forEach((row) => {
    const id = row.session_id || 'unknown-session';

    if (!bySession.has(id)) {
      bySession.set(id, {
        sessionId: id,
        channel: channelOf(id),
        messages: [],
        leadId: null,
        startedAt: row.created_at,
        lastAt: row.created_at
      });
    }

    const conv = bySession.get(id);
    conv.messages.push({
      id: row.id,
      sender: isUserSender(row.sender) ? 'user' : 'sara',
      text: row.message || '',
      at: row.created_at
    });

    // lead_id is only backfilled from the turn a phone number appears, so take
    // it from whichever message carries it.
    if (row.lead_id) conv.leadId = row.lead_id;
    if (row.created_at < conv.startedAt) conv.startedAt = row.created_at;
    if (row.created_at > conv.lastAt) conv.lastAt = row.created_at;
  });

  return Array.from(bySession.values())
    .map((conv) => {
      const lead = conv.leadId ? leadsById[conv.leadId] : null;
      const lastUser = [...conv.messages].reverse().find((m) => m.sender === 'user');
      const lastAny = conv.messages[conv.messages.length - 1];

      return {
        ...conv,
        lead,
        // A name exists only once the caller gave one. Saying so beats a label
        // that reads like a real customer record.
        name: (lead && lead.name) || null,
        phone: (lead && lead.phone) || null,
        email: (lead && lead.email) || null,
        preview: ((lastUser || lastAny) || {}).text || ''
      };
    })
    .sort((a, b) => (a.lastAt < b.lastAt ? 1 : -1));
}

export default function ChatsPage() {
  const [rows, setRows] = useState([]);
  const [leadsById, setLeadsById] = useState({});
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [tab, setTab] = useState('all');
  const [selectedId, setSelectedId] = useState(null);
  const [showMobileDetail, setShowMobileDetail] = useState(false);

  const load = async (isManualRefresh = false) => {
    if (isManualRefresh) setRefreshing(true);
    else setLoading(true);

    try {
      const [history, leads] = await Promise.all([
        supabase
          .from('chat_history')
          .select('id, session_id, sender, message, lead_id, created_at')
          .order('created_at', { ascending: true }),
        supabase.from('leads').select('id, name, phone, email, source')
      ]);

      if (history.error) throw history.error;
      if (leads.error) throw leads.error;

      const map = {};
      (leads.data || []).forEach((l) => {
        map[l.id] = l;
      });

      setLeadsById(map);
      setRows(history.data || []);
    } catch (err) {
      console.error('Error loading conversation history:', err);
      setRows([]);
      setLeadsById({});
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const conversations = useMemo(() => buildConversations(rows, leadsById), [rows, leadsById]);

  const counts = useMemo(
    () => ({
      all: conversations.length,
      chat: conversations.filter((c) => c.channel === 'chat').length,
      voice: conversations.filter((c) => c.channel === 'voice').length
    }),
    [conversations]
  );

  const visible = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    return conversations
      .filter((c) => tab === 'all' || c.channel === tab)
      .filter((c) => {
        if (!term) return true;
        return (
          (c.name || '').toLowerCase().includes(term) ||
          (c.phone || '').includes(term) ||
          (c.email || '').toLowerCase().includes(term) ||
          c.messages.some((m) => m.text.toLowerCase().includes(term))
        );
      });
  }, [conversations, tab, searchTerm]);

  const selected = visible.find((c) => c.sessionId === selectedId) || visible[0] || null;

  const tabs = [
    { key: 'all', label: 'All', Icon: Inbox },
    { key: 'chat', label: 'Chat', Icon: MessageSquare },
    { key: 'voice', label: 'Voice', Icon: Phone }
  ];

  return (
    <div className="space-y-4 font-sans text-charcoal pb-10">
      {/* Header */}
      <div className="flex items-center justify-between bg-white p-4 sm:p-5 rounded-xl border border-gray-200/80 shadow-2xs">
        <div>
          <h1 className="text-lg sm:text-xl font-bold tracking-tight">Conversation History</h1>
          <p className="text-xs text-gray-500 mt-0.5">
            Every chat and voice call handled by Sara.
          </p>
        </div>
        <button
          type="button"
          onClick={() => load(true)}
          disabled={refreshing}
          className="p-2 rounded-lg border border-gray-200 bg-ivory/60 hover:bg-ivory text-gray-600 hover:text-burgundy transition-colors cursor-pointer disabled:opacity-50"
          title="Refresh"
        >
          <RotateCw className={`w-4 h-4 ${refreshing ? 'animate-spin text-burgundy' : ''}`} />
        </button>
      </div>

      {loading ? (
        <div className="bg-white rounded-xl border border-gray-200/80 p-16 text-center">
          <div className="w-8 h-8 border-3 border-burgundy/20 border-t-burgundy rounded-full animate-spin mx-auto" />
          <p className="text-xs text-gray-500 mt-3">Loading conversations...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          {/* LIST */}
          <div
            className={`lg:col-span-4 bg-white rounded-xl border border-gray-200/80 shadow-2xs flex-col overflow-hidden ${
              showMobileDetail ? 'hidden lg:flex' : 'flex'
            }`}
          >
            <div className="flex gap-1 p-2 border-b border-gray-100">
              {tabs.map(({ key, label, Icon }) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => setTab(key)}
                  className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                    tab === key
                      ? 'bg-burgundy text-white'
                      : 'text-gray-500 hover:bg-ivory hover:text-charcoal'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  {label}
                  <span className={tab === key ? 'text-white/70' : 'text-gray-400'}>
                    {counts[key]}
                  </span>
                </button>
              ))}
            </div>

            <div className="p-2.5 border-b border-gray-100">
              <div className="relative">
                <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search name, number or message..."
                  className="w-full pl-9 pr-3 py-2 rounded-lg border border-gray-200 bg-ivory/40 text-xs focus:outline-none focus:border-burgundy/40"
                />
              </div>
            </div>

            <div className="overflow-y-auto max-h-[62vh] divide-y divide-gray-100">
              {visible.length === 0 ? (
                <p className="text-xs text-gray-400 text-center py-12">No conversations yet.</p>
              ) : (
                visible.map((c) => {
                  const { Icon, tone, label } = CHANNELS[c.channel];
                  const active = selected && selected.sessionId === c.sessionId;

                  return (
                    <button
                      key={c.sessionId}
                      type="button"
                      onClick={() => {
                        setSelectedId(c.sessionId);
                        setShowMobileDetail(true);
                      }}
                      className={`w-full text-left px-3.5 py-3 hover:bg-ivory/60 transition-colors cursor-pointer ${
                        active ? 'bg-ivory' : ''
                      }`}
                    >
                      <div className="flex items-start gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-burgundy/10 text-burgundy flex items-center justify-center shrink-0 text-xs font-bold">
                          {c.name ? c.name.charAt(0).toUpperCase() : <User className="w-4 h-4" />}
                        </div>

                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between gap-2">
                            <span
                              className={`text-xs truncate ${
                                c.name
                                  ? 'font-bold text-charcoal'
                                  : 'font-semibold italic text-gray-400'
                              }`}
                            >
                              {c.name || 'No name given'}
                            </span>
                            <span className="text-[10px] text-gray-400 shrink-0">
                              {fmtDay(c.lastAt)}
                            </span>
                          </div>

                          <p className="text-[11px] text-gray-500 truncate mt-0.5">{c.preview}</p>

                          <div className="flex items-center gap-1.5 mt-1.5">
                            <span
                              className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[9px] font-bold border ${tone}`}
                            >
                              <Icon className="w-2.5 h-2.5" />
                              {label}
                            </span>
                            <span className="text-[10px] text-gray-400">
                              {c.messages.length} msg
                            </span>
                            {c.phone && (
                              <span className="text-[10px] text-gray-400 truncate">{c.phone}</span>
                            )}
                          </div>
                        </div>
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </div>

          {/* TRANSCRIPT */}
          <div
            className={`lg:col-span-8 bg-white rounded-xl border border-gray-200/80 shadow-2xs flex-col overflow-hidden ${
              showMobileDetail ? 'flex' : 'hidden lg:flex'
            }`}
          >
            {!selected ? (
              <div className="flex-1 flex items-center justify-center py-20">
                <p className="text-xs text-gray-400">Select a conversation to read it.</p>
              </div>
            ) : (
              <>
                <div className="px-4 py-3 border-b border-gray-100 flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <button
                      type="button"
                      onClick={() => setShowMobileDetail(false)}
                      className="lg:hidden p-1 rounded text-gray-500 hover:text-burgundy cursor-pointer"
                    >
                      <ArrowLeft className="w-4 h-4" />
                    </button>

                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <h2
                          className={`text-sm font-bold truncate ${
                            selected.name ? 'text-charcoal' : 'italic text-gray-400'
                          }`}
                        >
                          {selected.name || 'No name given'}
                        </h2>
                        <span
                          className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[9px] font-bold border ${
                            CHANNELS[selected.channel].tone
                          }`}
                        >
                          {React.createElement(CHANNELS[selected.channel].Icon, {
                            className: 'w-2.5 h-2.5'
                          })}
                          {CHANNELS[selected.channel].label}
                        </span>
                      </div>
                      <p className="text-[11px] text-gray-500 mt-0.5 truncate">
                        {selected.phone || 'No number captured'}
                        {selected.email ? ` • ${selected.email}` : ''}
                        {!selected.lead && ' • no lead created'}
                      </p>
                    </div>
                  </div>

                  <span className="text-[10px] text-gray-400 shrink-0 hidden sm:block">
                    {new Date(selected.startedAt).toLocaleString()}
                  </span>
                </div>

                <div className="flex-1 overflow-y-auto max-h-[58vh] p-4 space-y-2.5 bg-ivory/30">
                  {selected.messages.map((m) => (
                    <div
                      key={m.id}
                      className={`flex ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div className="max-w-[78%]">
                        <div
                          className={`px-3.5 py-2 rounded-2xl text-xs leading-relaxed whitespace-pre-wrap ${
                            m.sender === 'user'
                              ? 'bg-burgundy text-white rounded-br-sm'
                              : 'bg-white border border-gray-200 text-charcoal rounded-bl-sm'
                          }`}
                        >
                          {m.text}
                        </div>
                        <span
                          className={`block text-[9px] text-gray-400 mt-0.5 ${
                            m.sender === 'user' ? 'text-right' : ''
                          }`}
                        >
                          {m.sender === 'user' ? 'Customer' : 'Sara'} {'•'} {fmtTime(m.at)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="px-4 py-2 border-t border-gray-100 flex items-center justify-between text-[10px] text-gray-400">
                  <span className="truncate">Session: {selected.sessionId}</span>
                  <span>{selected.messages.length} messages</span>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
