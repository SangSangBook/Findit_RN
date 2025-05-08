import { StyleSheet } from 'react-native';

export const summarizationSectionStyles = StyleSheet.create({
  container: {
    width: '91.67%',
    marginTop: 32,
    padding: 16,
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    backgroundColor: '#f9fafb',
    alignSelf: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
    color: '#1f2937',
  },
  input: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 4,
    padding: 10,
    marginBottom: 16,
    minHeight: 100,
    backgroundColor: '#ffffff',
    fontSize: 14,
  },
  resultContainer: {
    maxHeight: 192,
    marginTop: 16,
    padding: 10,
    backgroundColor: '#f3f4f6',
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#d1d5db',
  },
  resultText: {
    fontSize: 14,
    color: '#1f2937',
  },
}); 