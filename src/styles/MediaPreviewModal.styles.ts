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
      textInput: {
        color: textColor,
        fontSize: 16,
      },
    }),
    closeButtonIconColor,
    placeholderTextColor,
  };
};
