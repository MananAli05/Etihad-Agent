import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { CalendarCheck, Clock, ArrowRight } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { fmtDateTime } from '../hooks/useLeads';

/**
 * Dashboard summary of leads waiting to be called back.
 *
 * A follow-up is a lead carrying a follow_up_time, or one parked in the
 * Follow-up status - not a separate record. Overdue comes first, because that
 * is the list a rep opens the dashboard to find.
 */
export default function FollowUpsCard() {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const { data, error } = await supabase
          .from('leads')
          .select('id, name, phone, status, follow_up_time, interest_level')
          .or('follow_up_time.not.is.null,status.eq.Follow-up');

        if (error) throw error;
        if (!cancelled) setLeads(data || []);
      } catch (err) {
        console.error('FollowUpsCard fetch error:', err);
        if (!cancelled) setLeads([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  const tasks = useMemo(() => {
    const now = Date.now();
    return leads
      .map((l) => {
        const due = l.follow_up_time ? new Date(l.follow_up_time).getTime() : null;
        return { ...l, due, overdue: due !== null && due < now };
      })
      .sort((a, b) => {
        if (a.due === null) return 1;
        if (b.due === null) return -1;
        return a.due - b.due;
      })
      .slice(0, 4);
  }, [leads]);

  return (
    <div className="bg-white p-4 sm:p-5 rounded-2xl border border-gray-200/80 shadow-xs mb-0">
      <div className="flex items-center justify-between mb-4">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-sm sm:text-base font-bold text-charcoal">Follow-ups</h3>
            {leads.length > 0 && (
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-burgundy/10 text-burgundy border border-burgundy/20">
                {leads.length}
              </span>
            )}
          </div>
          <p className="text-[11px] text-gray-500 mt-0.5">Leads waiting on a call back</p>
        </div>
        <Link
          to="/admin/follow-ups"
          className="text-[11px] font-semibold text-burgundy hover:underline flex items-center gap-1"
        >
          View all <ArrowRight className="w-3 h-3" />
        </Link>
      </div>

      {loading ? (
        <p className="text-[11px] text-gray-400 py-6 text-center">Loading...</p>
      ) : tasks.length === 0 ? (
        <div className="py-6 text-center">
          <CalendarCheck className="w-6 h-6 text-gray-300 mx-auto mb-1.5" />
          <p className="text-[11px] text-gray-400">
            Nothing pending. A time agreed on a call appears here.
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {tasks.map((t) => (
            <div
              key={t.id}
              className="p-3 rounded-xl border border-gray-100 bg-ivory/40 flex items-center justify-between gap-2"
            >
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-bold text-charcoal truncate">
                    {t.name || 'Unnamed'}
                  </span>
                  {t.overdue && (
                    <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200">
                      Overdue
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-gray-500 truncate">{t.phone}</p>
              </div>
              <span className="text-[10px] text-gray-400 flex items-center gap-1 shrink-0">
                <Clock className="w-3 h-3" />
                {t.follow_up_time ? fmtDateTime(t.follow_up_time) : 'No time'}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
