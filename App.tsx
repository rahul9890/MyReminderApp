import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  SafeAreaView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  KeyboardAvoidingView,
  Platform,
  AppState,
  Alert,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Todo } from './src/types/todo';
import { setupNotifications } from './src/services/NotificationService';
import {
  syncTodosToOverlay,
  saveIntervalToOverlay,
  scheduleAlarm,
  scheduleDailyNudge,
  getTodosFromOverlay,
  checkOverlayPermission,
  requestOverlayPermission,
} from './src/services/OverlayService';
import { DraggableTodoList } from './src/components/DraggableTodoList';
import { styles } from './src/styles/AppStyles';

function App() {
  const [todo, setTodo] = useState('');
  const [todoList, setTodoList] = useState<Todo[]>([]);
  const [hours, setHours] = useState('1');
  const [minutes, setMinutes] = useState('0');
  const [seconds, setSeconds] = useState('0');
  const [isLoaded, setIsLoaded] = useState(false);

  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  // Trackdfsdfdsf if we've done initial scheduling so we don't double-schedule on mount
  const didSchedule = useRef(false);

  // ── On mount: load data, request permissions, and kick off the alarm chain ─
  useEffect(() => {
    (async () => {
      try {
        // 1. Ask for notification permission first (quick in-app system dialog),
        //    then chain the overlay rationale so both prompts feel like one flow.
        await setupNotifications();

        const hasOverlay = await checkOverlayPermission();
        if (!hasOverlay) {
          Alert.alert(
            'Allow display over other apps',
            'My Reminders needs permission to show your tasks as a floating popup over other apps. Tap Open Settings and enable "Display over other apps".',
            [
              { text: 'Not now', style: 'cancel' },
              { text: 'Open Settings', onPress: () => requestOverlayPermission() },
            ],
          );
        }

        // 3. Load saved data
        const [savedTodos, savedInterval] = await Promise.all([
          AsyncStorage.getItem('todo_list'),
          AsyncStorage.getItem('reminder_interval'),
        ]);

        let loadedTodos: Todo[] = [];
        if (savedTodos) loadedTodos = JSON.parse(savedTodos);

        if (savedInterval) {
          const [h, m, s] = savedInterval.split(':');
          setHours(h || '0');
          setMinutes(m || '0');
          setSeconds(s || '0');
        }

        // 4. Reconcile with SharedPreferences (user may have ticked tasks done in the overlay)
        const overlayJson = await getTodosFromOverlay();
        if (overlayJson !== null) {
          try {
            const overlayTodos: Todo[] = JSON.parse(overlayJson);
            // Trust the overlay list — it may have fewer items (ticked done)
            if (overlayTodos.length < loadedTodos.length) {
              loadedTodos = overlayTodos;
            }
          } catch (_) {}
        }

        setTodoList(loadedTodos);
      } catch (e) {
        console.error('Failed to load data', e);
      } finally {
        setIsLoaded(true);
      }
    })();
  }, []);

  // ── After load: push data to native and start the alarm chain once ─────────
  useEffect(() => {
    if (!isLoaded || didSchedule.current) return;
    didSchedule.current = true;
    syncTodosToOverlay(todoList);
    saveIntervalToOverlay(hours, minutes, seconds);
    scheduleAlarm();
    scheduleDailyNudge();
  }, [isLoaded]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── When interval changes: update SharedPreferences and reschedule now ─────
  const prevInterval = useRef(`${hours}:${minutes}:${seconds}`);
  useEffect(() => {
    if (!isLoaded) return;
    const current = `${hours}:${minutes}:${seconds}`;
    if (current === prevInterval.current) return;
    prevInterval.current = current;
    saveIntervalToOverlay(hours, minutes, seconds);
    scheduleAlarm();
  }, [hours, minutes, seconds, isLoaded]);

  // ── Debounced persist of todos to AsyncStorage ─────────────────────────────
  useEffect(() => {
    if (!isLoaded) return;
    // Sync overlay immediately (lightweight SharedPreferences write)
    syncTodosToOverlay(todoList);
    // Debounce the heavier AsyncStorage write
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => {
      AsyncStorage.setItem('todo_list', JSON.stringify(todoList));
    }, 400);
    return () => { if (saveTimer.current) clearTimeout(saveTimer.current); };
  }, [todoList, isLoaded]);

  // ── Persist interval to AsyncStorage (debounced) ───────────────────────────
  useEffect(() => {
    if (!isLoaded) return;
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => {
      AsyncStorage.setItem('reminder_interval', `${hours}:${minutes}:${seconds}`);
    }, 400);
  }, [hours, minutes, seconds, isLoaded]);

  // ── Re-sync when app comes back to foreground (overlay may have changed data)
  useEffect(() => {
    const sub = AppState.addEventListener('change', async state => {
      if (state === 'active') {
        const overlayJson = await getTodosFromOverlay();
        if (overlayJson === null) return;
        try {
          const overlayTodos: Todo[] = JSON.parse(overlayJson);
          setTodoList(prev => {
            if (overlayTodos.length < prev.length) return overlayTodos;
            return prev;
          });
        } catch (_) {}
      }
    });
    return () => sub.remove();
  }, []);

  // ── Todo mutations ─────────────────────────────────────────────────────────
  const addTodo = useCallback(() => {
    const trimmed = todo.trim();
    if (!trimmed) return;
    setTodoList(prev => [...prev, { id: Date.now().toString(), text: trimmed }]);
    setTodo('');
  }, [todo]);

  const removeTodo = useCallback((id: string) => {
    setTodoList(prev => prev.filter(item => item.id !== id));
  }, []);

  const editTodo = useCallback((id: string, text: string) => {
    setTodoList(prev => prev.map(item => item.id === id ? { ...item, text } : item));
  }, []);

  const reorderTodos = useCallback((newList: Todo[]) => {
    setTodoList(newList);
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>My Reminders</Text>

        <View style={styles.settingsRow}>
          <Text style={styles.label}>Remind me every:</Text>
          <View style={styles.timeInputContainer}>
            <View style={styles.timeBox}>
              <TextInput
                style={styles.intervalInput}
                keyboardType="numeric"
                value={hours}
                onChangeText={setHours}
                placeholder="0"
              />
              <Text style={styles.timeLabel}>HRS</Text>
            </View>
            <Text style={styles.timeSeparator}>:</Text>
            <View style={styles.timeBox}>
              <TextInput
                style={styles.intervalInput}
                keyboardType="numeric"
                value={minutes}
                onChangeText={setMinutes}
                placeholder="0"
              />
              <Text style={styles.timeLabel}>MIN</Text>
            </View>
            <Text style={styles.timeSeparator}>:</Text>
            <View style={styles.timeBox}>
              <TextInput
                style={styles.intervalInput}
                keyboardType="numeric"
                value={seconds}
                onChangeText={setSeconds}
                placeholder="0"
              />
              <Text style={styles.timeLabel}>SEC</Text>
            </View>
          </View>
        </View>
      </View>

      <DraggableTodoList
        todos={todoList}
        onReorder={reorderTodos}
        onRemove={removeTodo}
        onEdit={editTodo}
      />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.inputWrapper}
      >
        <TextInput
          style={styles.input}
          placeholder="Write a task"
          value={todo}
          onChangeText={setTodo}
          onSubmitEditing={addTodo}
          returnKeyType="done"
        />
        <TouchableOpacity onPress={addTodo}>
          <View style={styles.addWrapper}>
            <Text style={styles.addText}>+</Text>
          </View>
        </TouchableOpacity>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

export default App;
