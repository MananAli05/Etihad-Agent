import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import DashboardLayout from './layouts/DashboardLayout';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import LeadsPage from './pages/LeadsPage';
import CallsPage from './pages/CallsPage';
import ChatsPage from './pages/ChatsPage';
import SiteVisitsPage from './pages/SiteVisitsPage';
import FollowUpsPage from './pages/FollowUpsPage';
import SourcesPage from './pages/SourcesPage';
import AnalyticsPage from './pages/AnalyticsPage';
import SettingsPage from './pages/SettingsPage';

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <Routes>
          {/* Unprotected Login Routes */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/admin/login" element={<LoginPage />} />

          {/* Protected Dashboard Routes */}
          <Route
            path="/*"
            element={
              <ProtectedRoute>
                <DashboardLayout>
                  <Routes>
                    {/* Root Base Routes */}
                    <Route path="/" element={<DashboardPage />} />
                    <Route path="/leads" element={<LeadsPage />} />
                    <Route path="/calls" element={<CallsPage />} />
                    <Route path="/chats" element={<ChatsPage />} />
                    <Route path="/site-visits" element={<SiteVisitsPage />} />
                    <Route path="/follow-ups" element={<FollowUpsPage />} />
                    <Route path="/sources" element={<SourcesPage />} />
                    <Route path="/analytics" element={<AnalyticsPage />} />
                    <Route path="/settings" element={<SettingsPage />} />

                    {/* Subpath Aliases for /admin sub-routing */}
                    <Route path="/admin" element={<DashboardPage />} />
                    <Route path="/admin/leads" element={<LeadsPage />} />
                    <Route path="/admin/calls" element={<CallsPage />} />
                    <Route path="/admin/chats" element={<ChatsPage />} />
                    <Route path="/admin/site-visits" element={<SiteVisitsPage />} />
                    <Route path="/admin/follow-ups" element={<FollowUpsPage />} />
                    <Route path="/admin/sources" element={<SourcesPage />} />
                    <Route path="/admin/analytics" element={<AnalyticsPage />} />
                    <Route path="/admin/settings" element={<SettingsPage />} />

                    {/* Catch-all redirect */}
                    <Route path="*" element={<Navigate to="/" replace />} />
                  </Routes>
                </DashboardLayout>
              </ProtectedRoute>
            }
          />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
