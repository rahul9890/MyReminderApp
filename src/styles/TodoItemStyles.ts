import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  todoItem: {
    backgroundColor: '#FFF',
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    elevation: 3,
  },
  todoItemDragging: {
    backgroundColor: '#EEF4FF',
    borderWidth: 1.5,
    borderColor: '#55BCF6',
    elevation: 8,
  },
  dragHandle: {
    paddingHorizontal: 6,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dragIcon: {
    fontSize: 18,
    color: '#CCCCCC',
  },
  textContainer: {
    flex: 1,
    paddingHorizontal: 8,
  },
  todoText: {
    fontSize: 15,
    color: '#333',
  },
  editInput: {
    flex: 1,
    fontSize: 15,
    color: '#333',
    backgroundColor: '#F5F9FF',
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#55BCF6',
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginHorizontal: 6,
    minHeight: 36,
  },
  editActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  actionBtn: {
    padding: 4,
  },
  saveBtn: {
    color: '#4CAF50',
    fontWeight: 'bold',
    fontSize: 18,
  },
  cancelBtn: {
    color: '#FF5252',
    fontWeight: 'bold',
    fontSize: 16,
  },
  deleteBtn: {
    color: '#FF5252',
    fontWeight: 'bold',
    fontSize: 14,
    paddingHorizontal: 4,
  },
});
