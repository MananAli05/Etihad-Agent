// Etihad Garden CRM Data Schema (Clean Empty State awaiting Supabase integration)

export const kpiStats = [
  {
    title: "Total Leads",
    value: "—",
    change: null,
    period: "Awaiting data",
    icon: "Users"
  },
  {
    title: "Hot Leads",
    value: "—",
    change: null,
    period: "Awaiting data",
    icon: "Flame"
  },
  {
    title: "Calls Today",
    value: "—",
    change: null,
    period: "Awaiting data",
    icon: "PhoneCall"
  },
  {
    title: "Site Visits",
    value: "—",
    change: null,
    period: "Awaiting data",
    icon: "MapPin"
  },
  {
    title: "Follow-ups",
    value: "—",
    change: null,
    period: "Awaiting data",
    icon: "CalendarCheck"
  }
];

export const mockLeads = []; // Empty lead repository

export const leadSources = [
  { name: "Website Form", count: 0, percentage: 0, color: "#651F2B" },
  { name: "Chatbot", count: 0, percentage: 0, color: "#C8A45D" },
  { name: "Voice Agent", count: 0, percentage: 0, color: "#252323" },
  { name: "WhatsApp", count: 0, percentage: 0, color: "#4A5568" },
  { name: "Google Form", count: 0, percentage: 0, color: "#718096" },
  { name: "Inbound Calls", count: 0, percentage: 0, color: "#A0AEC0" }
];

export const recentCallActivity = [];
export const upcomingSiteVisits = [];
export const followUpsToday = [];
export const activityTimeline = [];
export const chatTranscripts = [];
