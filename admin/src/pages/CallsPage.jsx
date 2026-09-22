import React, { useEffect, useMemo, useState } from 'react';
import { PhoneCall, RotateCw, PhoneIncoming, PhoneOutgoing, MessageSquare } from 'lucide-react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { fmtDateTime, STATUS_TONE } from '../hooks/useLeads';

/**
 * Call history.
 *
 * There is no separate calls table. A call leaves two traces: the transcript
 * the voice webhook writes to chat_history under a voice-<direction>-<id>
 * session, and the outcome written back onto the lead. This page joins those,
 * so a call shows both what was said and what it produced.
 */
export default function CallsPage() {
  const [rows, setRows] = useState([]);
  const [leadsById, setLeadsById] = useState({});
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [tab, setTab] = useState('all');

  const load = async (isManualRefresh = false) => {
    if (isManualRefresh) setRefreshing(true);
    else setLoading(true);
    setError('');

    try {
      const [history, leads] = await Promise.all([
        supabase
          .from('chat_history')
          .select('id, session_id, sender, message, lead_id, created_at')
          .like('session_id', 'voice-%')
          .order('created_at', { ascending: true }),
        supabase.from('leads').select('*')
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
      console.error('Error loading call history:', err);
      setError(err.message || 'Could not load call history.');
      setRows([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const calls = useMemo(() => {
    const bySession = new Map();

    rows.forEach((row) => {
      const id = row.session_id;
      if (!bySession.has(id)) {
        bySession.set(id, {
          sessionId: id,
          // voice-inbound-… / voice-outbound-…
          direction: id.split('-')[1] === 'outbound' ? 'outbound' : 'inbound',
          turns: 0,
          leadId: null,
          startedAt: row.created_at,
          endedAt: row.created_at
        });
      }
      const call = bySession.get(id);
      call.turns += 1;
      if (row.lead_id) call.leadId = row.lead_id;
      if (row.created_at < call.startedAt) call.startedAt = row.created_at;
      if (row.created_at > call.endedAt) call.endedAt = row.created_at;
    });

    return Array.from(bySession.values())
      .map((call) => ({ ...call, lead: call.leadId ? leadsById[call.leadId] : null }))
      .sort((a, b) => (a.startedAt < b.startedAt ? 1 : -1));
  }, [rows, leadsById]);

  const counts = useMemo(
    () => ({
      all: calls.length,
      inbound: calls.filter((c) => c.direction === 'inbound').length,
      outbound: calls.filter((c) => c.direction === 'outbound').length
    }),
    [calls]
  );

  const visible = calls.filter((c) => tab === 'all' || c.direction === tab);

  const tabs = [
    { key: 'all', label: 'All', Icon: PhoneCall },
    { key: 'inbound', label: 'Inbound', Icon: PhoneIncoming },
    { key: 'outbound', label: 'Outbound', Icon: PhoneOutgoing }
  ];

  return (
    <div className="space-y-4 font-sans text-charcoal pb-10">
      <div className="flex items-center justify-between bg-white p-4 sm:p-5 rounded-xl border border-gray-200/80 shadow-2xs">
        <div>
          <h1 className="text-lg sm:text-xl font-bold tracking-tight">Call History</h1>
          <p className="text-xs text-gray-500 mt-0.5">
            Every call Sara handled, and what it produced.
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

      {error && (
        <p className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium">
          {error}
        </p>
      )}

      <div className="bg-white rounded-xl border border-gray-200/80 shadow-2xs overflow-hidden">
        <div className="flex gap-1 p-2 border-b border-gray-100">
          {tabs.map(({ key, label, Icon }) => (
            <button
              key={key}
              type="button"
              onClick={() => setTab(key)}
              className={`flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                tab === key
                  ? 'bg-burgundy text-white'
                  : 'text-gray-500 hover:bg-ivory hover:text-charcoal'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              {label}
              <span className={tab === key ? 'text-white/70' : 'text-gray-400'}>{counts[key]}</span>
            </button>
          ))}
        </div>

        {loading ? (
          <div className="p-14 text-center">
            <div className="w-8 h-8 border-3 border-burgundy/20 border-t-burgundy rounded-full animate-spin mx-auto" />
            <p className="text-xs text-gray-500 mt-3">Loading calls...</p>
          </div>
        ) : visible.length === 0 ? (
          <div className="p-14 text-center">
            <PhoneCall className="w-8 h-8 text-gray-300 mx-auto mb-2" />
            <p className="text-xs text-gray-400">
              No calls yet. Website voice calls and outbound calls both appear here.
            </p>
          </div>
        ) : (
          <ul className="divide-y divide-gray-100">
            {visible.map((call) => {
              const inbound = call.direction === 'inbound';
              const Icon = inbound ? PhoneIncoming : PhoneOutgoing;
              return (
                <li key={call.sessionId} className="px-4 py-3.5 flex items-center gap-3">
                  <div
                    className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 border ${
                      inbound
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        : 'bg-blue-50 text-blue-700 border-blue-200'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span
                        className={`text-xs truncate ${
                          call.lead ? 'font-bold' : 'font-semibold italic text-gray-400'
                        }`}
                      >
                        {call.lead?.name || 'No name given'}
                      </span>
                      <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full border bg-gray-100 text-gray-600 border-gray-200">
                        {inbound ? 'Inbound' : 'Outbound'}
                      </span>
                      {call.lead && (
                        <span
                          className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full border ${
                            STATUS_TONE[call.lead.status] || STATUS_TONE.New
                          }`}
                        >
                          {call.lead.status}
                        </span>
                      )}
                      {call.lead?.site_visit_requested && (
                        <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full border bg-teal-50 text-teal-700 border-teal-200">
                          Site visit
                        </span>
                      )}
                    </div>

                    <p className="text-[11px] text-gray-500 mt-0.5 truncate">
                      {call.lead?.phone || 'No number captured'}
                      {' • '}
                      {call.turns} turns
                      {' • '}
                      {fmtDateTime(call.startedAt)}
                    </p>

                    <p className="text-[11px] text-gray-400 mt-0.5 truncate">
                      {call.lead
                        ? [call.lead.plot_size, call.lead.budget_range, call.lead.interest_level]
                            .filter(Boolean)
                            .join(' • ') || 'Nothing captured'
                        : 'No lead created from this call'}
                    </p>
                  </div>

                  <Link
                    to="/admin/chats"
                    className="p-2 rounded-lg bg-ivory text-gray-600 border border-gray-200 hover:text-burgundy transition-colors shrink-0"
                    title="Read the transcript"
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
