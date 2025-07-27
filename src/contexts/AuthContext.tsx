import { createClient, User, Session } from '@supabase/supabase-js';
import React, { createContext, useContext, useEffect, useState } from 'react';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true); // Start with loading true
  const [error, setError] = useState<string | null>(null);

  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://placeholder.supabase.co';
  const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'placeholder_key';
  
  const supabase = createClient(supabaseUrl, supabaseKey);

  // Check if credentials are valid
  const hasValidCredentials = supabaseUrl !== 'https://placeholder.supabase.co' && 
                             supabaseKey !== 'placeholder_key' &&
                             supabaseUrl !== '' && 
                             supabaseKey !== '';

  useEffect(() => {
    // Function to check session
    const checkSession = async () => {
      try {
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Error getting session:', error);
          setError(error.message);
        } else if (data?.session) {
          setUser(data.session.user);
        }
      } catch (err) {
        console.error('Unexpected error during session check:', err);
      } finally {
        // Always set loading to false after checking session
        setLoading(false);
      }
    };

    // If we have valid credentials, check the session
    if (hasValidCredentials) {
      checkSession();

      // Set up auth state change listener
      const { data: authListener } = supabase.auth.onAuthStateChange(
        (event, session) => {
          if (event === 'SIGNED_IN' && session) {
            setUser(session.user);
          } else if (event === 'SIGNED_OUT') {
            setUser(null);
          }
        }
      );

      return () => {
        // Clean up the subscription
        if (authListener && authListener.subscription) {
          authListener.subscription.unsubscribe();
        }
      };
    } else {
      // If no valid credentials, just set loading to false
      console.warn('Supabase credentials not provided. Authentication will not work.');
      setLoading(false);
    }
  }, [supabase, hasValidCredentials]);

  const signIn = async (email: string, password: string) => {
    if (!hasValidCredentials) {
      throw new Error('Supabase credentials not configured. Please set up your environment variables.');
    }

    try {
      setLoading(true);
      setError(null);
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        setError(error.message);
      } else if (data?.user) {
        setUser(data.user);
      }
    } catch (err) {
      setError('An unexpected error occurred during sign in');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (email: string, password: string) => {
    if (!hasValidCredentials) {
      throw new Error('Supabase credentials not configured. Please set up your environment variables.');
    }

    try {
      setLoading(true);
      setError(null);
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) {
        setError(error.message);
      } else if (data?.user) {
        setUser(data.user);
      }
    } catch (err) {
      setError('An unexpected error occurred during sign up');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    if (!hasValidCredentials) {
      throw new Error('Supabase credentials not configured. Please set up your environment variables.');
    }

    try {
      setLoading(true);
      setError(null);
      
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        setError(error.message);
      } else {
        setUser(null);
      }
    } catch (err) {
      setError('An unexpected error occurred during sign out');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const value = {
    user,
    loading,
    error,
    signIn,
    signUp,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}; 