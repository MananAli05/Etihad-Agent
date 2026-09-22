import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, Eye, ArrowRight, X, Users } from 'lucide-react';
import { supabase } from '../lib/supabase';

const sourceMap = {
  website_form: 'Website Form',
  google_form: 'Google Form',
  chatbot: 'Chatbot',
  voice_agent: 'Voice Agent',
  whatsapp: 'WhatsApp',
  inbound_call: 'Inbound Call'
};

const formatSource = (src) => {
  if (!src) return 'Not provided';
  return sourceMap[src] || src;
};

const renderVal = (val) => {
  if (val === null || val === undefined || val === '') return 'Not provided';
  if (typeof val === 'boolean') return val ? 'Yes' : 'No';
  return val;
};

const getLeadName = (lead) => {
  if (!lead) return 'Unknown Lead';
  return lead.name || lead.customer_name || lead.full_name || lead.lead_name || 'Unnamed Lead';
};

const interestColors = {
  Hot: 'bg-rose-50 text-rose-700 border-rose-200',
  Warm: 'bg-amber-50 text-amber-800 border-amber-200',
  Cold: 'bg-gray-100 text-gray-600 border-gray-200',
  'Not Interested': 'bg-gray-100 text-gray-500 border-gray-200'
};

const statusColors = {
  New: 'bg-burgundy/10 text-burgundy border-burgundy/20',
  Calling: 'bg-blue-50 text-blue-700 border-blue-200',
  Contacted: 'bg-indigo-50 text-indigo-700 border-indigo-200',
  Qualified: 'bg-gold/15 text-amber-900 border-gold/30',
  'Follow-up': 'bg-amber-50 text-amber-800 border-amber-200',
  'Site Visit': 'bg-purple-50 text-purple-700 border-purple-200',
  Converted: 'bg-emerald-50 text-emerald-800 border-emerald-200',
  Cold: 'bg-gray-100 text-gray-600 border-gray-200',
  'Not Interested': 'bg-rose-100/70 text-rose-800 border-rose-200'
};

