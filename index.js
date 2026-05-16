/**
 * @format
 */

import { AppRegistry } from 'react-native';
import App from './App';
import { name as appName } from './app.json';

// Background events from notifee are no longer needed for rescheduling —
// the native ReminderReceiver self-reschedules on every alarm tick.
// Keep the handler registered so notifee doesn't warn about missing it.
import notifee from '@notifee/react-native';
notifee.onBackgroundEvent(async () => {});

AppRegistry.registerComponent(appName, () => App);
