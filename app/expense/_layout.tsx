import { Stack, useRouter } from 'expo-router';
import { useTheme } from '../../theme';
import { HeaderButton } from '../../components/ui/header-button';

export default function ExpenseLayout() {
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
      <Stack.Screen
        name="add"
        options={{
          title: 'Add Expense',
          presentation: 'modal',
          headerLeft: () => <HeaderButton title="Cancel" onPress={() => router.back()} />,
        }}
      />
      <Stack.Screen name="[id]" options={{ title: 'Expense Details' }} />
    </Stack>
  );
}
