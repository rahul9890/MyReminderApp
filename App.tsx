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
  const [intervalHours, setIntervalHours] = useState('1');
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      try {
        const savedTodos = await AsyncStorage.getItem('todo_list');
        const savedInterval = await AsyncStorage.getItem('reminder_interval');
        if (savedTodos) setTodoList(JSON.parse(savedTodos));
        if (savedInterval) setIntervalHours(savedInterval);
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
      AsyncStorage.setItem('todo_list', JSON.stringify(todoList));
      AsyncStorage.setItem('reminder_interval', intervalHours);
      scheduleNextReminder();
    }
  }, [todoList, intervalHours, isLoaded]);

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
          <Text style={styles.label}>Remind every</Text>
          <TextInput
            style={styles.intervalInput}
            keyboardType="numeric"
            value={intervalHours}
            onChangeText={setIntervalHours}
          />
          <Text style={styles.label}>hours</Text>
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
