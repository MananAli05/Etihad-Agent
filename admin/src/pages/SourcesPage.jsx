import React, { useState, useEffect } from 'react';
import { Share2, Globe, FileText, MessageSquare, Mic, MessageCircle, PhoneCall, RotateCw } from 'lucide-react';
import { supabase } from '../lib/supabase';

const channelMap = [
  { key: 'website_form', name: 'Website Form', icon: Globe },
  { key: 'google_form', name: 'Google Form', icon: FileText },
  { key: 'chatbot', name: 'Chatbot', icon: MessageSquare },
  { key: 'voice_agent', name: 'Voice Agent', icon: Mic },
  { key: 'whatsapp', name: 'WhatsApp', icon: MessageCircle },
  { key: 'inbound_call', name: 'Inbound Calls', icon: PhoneCall }
];

export default function SourcesPage() {
  const [sources, setSources] = useState([]);
  const [totalLeads, setTotalLeads] = useState(0);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchSourceData = async (isManualRefresh = false) => {
    if (isManualRefresh) setRefreshing(true);
    else setLoading(true);

    try {
      console.log(`[SUPABASE REQUEST] SourcesPage + leads + ${new Date().toISOString()}`);
      const { data: leads, error } = await supabase.from('leads').select('source');
      if (error) throw error;
      const allLeads = leads || [];
      const total = allLeads.length;
      setTotalLeads(total);

      const counts = {};
      allLeads.forEach((l) => {
        if (l.source) {
          counts[l.source] = (counts[l.source] || 0) + 1;
        }
      });

      const calculated = channelMap.map((c) => {
        const count = counts[c.key] || 0;
        const percentage = total > 0 ? Math.round((count / total) * 100) : 0;
        return {
          ...c,
          count,
          percentage
        };
      });

      setSources(calculated);
    } catch (err) {
      console.error('Error fetching lead sources:', err);
      setSources(channelMap.map((c) => ({ ...c, count: 0, percentage: 0 })));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchSourceData();
  }, []);

  return (
    <div className="space-y-5 font-sans text-charcoal max-w-4xl mx-auto pb-12">
      {/* Page Header */}
      <div className="flex items-center justify-between bg-white p-4 sm:p-5 rounded-xl border border-gray-200/80 shadow-2xs">
        <div>
          <h1 className="text-lg sm:text-xl font-bold tracking-tight text-charcoal">
            Lead Sources
          </h1>
          <p className="text-xs text-gray-500 mt-0.5">
            See where your leads are coming from.
          </p>
        </div>

        <button
          type="button"
          onClick={() => fetchSourceData(true)}
          disabled={refreshing}
          className="p-2 rounded-lg border border-gray-200 bg-ivory/60 hover:bg-ivory text-gray-600 hover:text-burgundy transition-colors cursor-pointer disabled:opacity-50"
          title="Refresh Sources"
        >
          <RotateCw className={`w-4 h-4 ${refreshing ? 'animate-spin text-burgundy' : ''}`} />
        </button>
      </div>

      {/* Main Single Card: Lead Sources List */}
      <div className="bg-white rounded-xl border border-gray-200/80 shadow-2xs overflow-hidden">
        <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-ivory/30">
          <div className="flex items-center gap-2">
            <Share2 className="w-4 h-4 text-burgundy" />
            <h2 className="text-sm font-bold text-charcoal">Lead Sources Breakdown</h2>
          </div>
          <span className="text-xs font-semibold text-gray-500">
            Total Leads: <strong className="text-burgundy font-bold">{totalLeads}</strong>
          </span>
        </div>

        {loading ? (
          <div className="p-12 text-center">
            <div className="w-8 h-8 border-3 border-burgundy/20 border-t-burgundy rounded-full animate-spin mx-auto mb-2" />
            <span className="text-xs font-semibold text-gray-500">Loading sources...</span>
          </div>
        ) : totalLeads === 0 ? (
          /* Empty State */
          <div className="p-12 text-center bg-ivory/20">
            <div className="w-10 h-10 rounded-xl bg-ivory border border-burgundy/20 text-burgundy flex items-center justify-center mx-auto mb-2">
              <Share2 className="w-5 h-5 text-burgundy" />
            </div>
            <h3 className="text-sm font-bold text-charcoal">No lead sources yet</h3>
            <p className="text-xs text-gray-500 max-w-sm mx-auto mt-1 leading-relaxed">
              Lead source statistics will appear here when new leads arrive.
            </p>
          </div>
        ) : (
          /* Source Table / List */
          <div className="divide-y divide-gray-100">
            {/* Table Header (Desktop) */}
            <div className="hidden sm:grid sm:grid-cols-12 gap-4 px-5 py-2.5 bg-ivory/50 text-[11px] font-bold text-gray-500 uppercase tracking-wider border-b border-gray-100">
              <div className="col-span-5">Source</div>
              <div className="col-span-3 text-right">Leads</div>
              <div className="col-span-4 text-right">Share</div>
            </div>

            {sources.map((source) => {
              const Icon = source.icon;
              return (
                <div
                  key={source.key}
                  className="p-4 sm:px-5 sm:py-3.5 space-y-2 hover:bg-ivory/30 transition-colors"
                >
                  <div className="grid grid-cols-1 sm:grid-cols-12 gap-2 items-center">
                    {/* Source Name & Icon */}
                    <div className="sm:col-span-5 flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-lg bg-ivory border border-gray-200/80 flex items-center justify-center text-burgundy shrink-0">
                        <Icon className="w-3.5 h-3.5" />
                      </div>
                      <span className="font-bold text-xs text-charcoal">{source.name}</span>
                    </div>

                    {/* Count */}
                    <div className="sm:col-span-3 sm:text-right text-xs font-semibold text-gray-600">
                      <span>{source.count} {source.count === 1 ? 'lead' : 'leads'}</span>
                    </div>

                    {/* Percentage */}
                    <div className="sm:col-span-4 sm:text-right text-xs font-bold text-burgundy">
                      <span>{source.percentage}%</span>
                    </div>
                  </div>

                  {/* Horizontal Progress Bar */}
                  <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-burgundy rounded-full transition-all duration-300"
                      style={{ width: `${source.percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
