import React, { memo, useState, useCallback } from 'react';
import { View, Text, TextInput, TouchableOpacity } from 'react-native';
import { Todo } from '../types/todo';
import { styles } from '../styles/TodoItemStyles';

interface Props {
  item: Todo;
  onRemove: (id: string) => void;
  onEdit: (id: string, text: string) => void;
  isDragging?: boolean;
  dragHandlers?: object;
}

export const TodoItem: React.FC<Props> = memo(
  ({ item, onRemove, onEdit, isDragging, dragHandlers }) => {
    const [editing, setEditing] = useState(false);
    const [editText, setEditText] = useState(item.text);

    const startEdit = useCallback(() => {
      setEditText(item.text);
      setEditing(true);
    }, [item.text]);

    const saveEdit = useCallback(() => {
      const trimmed = editText.trim();
      if (trimmed) onEdit(item.id, trimmed);
      setEditing(false);
    }, [editText, item.id, onEdit]);

    const cancelEdit = useCallback(() => {
      setEditText(item.text);
      setEditing(false);
    }, [item.text]);

    return (
      <View style={[styles.todoItem, isDragging && styles.todoItemDragging]}>
        {/* Drag handle — attach panHandlers here */}
        <View {...dragHandlers} style={styles.dragHandle} hitSlop={{ top: 12, bottom: 12, left: 8, right: 8 }}>
          <Text style={styles.dragIcon}>⠿</Text>
        </View>

        {/* Content */}
        {editing ? (
          <TextInput
            style={styles.editInput}
            value={editText}
            onChangeText={setEditText}
            autoFocus
            multiline
            selectTextOnFocus
            blurOnSubmit
            onSubmitEditing={saveEdit}
          />
        ) : (
          <TouchableOpacity onPress={startEdit} style={styles.textContainer} activeOpacity={0.7}>
            <Text style={styles.todoText}>{item.text}</Text>
          </TouchableOpacity>
        )}

        {/* Actions */}
        {editing ? (
          <View style={styles.editActions}>
            <TouchableOpacity onPress={saveEdit} style={styles.actionBtn}>
              <Text style={styles.saveBtn}>✓</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={cancelEdit} style={styles.actionBtn}>
              <Text style={styles.cancelBtn}>✕</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity onPress={() => onRemove(item.id)}>
            <Text style={styles.deleteBtn}>Done</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  },
);
