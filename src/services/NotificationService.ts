import notifee, {
  AndroidImportance,
  TriggerType,
  AndroidCategory,
  AndroidVisibility,
} from '@notifee/react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Todo } from '../types/todo';

export const REMINDER_ID = 'recurring-reminder';
export const IDLE_REMINDER_ID = 'idle-reminder';
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

/**
 * Calculates time in milliseconds from H:M:S string
 */
export function getIntervalMs(intervalStr: string): number {
  const parts = intervalStr.split(':').map(p => parseFloat(p) || 0);
  const h = parts[0] || 0;
  const m = parts[1] || 0;
  const s = parts[2] || 0;
  return (h * 3600 + m * 60 + s) * 1000;
}

export async function scheduleNextReminder() {
  const savedTodos = await AsyncStorage.getItem('todo_list');
  const savedInterval = await AsyncStorage.getItem('reminder_interval'); // Format "H:M:S"

  const todoList: Todo[] = savedTodos ? JSON.parse(savedTodos) : [];

  // 1. Clear existing reminders
  await notifee.cancelNotification(REMINDER_ID);
  await notifee.cancelNotification(IDLE_REMINDER_ID);

  // 2. Feature: Idle Reminder (6 AM - 10 PM IST)
  if (todoList.length === 0) {
    await scheduleIdleReminder();
    return;
  }

  // 3. Regular Task Reminder
  const intervalMs = getIntervalMs(savedInterval || '1:0:0');
  if (intervalMs <= 0) return;

  const randomTodo = todoList[Math.floor(Math.random() * todoList.length)];

  const trigger = {
    type: TriggerType.TIMESTAMP,
    timestamp: Date.now() + intervalMs,
    alarmManager: true,
  };

  await notifee.createTriggerNotification(
    {
      id: REMINDER_ID,
      title: '🚨 TASK REMINDER',
      body: `Still pending: ${randomTodo.text}`,
      android: {
        channelId: CHANNEL_ID,
        importance: AndroidImportance.HIGH,
        priority: 'high',
        category: AndroidCategory.ALARM,
        fullScreenAction: {
          id: 'default',
        },
        pressAction: {
          id: 'default',
        },
      },
    },
    trigger,
  );
}

async function scheduleIdleReminder() {
  // IST is UTC+5:30
  const now = new Date();
  const utc = now.getTime() + (now.getTimezoneOffset() * 60000);
  const ist = new Date(utc + (3600000 * 5.5));

  const currentHourIST = ist.getHours();

  // Between 6 AM and 10 PM (22:00)
  if (currentHourIST >= 6 && currentHourIST < 22) {
    const trigger = {
      type: TriggerType.TIMESTAMP,
      timestamp: Date.now() + (2 * 60 * 60 * 1000), // Every 2 hours
      alarmManager: true,
    };

    await notifee.createTriggerNotification(
      {
        id: IDLE_REMINDER_ID,
        title: '💡 Time to be productive!',
        body: 'Your todo list is empty. Add something to do!',
        android: {
          channelId: CHANNEL_ID,
          importance: AndroidImportance.HIGH,
          category: AndroidCategory.REMINDER,
          pressAction: { id: 'default' },
        },
      },
      trigger,
    );
  }
}