export default function RecentLeadsTable({ leads: propLeads, loading: propLoading, limit = 5 }) {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [selectedLead, setSelectedLead] = useState(null);

  useEffect(() => {
    if (propLeads !== undefined) {
      setLeads(propLeads || []);
      setLoading(!!propLoading);
      return;
    }

    let isMounted = true;
    async function loadLeads() {
      try {
        setLoading(true);
        console.log(`[SUPABASE REQUEST] RecentLeadsTable + leads + ${new Date().toISOString()}`);
        const { data, error } = await supabase
          .from('leads')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(limit);

        if (error) throw error;

        if (isMounted) {
          setLeads(data || []);
        }
      } catch (err) {
        console.error('RecentLeadsTable fetch error:', err);
        if (isMounted) {
          setLeads([]);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    loadLeads();
    return () => {
      isMounted = false;
    };
  }, [propLeads, propLoading, limit]);

  const displayLeads = leads.slice(0, limit).filter((lead) => {
    const term = searchTerm.toLowerCase().trim();
    const leadName = getLeadName(lead).toLowerCase();
    const phone = String(lead.phone || lead.phone_number || '').toLowerCase();
    const city = String(lead.city || lead.location || '').toLowerCase();

    const matchesSearch =
      !term ||
      leadName.includes(term) ||
      phone.includes(term) ||
      city.includes(term);

    const leadStatus = String(lead.status || '').trim();
    const matchesStatus =
      statusFilter === 'All' ||
      leadStatus.toLowerCase() === statusFilter.toLowerCase();

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="bg-white rounded-xl border border-gray-200/80 shadow-2xs mb-5 overflow-hidden font-sans">
      {/* Header & Controls */}
      <div className="p-4 sm:p-5 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-3">
            <h3 className="text-sm sm:text-base font-bold text-charcoal">Recent Leads</h3>
            <Link
              to="/leads"
              className="inline-flex items-center gap-1 text-xs font-bold text-burgundy hover:text-burgundy/80 transition-colors"
            >
              <span>View All Leads</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          <p className="text-xs text-gray-500 mt-0.5">
            Real-time inquiries from all lead channels
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          {/* Search Input */}
          <div className="relative w-full sm:w-44 lg:w-52">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search leads..."
              className="w-full pl-8 pr-3 py-1.5 bg-ivory/60 border border-gray-200/80 rounded-xl text-xs text-charcoal placeholder-gray-400 focus:outline-none focus:border-burgundy"
            />
          </div>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-2.5 py-1.5 bg-ivory/60 border border-gray-200/80 rounded-xl text-xs font-medium text-charcoal focus:outline-none focus:border-burgundy cursor-pointer"
          >
            <option value="All">All Statuses</option>
            <option value="New">New</option>
            <option value="Calling">Calling</option>
            <option value="Contacted">Contacted</option>
            <option value="Qualified">Qualified</option>
            <option value="Follow-up">Follow-up</option>
            <option value="Site Visit">Site Visit</option>
            <option value="Converted">Converted</option>
            <option value="Cold">Cold</option>
            <option value="Not Interested">Not Interested</option>
          </select>
        </div>
      </div>

      {/* Main Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[760px]">
          <thead>
            <tr className="bg-ivory/50 border-b border-gray-100 text-[11px] font-bold text-gray-500 uppercase tracking-wider">
              <th className="py-3 px-4">Lead</th>
              <th className="py-3 px-4">Source</th>
              <th className="py-3 px-4">Purpose / Interest</th>
              <th className="py-3 px-4">Plot Size</th>
              <th className="py-3 px-4">Phase</th>
              <th className="py-3 px-4">Status</th>
              <th className="py-3 px-4">Date</th>
              <th className="py-3 px-4 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 text-xs text-charcoal">
            {loading ? (
              <tr>
                <td colSpan="8" className="py-8 text-center text-xs text-gray-400 font-medium">
                  Loading recent leads...
                </td>
              </tr>
            ) : displayLeads.length > 0 ? (
              displayLeads.map((lead, idx) => {
                const leadName = getLeadName(lead);

                return (
                  <tr
                    key={lead.id || lead.created_at || idx}
                    className="hover:bg-ivory/40 transition-colors group cursor-pointer"
                    onClick={() => setSelectedLead(lead)}
                  >
                    {/* Lead (Name & City) */}
                    <td className="py-3 px-4 font-semibold">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-full bg-burgundy/10 text-burgundy font-bold flex items-center justify-center text-xs shrink-0">
                          {leadName.charAt(0) || 'L'}
                        </div>
                        <div>
                          <span className="font-bold text-charcoal block group-hover:text-burgundy transition-colors">
                            {leadName}
                          </span>
                          <span className="text-[10px] text-gray-400 font-normal">
                            {renderVal(lead.city || lead.location)}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Source */}
                    <td className="py-3 px-4">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-lg bg-gray-100 text-gray-700 text-[11px] font-medium border border-gray-200/60">
                        {formatSource(lead.source)}
                      </span>
                    </td>

                    {/* Purpose / Interest - purpose is what they asked for,
                        interest_level is how warm they are. Only the chatbot
                        and voice agent infer a level, so form leads have none
                        and the column would otherwise always read empty. */}
                    <td className="py-3 px-4 font-medium">
                      <div className="space-y-0.5">
                        <span className="block text-charcoal">
                          {renderVal(lead.purpose)}
                        </span>
                        {lead.interest_level && (
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                              interestColors[lead.interest_level] || 'bg-gray-100 text-gray-600'
                            }`}
                          >
                            {lead.interest_level}
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Plot Size */}
                    <td className="py-3 px-4 font-semibold text-burgundy">
                      {renderVal(lead.plot_size)}
                    </td>

                    {/* Phase */}
                    <td className="py-3 px-4 text-gray-600 font-medium">
                      {renderVal(lead.phase_preference)}
                    </td>

                    {/* Status */}
                    <td className="py-3 px-4">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                          statusColors[lead.status] || 'bg-gray-100 text-gray-700'
                        }`}
                      >
                        {renderVal(lead.status || 'New')}
                      </span>
                    </td>

                    {/* Date */}
                    <td className="py-3 px-4 text-gray-500 text-[11px] whitespace-nowrap">
                      {lead.created_at
                        ? new Date(lead.created_at).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric'
                          })
                        : 'Not provided'}
                    </td>

                    {/* Action */}
                    <td className="py-3 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                      <button
                        type="button"
                        onClick={() => setSelectedLead(lead)}
                        className="p-1 rounded-lg text-gray-400 hover:text-burgundy hover:bg-ivory transition-colors cursor-pointer"
                        title="View Details"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan="8" className="py-10 text-center">
                  <div className="max-w-sm mx-auto space-y-1.5">
                    <div className="w-8 h-8 rounded-full bg-ivory text-burgundy font-bold flex items-center justify-center mx-auto text-xs">
                      <Users className="w-4 h-4 text-burgundy" />
                    </div>
                    <h4 className="text-xs font-bold text-charcoal">No leads yet</h4>
                    <p className="text-[11px] text-gray-500 leading-relaxed">
                      New customer inquiries will appear here.
                    </p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Lead Detail Modal */}
      {selectedLead && (
        <div className="fixed inset-0 z-50 bg-charcoal/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-gray-200 relative animate-in fade-in zoom-in-95 duration-200 font-sans">
            <button
              onClick={() => setSelectedLead(null)}
              className="absolute top-4 right-4 p-1 rounded-lg text-gray-400 hover:text-charcoal hover:bg-gray-100 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3.5 mb-4 pb-3 border-b border-gray-100">
              <div className="w-10 h-10 rounded-xl bg-burgundy text-white font-bold flex items-center justify-center text-base shadow-sm">
                {getLeadName(selectedLead).charAt(0) || 'L'}
              </div>
              <div>
                <h4 className="text-base font-bold text-charcoal">{getLeadName(selectedLead)}</h4>
                <p className="text-xs text-gray-500">
                  {renderVal(selectedLead.city || selectedLead.location)} • {renderVal(selectedLead.phone || selectedLead.phone_number)}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2.5 text-xs mb-4">
              <div className="bg-ivory/60 p-2.5 rounded-xl border border-gray-100">
                <span className="text-gray-400 block text-[10px] uppercase font-bold mb-0.5">Phone</span>
                <span className="font-semibold text-charcoal">{renderVal(selectedLead.phone || selectedLead.phone_number)}</span>
              </div>
              <div className="bg-ivory/60 p-2.5 rounded-xl border border-gray-100">
                <span className="text-gray-400 block text-[10px] uppercase font-bold mb-0.5">Email</span>
                <span className="font-semibold text-charcoal truncate block">{renderVal(selectedLead.email)}</span>
              </div>
              <div className="bg-ivory/60 p-2.5 rounded-xl border border-gray-100">
                <span className="text-gray-400 block text-[10px] uppercase font-bold mb-0.5">Lead Source</span>
                <span className="font-semibold text-burgundy">{formatSource(selectedLead.source)}</span>
              </div>
              <div className="bg-ivory/60 p-2.5 rounded-xl border border-gray-100">
                <span className="text-gray-400 block text-[10px] uppercase font-bold mb-0.5">Plot Size & Phase</span>
                <span className="font-semibold text-charcoal">
                  {renderVal(selectedLead.plot_size)} ({renderVal(selectedLead.phase_preference)})
                </span>
              </div>
            </div>

            {selectedLead.notes && (
              <div className="mb-4">
                <span className="text-xs font-bold text-charcoal block mb-1">Notes</span>
                <p className="text-xs text-gray-600 bg-ivory/60 p-3 rounded-xl border border-gray-100 leading-relaxed">
                  {selectedLead.notes}
                </p>
              </div>
            )}

            <div className="flex items-center justify-between pt-3 border-t border-gray-100">
              <Link
                to="/leads"
                onClick={() => setSelectedLead(null)}
                className="text-xs font-bold text-burgundy hover:underline"
              >
                View Full Lead Profile →
              </Link>
              <button
                type="button"
                onClick={() => setSelectedLead(null)}
                className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-burgundy text-white hover:bg-burgundy/90 cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
