import { useState } from 'react';
import { supabase } from '../../../lib/supabase';
import { LoginInput, RegisterInput } from '../../../validation/auth';
import { Alert } from 'react-native';

export function useAuth() {
  const [isLoading, setIsLoading] = useState(false);

  const login = async (data: LoginInput) => {
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: data.email,
        password: data.password,
      });
      if (error) throw error;
    } catch (error: any) {
      Alert.alert('Login Failed', error.message);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (data: RegisterInput) => {
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          data: {
            display_name: data.displayName,
          },
        },
      });
      if (error) throw error;
      Alert.alert('Success', 'Registration successful! You are now logged in.');
    } catch (error: any) {
      Alert.alert('Registration Failed', error.message);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
    } catch (error: any) {
      Alert.alert('Logout Failed', error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    login,
    register,
    logout,
    isLoading,
  };
}
