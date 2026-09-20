import React from 'react';
import { Link } from 'react-router-dom';
import { CalendarCheck, Clock, ArrowRight } from 'lucide-react';
import { followUpsToday } from '../lib/mockData';

const priorityBadges = {
  High: 'bg-rose-50 text-rose-700 border-rose-200',
  Medium: 'bg-amber-50 text-amber-700 border-amber-200',
  Low: 'bg-gray-100 text-gray-700 border-gray-200'
};

export default function FollowUpsCard() {
  return (
    <div className="bg-white p-4 sm:p-5 rounded-2xl border border-gray-200/80 shadow-xs mb-0">
      <div className="flex items-center justify-between mb-4">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-sm sm:text-base font-bold text-charcoal">Follow-ups Today</h3>
            <Link
              to="/follow-ups"
              className="inline-flex items-center gap-0.5 text-xs font-bold text-burgundy hover:text-burgundy/80 transition-colors"
            >
              <span>View All</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          <p className="text-[11px] text-gray-500 mt-0.5">Scheduled calls and action tasks</p>
        </div>
        <div className="w-7 h-7 rounded-lg bg-burgundy/10 text-burgundy flex items-center justify-center">
          <CalendarCheck className="w-3.5 h-3.5" />
        </div>
      </div>

      <div className="space-y-2.5">
        {followUpsToday.slice(0, 3).map((item) => (
          <div
            key={item.id}
            className="p-3 rounded-xl border border-gray-100 bg-ivory/30 flex items-start justify-between gap-2 hover:bg-ivory/70 transition-colors"
          >
            <div className="space-y-0.5">
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-bold text-charcoal">{item.leadName}</span>
                <span
                  className={`inline-flex items-center px-1.5 py-0.5 rounded-full text-[9px] font-bold border ${
                    priorityBadges[item.priority]
                  }`}
                >
                  {item.priority} Priority
                </span>
              </div>
              <p className="text-[11px] text-gray-600 leading-snug line-clamp-1">{item.reason}</p>
            </div>

            <div className="flex items-center gap-1 text-[11px] font-bold text-burgundy whitespace-nowrap bg-white px-2 py-0.5 rounded-md border border-gray-200/60 shadow-2xs">
              <Clock className="w-3 h-3 text-gold" />
              <span>{item.time}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
