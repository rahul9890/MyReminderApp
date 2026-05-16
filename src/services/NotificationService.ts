import notifee, { AndroidImportance, AndroidVisibility } from '@notifee/react-native';

export const CHANNEL_ID = 'reminder';

export async function setupNotifications() {
  await notifee.requestPermission();
  await notifee.createChannel({
    id: CHANNEL_ID,
    name: 'Todo Reminders',
    importance: AndroidImportance.HIGH,
    visibility: AndroidVisibility.PUBLIC,
  });
}

export function getIntervalMs(intervalStr: string): number {
  const parts = intervalStr.split(':').map(p => parseFloat(p) || 0);
  return ((parts[0] || 0) * 3600 + (parts[1] || 0) * 60 + (parts[2] || 0)) * 1000;
}
