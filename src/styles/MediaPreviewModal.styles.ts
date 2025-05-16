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
      modal: {
        margin: 0,
        justifyContent: 'flex-end',
      },
      bottomSheet: {
        backgroundColor: modalBackgroundColor,
        borderTopLeftRadius: 16,
        borderTopRightRadius: 16,
        height: '80%',
      },
      bottomSheetHeader: {
        alignItems: 'center',
        paddingVertical: 12,
      },
      bottomSheetHandle: {
        width: 50,
        height: 4,
        backgroundColor: '#8E8E8E',
        borderRadius: 1.5,
        alignSelf: 'center',
        marginTop: 8,
      },
      bottomSheetContent: {
        flex: 1,
        paddingHorizontal: 16,
        paddingBottom: Platform.OS === 'android' ? 20 : 0,
      },
      previewTitleContainer: {
        flexDirection: 'row',
      },
      previewTitle: {
        fontFamily: 'PretendardSemiBold',
        fontSize: 22,
        color: '#222222',
      },
      previewTitleDot: {
        color: '#46B876',
      },
      textFieldWrapper: {
        padding: 16,
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: modalBackgroundColor,
      },
      textFieldContainer: {
        backgroundColor: textFieldBg,
        borderColor: textFieldBorder,
        borderWidth: 1,
        borderRadius: 12,
        paddingHorizontal: 12,
        marginBottom: 10,
      },
      textFieldContainerRow: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: textFieldBg,
        borderRadius: 8,
        paddingHorizontal: 12,
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
