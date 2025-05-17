import { StyleSheet } from 'react-native';

export const summarizationSectionStyles = StyleSheet.create({
  container: {
    width: '100%',
    paddingHorizontal: 20,
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
  textFieldWrapper: {
    width: '100%',
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  textFieldContainerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
  },
  textInput: {
    flex: 1,
    height: 40,
    fontSize: 16,
    color: '#000',
    paddingRight: 32,
  },
  clearButton: {
    position: 'absolute',
    right: 0,
    padding: 4,
  },
}); 