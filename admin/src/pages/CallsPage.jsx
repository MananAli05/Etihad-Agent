import React from 'react';
import { PhoneCall, Play, Mic, Clock, Filter, CheckCircle2 } from 'lucide-react';
import { recentCallActivity } from '../lib/mockData';

export default function CallsPage() {
  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-2xl font-bold text-charcoal">Call Logs & Voice Assistant History</h2>
          <p className="text-xs text-gray-[500] mt-1">
            Audio logs, call durations, and voice agent conversation transcripts
          </p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200/80 shadow-xs p-6 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-ivory p-4 rounded-xl border border-gray-100">
            <span className="text-xs text-gray-500 font-medium">Total Voice Conversations</span>
            <div className="text-2xl font-bold text-charcoal mt-1">482</div>
          </div>
          <div className="bg-ivory p-4 rounded-xl border border-gray-100">
            <span className="text-xs text-gray-500 font-medium">Avg. Call Duration</span>
            <div className="text-2xl font-bold text-burgundy mt-1">3m 45s</div>
          </div>
          <div className="bg-ivory p-4 rounded-xl border border-gray-100">
            <span className="text-xs text-gray-500 font-medium">Voice Agent Conversion</span>
            <div className="text-2xl font-bold text-gold mt-1">16.4%</div>
          </div>
          <div className="bg-ivory p-4 rounded-xl border border-gray-100">
            <span className="text-xs text-gray-500 font-medium">Successful Site Visits</span>
            <div className="text-2xl font-bold text-emerald-700 mt-1">54</div>
          </div>
        </div>

        <div className="divide-y divide-gray-100">
          {recentCallActivity.map((call) => (
            <div key={call.id} className="py-4 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-burgundy/10 text-burgundy font-bold flex items-center justify-center text-sm">
                  <Mic className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-charcoal">{call.leadName}</h4>
                  <p className="text-xs text-gray-500">
                    {call.source} • <span className="text-burgundy font-medium">{call.interest}</span>
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-6">
                <div className="text-right">
                  <span className="text-xs font-bold text-charcoal block">{call.duration}</span>
                  <span className="text-[10px] text-gray-400">{call.dateTime}</span>
                </div>

                <button
                  type="button"
                  className="px-3.5 py-1.5 rounded-xl bg-ivory border border-gray-200 text-xs font-bold text-charcoal hover:bg-gold hover:text-white transition-all inline-flex items-center gap-1.5 shadow-2xs"
                >
                  <Play className="w-3.5 h-3.5" />
                  <span>Listen Audio</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
