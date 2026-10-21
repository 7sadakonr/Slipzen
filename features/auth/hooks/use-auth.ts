import { useState } from 'react';
import { supabase } from '../../../lib/supabase';
import { LoginInput, RegisterInput } from '../../../validation/auth';
import { Alert } from 'react-native';
import { uploadAvatar } from './use-avatar';

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

  const register = async (data: RegisterInput, avatarBase64?: string | null) => {
    setIsLoading(true);
    try {
      const { data: signUpData, error } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          data: {
            display_name: data.displayName,
          },
        },
      });
      if (error) throw error;

      // Profile picture is optional and must never make sign-up fail
      let avatarSaved = !avatarBase64;
      if (avatarBase64 && signUpData.session && signUpData.user) {
        try {
          await uploadAvatar(avatarBase64, signUpData.user.id);
          avatarSaved = true;
        } catch {
          avatarSaved = false;
        }
      }

      Alert.alert(
        'Welcome to Slipzen',
        avatarSaved
          ? 'Your account is ready.'
          : 'Your account is ready. You can add a profile picture from the Profile tab.'
      );
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
