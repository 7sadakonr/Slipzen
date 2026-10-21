import { Stack, useRouter } from 'expo-router';
import { useTheme } from '../../theme';
import { HeaderButton } from '../../components/ui/header-button';

export default function AccountLayout() {
  const router = useRouter();
  const { colors } = useTheme();

  return (
    <Stack
      screenOptions={{
        headerTintColor: colors.textPrimary,
        headerTitleStyle: { color: colors.textPrimary },
        headerShadowVisible: false,
        contentStyle: { backgroundColor: colors.background },
      }}
    >
      <Stack.Screen
        name="password"
        options={{
          title: 'Change Password',
          headerLeft: () => <HeaderButton title="Cancel" onPress={() => router.back()} />,
        }}
      />
    </Stack>
  );
}
