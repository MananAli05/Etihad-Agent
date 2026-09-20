import React from 'react';
import { Link } from 'react-router-dom';
import { Calendar, MapPin, UserCheck, ArrowRight } from 'lucide-react';
import { upcomingSiteVisits } from '../lib/mockData';

export default function SiteVisitsCard() {
  return (
    <div className="bg-white p-4 sm:p-5 rounded-2xl border border-gray-200/80 shadow-xs mb-0">
      <div className="flex items-center justify-between mb-4">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-sm sm:text-base font-bold text-charcoal">Upcoming Site Visits</h3>
            <Link
              to="/site-visits"
              className="inline-flex items-center gap-0.5 text-xs font-bold text-burgundy hover:text-burgundy/80 transition-colors"
            >
              <span>View All</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          <p className="text-[11px] text-gray-500 mt-0.5">Scheduled property tours</p>
        </div>
        <div className="w-7 h-7 rounded-lg bg-gold/15 text-amber-800 flex items-center justify-center">
          <MapPin className="w-3.5 h-3.5" />
        </div>
      </div>

      <div className="space-y-2.5">
        {upcomingSiteVisits.slice(0, 3).map((visit) => (
          <div
            key={visit.id}
            className="p-3 rounded-xl border border-gray-100 bg-ivory/30 hover:bg-ivory/70 transition-colors"
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-bold text-charcoal">{visit.leadName}</span>
              <span className="inline-flex items-center text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                {visit.status}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-[10px] text-gray-600 mb-1">
              <div className="flex items-center gap-1">
                <Calendar className="w-3 h-3 text-gold" />
                <span>{visit.date} ({visit.time})</span>
              </div>
              <div className="flex items-center gap-1">
                <MapPin className="w-3 h-3 text-burgundy" />
                <span className="truncate">{visit.plotInterest}</span>
              </div>
            </div>

            <div className="flex items-center gap-1 text-[10px] text-gray-500 pt-1.5 border-t border-gray-100/80">
              <UserCheck className="w-3 h-3 text-gray-400" />
              <span>Assigned: <strong className="text-charcoal">{visit.assignedAgent}</strong></span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
