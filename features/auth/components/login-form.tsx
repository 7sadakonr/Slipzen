import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { Input } from '../../../components/ui/input';
import { Button } from '../../../components/ui/button';
import { useAuth } from '../hooks/use-auth';
import { loginSchema } from '../../../validation/auth';

export function LoginForm() {
  const { login, isLoading } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleLogin = async () => {
    try {
      // Validate
      setErrors({});
      loginSchema.parse({ email, password });
      
      await login({ email, password });
    } catch (err: any) {
      if (err.errors) {
        // Zod error
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
        placeholder="Enter your password"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
        error={errors.password}
      />
      <Button 
        title="Login" 
        onPress={handleLogin} 
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
    marginTop: 8,
  },
});
