import React, { useEffect, useState } from 'react';
import { Globe, MessageSquare, Mic, MessageCircle, FileText, PhoneCall, Share2 } from 'lucide-react';
import { supabase } from '../lib/supabase';

const channelMap = [
  { key: 'website_form', name: 'Website Form', icon: Globe, color: '#651F2B' },
  { key: 'google_form', name: 'Google Form', icon: FileText, color: '#718096' },
  { key: 'chatbot', name: 'Chatbot', icon: MessageSquare, color: '#C8A45D' },
  { key: 'voice_agent', name: 'Voice Agent', icon: Mic, color: '#252323' },
  { key: 'whatsapp', name: 'WhatsApp', icon: MessageCircle, color: '#4A5568' },
  { key: 'inbound_call', name: 'Inbound Calls', icon: PhoneCall, color: '#A0AEC0' }
];

export default function LeadSourcesCard() {
  const [sources, setSources] = useState(
    channelMap.map((c) => ({ ...c, count: 0, percentage: 0 }))
  );

  useEffect(() => {
    async function loadSources() {
      try {
        const { data: leads, error } = await supabase.from('leads').select('source');
        if (error || !leads) return;

        const total = leads.length;
        const counts = {};
        leads.forEach((l) => {
          if (l.source) counts[l.source] = (counts[l.source] || 0) + 1;
        });

        const updated = channelMap.map((c) => {
          const count = counts[c.key] || 0;
          const percentage = total > 0 ? Math.round((count / total) * 100) : 0;
          return { ...c, count, percentage };
        });

        setSources(updated);
      } catch (err) {
        console.error('Error loading sources from Supabase:', err);
      }
    }
    loadSources();
  }, []);

  return (
    <div className="bg-white p-5 rounded-xl border border-gray-200/80 shadow-2xs mb-5 font-sans">
      <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-100">
        <div>
          <h3 className="text-base font-bold text-charcoal">Lead Acquisition Channels</h3>
          <p className="text-xs text-gray-500 mt-0.5">Real-time source distribution from Supabase</p>
        </div>
        <div className="w-7 h-7 rounded-lg bg-ivory text-gold flex items-center justify-center border border-gray-200/60">
          <Share2 className="w-3.5 h-3.5" />
        </div>
      </div>

      {/* Grid for Channels */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
        {sources.map((source) => {
          const Icon = source.icon;
          return (
            <div key={source.name} className="p-3 rounded-xl bg-ivory/40 border border-gray-100 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-lg bg-white border border-gray-200/60 flex items-center justify-center text-burgundy shadow-2xs">
                    <Icon className="w-3 h-3" />
                  </div>
                  <span className="text-charcoal font-bold text-xs">{source.name}</span>
                </div>
                <span className="text-gray-500 text-xs font-semibold">
                  {source.count} {source.count === 1 ? 'lead' : 'leads'}
                </span>
              </div>

              {/* Horizontal Progress Bar */}
              <div className="space-y-1">
                <div className="h-1.5 w-full bg-gray-200/60 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-300"
                    style={{
                      width: `${source.percentage}%`,
                      backgroundColor: source.color
                    }}
                  />
                </div>
                <div className="flex items-center justify-between text-[10px] text-gray-400 font-medium">
                  <span>Volume</span>
                  <span>{source.percentage}%</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
