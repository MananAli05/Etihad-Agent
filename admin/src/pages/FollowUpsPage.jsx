import React from 'react';
import FollowUpsCard from '../components/FollowUpsCard';
import { CalendarCheck, Plus, Check } from 'lucide-react';
import { followUpsToday } from '../lib/mockData';

export default function FollowUpsPage() {
  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-2xl font-bold text-charcoal">Follow-ups & Task Reminders</h2>
          <p className="text-xs text-gray-500 mt-1">Priority task queue for sales reps and lead officers</p>
        </div>
        <button
          type="button"
          className="inline-flex items-center gap-2 px-4 py-2 bg-burgundy hover:bg-burgundy/90 text-white rounded-xl text-xs font-bold shadow-xs"
        >
          <Plus className="w-4 h-4" />
          <span>New Follow-up Task</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-200/80 p-6 shadow-xs">
          <h3 className="text-base font-bold text-charcoal mb-4">Pending Sales Action Items</h3>
          <div className="space-y-3">
            {followUpsToday.map((task) => (
              <div key={task.id} className="p-4 rounded-xl border border-gray-100 bg-ivory/30 flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-bold text-xs text-charcoal">{task.leadName}</span>
                    <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                      {task.priority} Priority
                    </span>
                  </div>
                  <p className="text-xs text-gray-600">{task.reason}</p>
                </div>
                <button
                  type="button"
                  className="p-2 rounded-xl bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 transition-colors"
                  title="Mark Completed"
                >
                  <Check className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>

        <div>
          <FollowUpsCard />
        </div>
      </div>
    </div>
  );
}
