import React, { useRef, useState, useMemo, useCallback } from 'react';
import { ScrollView, PanResponder } from 'react-native';
import { Todo } from '../types/todo';
import { TodoItem } from './TodoItem';

interface Props {
  todos: Todo[];
  onReorder: (todos: Todo[]) => void;
  onRemove: (id: string) => void;
  onEdit: (id: string, text: string) => void;
}

// Approximate height of each todo item (paddingVertical 12*2 + text ~20 + marginBottom 12)
const ITEM_HEIGHT = 68;

export const DraggableTodoList: React.FC<Props> = ({ todos, onReorder, onRemove, onEdit }) => {
  const [dragId, setDragId] = useState<string | null>(null);
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);

  // Shared mutable ref to avoid stale closures inside cached PanResponders
  const stateRef = useRef({
    todos,
    onReorder,
    dragIndex: null as number | null,
    hoverIndex: null as number | null,
  });
  stateRef.current.todos = todos;
  stateRef.current.onReorder = onReorder;

  // PanResponders cached by todo id so they are not recreated on every render
  const panCache = useRef<Record<string, ReturnType<typeof PanResponder.create>>>({});

  const commitDrag = useCallback(() => {
    const { dragIndex: di, hoverIndex: hi, todos: ts, onReorder: reorder } = stateRef.current;
    if (di !== null && hi !== null && di !== hi) {
      const next = [...ts];
      const [moved] = next.splice(di, 1);
      next.splice(hi, 0, moved);
      reorder(next);
    }
    stateRef.current.dragIndex = null;
    stateRef.current.hoverIndex = null;
    setDragId(null);
    setHoverIndex(null);
  }, []);

  const getPanResponder = useCallback(
    (todoId: string) => {
      if (!panCache.current[todoId]) {
        panCache.current[todoId] = PanResponder.create({
          onStartShouldSetPanResponder: () => true,
          onMoveShouldSetPanResponder: (_, gs) => Math.abs(gs.dy) > 3,

          onPanResponderGrant: () => {
            const idx = stateRef.current.todos.findIndex(t => t.id === todoId);
            stateRef.current.dragIndex = idx;
            stateRef.current.hoverIndex = idx;
            setDragId(todoId);
            setHoverIndex(idx);
          },

          onPanResponderMove: (_, gs) => {
            const di = stateRef.current.dragIndex;
            if (di === null) return;
            const newHover = Math.max(
              0,
              Math.min(
                stateRef.current.todos.length - 1,
                Math.round(di + gs.dy / ITEM_HEIGHT),
              ),
            );
            if (newHover !== stateRef.current.hoverIndex) {
              stateRef.current.hoverIndex = newHover;
              setHoverIndex(newHover);
            }
          },

          onPanResponderRelease: commitDrag,
          onPanResponderTerminate: commitDrag,
        });
      }
      return panCache.current[todoId];
    },
    [commitDrag],
  );

  // Reorder items visually while dragging so the user sees live feedback
  const displayTodos = useMemo(() => {
    if (!dragId || hoverIndex === null) return todos;
    const di = todos.findIndex(t => t.id === dragId);
    if (di === -1) return todos;
    const result = [...todos];
    const [item] = result.splice(di, 1);
    result.splice(hoverIndex, 0, item);
    return result;
  }, [todos, dragId, hoverIndex]);

  return (
    <ScrollView
      scrollEnabled={!dragId}
      contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 20 }}
      keyboardShouldPersistTaps="handled"
    >
      {displayTodos.map(item => (
        <TodoItem
          key={item.id}
          item={item}
          onRemove={onRemove}
          onEdit={onEdit}
          isDragging={item.id === dragId}
          dragHandlers={getPanResponder(item.id).panHandlers}
        />
      ))}
    </ScrollView>
  );
};
