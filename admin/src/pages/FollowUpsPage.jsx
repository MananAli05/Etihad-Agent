import React, { useMemo, useState } from 'react';
import { CalendarCheck, RotateCw, Phone, MessageCircle, Check } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useLeads, fmtDateTime, STATUS_TONE, SOURCE_LABELS } from '../hooks/useLeads';

/**
 * Follow-ups.
 *
 * A follow-up is not a separate record: it is a lead that either carries a
 * follow_up_time the caller agreed, or sits in the Follow-up status. Both are
 * columns the voice agent and n8n already write.
 */
export default function FollowUpsPage() {
  const { leads, loading, refreshing, error, reload, setLeads } = useLeads();
  const [busyId, setBusyId] = useState(null);

  const tasks = useMemo(() => {
    const now = Date.now();
    return leads
      .filter((l) => l.follow_up_time || l.status === 'Follow-up')
      .map((l) => {
        const due = l.follow_up_time ? new Date(l.follow_up_time).getTime() : null;
        return { ...l, due, overdue: due !== null && due < now };
      })
      // Overdue first, then soonest. A lead with no time agreed goes last:
      // it needs chasing, but not before one that was promised a time.
      .sort((a, b) => {
        if (a.due === null) return 1;
        if (b.due === null) return -1;
        return a.due - b.due;
      });
  }, [leads]);

  const markDone = async (lead) => {
    setBusyId(lead.id);
    try {
      const { error: updateError } = await supabase
        .from('leads')
        .update({ status: 'Contacted', follow_up_time: null })
        .eq('id', lead.id);

      if (updateError) throw updateError;

      setLeads((prev) =>
        prev.map((l) =>
          l.id === lead.id ? { ...l, status: 'Contacted', follow_up_time: null } : l
        )
      );
    } catch (err) {
      console.error('Could not complete follow-up:', err);
      window.alert(err.message || 'Could not update this follow-up.');
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="space-y-4 font-sans text-charcoal pb-10">
      <div className="flex items-center justify-between bg-white p-4 sm:p-5 rounded-xl border border-gray-200/80 shadow-2xs">
        <div>
          <h1 className="text-lg sm:text-xl font-bold tracking-tight">Follow-ups</h1>
          <p className="text-xs text-gray-500 mt-0.5">
            Leads waiting to be called back, soonest first.
          </p>
        </div>
        <button
          type="button"
          onClick={() => reload(true)}
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
        {loading ? (
          <div className="p-14 text-center">
            <div className="w-8 h-8 border-3 border-burgundy/20 border-t-burgundy rounded-full animate-spin mx-auto" />
            <p className="text-xs text-gray-500 mt-3">Loading follow-ups...</p>
          </div>
        ) : tasks.length === 0 ? (
          <div className="p-14 text-center">
            <CalendarCheck className="w-8 h-8 text-gray-300 mx-auto mb-2" />
            <p className="text-xs text-gray-400">
              Nothing to follow up. A time agreed on a call shows up here.
            </p>
          </div>
        ) : (
          <ul className="divide-y divide-gray-100">
            {tasks.map((lead) => (
              <li key={lead.id} className="px-4 py-3.5 flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-burgundy/10 text-burgundy flex items-center justify-center shrink-0 text-xs font-bold">
                  {(lead.name || '?').charAt(0).toUpperCase()}
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-bold truncate">{lead.name || 'Unnamed'}</span>
                    <span
                      className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full border ${
                        STATUS_TONE[lead.status] || STATUS_TONE.New
                      }`}
                    >
                      {lead.status}
                    </span>
                    {lead.overdue && (
                      <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full border bg-rose-50 text-rose-700 border-rose-200">
                        Overdue
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-gray-500 mt-0.5 truncate">
                    {lead.phone}
                    {lead.city ? ` • ${lead.city}` : ''}
                    {' • '}
                    {SOURCE_LABELS[lead.source] || lead.source}
                  </p>
                  <p className="text-[11px] text-gray-400 mt-0.5">
                    {lead.follow_up_time
                      ? `Due ${fmtDateTime(lead.follow_up_time)}`
                      : 'No time agreed'}
                  </p>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  <a
                    href={`tel:${lead.phone}`}
                    className="p-2 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 transition-colors"
                    title="Call"
                  >
                    <Phone className="w-3.5 h-3.5" />
                  </a>
                  <a
                    href={`https://wa.me/${String(lead.phone || '').replace(/\D/g, '')}`}
                    target="_blank"
                    rel="noreferrer"
                    className="p-2 rounded-lg bg-ivory text-gray-600 border border-gray-200 hover:text-burgundy transition-colors"
                    title="WhatsApp"
                  >
                    <MessageCircle className="w-3.5 h-3.5" />
                  </a>
                  <button
                    type="button"
                    onClick={() => markDone(lead)}
                    disabled={busyId === lead.id}
                    className="p-2 rounded-lg bg-burgundy text-white hover:bg-[#521923] transition-colors cursor-pointer disabled:opacity-50"
                    title="Mark as contacted"
                  >
                    <Check className="w-3.5 h-3.5" />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
