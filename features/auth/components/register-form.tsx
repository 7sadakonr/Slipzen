import React, { useRef, useState } from 'react';
import { View, StyleSheet, Text, TextInput } from 'react-native';
import { Input } from '../../../components/ui/input';
import { Button } from '../../../components/ui/button';
import { useAuth } from '../hooks/use-auth';
import { registerSchema } from '../../../validation/auth';
import { makeStyles } from '../../../theme';
import { AvatarPicker } from '../../../components/ui/avatar-picker';
import { pickAvatarImage, AvatarSource } from '../hooks/use-avatar';
import { Alert } from 'react-native';

export function RegisterForm() {
  const styles = useStyles();
  const { register, isLoading } = useAuth();
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const emailRef = useRef<TextInput>(null);
  const passwordRef = useRef<TextInput>(null);
  const confirmRef = useRef<TextInput>(null);
  const [avatar, setAvatar] = useState<{ uri: string; base64: string } | null>(null);

  const handlePickAvatar = async (source: AvatarSource) => {
    try {
      const picked = await pickAvatarImage(source);
      if (picked) setAvatar(picked);
    } catch (err: any) {
      Alert.alert('Photo', err.message);
    }
  };

  const handleRegister = async () => {
    try {
      setErrors({});
      // Validate
      registerSchema.parse({ displayName, email, password, confirmPassword });
      
      await register({ displayName, email, password, confirmPassword }, avatar?.base64);
    } catch (err: any) {
      if (err.errors) {
        // Zod error mapping
        const fieldErrors: Record<string, string> = {};
        err.errors.forEach((e: any) => {
          if (e.path[0]) fieldErrors[e.path[0].toString()] = e.message;
        });
        setErrors(fieldErrors);
      }
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.avatarRow}>
        <AvatarPicker
          name={displayName}
          imageUri={avatar?.uri}
          onPick={handlePickAvatar}
          onRemove={() => setAvatar(null)}
        />
        <Text style={styles.avatarHint}>Add a profile picture (optional)</Text>
      </View>

      <Input
        label="Display Name"
        returnKeyType="next"
        onSubmitEditing={() => emailRef.current?.focus()}
        placeholder="Enter your name"
        value={displayName}
        onChangeText={setDisplayName}
        error={errors.displayName}
      />
      <Input
        ref={emailRef}
        label="Email"
        returnKeyType="next"
        onSubmitEditing={() => passwordRef.current?.focus()}
        placeholder="you@example.com"
        keyboardType="email-address"
        autoCapitalize="none"
        value={email}
        onChangeText={setEmail}
        error={errors.email}
      />
      <Input
        ref={passwordRef}
        label="Password"
        returnKeyType="next"
        onSubmitEditing={() => confirmRef.current?.focus()}
        placeholder="Create a password (min 8 chars)"
        secureTextEntry
        secureToggle
        value={password}
        onChangeText={setPassword}
        error={errors.password}
      />
      <Input
        ref={confirmRef}
        label="Confirm Password"
        returnKeyType="done"
        onSubmitEditing={handleRegister}
        placeholder="Type password again"
        secureTextEntry
        secureToggle
        value={confirmPassword}
        onChangeText={setConfirmPassword}
        error={errors.confirmPassword}
      />
      
      <Button 
        title="Create Account" 
        onPress={handleRegister} 
        loading={isLoading} 
        style={styles.button} 
      />
    </View>
  );
}

const useStyles = makeStyles((colors) => ({
  container: {
    width: '100%',
  },
  button: {
    marginTop: 16,
  },
  avatarRow: {
    alignItems: 'center',
    gap: 12,
    marginBottom: 28,
  },
  avatarHint: {
    fontSize: 13,
    color: colors.textSecondary,
  },
}));
