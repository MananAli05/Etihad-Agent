import React from 'react';
import SiteVisitsCard from '../components/SiteVisitsCard';
import { Calendar, Plus, MapPin, CheckCircle } from 'lucide-react';
import { upcomingSiteVisits } from '../lib/mockData';

export default function SiteVisitsPage() {
  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-2xl font-bold text-charcoal">Site Visit Management</h2>
          <p className="text-xs text-gray-500 mt-1">Schedule and track client property visits in Rahim Yar Khan</p>
        </div>
        <button
          type="button"
          className="inline-flex items-center gap-2 px-4 py-2 bg-burgundy hover:bg-burgundy/90 text-white rounded-xl text-xs font-bold shadow-xs"
        >
          <Plus className="w-4 h-4" />
          <span>Book New Visit</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-200/80 p-6 shadow-xs">
          <h3 className="text-base font-bold text-charcoal mb-4">Confirmed Site Visits Schedule</h3>
          <div className="divide-y divide-gray-100">
            {upcomingSiteVisits.map((visit) => (
              <div key={visit.id} className="py-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gold/15 text-amber-800 font-bold flex items-center justify-center text-xs">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-charcoal">{visit.leadName}</h4>
                    <span className="text-xs text-gray-500">{visit.plotInterest} • Agent: {visit.assignedAgent}</span>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-xs font-bold text-burgundy block">{visit.date}</span>
                  <span className="text-[11px] text-gray-500">{visit.time}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div>
          <SiteVisitsCard />
        </div>
      </div>
    </div>
  );
}
