import React, { useState, useEffect } from 'react';
import { Users, Flame, PhoneCall, MapPin, CalendarCheck } from 'lucide-react';
import { supabase } from '../lib/supabase';

export default function KPICards({ leads: propLeads, loading: propLoading }) {
  const [stats, setStats] = useState({
    total: 0,
    hot: 0,
    calls: 0,
    visits: 0,
    followups: 0,
    loaded: false
  });

  useEffect(() => {
    if (propLeads !== undefined) {
      const leads = propLeads || [];
      const total = leads.length;
      const hot = leads.filter((l) => l.interest_level === 'Hot').length;
      const calls = leads.filter((l) => l.status === 'Calling' || l.source === 'inbound_call').length;
      const visits = leads.filter((l) => l.status === 'Site Visit').length;
      const followups = leads.filter((l) => l.status === 'Follow-up').length;

      setStats({ total, hot, calls, visits, followups, loaded: !propLoading });
      return;
    }

    let isMounted = true;
    async function loadKPIs() {
      try {
        console.log(`[SUPABASE REQUEST] KPICards + leads + ${new Date().toISOString()}`);
        const { data: leads, error } = await supabase.from('leads').select('*');
        if (error) throw error;

        if (isMounted && leads) {
          const total = leads.length;
          const hot = leads.filter((l) => l.interest_level === 'Hot').length;
          const calls = leads.filter((l) => l.status === 'Calling' || l.source === 'inbound_call').length;
          const visits = leads.filter((l) => l.status === 'Site Visit').length;
          const followups = leads.filter((l) => l.status === 'Follow-up').length;

          setStats({ total, hot, calls, visits, followups, loaded: true });
        }
      } catch (err) {
        console.error('KPICards fetch error:', err);
        if (isMounted) {
          setStats((prev) => ({ ...prev, loaded: true }));
        }
      }
    }
    loadKPIs();
    return () => {
      isMounted = false;
    };
  }, [propLeads, propLoading]);

  const cards = [
    {
      title: 'TOTAL LEADS',
      value: stats.loaded ? stats.total : '—',
      subtext: stats.total > 0 ? `${stats.total} registered` : 'No data yet',
      icon: Users
    },
    {
      title: 'HOT LEADS',
      value: stats.loaded ? stats.hot : '—',
      subtext: stats.hot > 0 ? `${stats.hot} high priority` : 'No data yet',
      icon: Flame
    },
    {
      title: 'CALLS TODAY',
      value: stats.loaded ? stats.calls : '—',
      subtext: stats.calls > 0 ? `${stats.calls} scheduled` : 'No data yet',
      icon: PhoneCall
    },
    {
      title: 'SITE VISITS',
      value: stats.loaded ? stats.visits : '—',
      subtext: stats.visits > 0 ? `${stats.visits} booked` : 'No data yet',
      icon: MapPin
    },
    {
      title: 'FOLLOW-UPS',
      value: stats.loaded ? stats.followups : '—',
      subtext: stats.followups > 0 ? `${stats.followups} pending` : 'No data yet',
      icon: CalendarCheck
    }
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4 font-sans">
      {cards.map((card, idx) => {
        const IconComponent = card.icon;
        return (
          <div
            key={idx}
            className="bg-white p-3.5 sm:p-4 rounded-xl border border-gray-200/80 shadow-2xs flex flex-col justify-between"
          >
            <div className="flex items-center justify-between gap-2 mb-2">
              <span className="text-[10px] sm:text-[11px] font-bold text-gray-500 tracking-wider uppercase">
                {card.title}
              </span>
              <div className="w-6 h-6 rounded-md bg-ivory text-burgundy flex items-center justify-center shrink-0">
                <IconComponent className="w-3.5 h-3.5 text-burgundy" />
              </div>
            </div>

            <div>
              <div className="text-xl sm:text-2xl font-extrabold text-charcoal tracking-tight">
                {card.value}
              </div>
              <p className="text-[10px] sm:text-[11px] text-gray-400 font-medium mt-1">
                {card.subtext}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
