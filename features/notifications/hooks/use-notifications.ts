import { useState, useEffect, useCallback } from 'react';
import * as Notifications from 'expo-notifications';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../../../lib/supabase';

const LAST_READ_KEY = '@slipzen_noti_last_read_v1';

export interface AppNotification {
  id: string;
  title: string;
  body: string;
  timestamp: number;
  type: 'budget' | 'system' | 'general';
}

export function useNotifications(month?: number, year?: number) {
  const queryClient = useQueryClient();
  const [lastReadTimestamp, setLastReadTimestamp] = useState<number>(0);

  // 1. Load last read timestamp from AsyncStorage on mount
  useEffect(() => {
    AsyncStorage.getItem(LAST_READ_KEY)
      .then((val) => {
        if (val) {
          setLastReadTimestamp(parseInt(val, 10));
        }
      })
      .catch(() => {});
  }, []);

  // 2. Fetch notifications from DB and system tray
  const now = new Date();
  const currentMonth = month ?? now.getMonth() + 1;
  const currentYear = year ?? now.getFullYear();

  const { data: notifications = [], refetch, isLoading } = useQuery<AppNotification[]>({
    queryKey: ['notifications', currentMonth, currentYear],
    queryFn: async () => {
      const notifList: AppNotification[] = [];

      try {
        // A. Delivered system notifications from expo-notifications
        const presented = await Notifications.getPresentedNotificationsAsync().catch(() => []);
        presented.forEach((n) => {
          notifList.push({
            id: n.request.identifier,
            title: n.request.content.title || 'Notification',
            body: n.request.content.body || '',
            timestamp: n.date ? new Date(n.date).getTime() : Date.now(),
            type: 'system',
          });
        });

        // B. Budget alert logs from Supabase
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const { data: alertLogs } = await supabase
            .from('budget_alert_log')
            .select(`
              id,
              threshold,
              triggered_at,
              budgets (
                category_id,
                categories ( name )
              )
            `)
            .eq('user_id', user.id)
            .order('triggered_at', { ascending: false })
            .limit(10);

          if (alertLogs && alertLogs.length > 0) {
            alertLogs.forEach((log: any) => {
              const categoryName = log.budgets?.categories?.name || 'Overall';
              const isOver = log.threshold >= 100;
              notifList.push({
                id: log.id,
                title: isOver ? `Budget Exceeded: ${categoryName}` : `Budget Warning: ${categoryName}`,
                body: isOver
                  ? `You have exceeded 100% of your ${categoryName} budget!`
                  : `You have reached ${log.threshold}% of your ${categoryName} budget limit.`,
                timestamp: new Date(log.triggered_at).getTime(),
                type: 'budget',
              });
            });
          }
        }
      } catch (err) {
        console.warn('Failed to fetch notifications:', err);
      }

      // Sort newest first
      return notifList.sort((a, b) => b.timestamp - a.timestamp);
    },
    staleTime: 30 * 1000,
  });

  // Keep read state in sync when another screen marks everything as read
  useEffect(() => {
    AsyncStorage.getItem(LAST_READ_KEY)
      .then((val) => {
        if (val) setLastReadTimestamp(parseInt(val, 10));
      })
      .catch(() => {});
  }, [notifications]);

  // 3. Realtime listener for incoming push/local notifications
  useEffect(() => {
    const subscription = Notifications.addNotificationReceivedListener(() => {
      refetch();
    });

    return () => {
      subscription.remove();
    };
  }, [refetch]);

  // 4. Compute unread notifications compared against lastReadTimestamp
  const unreadNotifications = notifications.filter((n) => n.timestamp > lastReadTimestamp);
  const unreadCount = unreadNotifications.length;
  const hasUnread = unreadCount > 0;

  // 5. Mark all as read action
  const markAllAsRead = useCallback(async () => {
    const newTimestamp = Date.now();
    setLastReadTimestamp(newTimestamp);
    await AsyncStorage.setItem(LAST_READ_KEY, newTimestamp.toString()).catch(() => {});
    await Notifications.dismissAllNotificationsAsync().catch(() => {});
    queryClient.invalidateQueries({ queryKey: ['notifications'] });
  }, [queryClient]);

  return {
    notifications,
    unreadNotifications,
    unreadCount,
    hasUnread,
    markAllAsRead,
    refetch,
    isLoading,
  };
}
