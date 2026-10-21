import React from 'react';
import { ScrollView, RefreshControl, View } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { formatDistanceToNow } from 'date-fns';
import { ListGroup, ListRow, HeaderButton } from '../components/ui';
import { EmptyState } from '../components/feedback/empty-state';
import { useNotifications } from '../features/notifications/hooks/use-notifications';
import { makeStyles, spacing, useTheme } from '../theme';

export default function NotificationsScreen() {
  const styles = useStyles();
  const { colors } = useTheme();
  const router = useRouter();
  const { notifications, unreadNotifications, hasUnread, markAllAsRead, refetch, isLoading } = useNotifications();
  const unreadIds = new Set(unreadNotifications.map((n) => n.id));

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          title: 'Notifications',
          headerRight: () =>
            hasUnread ? (
              <HeaderButton title="Mark all read" onPress={markAllAsRead} bold />
            ) : null,
        }}
      />
      {notifications.length === 0 && !isLoading ? (
        <EmptyState
          ionicon="notifications-outline"
          title="You're all caught up"
          subtitle="Budget alerts show up here when you get close to a limit."
          action={{ label: 'Set a budget', onPress: () => router.push('/budget') }}
        />
      ) : (
        <ScrollView
          contentContainerStyle={styles.scroll}
          contentInsetAdjustmentBehavior="automatic"
          refreshControl={<RefreshControl refreshing={false} onRefresh={refetch} />}
        >
          <ListGroup>
            {notifications.map((n) => (
              <ListRow
                key={n.id}
                icon={n.type === 'budget' ? 'wallet-outline' : 'notifications-outline'}
                title={n.title}
                subtitle={`${n.body}  ·  ${formatDistanceToNow(new Date(n.timestamp), { addSuffix: true })}`}
                trailing={unreadIds.has(n.id) ? <View style={[styles.dot, { backgroundColor: colors.textPrimary }]} /> : undefined}
                chevron={n.type === 'budget'}
                onPress={n.type === 'budget' ? () => router.push('/budget') : undefined}
              />
            ))}
          </ListGroup>
        </ScrollView>
      )}
    </View>
  );
}

const useStyles = makeStyles((colors) => ({
  container: { flex: 1, backgroundColor: colors.background },
  scroll: { padding: spacing.lg, paddingBottom: 48 },
  dot: { width: 8, height: 8, borderRadius: 4 },
}));
