import notifee, {
  AndroidImportance,
  TriggerType,
  AndroidCategory,
} from '@notifee/react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Todo } from '../types/todo';

export const REMINDER_ID = 'recurring-reminder';
export const CHANNEL_ID = 'reminder';

export async function setupNotifications() {
  await notifee.requestPermission();
  await notifee.createChannel({
    id: CHANNEL_ID,
    name: 'Todo Reminders',
    importance: AndroidImportance.HIGH,
  });
}

export async function scheduleNextReminder() {
  const savedTodos = await AsyncStorage.getItem('todo_list');
  const savedInterval = await AsyncStorage.getItem('reminder_interval');

  const todoList: Todo[] = savedTodos ? JSON.parse(savedTodos) : [];
  const hours = parseFloat(savedInterval || '1');

  if (todoList.length === 0 || isNaN(hours) || hours <= 0) {
    await notifee.cancelAllNotifications();
    return;
  }

  // Clear existing to avoid duplicates
  await notifee.cancelNotification(REMINDER_ID);

  const randomTodo = todoList[Math.floor(Math.random() * todoList.length)];

  const trigger = {
    type: TriggerType.TIMESTAMP,
    timestamp: Date.now() + (hours * 60 * 60 * 1000),
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
