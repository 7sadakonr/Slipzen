import React, { useState } from 'react';
import { View, StyleSheet, Text } from 'react-native';
import { Input } from '../../../components/ui/input';
import { Button } from '../../../components/ui/button';
import { useAuth } from '../hooks/use-auth';
import { registerSchema } from '../../../validation/auth';

export function RegisterForm() {
  const { register, isLoading } = useAuth();
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleRegister = async () => {
    try {
      setErrors({});
      // Validate
      registerSchema.parse({ displayName, email, password, confirmPassword });
      
      await register({ displayName, email, password, confirmPassword });
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
      <Input
        label="Display Name"
        placeholder="Enter your name"
        value={displayName}
        onChangeText={setDisplayName}
        error={errors.displayName}
      />
      <Input
        label="Email"
        placeholder="Enter your email"
        keyboardType="email-address"
        autoCapitalize="none"
        value={email}
        onChangeText={setEmail}
        error={errors.email}
      />
      <Input
        label="Password"
        placeholder="Create a password (min 8 chars)"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
        error={errors.password}
      />
      <Input
        label="Confirm Password"
        placeholder="Type password again"
        secureTextEntry
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

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  button: {
    marginTop: 16,
  },
});
