import React, { useState, useEffect } from 'react';
import { Users, UserCheck, CheckCircle2, MapPin, RotateCw, Activity, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';

const allStatuses = [
  'New',
  'Calling',
  'Contacted',
  'Qualified',
  'Follow-up',
  'Site Visit',
  'Converted',
  'Cold',
  'Not Interested'
];

const sourceMap = [
  { key: 'website_form', name: 'Website Form' },
  { key: 'google_form', name: 'Google Form' },
  { key: 'chatbot', name: 'Chatbot' },
  { key: 'voice_agent', name: 'Voice Agent' },
  { key: 'whatsapp', name: 'WhatsApp' },
  { key: 'inbound_call', name: 'Inbound Calls' }
];

export default function AnalyticsPage() {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [totalLeads, setTotalLeads] = useState(0);
  const [newLeadsCount, setNewLeadsCount] = useState(0);
  const [qualifiedCount, setQualifiedCount] = useState(0);
  const [siteVisitsCount, setSiteVisitsCount] = useState(0);

  const [pipelineStats, setPipelineStats] = useState([]);
  const [sourceStats, setSourceStats] = useState([]);
  const [recentActivities, setRecentActivities] = useState([]);

  const loadAnalyticsData = async (isManualRefresh = false) => {
    if (isManualRefresh) setRefreshing(true);
    else setLoading(true);

    try {
      console.log(`[SUPABASE REQUEST] AnalyticsPage + leads + ${new Date().toISOString()}`);
      const { data: leads, error } = await supabase.from('leads').select('*');
      if (error) throw error;

      const allLeads = leads || [];
      const total = allLeads.length;
      setTotalLeads(total);

      // Section 1: Key Metrics Calculations
      const newCount = allLeads.filter((l) => l.status === 'New').length;
      const qualCount = allLeads.filter((l) => l.status === 'Qualified').length;
      const visitCount = allLeads.filter(
        (l) => l.status === 'Site Visit' || l.site_visit_requested === true
      ).length;

      setNewLeadsCount(newCount);
      setQualifiedCount(qualCount);
      setSiteVisitsCount(visitCount);

      // Section 2: Pipeline Distribution Calculations
      const statusCounts = {};
      allLeads.forEach((l) => {
        if (l.status) statusCounts[l.status] = (statusCounts[l.status] || 0) + 1;
      });

      const pipeline = allStatuses.map((st) => {
        const count = statusCounts[st] || 0;
        const pct = total > 0 ? Math.round((count / total) * 100) : 0;
        return { status: st, count, percentage: pct };
      });
      setPipelineStats(pipeline);

      // Section 3: Source Distribution Calculations
      const srcCounts = {};
      allLeads.forEach((l) => {
        if (l.source) srcCounts[l.source] = (srcCounts[l.source] || 0) + 1;
      });

      const sources = sourceMap.map((src) => {
        const count = srcCounts[src.key] || 0;
        const pct = total > 0 ? Math.round((count / total) * 100) : 0;
        return { ...src, count, percentage: pct };
      });
      setSourceStats(sources);

      // Section 4: Recent Activity (Latest 5 records)
      setRecentActivities(allLeads.slice(0, 5));
    } catch (err) {
      console.error('Error fetching analytics:', err);
      setTotalLeads(0);
      setNewLeadsCount(0);
      setQualifiedCount(0);
      setSiteVisitsCount(0);
      setPipelineStats(allStatuses.map((st) => ({ status: st, count: 0, percentage: 0 })));
      setSourceStats(sourceMap.map((src) => ({ ...src, count: 0, percentage: 0 })));
      setRecentActivities([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadAnalyticsData();
  }, []);

  return (
    <div className="space-y-5 font-sans text-charcoal pb-12">
      {/* Header Panel */}
      <div className="flex items-center justify-between bg-white p-4 sm:p-5 rounded-xl border border-gray-200/80 shadow-2xs">
        <div>
          <h1 className="text-lg sm:text-xl font-bold tracking-tight text-charcoal">
            Performance & Lead Analytics
          </h1>
          <p className="text-xs text-gray-500 mt-0.5">
            Track lead activity, conversion progress, and sales performance.
          </p>
        </div>

        <button
          type="button"
          onClick={() => loadAnalyticsData(true)}
          disabled={refreshing}
          className="p-2 rounded-lg border border-gray-200 bg-ivory/60 hover:bg-ivory text-gray-600 hover:text-burgundy transition-colors cursor-pointer disabled:opacity-50"
          title="Refresh Analytics"
        >
          <RotateCw className={`w-4 h-4 ${refreshing ? 'animate-spin text-burgundy' : ''}`} />
        </button>
      </div>

      {loading ? (
        <div className="bg-white rounded-xl border border-gray-200/80 p-16 text-center shadow-2xs">
          <div className="w-8 h-8 border-3 border-burgundy/20 border-t-burgundy rounded-full animate-spin mx-auto mb-2" />
          <span className="text-xs font-semibold text-gray-500">Loading analytics from Supabase...</span>
        </div>
      ) : totalLeads === 0 ? (
        /* Global Empty State */
        <div className="bg-white rounded-xl border border-gray-200/80 p-12 text-center shadow-2xs">
          <div className="max-w-md mx-auto space-y-2">
            <div className="w-10 h-10 rounded-xl bg-ivory border border-burgundy/20 text-burgundy flex items-center justify-center mx-auto mb-1">
              <Activity className="w-5 h-5 text-burgundy" />
            </div>
            <h3 className="text-base font-bold text-charcoal">No analytics available yet</h3>
            <p className="text-xs text-gray-500 leading-relaxed">
              Analytics will appear as leads and sales activity are recorded in Supabase.
            </p>
          </div>
        </div>
      ) : (
        <>
          {/* SECTION 1 — KEY METRICS (4 Compact Metric Cards) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
            {/* Card 1: Total Leads */}
            <div className="bg-white p-4 rounded-xl border border-gray-200/80 shadow-2xs flex flex-col justify-between">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                  Total Leads
                </span>
                <div className="w-6.5 h-6.5 rounded-lg bg-burgundy/10 text-burgundy border border-burgundy/20 flex items-center justify-center">
                  <Users className="w-3.5 h-3.5" />
                </div>
              </div>
              <div className="text-xl sm:text-2xl font-bold text-charcoal tracking-tight mb-1">
                {totalLeads > 0 ? totalLeads : '—'}
              </div>
              <div className="pt-2 border-t border-gray-100 text-[11px] text-gray-400 font-medium">
                Live database record count
              </div>
            </div>

            {/* Card 2: New Leads */}
            <div className="bg-white p-4 rounded-xl border border-gray-200/80 shadow-2xs flex flex-col justify-between">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                  New Leads
                </span>
                <div className="w-6.5 h-6.5 rounded-lg bg-gold/15 text-gold border border-gold/25 flex items-center justify-center">
                  <UserCheck className="w-3.5 h-3.5" />
                </div>
              </div>
              <div className="text-xl sm:text-2xl font-bold text-charcoal tracking-tight mb-1">
                {newLeadsCount > 0 ? newLeadsCount : '—'}
              </div>
              <div className="pt-2 border-t border-gray-100 text-[11px] text-gray-400 font-medium">
                Status: New inquiries
              </div>
            </div>

            {/* Card 3: Qualified Leads */}
            <div className="bg-white p-4 rounded-xl border border-gray-200/80 shadow-2xs flex flex-col justify-between">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                  Qualified Leads
                </span>
                <div className="w-6.5 h-6.5 rounded-lg bg-burgundy/10 text-burgundy border border-burgundy/20 flex items-center justify-center">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                </div>
              </div>
              <div className="text-xl sm:text-2xl font-bold text-charcoal tracking-tight mb-1">
                {qualifiedCount > 0 ? qualifiedCount : '—'}
              </div>
              <div className="pt-2 border-t border-gray-100 text-[11px] text-gray-400 font-medium">
                Verified buyer interest
              </div>
            </div>

            {/* Card 4: Site Visits */}
            <div className="bg-white p-4 rounded-xl border border-gray-200/80 shadow-2xs flex flex-col justify-between">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                  Site Visits
                </span>
                <div className="w-6.5 h-6.5 rounded-lg bg-gold/15 text-gold border border-gold/25 flex items-center justify-center">
                  <MapPin className="w-3.5 h-3.5" />
                </div>
              </div>
              <div className="text-xl sm:text-2xl font-bold text-charcoal tracking-tight mb-1">
                {siteVisitsCount > 0 ? siteVisitsCount : '—'}
              </div>
              <div className="pt-2 border-t border-gray-100 text-[11px] text-gray-400 font-medium">
                Scheduled property tours
              </div>
            </div>
          </div>

          {/* SECTION 2 & SECTION 3 (Grid) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
            {/* SECTION 2: LEAD PIPELINE (7 cols Desktop) */}
            <div className="lg:col-span-7 bg-white p-5 rounded-xl border border-gray-200/80 shadow-2xs space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                <h2 className="text-sm font-bold text-charcoal">Lead Pipeline Breakdown</h2>
                <span className="text-xs text-gray-500 font-medium">Actual count by status</span>
              </div>

              <div className="space-y-3">
                {pipelineStats.map((item) => (
                  <div key={item.status} className="space-y-1">
                    <div className="flex items-center justify-between text-xs font-semibold text-charcoal">
                      <span>{item.status}</span>
                      <span className="text-gray-500 font-mono text-[11px]">
                        {item.count} ({item.percentage}%)
                      </span>
                    </div>

                    <div className="h-1.5 w-full bg-ivory/80 rounded-full overflow-hidden border border-gray-100">
                      <div
                        className="h-full bg-burgundy rounded-full transition-all duration-300"
                        style={{ width: `${item.percentage}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* SECTION 3: LEAD SOURCES (5 cols Desktop) */}
            <div className="lg:col-span-5 bg-white p-5 rounded-xl border border-gray-200/80 shadow-2xs space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                <h2 className="text-sm font-bold text-charcoal">Lead Source Distribution</h2>
                <span className="text-xs text-gray-500 font-medium">By channel</span>
              </div>

              <div className="space-y-3.5">
                {sourceStats.map((src) => (
                  <div key={src.key} className="space-y-1">
                    <div className="flex items-center justify-between text-xs font-semibold text-charcoal">
                      <span>{src.name}</span>
                      <span className="text-gray-500 font-mono text-[11px]">
                        {src.count} ({src.percentage}%)
                      </span>
                    </div>

                    <div className="h-1.5 w-full bg-ivory/80 rounded-full overflow-hidden border border-gray-100">
                      <div
                        className="h-full bg-gold rounded-full transition-all duration-300"
                        style={{ width: `${src.percentage}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* SECTION 4 — RECENT ACTIVITY */}
          <div className="bg-white p-5 rounded-xl border border-gray-200/80 shadow-2xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div>
                <h2 className="text-sm font-bold text-charcoal">Recent Lead Activity</h2>
                <p className="text-xs text-gray-500 mt-0.5">Latest real-time entries from public.leads</p>
              </div>
              <Link
                to="/leads"
                className="inline-flex items-center gap-1 text-xs font-bold text-burgundy hover:underline"
              >
                <span>View Leads</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {recentActivities.length > 0 ? (
              <div className="divide-y divide-gray-100 text-xs">
                {recentActivities.map((act) => (
                  <div key={act.id} className="py-2.5 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="w-7 h-7 rounded-full bg-burgundy/10 text-burgundy font-bold flex items-center justify-center text-xs shrink-0">
                        {act.name?.charAt(0) || 'L'}
                      </div>
                      <div>
                        <span className="font-bold text-charcoal block">{act.name || 'Unnamed Lead'}</span>
                        <span className="text-[11px] text-gray-500">
                          {act.city || 'City N/A'} • {act.phone || 'Phone N/A'}
                        </span>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="px-2 py-0.5 rounded-full bg-ivory text-burgundy font-bold text-[10px] border border-burgundy/15 block mb-0.5">
                        {act.status || 'New'}
                      </span>
                      <span className="text-[10px] text-gray-400">
                        {act.created_at
                          ? new Date(act.created_at).toLocaleString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })
                          : 'Not provided'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-6 text-center text-xs text-gray-400">
                No recent activity recorded yet.
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
