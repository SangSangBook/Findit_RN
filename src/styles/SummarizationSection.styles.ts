import { StyleSheet } from 'react-native';

export const summarizationSectionStyles = StyleSheet.create({
  container: {
    width: '100%',
    paddingHorizontal: 20,
    backgroundColor: '#fff',
    alignSelf: 'center',
  },
  title: {
    fontFamily: 'Pretendard',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'left',
    color: '#333',
    marginBottom: 16,
  },
  textFieldWrapper: {
    width: '100%',
    marginBottom: 20,
  },
  textFieldContainerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingBottom: 8,
  },
  textInput: {
    flex: 1,
    fontSize: 16,
    color: '#333',
    paddingVertical: 8,
    fontFamily: 'Pretendard',
  },
  clearButton: {
    padding: 4,
  },
}); 