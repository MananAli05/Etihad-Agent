import { useCallback, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

/**
 * Load leads from the CRM.
 *
 * The Calls, Follow-ups and Site Visits pages are three views of the same
 * leads table rather than three separate stores: a call outcome, a follow-up
 * time and a site visit request are all columns on the lead the call was
 * about. Keeping the fetch in one place means they cannot drift apart.
 */
export function useLeads(filter) {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');

  const load = useCallback(
    async (isManualRefresh = false) => {
      if (isManualRefresh) setRefreshing(true);
      else setLoading(true);
      setError('');

      try {
        let query = supabase.from('leads').select('*');
        if (filter) query = filter(query);

        const { data, error: queryError } = await query;
        if (queryError) throw queryError;

        setLeads(data || []);
      } catch (err) {
        console.error('Error loading leads:', err);
        setError(err.message || 'Could not load leads.');
        setLeads([]);
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    // filter is a new function each render, so depending on it would refetch
    // forever. Pages pass a stable predicate; the query is built once.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  useEffect(() => {
    load();
  }, [load]);

  return { leads, loading, refreshing, error, reload: load, setLeads };
}

export const fmtDateTime = (iso) => {
  if (!iso) return null;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return String(iso);
  return d.toLocaleString([], {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

export const STATUS_TONE = {
  New: 'bg-gray-100 text-gray-700 border-gray-200',
  Calling: 'bg-amber-50 text-amber-700 border-amber-200',
  Contacted: 'bg-blue-50 text-blue-700 border-blue-200',
  Qualified: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  'Follow-up': 'bg-purple-50 text-purple-700 border-purple-200',
  'Site Visit': 'bg-teal-50 text-teal-700 border-teal-200',
  Converted: 'bg-emerald-100 text-emerald-800 border-emerald-300',
  Cold: 'bg-slate-100 text-slate-600 border-slate-200',
  'Not Interested': 'bg-rose-50 text-rose-700 border-rose-200'
};

export const SOURCE_LABELS = {
  website_form: 'Website Form',
  google_form: 'Google Form',
  chatbot: 'Chatbot',
  voice_agent: 'Voice Agent',
  whatsapp: 'WhatsApp',
  inbound_call: 'Inbound Call'
};
