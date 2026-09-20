import React from 'react';
import { Activity } from 'lucide-react';
import { activityTimeline } from '../lib/mockData';

export default function ActivityTimelineCard() {
  return (
    <div className="bg-white p-4 sm:p-5 rounded-2xl border border-gray-200/80 shadow-xs mb-0">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm sm:text-base font-bold text-charcoal">Activity Timeline</h3>
          <p className="text-[11px] text-gray-500 mt-0.5">Live CRM lead events</p>
        </div>
        <div className="w-7 h-7 rounded-lg bg-ivory text-burgundy flex items-center justify-center">
          <Activity className="w-3.5 h-3.5" />
        </div>
      </div>

      <div className="relative pl-5 space-y-4 before:absolute before:left-2 before:top-1.5 before:bottom-1.5 before:w-0.5 before:bg-gray-100">
        {activityTimeline.slice(0, 4).map((act) => (
          <div key={act.id} className="relative group">
            <div className="absolute -left-[1.4rem] top-0.5 w-4 h-4 rounded-full bg-white border-2 border-burgundy flex items-center justify-center z-10">
              <div className="w-1 h-1 rounded-full bg-burgundy" />
            </div>

            <div>
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-charcoal group-hover:text-burgundy transition-colors">
                  {act.title}
                </h4>
                <span className="text-[10px] text-gray-400 font-medium">{act.time}</span>
              </div>
              <p className="text-[11px] text-gray-600 mt-0.5 leading-snug line-clamp-1">{act.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
