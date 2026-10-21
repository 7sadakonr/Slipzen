import { Stack, useRouter } from 'expo-router';
import { useTheme } from '../../theme';
import { HeaderButton } from '../../components/ui/header-button';

export default function BudgetLayout() {
  const router = useRouter();
  const { colors } = useTheme();

  return (
    <Stack
      screenOptions={{
        headerTintColor: colors.textPrimary,
        headerTitleStyle: { color: colors.textPrimary },
        headerShadowVisible: false,
        headerBackButtonDisplayMode: 'minimal',
        contentStyle: { backgroundColor: colors.background },
      }}
    >
      <Stack.Screen name="index" options={{ title: 'Budgets' }} />
      <Stack.Screen
        name="set"
        options={{
          title: 'Set Budget',
          presentation: 'modal',
          headerLeft: () => <HeaderButton title="Cancel" onPress={() => router.back()} />,
        }}
      />
    </Stack>
  );
}
