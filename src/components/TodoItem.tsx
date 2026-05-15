import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { Todo } from '../types/todo';
import { styles } from '../styles/TodoItemStyles';

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
