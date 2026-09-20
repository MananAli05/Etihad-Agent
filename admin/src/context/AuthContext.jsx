import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

const AuthContext = createContext({});

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [displayName, setDisplayName] = useState('Sales Admin');
  const [avatarUrl, setAvatarUrl] = useState('');

  const syncUserData = (usr) => {
    setUser(usr);
    if (usr?.user_metadata) {
      setDisplayName(usr.user_metadata.full_name || usr.user_metadata.display_name || 'Sales Admin');
      setAvatarUrl(usr.user_metadata.avatar_url || '');
    } else {
      setDisplayName('Sales Admin');
      setAvatarUrl('');
    }
  };

  useEffect(() => {
    console.log(`[SUPABASE REQUEST] AuthContext + auth.onAuthStateChange + ${new Date().toISOString()}`);
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session);
        syncUserData(session?.user ?? null);
        setLoading(false);
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const signIn = async (email, password) => {
    console.log(`[SUPABASE REQUEST] AuthContext + auth.signInWithPassword + ${new Date().toISOString()}`);
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) throw error;
    return data;
  };

  const signOut = async () => {
    console.log(`[SUPABASE REQUEST] AuthContext + auth.signOut + ${new Date().toISOString()}`);
    await supabase.auth.signOut();
    setSession(null);
    setUser(null);
    setDisplayName('Sales Admin');
    setAvatarUrl('');
  };

  const updateProfileData = async ({ name, avatar, phone }) => {
    console.log(`[SUPABASE REQUEST] AuthContext + auth.updateUser + ${new Date().toISOString()}`);
    const newMetadata = {
      ...user?.user_metadata,
      full_name: name !== undefined ? name : (user?.user_metadata?.full_name || ''),
      avatar_url: avatar !== undefined ? avatar : (user?.user_metadata?.avatar_url || ''),
      phone: phone !== undefined ? phone : (user?.user_metadata?.phone || '')
    };

    const { data, error } = await supabase.auth.updateUser({
      data: newMetadata
    });

    if (error) throw error;
    if (data?.user) {
      syncUserData(data.user);
    }
    return data;
  };

  return (
    <AuthContext.Provider
      value={{
        session,
        user,
        loading,
        displayName,
        avatarUrl,
        signIn,
        signOut,
        updateProfileData
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
