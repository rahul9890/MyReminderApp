/**
 * @format
 */

import { AppRegistry } from 'react-native';
import App from './App';
import { name as appName } from './app.json';
import notifee, { EventType } from '@notifee/react-native';
import { scheduleNextReminder } from './src/services/NotificationService';

// Background event handler
notifee.onBackgroundEvent(async ({ type, detail }) => {
  if (type === EventType.DISMISSED || type === EventType.PRESS) {
    // Reschedule the next reminder when the current one is dealt with
    await scheduleNextReminder();
  }
});

AppRegistry.registerComponent(appName, () => App);
