import { NativeModules } from 'react-native';
import { Todo } from '../types/todo';
import { getIntervalMs } from './NotificationService';

const { OverlayModule } = NativeModules;

export const syncTodosToOverlay = (todos: Todo[]): void => {
  OverlayModule?.saveTodos(JSON.stringify(todos));
};

export const saveIntervalToOverlay = (hours: string, minutes: string, seconds: string): void => {
  const ms = getIntervalMs(`${hours}:${minutes}:${seconds}`);
  OverlayModule?.saveInterval(ms);
};

export const scheduleAlarm = (): void => {
  OverlayModule?.scheduleAlarm();
};

export const cancelAlarm = (): void => {
  OverlayModule?.cancelAlarm();
};

export const scheduleDailyNudge = (): void => {
  OverlayModule?.scheduleDailyNudge?.();
};

/** Returns todos from SharedPreferences — may differ from AsyncStorage if the user
 *  ticked items done in the overlay while the app was closed. */
export const getTodosFromOverlay = (): Promise<string | null> => {
  return OverlayModule?.getTodos() ?? Promise.resolve(null);
};

export const checkOverlayPermission = (): Promise<boolean> => {
  return OverlayModule?.checkOverlayPermission() ?? Promise.resolve(false);
};

export const requestOverlayPermission = (): void => {
  OverlayModule?.requestOverlayPermission();
};
