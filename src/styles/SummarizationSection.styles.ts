import { StyleSheet } from 'react-native';

export const summarizationSectionStyles = StyleSheet.create({
  container: {
    width: '100%',
    paddingHorizontal: 36,
    backgroundColor: '#fff',
    alignSelf: 'center',
  },
  title: {
    fontFamily: 'PretendardSemiBold',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'left',
    color: '#222222',
  },
  input: {
    fontFamily: 'PretendardMedium',
    paddingVertical: 10,
    marginBottom: 10,
    minHeight: 18,
    fontSize: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#eeeeee',
  },
  resultContainer: {
    maxHeight: 192,
    marginTop: 16,
    padding: 10,
    backgroundColor: '#f3f4f6',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#d1d5db',
  },
  resultText: {
    fontFamily: 'GmarketSansMedium',
    fontSize: 14,
    color: '#1f2937',
    lineHeight: 18,
  },
}); 