import React, { useState, useEffect } from 'react';
import WelcomeBanner from '../components/WelcomeBanner';
import KPICards from '../components/KPICards';
import RecentLeadsTable from '../components/RecentLeadsTable';
import { supabase } from '../lib/supabase';

export default function DashboardPage() {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;
    async function fetchDashboardLeads() {
      try {
        setLoading(true);
        console.log(`[SUPABASE REQUEST] DashboardPage + leads + ${new Date().toISOString()}`);
        const { data, error } = await supabase
          .from('leads')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) throw error;

        if (isMounted) {
          setLeads(data || []);
          setError(null);
        }
      } catch (err) {
        console.error('DashboardPage fetch error:', err);
        if (isMounted) {
          setError(err);
          setLeads([]);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    fetchDashboardLeads();
    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <div className="space-y-5 font-sans">
      {/* 1. Compact Lead Pipeline Hero */}
      <WelcomeBanner />

      {/* 2. Real-time KPI Cards */}
      <KPICards leads={leads} loading={loading} error={error} />

      {/* 3. Primary Focus: Recent Leads Table */}
      <RecentLeadsTable leads={leads} loading={loading} error={error} limit={5} />
    </div>
  );
}
