import React, { useEffect, useMemo, useState } from 'react';
import { Activity, UserPlus, PhoneCall, MapPin, CheckCircle2 } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { fmtDateTime, SOURCE_LABELS } from '../hooks/useLeads';

/**
 * Recent CRM events.
 *
 * Derived from the leads themselves rather than an events table: a lead's
 * created_at is when it arrived, and its status and flags say what has
 * happened since. Enough to answer "what changed today" without another
 * table to keep in step.
 */
const EVENT_STYLES = {
  arrived: { Icon: UserPlus, tone: 'bg-burgundy/10 text-burgundy border-burgundy/20' },
  called: { Icon: PhoneCall, tone: 'bg-blue-50 text-blue-700 border-blue-200' },
  visit: { Icon: MapPin, tone: 'bg-teal-50 text-teal-700 border-teal-200' },
  won: { Icon: CheckCircle2, tone: 'bg-emerald-50 text-emerald-700 border-emerald-200' }
};

function describe(lead) {
  if (lead.status === 'Converted') {
    return { kind: 'won', text: 'converted' };
  }
  if (lead.site_visit_requested || lead.status === 'Site Visit') {
    return { kind: 'visit', text: 'asked for a site visit' };
  }
  if (['Contacted', 'Calling', 'Qualified', 'Follow-up'].includes(lead.status)) {
    return { kind: 'called', text: `is ${lead.status.toLowerCase()}` };
  }
  return {
    kind: 'arrived',
    text: `arrived via ${SOURCE_LABELS[lead.source] || lead.source || 'the website'}`
  };
}

export default function ActivityTimelineCard() {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const { data, error } = await supabase
          .from('leads')
          .select('id, name, source, status, site_visit_requested, created_at, updated_at')
          .order('updated_at', { ascending: false })
          .limit(6);

        if (error) throw error;
        if (!cancelled) setLeads(data || []);
      } catch (err) {
        console.error('ActivityTimelineCard fetch error:', err);
        if (!cancelled) setLeads([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  const events = useMemo(
    () => leads.map((l) => ({ ...l, ...describe(l) })),
    [leads]
  );

  return (
    <div className="bg-white p-4 sm:p-5 rounded-2xl border border-gray-200/80 shadow-xs mb-0">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm sm:text-base font-bold text-charcoal">Activity Timeline</h3>
          <p className="text-[11px] text-gray-500 mt-0.5">Live CRM lead events</p>
        </div>
        <Activity className="w-4 h-4 text-gray-300" />
      </div>

      {loading ? (
        <p className="text-[11px] text-gray-400 py-6 text-center">Loading...</p>
      ) : events.length === 0 ? (
        <p className="text-[11px] text-gray-400 py-6 text-center">No activity yet.</p>
      ) : (
        <ul className="space-y-3">
          {events.map((e) => {
            const { Icon, tone } = EVENT_STYLES[e.kind];
            return (
              <li key={e.id} className="flex items-start gap-2.5">
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 border ${tone}`}
                >
                  <Icon className="w-3 h-3" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[11px] text-charcoal leading-snug">
                    <span className="font-bold">{e.name || 'A visitor'}</span> {e.text}
                  </p>
                  <span className="text-[10px] text-gray-400">
                    {fmtDateTime(e.updated_at || e.created_at)}
                  </span>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
