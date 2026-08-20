import { Stack, useRouter } from 'expo-router';
import { TouchableOpacity, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography } from '../../theme';

export default function CategoriesLayout() {
  const router = useRouter();

  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: colors.background },
        headerTintColor: colors.primary,
        headerTitleStyle: { color: colors.textPrimary },
        headerShadowVisible: false,
      }}
    >
      <Stack.Screen 
        name="index" 
        options={{ 
          title: 'Categories',
          headerLeft: () => (
            <TouchableOpacity onPress={() => router.back()} style={{ paddingRight: 16, flexDirection: 'row', alignItems: 'center' }}>
              <Ionicons name="chevron-back" size={24} color={colors.primary} />
              <Text style={{ color: colors.primary, ...typography.body }}>Back</Text>
            </TouchableOpacity>
          )
        }} 
      />
      <Stack.Screen 
        name="edit" 
        options={{ 
          title: 'Category',
          presentation: 'modal',
          headerLeft: () => (
            <TouchableOpacity onPress={() => router.back()} style={{ paddingRight: 16 }}>
              <Text style={{ color: colors.primary, ...typography.body }}>Cancel</Text>
            </TouchableOpacity>
          )
        }} 
      />
    </Stack>
  );
}
