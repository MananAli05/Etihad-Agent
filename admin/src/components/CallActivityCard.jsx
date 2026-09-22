import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { PhoneIncoming, PhoneOutgoing, PhoneCall, ArrowRight } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { fmtDateTime } from '../hooks/useLeads';

/**
 * Dashboard summary of recent calls.
 *
 * There is no calls table: a call leaves a transcript in chat_history under a
 * voice-<direction>-<id> session. Grouping those sessions gives the call log,
 * and lead_id ties each one to whatever it produced.
 */
export default function CallActivityCard() {
  const [rows, setRows] = useState([]);
  const [leadsById, setLeadsById] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const [history, leads] = await Promise.all([
          supabase
            .from('chat_history')
            .select('session_id, lead_id, created_at')
            .like('session_id', 'voice-%')
            .order('created_at', { ascending: false })
            .limit(200),
          supabase.from('leads').select('id, name, phone, status')
        ]);

        if (history.error) throw history.error;
        if (leads.error) throw leads.error;

        const map = {};
        (leads.data || []).forEach((l) => {
          map[l.id] = l;
        });

        if (!cancelled) {
          setLeadsById(map);
          setRows(history.data || []);
        }
      } catch (err) {
        console.error('CallActivityCard fetch error:', err);
        if (!cancelled) setRows([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  const calls = useMemo(() => {
    const bySession = new Map();

    rows.forEach((row) => {
      const id = row.session_id;
      if (!bySession.has(id)) {
        bySession.set(id, {
          sessionId: id,
          direction: id.split('-')[1] === 'outbound' ? 'outbound' : 'inbound',
          leadId: null,
          at: row.created_at
        });
      }
      const call = bySession.get(id);
      if (row.lead_id) call.leadId = row.lead_id;
      if (row.created_at > call.at) call.at = row.created_at;
    });

    return Array.from(bySession.values())
      .map((c) => ({ ...c, lead: c.leadId ? leadsById[c.leadId] : null }))
      .sort((a, b) => (a.at < b.at ? 1 : -1))
      .slice(0, 4);
  }, [rows, leadsById]);

  return (
    <div className="bg-white p-4 sm:p-5 rounded-2xl border border-gray-200/80 shadow-xs mb-0">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm sm:text-base font-bold text-charcoal">Recent Calls</h3>
          <p className="text-[11px] text-gray-500 mt-0.5">Handled by Sara</p>
        </div>
        <Link
          to="/admin/calls"
          className="text-[11px] font-semibold text-burgundy hover:underline flex items-center gap-1"
        >
          View all <ArrowRight className="w-3 h-3" />
        </Link>
      </div>

      {loading ? (
        <p className="text-[11px] text-gray-400 py-6 text-center">Loading...</p>
      ) : calls.length === 0 ? (
        <div className="py-6 text-center">
          <PhoneCall className="w-6 h-6 text-gray-300 mx-auto mb-1.5" />
          <p className="text-[11px] text-gray-400">No calls yet.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {calls.map((c) => {
            const inbound = c.direction === 'inbound';
            const Icon = inbound ? PhoneIncoming : PhoneOutgoing;
            return (
              <div
                key={c.sessionId}
                className="p-3 rounded-xl border border-gray-100 bg-ivory/40 flex items-center gap-2.5"
              >
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 border ${
                    inbound
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      : 'bg-blue-50 text-blue-700 border-blue-200'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                </div>
                <div className="min-w-0 flex-1">
                  <span
                    className={`text-xs truncate block ${
                      c.lead ? 'font-bold text-charcoal' : 'font-semibold italic text-gray-400'
                    }`}
                  >
                    {c.lead?.name || 'No name given'}
                  </span>
                  <p className="text-[11px] text-gray-500 truncate">
                    {inbound ? 'Inbound' : 'Outbound'}
                    {c.lead?.phone ? ` • ${c.lead.phone}` : ''}
                  </p>
                </div>
                <span className="text-[10px] text-gray-400 shrink-0">{fmtDateTime(c.at)}</span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
