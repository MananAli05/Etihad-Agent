import React, { useState, useEffect } from 'react';
import {
  User,
  Shield,
  Bell,
  Sliders,
  Camera,
  Check,
  AlertCircle,
  KeyRound,
  LogOut,
  Clock,
  Save
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { makeAvatarThumbnail, isTooLarge } from '../lib/avatar';
import { supabase } from '../lib/supabase';

export default function SettingsPage() {
  const { user, displayName, avatarUrl, updateProfileData, signOut } = useAuth();

  // Profile Form State
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [previewAvatar, setPreviewAvatar] = useState('');
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileMsg, setProfileMsg] = useState({ type: '', text: '' });

  // Password Change State
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [passwordMsg, setPasswordMsg] = useState({ type: '', text: '' });

  // Notifications State (persisted in localStorage)
  const [notifications, setNotifications] = useState(() => {
    const saved = localStorage.getItem('eg_crm_notifs');
    return saved
      ? JSON.parse(saved)
      : { newLead: true, siteVisit: true, followUp: true };
  });

  // Preferences State (persisted in localStorage)
  const [preferences, setPreferences] = useState(() => {
    const saved = localStorage.getItem('eg_crm_prefs');
    return saved
      ? JSON.parse(saved)
      : { dateFormat: 'MMM DD, YYYY', timeFormat: '12-hour' };
  });

  // Initialize values when user loads
  useEffect(() => {
    if (user) {
      setName(user.user_metadata?.full_name || displayName || '');
      setPhone(user.user_metadata?.phone || '');
      setPreviewAvatar(avatarUrl || '');
    }
  }, [user, displayName, avatarUrl]);

  // Handle Avatar File Upload
  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      setProfileMsg({ type: 'error', text: 'Image size should be less than 2MB.' });
      return;
    }

    try {
      // Shrink before it ever reaches user_metadata: Supabase puts that
      // metadata in the JWT, and a full-size image there makes every
      // authenticated request fail.
      const thumbnail = await makeAvatarThumbnail(file);
      setPreviewAvatar(thumbnail);
      setProfileMsg({ type: 'info', text: 'Click "Save Profile" to apply avatar.' });
    } catch (err) {
      console.error('Avatar processing failed:', err);
      setProfileMsg({ type: 'error', text: err.message });
    }
  };

  // Save Profile Changes
  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setProfileSaving(true);
    setProfileMsg({ type: '', text: '' });

    try {
      // A legacy oversized avatar loaded from an old session would be written
      // straight back, re-breaking the account. Drop it instead.
      const avatar = isTooLarge(previewAvatar) ? '' : previewAvatar;
      if (avatar !== previewAvatar) {
        setPreviewAvatar('');
      }

      await updateProfileData({
        name: name.trim(),
        avatar,
        phone: phone.trim()
      });
      setProfileMsg({ type: 'success', text: 'Profile updated successfully.' });
    } catch (err) {
      console.error('Error updating profile:', err);
      // "Failed to fetch" means the request never reached Supabase - almost
      // always an oversized auth header from a stale session.
      const text = /failed to fetch|networkerror/i.test(err.message || '')
        ? 'Could not reach the server. Sign out and sign in again, then retry.'
        : err.message || 'Failed to update profile. Please try again.';
      setProfileMsg({ type: 'error', text });
    } finally {
      setProfileSaving(false);
    }
  };

  // Change Password
  const handleChangePassword = async (e) => {
    e.preventDefault();
    setPasswordMsg({ type: '', text: '' });

    if (newPassword.length < 6) {
      setPasswordMsg({ type: 'error', text: 'Password must be at least 6 characters.' });
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordMsg({ type: 'error', text: 'Passwords do not match.' });
      return;
    }

    setPasswordSaving(true);

    try {
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) throw error;

      setPasswordMsg({ type: 'success', text: 'Password updated successfully.' });
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      console.error('Error changing password:', err);
      setPasswordMsg({ type: 'error', text: err.message || 'Failed to update password.' });
    } finally {
      setPasswordSaving(false);
    }
  };

  // Toggle Notification
  const handleToggleNotification = (key) => {
    const updated = { ...notifications, [key]: !notifications[key] };
    setNotifications(updated);
    localStorage.setItem('eg_crm_notifs', JSON.stringify(updated));
  };

  // Preference Change
  const handlePrefChange = (key, value) => {
    const updated = { ...preferences, [key]: value };
    setPreferences(updated);
    localStorage.setItem('eg_crm_prefs', JSON.stringify(updated));
  };

  return (
    <div className="space-y-6 font-sans text-charcoal pb-12">
      {/* Header Panel */}
      <div className="bg-white p-5 sm:p-6 rounded-2xl border border-gray-200/80 shadow-2xs">
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-charcoal">
          Admin Settings & Profile
        </h1>
        <p className="text-xs sm:text-sm text-gray-500 mt-1">
          Manage your account profile, security credentials, notification preferences, and display settings.
        </p>
      </div>

      {/* Main Grid: Profile (Left) & Security (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* 1. PROFILE SECTION (Left 7 cols on Desktop) */}
        <div className="lg:col-span-7 bg-white p-5 sm:p-6 rounded-2xl border border-gray-200/80 shadow-2xs space-y-5">
          <div className="flex items-center gap-2.5 pb-3 border-b border-gray-100">
            <div className="w-8 h-8 rounded-xl bg-burgundy/10 text-burgundy flex items-center justify-center">
              <User className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-charcoal">Profile Information</h2>
              <p className="text-xs text-gray-500">Update your public name and profile picture</p>
            </div>
          </div>

          {profileMsg.text && (
            <div
              className={`p-3 rounded-xl text-xs font-semibold flex items-center gap-2 ${
                profileMsg.type === 'success'
                  ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                  : profileMsg.type === 'error'
                  ? 'bg-rose-50 text-rose-800 border border-rose-200'
                  : 'bg-blue-50 text-blue-800 border border-blue-200'
              }`}
            >
              {profileMsg.type === 'success' ? (
                <Check className="w-4 h-4 shrink-0 text-emerald-600" />
              ) : (
                <AlertCircle className="w-4 h-4 shrink-0" />
              )}
              <span>{profileMsg.text}</span>
            </div>
          )}

          <form onSubmit={handleSaveProfile} className="space-y-4 text-xs">
            {/* Avatar Upload Area */}
            <div className="flex flex-col sm:flex-row items-center gap-4 p-4 rounded-xl bg-ivory/50 border border-gray-100">
              <div className="relative group shrink-0">
                {previewAvatar ? (
                  <img
                    src={previewAvatar}
                    alt="Admin Avatar"
                    className="w-20 h-20 rounded-2xl object-cover border-2 border-burgundy/30 shadow-xs"
                  />
                ) : (
                  <div className="w-20 h-20 rounded-2xl bg-burgundy text-white font-bold flex items-center justify-center text-2xl shadow-xs">
                    {name?.charAt(0).toUpperCase() || user?.email?.charAt(0).toUpperCase() || 'A'}
                  </div>
                )}
                <label
                  htmlFor="avatar-upload"
                  className="absolute -bottom-1 -right-1 w-7 h-7 rounded-xl bg-gold text-charcoal flex items-center justify-center shadow-md cursor-pointer hover:bg-gold/90 transition-transform active:scale-95"
                  title="Upload profile picture"
                >
                  <Camera className="w-3.5 h-3.5" />
                  <input
                    id="avatar-upload"
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                  />
                </label>
              </div>

              <div>
                <h3 className="font-bold text-charcoal text-sm">{displayName}</h3>
                <p className="text-[11px] text-gray-500 mt-0.5">JPG, PNG or GIF. Max size 2MB.</p>
                <label
                  htmlFor="avatar-upload"
                  className="mt-2 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-gray-200 bg-white hover:bg-ivory text-charcoal font-semibold text-xs cursor-pointer shadow-2xs"
                >
                  <Camera className="w-3.5 h-3.5 text-burgundy" />
                  <span>Change Photo</span>
                </label>
              </div>
            </div>

            {/* Input Fields */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-bold text-charcoal mb-1">Display Name *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Sales Administrator"
                  className="w-full px-3 py-2 bg-ivory/60 border border-gray-200 rounded-xl text-xs text-charcoal focus:outline-none focus:border-burgundy"
                />
              </div>

              <div>
                <label className="block font-bold text-charcoal mb-1">Phone Number (Optional)</label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="e.g. +92 300 1234567"
                  className="w-full px-3 py-2 bg-ivory/60 border border-gray-200 rounded-xl text-xs text-charcoal focus:outline-none focus:border-burgundy"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-bold text-gray-500 mb-1">Authenticated Email</label>
                <input
                  type="email"
                  readOnly
                  value={user?.email || ''}
                  className="w-full px-3 py-2 bg-gray-100 border border-gray-200 rounded-xl text-xs text-gray-600 font-mono cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-500 mb-1">Role</label>
                <input
                  type="text"
                  readOnly
                  value="Sales Admin"
                  className="w-full px-3 py-2 bg-gray-100 border border-gray-200 rounded-xl text-xs font-semibold text-burgundy cursor-not-allowed"
                />
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="submit"
                disabled={profileSaving}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-burgundy hover:bg-burgundy/90 text-white font-bold text-xs shadow-2xs transition-all cursor-pointer disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                <span>{profileSaving ? 'Saving Changes...' : 'Save Profile'}</span>
              </button>
            </div>
          </form>
        </div>

        {/* 2. ACCOUNT & SECURITY (Right 5 cols on Desktop) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Change Password Card */}
          <div className="bg-white p-5 sm:p-6 rounded-2xl border border-gray-200/80 shadow-2xs space-y-4">
            <div className="flex items-center gap-2.5 pb-3 border-b border-gray-100">
              <div className="w-8 h-8 rounded-xl bg-gold/15 text-gold flex items-center justify-center">
                <KeyRound className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-base font-bold text-charcoal">Security & Password</h2>
                <p className="text-xs text-gray-500">Update your account login password</p>
              </div>
            </div>

            {passwordMsg.text && (
              <div
                className={`p-3 rounded-xl text-xs font-semibold flex items-center gap-2 ${
                  passwordMsg.type === 'success'
                    ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                    : 'bg-rose-50 text-rose-800 border border-rose-200'
                }`}
              >
                {passwordMsg.type === 'success' ? (
                  <Check className="w-4 h-4 shrink-0 text-emerald-600" />
                ) : (
                  <AlertCircle className="w-4 h-4 shrink-0" />
                )}
                <span>{passwordMsg.text}</span>
              </div>
            )}

            <form onSubmit={handleChangePassword} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-charcoal mb-1">New Password</label>
                <input
                  type="password"
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="At least 6 characters"
                  className="w-full px-3 py-2 bg-ivory/60 border border-gray-200 rounded-xl text-xs text-charcoal focus:outline-none focus:border-burgundy"
                />
              </div>

              <div>
                <label className="block font-bold text-charcoal mb-1">Confirm New Password</label>
                <input
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter new password"
                  className="w-full px-3 py-2 bg-ivory/60 border border-gray-200 rounded-xl text-xs text-charcoal focus:outline-none focus:border-burgundy"
                />
              </div>

              <div className="pt-1">
                <button
                  type="submit"
                  disabled={passwordSaving}
                  className="w-full py-2.5 rounded-xl bg-charcoal hover:bg-black text-white font-bold text-xs shadow-2xs transition-all cursor-pointer disabled:opacity-50"
                >
                  {passwordSaving ? 'Updating Password...' : 'Update Password'}
                </button>
              </div>
            </form>
          </div>

          {/* Session & Account Info Card */}
          <div className="bg-white p-5 rounded-2xl border border-gray-200/80 shadow-2xs space-y-3 text-xs">
            <div className="flex items-center justify-between pb-2 border-b border-gray-100">
              <span className="font-bold text-charcoal">Active Session</span>
              <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 text-[10px] font-bold border border-emerald-200">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />
                Authenticated
              </span>
            </div>

            <div className="space-y-1.5 text-gray-600 text-[11px]">
              <div className="flex justify-between">
                <span className="text-gray-400">Signed in as:</span>
                <span className="font-mono text-charcoal font-semibold">{user?.email}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Last Sign-in:</span>
                <span className="text-charcoal font-medium">
                  {user?.last_sign_in_at
                    ? new Date(user.last_sign_in_at).toLocaleString()
                    : 'Current session'}
                </span>
              </div>
            </div>

            <div className="pt-2 border-t border-gray-100">
              <button
                type="button"
                onClick={signOut}
                className="w-full flex items-center justify-center gap-2 py-2 px-3 bg-rose-50 hover:bg-rose-100 text-rose-800 font-bold rounded-xl border border-rose-200 transition-colors cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
                <span>Sign Out of CRM</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Grid: Notifications (Left) & Preferences (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 3. NOTIFICATIONS */}
        <div className="bg-white p-5 sm:p-6 rounded-2xl border border-gray-200/80 shadow-2xs space-y-4">
          <div className="flex items-center gap-2.5 pb-3 border-b border-gray-100">
            <div className="w-8 h-8 rounded-xl bg-burgundy/10 text-burgundy flex items-center justify-center">
              <Bell className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-charcoal">Notifications Settings</h2>
              <p className="text-xs text-gray-500">Configure sales activity notification alerts</p>
            </div>
          </div>

          <div className="space-y-3.5 text-xs">
            {/* Toggle 1 */}
            <div className="flex items-center justify-between p-3 rounded-xl bg-ivory/40 border border-gray-100">
              <div>
                <span className="font-bold text-charcoal block">New Lead Notifications</span>
                <span className="text-[11px] text-gray-500">Alert when a new lead is received</span>
              </div>
              <button
                type="button"
                onClick={() => handleToggleNotification('newLead')}
                className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors cursor-pointer ${
                  notifications.newLead ? 'bg-burgundy' : 'bg-gray-300'
                }`}
              >
                <div
                  className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                    notifications.newLead ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {/* Toggle 2 */}
            <div className="flex items-center justify-between p-3 rounded-xl bg-ivory/40 border border-gray-100">
              <div>
                <span className="font-bold text-charcoal block">Site Visit Notifications</span>
                <span className="text-[11px] text-gray-500">Alert when a property tour is booked</span>
              </div>
              <button
                type="button"
                onClick={() => handleToggleNotification('siteVisit')}
                className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors cursor-pointer ${
                  notifications.siteVisit ? 'bg-burgundy' : 'bg-gray-300'
                }`}
              >
                <div
                  className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                    notifications.siteVisit ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {/* Toggle 3 */}
            <div className="flex items-center justify-between p-3 rounded-xl bg-ivory/40 border border-gray-100">
              <div>
                <span className="font-bold text-charcoal block">Follow-up Notifications</span>
                <span className="text-[11px] text-gray-500">Reminders for scheduled customer calls</span>
              </div>
              <button
                type="button"
                onClick={() => handleToggleNotification('followUp')}
                className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors cursor-pointer ${
                  notifications.followUp ? 'bg-burgundy' : 'bg-gray-300'
                }`}
              >
                <div
                  className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                    notifications.followUp ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
          </div>
        </div>

        {/* 4. PREFERENCES */}
        <div className="bg-white p-5 sm:p-6 rounded-2xl border border-gray-200/80 shadow-2xs space-y-4">
          <div className="flex items-center gap-2.5 pb-3 border-b border-gray-100">
            <div className="w-8 h-8 rounded-xl bg-gold/15 text-gold flex items-center justify-center">
              <Sliders className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-charcoal">Appearance & Preferences</h2>
              <p className="text-xs text-gray-500">Customize date and time formatting options</p>
            </div>
          </div>

          <div className="space-y-4 text-xs">
            <div>
              <label className="block font-bold text-charcoal mb-1">Date Format</label>
              <select
                value={preferences.dateFormat}
                onChange={(e) => handlePrefChange('dateFormat', e.target.value)}
                className="w-full px-3 py-2 bg-ivory/60 border border-gray-200 rounded-xl text-xs text-charcoal focus:outline-none focus:border-burgundy cursor-pointer font-medium"
              >
                <option value="MMM DD, YYYY">MMM DD, YYYY (e.g. Aug 15, 2026)</option>
                <option value="DD/MM/YYYY">DD/MM/YYYY (e.g. 15/08/2026)</option>
                <option value="YYYY-MM-DD">YYYY-MM-DD (e.g. 2026-08-15)</option>
              </select>
            </div>

            <div>
              <label className="block font-bold text-charcoal mb-1">Time Format</label>
              <select
                value={preferences.timeFormat}
                onChange={(e) => handlePrefChange('timeFormat', e.target.value)}
                className="w-full px-3 py-2 bg-ivory/60 border border-gray-200 rounded-xl text-xs text-charcoal focus:outline-none focus:border-burgundy cursor-pointer font-medium"
              >
                <option value="12-hour">12-hour AM/PM (e.g. 11:30 AM)</option>
                <option value="24-hour">24-hour (e.g. 23:30)</option>
              </select>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
