import { Platform, StyleSheet } from 'react-native';

export const getThemedStyles = (isDarkMode: boolean) => {
  const modalBackgroundColor = isDarkMode ? '#1C1C1E' : '#ffffff';
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
        marginBottom: 10,
      },
      previewTitleDot: {
        color: '#46B876',
      },
      textFieldWrapper: {
        marginVertical: 16,
        backgroundColor: 'transparent',
      },
      textFieldContainer: {
        backgroundColor: textFieldBg,
        paddingHorizontal: 12,
        marginBottom: 10,
      },
      textFieldContainerRow: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: textFieldBg,
        paddingHorizontal: 12,
        marginBottom: 0,
      },
      textInput: {
        flex: 1,
        fontSize: 14,
        padding: 0,
        color: textColor,
        textAlignVertical: 'center',
        minHeight: 40,
        maxHeight: 40,
        height: 40,
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
      clearButton: {
        marginLeft: 8,
        padding: 6,
        alignItems: 'center',
        justifyContent: 'center',
        height: 40,
      },
    }),
    closeButtonIconColor,
    placeholderTextColor,
  };
};

export const mediaPreviewModalStyles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    flex: 1,
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    overflow: 'hidden',
  },
  previewContainer: {
    flex: 1,
    width: '100%',
  },
  textFieldWrapper: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderTopWidth: 1,
    borderTopColor: '#ddd',
  },
  textField: {
    backgroundColor: 'white',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
  },
});
