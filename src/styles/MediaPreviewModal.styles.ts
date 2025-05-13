import { Platform, StyleSheet } from 'react-native';

export const getThemedStyles = (isDarkMode: boolean) => {
  const modalBackgroundColor = isDarkMode ? '#1C1C1E' : '#F2F2F7';
  const closeButtonIconColor = isDarkMode ? '#FFFFFF' : '#000000';
  const textFieldBg = isDarkMode ? '#232323' : '#fff';
  const textFieldBorder = isDarkMode ? '#444' : '#ccc';
  const textColor = isDarkMode ? '#fff' : '#000';
  const placeholderTextColor = isDarkMode ? '#888' : '#aaa';

  return {
    styles: StyleSheet.create({
      modalContainer: {
        flex: 1,
        backgroundColor: modalBackgroundColor,
      },
      modalCloseButton: {
        position: 'absolute',
        top: Platform.OS === 'ios' ? 20 : 20,
        right: 20,
        zIndex: 20,
        padding: 10,
      },
      textFieldWrapper: {
        padding: 24,
      },
      textFieldContainer: {
        backgroundColor: textFieldBg,
        borderColor: textFieldBorder,
        borderWidth: 1,
        borderRadius: 12,
        paddingHorizontal: 12,
        paddingVertical: 4,
        marginBottom: 10,
      },
      textFieldWrapperRow: {
        padding: 16,
      },
      textFieldContainerRow: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: textFieldBg,
        borderRadius: 8,
        paddingHorizontal: 12,
        paddingVertical: 8,
        marginBottom: 10,
      },
      textInput: {
        flex: 1,
        fontSize: 14,
        padding: 0,
        color: textColor,
        textAlignVertical: 'center',
      },
      dismissKeyboardButton: {
        marginLeft: 8,
        marginRight: 0,
        padding: 8,
        alignItems: 'center',
        justifyContent: 'center',
      },
      searchButton: {
        marginLeft: 8,
        backgroundColor: isDarkMode ? '#4299e1' : '#4299e1',
        borderRadius: 8,
        paddingVertical: 10,
        paddingHorizontal: 16,
        alignItems: 'center',
        justifyContent: 'center',
      },
      searchButtonText: {
        color: isDarkMode ? '#fff' : '#fff',
        fontWeight: 'bold',
        fontSize: 16,
      },
    }),
    closeButtonIconColor,
    placeholderTextColor,
  };
};
