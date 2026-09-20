import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  Search,
  Plus,
  RotateCw,
  Eye,
  Phone,
  MessageCircle,
  PhoneCall,
  MessageSquare,
  MapPin,
  CalendarCheck,
  X,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  User,
  Clock,
  Shield
} from 'lucide-react';
import { supabase } from '../lib/supabase';

// Source mapping helper
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

// Helper for rendering empty / null fields
const renderVal = (val) => {
  if (val === null || val === undefined || val === '') return 'Not provided';
  if (typeof val === 'boolean') return val ? 'Yes' : 'No';
  return val;
};

// Interest badge colors
const interestColors = {
  Hot: 'bg-rose-50 text-rose-700 border-rose-200',
  Warm: 'bg-amber-50 text-amber-800 border-amber-200',
  Cold: 'bg-gray-100 text-gray-600 border-gray-200',
  'Not Interested': 'bg-gray-100 text-gray-500 border-gray-200'
};

// Status badge colors
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

export default function LeadsPage() {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');

  // Search and Filter States
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [sourceFilter, setSourceFilter] = useState('All');
  const [interestFilter, setInterestFilter] = useState('All');
  const [phaseFilter, setPhaseFilter] = useState('All');

  // Modal States
  const [selectedLead, setSelectedLead] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [isInserting, setIsInserting] = useState(false);
  const [addError, setAddError] = useState('');

  // Form State
  const [newLead, setNewLead] = useState({
    name: '',
    phone: '',
    email: '',
    city: '',
    source: 'google_form',
    status: 'New',
    interest_level: 'Warm',
    purpose: '',
    plot_size: '',
    budget_range: '',
    phase_preference: '',
    notes: ''
  });

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 15;

  // Fetch Leads from Supabase
  const fetchLeads = useCallback(async (isManualRefresh = false) => {
    if (isManualRefresh) setRefreshing(true);
    else setLoading(true);
    setError('');

    try {
      console.log(`[SUPABASE REQUEST] LeadsPage + leads + ${new Date().toISOString()}`);
      const { data, error } = await supabase
        .from('leads')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setLeads(data || []);
    } catch (err) {
      console.error('Error fetching leads:', err);
      setError('Unable to load leads. Please try again.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchLeads();
  }, [fetchLeads]);

  // Insert New Lead into Supabase
  const handleCreateLead = async (e) => {
    e.preventDefault();
    setAddError('');
    setIsInserting(true);

    try {
      const { error } = await supabase.from('leads').insert([
        {
          name: newLead.name.trim(),
          phone: newLead.phone.trim(),
          email: newLead.email.trim() || null,
          city: newLead.city.trim() || null,
          source: newLead.source,
          status: newLead.status,
          interest_level: newLead.interest_level || null,
          purpose: newLead.purpose.trim() || null,
          plot_size: newLead.plot_size.trim() || null,
          budget_range: newLead.budget_range.trim() || null,
          phase_preference: newLead.phase_preference.trim() || null,
          notes: newLead.notes.trim() || null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      ]);

      if (error) throw error;

      setShowAddModal(false);
      setNewLead({
        name: '',
        phone: '',
        email: '',
        city: '',
        source: 'google_form',
        status: 'New',
        interest_level: 'Warm',
        purpose: '',
        plot_size: '',
        budget_range: '',
        phase_preference: '',
        notes: ''
      });
      fetchLeads(true);
    } catch (err) {
      console.error('Error inserting lead:', err);
      setAddError('Failed to create lead. Please check the fields and try again.');
    } finally {
      setIsInserting(false);
    }
  };

  // Filter Computation
  const filteredLeads = leads.filter((lead) => {
    const term = searchTerm.toLowerCase().trim();
    const matchesSearch =
      !term ||
      (lead.name && lead.name.toLowerCase().includes(term)) ||
      (lead.phone && lead.phone.includes(term)) ||
      (lead.email && lead.email.toLowerCase().includes(term)) ||
      (lead.city && lead.city.toLowerCase().includes(term));

    const matchesStatus = statusFilter === 'All' || lead.status === statusFilter;
    const matchesSource =
      sourceFilter === 'All' ||
      lead.source === sourceFilter ||
      formatSource(lead.source) === sourceFilter;
    const matchesInterest =
      interestFilter === 'All' || lead.interest_level === interestFilter;
    const matchesPhase =
      phaseFilter === 'All' || lead.phase_preference === phaseFilter;

    return matchesSearch && matchesStatus && matchesSource && matchesInterest && matchesPhase;
  });

  // Pagination Computation
  const totalPages = Math.ceil(filteredLeads.length / pageSize) || 1;
  const paginatedLeads = filteredLeads.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  return (
    <div className="space-y-6 font-sans text-charcoal pb-12">
      {/* Header Panel */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 sm:p-6 rounded-2xl border border-gray-200/80 shadow-xs">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-charcoal">
              Leads
            </h1>
            <span className="px-2.5 py-0.5 rounded-full bg-burgundy/10 text-burgundy text-xs font-bold">
              {leads.length} Total
            </span>
          </div>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">
            Manage and track all customer inquiries.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => fetchLeads(true)}
            disabled={refreshing}
            className="p-2.5 rounded-xl border border-gray-200 bg-ivory/60 hover:bg-ivory text-gray-600 hover:text-burgundy transition-all cursor-pointer disabled:opacity-50"
            title="Refresh Leads"
          >
            <RotateCw className={`w-4 h-4 ${refreshing ? 'animate-spin text-burgundy' : ''}`} />
          </button>

          <button
            type="button"
            onClick={() => setShowAddModal(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-burgundy hover:bg-burgundy/90 text-white text-xs font-bold shadow-sm transition-all duration-200 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>+ Add Lead</span>
          </button>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
            <span>{error}</span>
          </div>
          <button
            onClick={() => fetchLeads(true)}
            className="underline hover:text-rose-900 cursor-pointer font-bold"
          >
            Retry
          </button>
        </div>
      )}

      {/* Controls Bar: Search & Multi-Filters */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-gray-200/80 shadow-xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {/* Search Input */}
          <div className="relative lg:col-span-2">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Search by name, phone or city..."
              className="w-full pl-10 pr-4 py-2 bg-ivory/60 border border-gray-200 rounded-xl text-xs text-charcoal placeholder-gray-400 focus:outline-none focus:border-burgundy focus:ring-1 focus:ring-burgundy transition-all"
            />
          </div>

          {/* Status Filter */}
          <div>
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full px-3 py-2 bg-ivory/60 border border-gray-200 rounded-xl text-xs font-medium text-charcoal focus:outline-none focus:border-burgundy cursor-pointer"
            >
              <option value="All">Status: All</option>
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

          {/* Source Filter */}
          <div>
            <select
              value={sourceFilter}
              onChange={(e) => {
                setSourceFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full px-3 py-2 bg-ivory/60 border border-gray-200 rounded-xl text-xs font-medium text-charcoal focus:outline-none focus:border-burgundy cursor-pointer"
            >
              <option value="All">Source: All</option>
              <option value="google_form">Google Form</option>
              <option value="website_form">Website Form</option>
              <option value="chatbot">Chatbot</option>
              <option value="voice_agent">Voice Agent</option>
              <option value="whatsapp">WhatsApp</option>
              <option value="inbound_call">Inbound Call</option>
            </select>
          </div>

          {/* Interest Level Filter */}
          <div>
            <select
              value={interestFilter}
              onChange={(e) => {
                setInterestFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full px-3 py-2 bg-ivory/60 border border-gray-200 rounded-xl text-xs font-medium text-charcoal focus:outline-none focus:border-burgundy cursor-pointer"
            >
              <option value="All">Interest: All</option>
              <option value="Hot">Hot</option>
              <option value="Warm">Warm</option>
              <option value="Cold">Cold</option>
              <option value="Not Interested">Not Interested</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Leads Table */}
      <div className="bg-white rounded-2xl border border-gray-200/80 shadow-xs overflow-hidden">
        {loading ? (
          <div className="p-16 text-center">
            <div className="w-10 h-10 border-4 border-burgundy/20 border-t-burgundy rounded-full animate-spin mx-auto mb-3" />
            <span className="text-xs font-semibold text-gray-500">Loading leads from Supabase...</span>
          </div>
        ) : paginatedLeads.length > 0 ? (
          <>
            {/* Desktop Table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[900px]">
                <thead>
                  <tr className="bg-ivory/50 border-b border-gray-100 text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                    <th className="py-3.5 px-4">Lead</th>
                    <th className="py-3.5 px-4">Contact</th>
                    <th className="py-3.5 px-4">Source</th>
                    <th className="py-3.5 px-4">Purpose / Interest</th>
                    <th className="py-3.5 px-4">Plot Size</th>
                    <th className="py-3.5 px-4">Budget</th>
                    <th className="py-3.5 px-4">Phase</th>
                    <th className="py-3.5 px-4">Status</th>
                    <th className="py-3.5 px-4">Created</th>
                    <th className="py-3.5 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-xs text-charcoal">
                  {paginatedLeads.map((lead) => (
                    <tr
                      key={lead.id}
                      onClick={() => setSelectedLead(lead)}
                      className="hover:bg-ivory/40 transition-colors group cursor-pointer"
                    >
                      {/* Lead (Name & City) */}
                      <td className="py-3.5 px-4 font-semibold">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-full bg-burgundy/10 text-burgundy font-bold flex items-center justify-center text-xs shrink-0">
                            {lead.name?.charAt(0) || 'L'}
                          </div>
                          <div>
                            <span className="font-bold text-charcoal block group-hover:text-burgundy transition-colors">
                              {renderVal(lead.name)}
                            </span>
                            <span className="text-[10px] text-gray-400 font-normal block">
                              {renderVal(lead.city)}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Contact (Phone & Email) */}
                      <td className="py-3.5 px-4">
                        <span className="font-semibold text-charcoal block">{renderVal(lead.phone)}</span>
                        <span className="text-[10px] text-gray-400 block truncate max-w-[140px]">
                          {renderVal(lead.email)}
                        </span>
                      </td>

                      {/* Source */}
                      <td className="py-3.5 px-4">
                        <span className="inline-flex items-center px-2 py-0.5 rounded-lg bg-gray-100 text-gray-700 text-[11px] font-medium border border-gray-200/60">
                          {formatSource(lead.source)}
                        </span>
                      </td>

                      {/* Purpose / Interest */}
                      <td className="py-3.5 px-4">
                        <div className="space-y-0.5">
                          <span className="font-medium text-charcoal block text-xs">
                            {renderVal(lead.purpose)}
                          </span>
                          {lead.interest_level && (
                            <span
                              className={`inline-flex items-center px-1.5 py-0.5 rounded-full text-[9px] font-bold border ${
                                interestColors[lead.interest_level] || 'bg-gray-100 text-gray-600'
                              }`}
                            >
                              {lead.interest_level}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Plot Size */}
                      <td className="py-3.5 px-4 font-semibold text-burgundy">
                        {renderVal(lead.plot_size)}
                      </td>

                      {/* Budget */}
                      <td className="py-3.5 px-4 text-gray-700">
                        {renderVal(lead.budget_range)}
                      </td>

                      {/* Phase */}
                      <td className="py-3.5 px-4 text-gray-600 font-medium">
                        {renderVal(lead.phase_preference)}
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                            statusColors[lead.status] || 'bg-gray-100 text-gray-700'
                          }`}
                        >
                          {renderVal(lead.status)}
                        </span>
                      </td>

                      {/* Created */}
                      <td className="py-3.5 px-4 text-gray-500 text-[11px] whitespace-nowrap">
                        {lead.created_at
                          ? new Date(lead.created_at).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric'
                            })
                          : 'Not provided'}
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                        <button
                          type="button"
                          onClick={() => setSelectedLead(lead)}
                          className="p-1.5 rounded-lg text-gray-400 hover:text-burgundy hover:bg-ivory transition-colors cursor-pointer"
                          title="View Details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Card View */}
            <div className="md:hidden divide-y divide-gray-100">
              {paginatedLeads.map((lead) => (
                <div
                  key={lead.id}
                  onClick={() => setSelectedLead(lead)}
                  className="p-4 space-y-2 hover:bg-ivory/40 transition-colors cursor-pointer"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-burgundy/10 text-burgundy font-bold flex items-center justify-center text-xs">
                        {lead.name?.charAt(0) || 'L'}
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-charcoal">{renderVal(lead.name)}</h4>
                        <p className="text-[10px] text-gray-400">
                          {renderVal(lead.city)} • {renderVal(lead.phone)}
                        </p>
                      </div>
                    </div>
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                        statusColors[lead.status] || 'bg-gray-100 text-gray-700'
                      }`}
                    >
                      {renderVal(lead.status)}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-xs pt-1">
                    <span className="text-gray-500">{formatSource(lead.source)}</span>
                    <span className="font-semibold text-burgundy">{renderVal(lead.plot_size)}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination Controls */}
            <div className="p-4 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500 bg-ivory/20">
              <span>
                Showing {Math.min((currentPage - 1) * pageSize + 1, filteredLeads.length)} to{' '}
                {Math.min(currentPage * pageSize, filteredLeads.length)} of {filteredLeads.length} leads
              </span>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                  disabled={currentPage === 1}
                  className="p-1.5 rounded-lg border border-gray-200 bg-white hover:bg-ivory text-gray-600 disabled:opacity-40 cursor-pointer"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span className="font-bold text-charcoal">
                  {currentPage} / {totalPages}
                </span>
                <button
                  type="button"
                  onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="p-1.5 rounded-lg border border-gray-200 bg-white hover:bg-ivory text-gray-600 disabled:opacity-40 cursor-pointer"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </>
        ) : (
          /* Empty State */
          <div className="p-12 sm:p-16 text-center">
            <div className="max-w-md mx-auto space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-ivory text-burgundy font-bold flex items-center justify-center mx-auto shadow-xs border border-burgundy/10">
                <User className="w-6 h-6 text-burgundy" />
              </div>
              <h3 className="text-base font-bold text-charcoal">No leads yet</h3>
              <p className="text-xs text-gray-500 leading-relaxed">
                New customer inquiries will appear here when customers submit a form, chat, call or other lead source.
              </p>
              <button
                type="button"
                onClick={() => setShowAddModal(true)}
                className="mt-2 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-burgundy hover:bg-burgundy/90 text-white text-xs font-bold cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add First Lead</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* LEAD DETAILS MODAL */}
      {selectedLead && (
        <div className="fixed inset-0 z-50 bg-charcoal/50 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 sm:p-7 shadow-2xl border border-gray-200 relative my-8 animate-in fade-in zoom-in-95 duration-200">
            {/* Close Button */}
            <button
              onClick={() => setSelectedLead(null)}
              className="absolute top-4 right-4 p-1.5 rounded-lg text-gray-400 hover:text-charcoal hover:bg-gray-100 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Header Info */}
            <div className="flex items-center gap-4 mb-5 pb-4 border-b border-gray-100">
              <div className="w-12 h-12 rounded-2xl bg-burgundy text-white font-bold flex items-center justify-center text-lg shadow-sm shrink-0">
                {selectedLead.name?.charAt(0) || 'L'}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-bold text-charcoal">{renderVal(selectedLead.name)}</h3>
                  <span
                    className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                      statusColors[selectedLead.status] || 'bg-gray-100 text-gray-700'
                    }`}
                  >
                    {renderVal(selectedLead.status)}
                  </span>
                </div>
                <p className="text-xs text-gray-500 mt-0.5">
                  ID: <span className="font-mono text-gray-700">{selectedLead.id}</span> • City: {renderVal(selectedLead.city)}
                </p>
              </div>
            </div>

            {/* Quick Action Buttons */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mb-6">
              {selectedLead.phone && (
                <a
                  href={`tel:${selectedLead.phone}`}
                  className="flex items-center justify-center gap-1.5 py-2 px-3 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-bold rounded-xl border border-emerald-200 transition-colors"
                >
                  <Phone className="w-3.5 h-3.5" />
                  <span>Call</span>
                </a>
              )}

              {selectedLead.phone && (
                <a
                  href={`https://wa.me/${selectedLead.phone.replace(/[^0-9]/g, '')}`}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center justify-center gap-1.5 py-2 px-3 bg-green-50 hover:bg-green-100 text-green-800 text-xs font-bold rounded-xl border border-green-200 transition-colors"
                >
                  <MessageCircle className="w-3.5 h-3.5" />
                  <span>WhatsApp</span>
                </a>
              )}

              <Link
                to="/calls"
                onClick={() => setSelectedLead(null)}
                className="flex items-center justify-center gap-1.5 py-2 px-3 bg-ivory hover:bg-ivory/80 text-charcoal text-xs font-semibold rounded-xl border border-gray-200 transition-colors"
              >
                <PhoneCall className="w-3.5 h-3.5 text-burgundy" />
                <span>View Calls</span>
              </Link>

              <Link
                to="/chats"
                onClick={() => setSelectedLead(null)}
                className="flex items-center justify-center gap-1.5 py-2 px-3 bg-ivory hover:bg-ivory/80 text-charcoal text-xs font-semibold rounded-xl border border-gray-200 transition-colors"
              >
                <MessageSquare className="w-3.5 h-3.5 text-gold" />
                <span>View Chats</span>
              </Link>

              <Link
                to="/site-visits"
                onClick={() => setSelectedLead(null)}
                className="flex items-center justify-center gap-1.5 py-2 px-3 bg-ivory hover:bg-ivory/80 text-charcoal text-xs font-semibold rounded-xl border border-gray-200 transition-colors"
              >
                <MapPin className="w-3.5 h-3.5 text-purple-600" />
                <span>Site Visit</span>
              </Link>

              <Link
                to="/follow-ups"
                onClick={() => setSelectedLead(null)}
                className="flex items-center justify-center gap-1.5 py-2 px-3 bg-ivory hover:bg-ivory/80 text-charcoal text-xs font-semibold rounded-xl border border-gray-200 transition-colors"
              >
                <CalendarCheck className="w-3.5 h-3.5 text-amber-600" />
                <span>Follow-up</span>
              </Link>
            </div>

            {/* Categorized Lead Details Sections */}
            <div className="space-y-4 max-h-[50vh] overflow-y-auto pr-1">
              {/* Section 1: Personal Information */}
              <div>
                <h4 className="text-xs font-bold text-burgundy uppercase tracking-wider mb-2 border-b border-burgundy/10 pb-1">
                  Personal Information
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
                  <div className="bg-ivory/60 p-2.5 rounded-xl border border-gray-100">
                    <span className="text-[10px] font-bold text-gray-400 uppercase block mb-0.5">Name</span>
                    <span className="font-semibold text-charcoal">{renderVal(selectedLead.name)}</span>
                  </div>
                  <div className="bg-ivory/60 p-2.5 rounded-xl border border-gray-100">
                    <span className="text-[10px] font-bold text-gray-400 uppercase block mb-0.5">Phone</span>
                    <span className="font-semibold text-charcoal">{renderVal(selectedLead.phone)}</span>
                  </div>
                  <div className="bg-ivory/60 p-2.5 rounded-xl border border-gray-100">
                    <span className="text-[10px] font-bold text-gray-400 uppercase block mb-0.5">Email</span>
                    <span className="font-semibold text-charcoal truncate block">{renderVal(selectedLead.email)}</span>
                  </div>
                  <div className="bg-ivory/60 p-2.5 rounded-xl border border-gray-100">
                    <span className="text-[10px] font-bold text-gray-400 uppercase block mb-0.5">City</span>
                    <span className="font-semibold text-charcoal">{renderVal(selectedLead.city)}</span>
                  </div>
                </div>
              </div>

              {/* Section 2: Lead Information */}
              <div>
                <h4 className="text-xs font-bold text-burgundy uppercase tracking-wider mb-2 border-b border-burgundy/10 pb-1">
                  Lead Information
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
                  <div className="bg-ivory/60 p-2.5 rounded-xl border border-gray-100">
                    <span className="text-[10px] font-bold text-gray-400 uppercase block mb-0.5">Source</span>
                    <span className="font-semibold text-burgundy">{formatSource(selectedLead.source)}</span>
                  </div>
                  <div className="bg-ivory/60 p-2.5 rounded-xl border border-gray-100">
                    <span className="text-[10px] font-bold text-gray-400 uppercase block mb-0.5">Status</span>
                    <span className="font-semibold text-charcoal">{renderVal(selectedLead.status)}</span>
                  </div>
                  <div className="bg-ivory/60 p-2.5 rounded-xl border border-gray-100">
                    <span className="text-[10px] font-bold text-gray-400 uppercase block mb-0.5">Interest Level</span>
                    <span className="font-semibold text-amber-800">{renderVal(selectedLead.interest_level)}</span>
                  </div>
                  <div className="bg-ivory/60 p-2.5 rounded-xl border border-gray-100">
                    <span className="text-[10px] font-bold text-gray-400 uppercase block mb-0.5">Purpose</span>
                    <span className="font-semibold text-charcoal">{renderVal(selectedLead.purpose)}</span>
                  </div>
                </div>
              </div>

              {/* Section 3: Property Requirements */}
              <div>
                <h4 className="text-xs font-bold text-burgundy uppercase tracking-wider mb-2 border-b border-burgundy/10 pb-1">
                  Property Requirements
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 text-xs">
                  <div className="bg-ivory/60 p-2.5 rounded-xl border border-gray-100">
                    <span className="text-[10px] font-bold text-gray-400 uppercase block mb-0.5">Plot Size</span>
                    <span className="font-semibold text-burgundy">{renderVal(selectedLead.plot_size)}</span>
                  </div>
                  <div className="bg-ivory/60 p-2.5 rounded-xl border border-gray-100">
                    <span className="text-[10px] font-bold text-gray-400 uppercase block mb-0.5">Budget Range</span>
                    <span className="font-semibold text-charcoal">{renderVal(selectedLead.budget_range)}</span>
                  </div>
                  <div className="bg-ivory/60 p-2.5 rounded-xl border border-gray-100">
                    <span className="text-[10px] font-bold text-gray-400 uppercase block mb-0.5">Phase Preference</span>
                    <span className="font-semibold text-charcoal">{renderVal(selectedLead.phase_preference)}</span>
                  </div>
                  <div className="bg-ivory/60 p-2.5 rounded-xl border border-gray-100">
                    <span className="text-[10px] font-bold text-gray-400 uppercase block mb-0.5">Timeline</span>
                    <span className="font-semibold text-charcoal">{renderVal(selectedLead.timeline)}</span>
                  </div>
                  <div className="bg-ivory/60 p-2.5 rounded-xl border border-gray-100 col-span-2 sm:col-span-2">
                    <span className="text-[10px] font-bold text-gray-400 uppercase block mb-0.5">Payment Method</span>
                    <span className="font-semibold text-charcoal">{renderVal(selectedLead.payment_method)}</span>
                  </div>
                </div>
              </div>

              {/* Section 4: Follow-up / Visit */}
              <div>
                <h4 className="text-xs font-bold text-burgundy uppercase tracking-wider mb-2 border-b border-burgundy/10 pb-1">
                  Follow-up / Visit
                </h4>
                <div className="grid grid-cols-2 gap-2.5 text-xs">
                  <div className="bg-ivory/60 p-2.5 rounded-xl border border-gray-100">
                    <span className="text-[10px] font-bold text-gray-400 uppercase block mb-0.5">Site Visit Requested</span>
                    <span className="font-semibold text-charcoal">{renderVal(selectedLead.site_visit_requested)}</span>
                  </div>
                  <div className="bg-ivory/60 p-2.5 rounded-xl border border-gray-100">
                    <span className="text-[10px] font-bold text-gray-400 uppercase block mb-0.5">Follow-up Time</span>
                    <span className="font-semibold text-charcoal">{renderVal(selectedLead.follow_up_time)}</span>
                  </div>
                </div>
              </div>

              {/* Section 5: Notes */}
              <div>
                <h4 className="text-xs font-bold text-burgundy uppercase tracking-wider mb-2 border-b border-burgundy/10 pb-1">
                  Notes & Feedback
                </h4>
                <div className="space-y-2 text-xs">
                  <div className="bg-ivory/60 p-3 rounded-xl border border-gray-100">
                    <span className="text-[10px] font-bold text-gray-400 uppercase block mb-0.5">Additional Notes</span>
                    <p className="text-gray-700 leading-relaxed">{renderVal(selectedLead.notes)}</p>
                  </div>

                  {selectedLead.not_interested_reason && (
                    <div className="bg-rose-50 p-3 rounded-xl border border-rose-200">
                      <span className="text-[10px] font-bold text-rose-700 uppercase block mb-0.5">Not Interested Reason</span>
                      <p className="text-rose-900 font-semibold">{selectedLead.not_interested_reason}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Section 6: Timestamps */}
              <div>
                <h4 className="text-xs font-bold text-burgundy uppercase tracking-wider mb-2 border-b border-burgundy/10 pb-1">
                  System Timestamps
                </h4>
                <div className="grid grid-cols-2 gap-2.5 text-xs text-gray-500">
                  <div className="bg-ivory/40 p-2 rounded-xl border border-gray-100">
                    <span className="text-[10px] font-bold text-gray-400 uppercase block">Created At</span>
                    <span>
                      {selectedLead.created_at
                        ? new Date(selectedLead.created_at).toLocaleString()
                        : 'Not provided'}
                    </span>
                  </div>
                  <div className="bg-ivory/40 p-2 rounded-xl border border-gray-100">
                    <span className="text-[10px] font-bold text-gray-400 uppercase block">Updated At</span>
                    <span>
                      {selectedLead.updated_at
                        ? new Date(selectedLead.updated_at).toLocaleString()
                        : 'Not provided'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="flex justify-end pt-4 border-t border-gray-100 mt-4">
              <button
                type="button"
                onClick={() => setSelectedLead(null)}
                className="px-5 py-2 rounded-xl text-xs font-bold bg-burgundy text-white hover:bg-burgundy/90 cursor-pointer shadow-xs"
              >
                Close Details
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ADD LEAD MODAL */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-charcoal/50 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-gray-200 relative my-8 animate-in fade-in zoom-in-95 duration-200">
            <button
              onClick={() => setShowAddModal(false)}
              className="absolute top-4 right-4 p-1.5 rounded-lg text-gray-400 hover:text-charcoal hover:bg-gray-100 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2 mb-4 pb-3 border-b border-gray-100">
              <Plus className="w-5 h-5 text-burgundy" />
              <h3 className="text-base font-bold text-charcoal">Add New Lead</h3>
            </div>

            {addError && (
              <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold">
                {addError}
              </div>
            )}

            <form onSubmit={handleCreateLead} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-charcoal mb-1">Full Name *</label>
                  <input
                    type="text"
                    required
                    value={newLead.name}
                    onChange={(e) => setNewLead({ ...newLead, name: e.target.value })}
                    placeholder="e.g. Ali Raza"
                    className="w-full px-3 py-2 bg-ivory/60 border border-gray-200 rounded-xl text-xs text-charcoal focus:outline-none focus:border-burgundy"
                  />
                </div>

                <div>
                  <label className="block font-bold text-charcoal mb-1">Phone Number *</label>
                  <input
                    type="text"
                    required
                    value={newLead.phone}
                    onChange={(e) => setNewLead({ ...newLead, phone: e.target.value })}
                    placeholder="e.g. 0300-1234567"
                    className="w-full px-3 py-2 bg-ivory/60 border border-gray-200 rounded-xl text-xs text-charcoal focus:outline-none focus:border-burgundy"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-charcoal mb-1">Email Address</label>
                  <input
                    type="email"
                    value={newLead.email}
                    onChange={(e) => setNewLead({ ...newLead, email: e.target.value })}
                    placeholder="e.g. client@email.com"
                    className="w-full px-3 py-2 bg-ivory/60 border border-gray-200 rounded-xl text-xs text-charcoal focus:outline-none focus:border-burgundy"
                  />
                </div>

                <div>
                  <label className="block font-bold text-charcoal mb-1">City</label>
                  <input
                    type="text"
                    value={newLead.city}
                    onChange={(e) => setNewLead({ ...newLead, city: e.target.value })}
                    placeholder="e.g. Rahim Yar Khan"
                    className="w-full px-3 py-2 bg-ivory/60 border border-gray-200 rounded-xl text-xs text-charcoal focus:outline-none focus:border-burgundy"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-charcoal mb-1">Lead Source</label>
                  <select
                    value={newLead.source}
                    onChange={(e) => setNewLead({ ...newLead, source: e.target.value })}
                    className="w-full px-3 py-2 bg-ivory/60 border border-gray-200 rounded-xl text-xs text-charcoal focus:outline-none focus:border-burgundy cursor-pointer"
                  >
                    <option value="google_form">Google Form</option>
                    <option value="website_form">Website Form</option>
                    <option value="chatbot">Chatbot</option>
                    <option value="voice_agent">Voice Agent</option>
                    <option value="whatsapp">WhatsApp</option>
                    <option value="inbound_call">Inbound Call</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-charcoal mb-1">Status</label>
                  <select
                    value={newLead.status}
                    onChange={(e) => setNewLead({ ...newLead, status: e.target.value })}
                    className="w-full px-3 py-2 bg-ivory/60 border border-gray-200 rounded-xl text-xs text-charcoal focus:outline-none focus:border-burgundy cursor-pointer"
                  >
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

                <div>
                  <label className="block font-bold text-charcoal mb-1">Interest Level</label>
                  <select
                    value={newLead.interest_level}
                    onChange={(e) => setNewLead({ ...newLead, interest_level: e.target.value })}
                    className="w-full px-3 py-2 bg-ivory/60 border border-gray-200 rounded-xl text-xs text-charcoal focus:outline-none focus:border-burgundy cursor-pointer"
                  >
                    <option value="Hot">Hot</option>
                    <option value="Warm">Warm</option>
                    <option value="Cold">Cold</option>
                    <option value="Not Interested">Not Interested</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-charcoal mb-1">Plot Size</label>
                  <input
                    type="text"
                    value={newLead.plot_size}
                    onChange={(e) => setNewLead({ ...newLead, plot_size: e.target.value })}
                    placeholder="e.g. 5 Marla / 10 Marla"
                    className="w-full px-3 py-2 bg-ivory/60 border border-gray-200 rounded-xl text-xs text-charcoal focus:outline-none focus:border-burgundy"
                  />
                </div>

                <div>
                  <label className="block font-bold text-charcoal mb-1">Budget Range</label>
                  <input
                    type="text"
                    value={newLead.budget_range}
                    onChange={(e) => setNewLead({ ...newLead, budget_range: e.target.value })}
                    placeholder="e.g. 40-50 Lakhs"
                    className="w-full px-3 py-2 bg-ivory/60 border border-gray-200 rounded-xl text-xs text-charcoal focus:outline-none focus:border-burgundy"
                  />
                </div>

                <div>
                  <label className="block font-bold text-charcoal mb-1">Phase Preference</label>
                  <input
                    type="text"
                    value={newLead.phase_preference}
                    onChange={(e) => setNewLead({ ...newLead, phase_preference: e.target.value })}
                    placeholder="e.g. Phase 1"
                    className="w-full px-3 py-2 bg-ivory/60 border border-gray-200 rounded-xl text-xs text-charcoal focus:outline-none focus:border-burgundy"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-charcoal mb-1">Notes / Requirement</label>
                <textarea
                  rows="3"
                  value={newLead.notes}
                  onChange={(e) => setNewLead({ ...newLead, notes: e.target.value })}
                  placeholder="Inquiry notes..."
                  className="w-full px-3 py-2 bg-ivory/60 border border-gray-200 rounded-xl text-xs text-charcoal focus:outline-none focus:border-burgundy"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-gray-600 hover:bg-gray-100 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isInserting}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-burgundy text-white hover:bg-burgundy/90 disabled:opacity-50 cursor-pointer"
                >
                  {isInserting ? 'Saving...' : 'Save Lead'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
