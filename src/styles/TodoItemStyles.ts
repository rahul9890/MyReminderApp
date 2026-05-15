import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
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
