import React, { useRef, useState } from 'react';
import { View, StyleSheet, TextInput } from 'react-native';
import { Input } from '../../../components/ui/input';
import { Button } from '../../../components/ui/button';
import { useAuth } from '../hooks/use-auth';
import { loginSchema } from '../../../validation/auth';
import { makeStyles } from '../../../theme';

export function LoginForm() {
  const styles = useStyles();
  const { login, isLoading } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const passwordRef = useRef<TextInput>(null);
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
        returnKeyType="next"
        onSubmitEditing={() => passwordRef.current?.focus()}
        textContentType="emailAddress"
        autoComplete="email"
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
        returnKeyType="go"
        onSubmitEditing={handleLogin}
        textContentType="password"
        placeholder="Password"
        secureTextEntry
        secureToggle
        value={password}
        onChangeText={setPassword}
        error={errors.password}
      />
      <Button 
        title="Sign in" 
        onPress={handleLogin} 
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
    marginTop: 12,
  },
}));
