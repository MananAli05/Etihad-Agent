import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { MapPin, ArrowRight } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { fmtDateTime } from '../hooks/useLeads';

/**
 * Dashboard summary of site visit requests.
 *
 * site_visit_requested is set by Sara when a caller asks to see the place, on
 * the website or an outbound call. These are the warmest leads in the CRM.
 */
export default function SiteVisitsCard() {
  const [visits, setVisits] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const { data, error } = await supabase
          .from('leads')
          .select('id, name, phone, city, plot_size, status, created_at, site_visit_requested')
          .or('site_visit_requested.is.true,status.eq.Site Visit')
          .order('created_at', { ascending: false });

        if (error) throw error;
        if (!cancelled) setVisits(data || []);
      } catch (err) {
        console.error('SiteVisitsCard fetch error:', err);
        if (!cancelled) setVisits([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="bg-white p-4 sm:p-5 rounded-2xl border border-gray-200/80 shadow-xs mb-0">
      <div className="flex items-center justify-between mb-4">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-sm sm:text-base font-bold text-charcoal">Site Visits</h3>
            {visits.length > 0 && (
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-teal-50 text-teal-700 border border-teal-200">
                {visits.length}
              </span>
            )}
          </div>
          <p className="text-[11px] text-gray-500 mt-0.5">Customers who asked to visit</p>
        </div>
        <Link
          to="/admin/site-visits"
          className="text-[11px] font-semibold text-burgundy hover:underline flex items-center gap-1"
        >
          View all <ArrowRight className="w-3 h-3" />
        </Link>
      </div>

      {loading ? (
        <p className="text-[11px] text-gray-400 py-6 text-center">Loading...</p>
      ) : visits.length === 0 ? (
        <div className="py-6 text-center">
          <MapPin className="w-6 h-6 text-gray-300 mx-auto mb-1.5" />
          <p className="text-[11px] text-gray-400">
            No requests yet. Sara flags these during a conversation.
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {visits.slice(0, 4).map((v) => (
            <div
              key={v.id}
              className="p-3 rounded-xl border border-gray-100 bg-ivory/40 flex items-center justify-between gap-2"
            >
              <div className="min-w-0">
                <span className="text-xs font-bold text-charcoal truncate block">
                  {v.name || 'Unnamed'}
                </span>
                <p className="text-[11px] text-gray-500 truncate">
                  {[v.phone, v.city, v.plot_size].filter(Boolean).join(' • ')}
                </p>
              </div>
              <span className="text-[10px] text-gray-400 shrink-0">
                {fmtDateTime(v.created_at)}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
