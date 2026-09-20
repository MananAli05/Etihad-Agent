import React from 'react';
import { Link } from 'react-router-dom';
import { PhoneCall, Clock, ArrowRight } from 'lucide-react';
import { recentCallActivity } from '../lib/mockData';

export default function CallActivityCard() {
  return (
    <div className="bg-white p-4 sm:p-5 rounded-2xl border border-gray-200/80 shadow-xs mb-0">
      <div className="flex items-center justify-between mb-4">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-sm sm:text-base font-bold text-charcoal">Recent Call Activity</h3>
            <Link
              to="/calls"
              className="inline-flex items-center gap-0.5 text-xs font-bold text-burgundy hover:text-burgundy/80 transition-colors"
            >
              <span>View All</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          <p className="text-[11px] text-gray-500 mt-0.5">Voice assistant & call logs</p>
        </div>
        <div className="w-7 h-7 rounded-lg bg-burgundy/10 text-burgundy flex items-center justify-center">
          <PhoneCall className="w-3.5 h-3.5" />
        </div>
      </div>

      <div className="space-y-2.5">
        {recentCallActivity.slice(0, 3).map((call) => (
          <div
            key={call.id}
            className="p-3 rounded-xl bg-ivory/40 border border-gray-100 flex items-center justify-between hover:bg-ivory/80 transition-colors"
          >
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-burgundy text-white font-bold flex items-center justify-center text-xs">
                {call.leadName.charAt(0)}
              </div>
              <div>
                <h4 className="text-xs font-bold text-charcoal">{call.leadName}</h4>
                <div className="flex items-center gap-1.5 text-[10px] text-gray-500 mt-0.5">
                  <span className="font-semibold text-burgundy">{call.source}</span>
                  <span>•</span>
                  <span>{call.interest}</span>
                </div>
              </div>
            </div>

            <div className="text-right">
              <div className="flex items-center justify-end gap-1 text-xs font-bold text-charcoal">
                <Clock className="w-3 h-3 text-gold" />
                <span>{call.duration}</span>
              </div>
              <span className="text-[10px] text-gray-400 block mt-0.5">{call.dateTime}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
