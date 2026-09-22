import React, { useMemo, useState } from 'react';
import { MapPin, RotateCw, Phone, MessageCircle, CheckCircle2 } from 'lucide-react';
import { supabase } from '../lib/supabase';
import {
  useLeads,
  fmtDateTime,
  STATUS_TONE,
  SOURCE_LABELS,
  interestLabel
} from '../hooks/useLeads';

/**
 * Site visits.
 *
 * Sara sets site_visit_requested when a caller says they want to see the
 * place, on the website or on an outbound call. That flag is the queue: these
 * are the warmest leads in the CRM and the ones worth calling first.
 */
export default function SiteVisitsPage() {
  const { leads, loading, refreshing, error, reload, setLeads } = useLeads();
  const [busyId, setBusyId] = useState(null);

  const visits = useMemo(
    () =>
      leads
        .filter((l) => l.site_visit_requested === true || l.status === 'Site Visit')
        .sort((a, b) => (a.created_at < b.created_at ? 1 : -1)),
    [leads]
  );

  const markScheduled = async (lead) => {
    setBusyId(lead.id);
    try {
      const { error: updateError } = await supabase
        .from('leads')
        .update({ status: 'Site Visit' })
        .eq('id', lead.id);

      if (updateError) throw updateError;
      setLeads((prev) => prev.map((l) => (l.id === lead.id ? { ...l, status: 'Site Visit' } : l)));
    } catch (err) {
      console.error('Could not update site visit:', err);
      window.alert(err.message || 'Could not update this lead.');
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="space-y-4 font-sans text-charcoal pb-10">
      <div className="flex items-center justify-between bg-white p-4 sm:p-5 rounded-xl border border-gray-200/80 shadow-2xs">
        <div>
          <h1 className="text-lg sm:text-xl font-bold tracking-tight">Site Visits</h1>
          <p className="text-xs text-gray-500 mt-0.5">
            Everyone who asked to see the project, newest first.
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
            <p className="text-xs text-gray-500 mt-3">Loading site visits...</p>
          </div>
        ) : visits.length === 0 ? (
          <div className="p-14 text-center">
            <MapPin className="w-8 h-8 text-gray-300 mx-auto mb-2" />
            <p className="text-xs text-gray-400">
              No site visit requests yet. Sara flags these when a caller asks to see the project.
            </p>
          </div>
        ) : (
          <ul className="divide-y divide-gray-100">
            {visits.map((lead) => (
              <li key={lead.id} className="px-4 py-3.5 flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-teal-50 text-teal-700 border border-teal-200 flex items-center justify-center shrink-0">
                  <MapPin className="w-4 h-4" />
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
                    {lead.interest_level && (
                      <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full border bg-amber-50 text-amber-700 border-amber-200">
                        {interestLabel(lead.interest_level)}
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-gray-500 mt-0.5 truncate">
                    {lead.phone}
                    {lead.city ? ` • ${lead.city}` : ''}
                    {' • '}
                    {SOURCE_LABELS[lead.source] || lead.source}
                  </p>
                  <p className="text-[11px] text-gray-400 mt-0.5 truncate">
                    {[lead.plot_size, lead.phase_preference, lead.budget_range]
                      .filter(Boolean)
                      .join(' • ') || 'No requirements captured'}
                  </p>
                  <p className="text-[11px] text-gray-400 mt-0.5">
                    Requested {fmtDateTime(lead.created_at)}
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
                  {lead.status !== 'Site Visit' && (
                    <button
                      type="button"
                      onClick={() => markScheduled(lead)}
                      disabled={busyId === lead.id}
                      className="p-2 rounded-lg bg-burgundy text-white hover:bg-[#521923] transition-colors cursor-pointer disabled:opacity-50"
                      title="Mark as scheduled"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
