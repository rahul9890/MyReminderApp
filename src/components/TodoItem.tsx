import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Todo } from '../types/todo';

interface Props {
  item: Todo;
  onRemove: (id: string) => void;
}

export const TodoItem: React.FC<Props> = ({ item, onRemove }) => {
  return (
    <View style={styles.todoItem}>
      <Text style={styles.todoText}>{item.text}</Text>
      <TouchableOpacity onPress={() => onRemove(item.id)}>
        <Text style={styles.deleteBtn}>Done</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  todoItem: {
    backgroundColor: '#FFF',
    padding: 15,
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
    elevation: 3,
  },
  todoText: { maxWidth: '80%', fontSize: 16, color: '#333' },
  deleteBtn: { color: '#FF5252', fontWeight: 'bold' },
});
