import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F5F5' },
  header: {
    paddingTop: 40,
    paddingHorizontal: 20,
    paddingBottom: 20,
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#EEE',
  },
  title: { fontSize: 28, fontWeight: 'bold', color: '#333' },
  settingsRow: {
    flexDirection: 'column',
    marginTop: 15,
    backgroundColor: '#F9F9F9',
    padding: 10,
    borderRadius: 10
  },
  label: { fontSize: 14, color: '#666', marginBottom: 5 },
  timeInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  timeBox: {
    flexDirection: 'column',
    alignItems: 'center',
    flex: 1
  },
  intervalInput: {
    backgroundColor: '#FFF',
    paddingHorizontal: 5,
    paddingVertical: 8,
    borderRadius: 5,
    width: '80%',
    textAlign: 'center',
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    borderWidth: 1,
    borderColor: '#DDD'
  },
  timeLabel: {
    fontSize: 10,
    color: '#999',
    marginTop: 2
  },
  timeSeparator: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#CCC',
    marginTop: -15
  },
  listContent: { paddingHorizontal: 20, paddingTop: 20 },
  inputWrapper: {
    position: 'absolute',
    bottom: 30,
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  input: {
    paddingVertical: 15,
    paddingHorizontal: 20,
    backgroundColor: '#FFF',
    borderRadius: 30,
    borderColor: '#C0C0C0',
    borderWidth: 1,
    width: 250,
  },
  addWrapper: {
    width: 60,
    height: 60,
    backgroundColor: '#FFF',
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    borderColor: '#C0C0C0',
    borderWidth: 1,
  },
  addText: { fontSize: 30, color: '#55BCF6' },
});
