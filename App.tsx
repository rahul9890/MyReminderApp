import React, { useState, useEffect } from 'react';
import {
  SafeAreaView,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  View,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import notifee, { EventType } from '@notifee/react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Todo } from './src/types/todo';
import { setupNotifications, scheduleNextReminder } from './src/services/NotificationService';
import { TodoItem } from './src/components/TodoItem';
import { styles } from './src/styles/AppStyles';

function App() {
  const [todo, setTodo] = useState('');
  const [todoList, setTodoList] = useState<Todo[]>([]);

  // HMS State
  const [hours, setHours] = useState('1');
  const [minutes, setMinutes] = useState('0');
  const [seconds, setSeconds] = useState('0');

  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      try {
        const savedTodos = await AsyncStorage.getItem('todo_list');
        const savedInterval = await AsyncStorage.getItem('reminder_interval'); // Format "H:M:S"

        if (savedTodos) setTodoList(JSON.parse(savedTodos));

        if (savedInterval) {
          const parts = savedInterval.split(':');
          setHours(parts[0] || '0');
          setMinutes(parts[1] || '0');
          setSeconds(parts[2] || '0');
        }
      } catch (e) {
        console.error('Failed to load data', e);
      } finally {
        setIsLoaded(true);
      }
    };
    loadData();
  }, []);

  useEffect(() => {
    if (isLoaded) {
      const intervalStr = `${hours}:${minutes}:${seconds}`;
      AsyncStorage.setItem('todo_list', JSON.stringify(todoList));
      AsyncStorage.setItem('reminder_interval', intervalStr);
      scheduleNextReminder();
    }
  }, [todoList, hours, minutes, seconds, isLoaded]);

  useEffect(() => {
    setupNotifications();

    const unsubscribe = notifee.onForegroundEvent(({ type }) => {
      if (type === EventType.DISMISSED || type === EventType.PRESS) {
        scheduleNextReminder();
      }
    });

    return () => unsubscribe();
  }, []);

  const addTodo = () => {
    if (todo.trim().length > 0) {
      setTodoList([...todoList, { id: Date.now().toString(), text: todo }]);
      setTodo('');
    }
  };

  const removeTodo = (id: string) => {
    setTodoList(todoList.filter((item) => item.id !== id));
  };

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

      <FlatList
        data={todoList}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TodoItem item={item} onRemove={removeTodo} />
        )}
        contentContainerStyle={styles.listContent}
      />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.inputWrapper}
      >
        <TextInput
          style={styles.input}
          placeholder={'Write a task'}
          value={todo}
          onChangeText={(text) => setTodo(text)}
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
