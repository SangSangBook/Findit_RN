import { MaterialIcons } from '@expo/vector-icons';
import { ImagePickerAsset } from 'expo-image-picker';
import React, { useState } from 'react';
import {
  ColorSchemeName,
  Modal,
  Platform,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import ImagePreview from './ImagePreview';

interface MediaPreviewModalProps {
  visible: boolean;
  onClose: () => void;
  mediaAsset: ImagePickerAsset | null;
  ocrText: string | null;
  isLoadingOcr: boolean;
  colorScheme: ColorSchemeName;
}


const MediaPreviewModal: React.FC<MediaPreviewModalProps> = ({
  visible,
  onClose,
  mediaAsset,
  ocrText,
  isLoadingOcr,
  colorScheme,
}) => {
  const [textFieldValue, setTextFieldValue] = useState('');

  if (!mediaAsset) {
    return null;
  }

  const isDarkMode = colorScheme === 'dark';
  const modalBackgroundColor = isDarkMode ? '#1C1C1E' : '#F2F2F7';
  const closeButtonColor = isDarkMode ? '#FFFFFF' : '#000000';
  const textFieldBg = isDarkMode ? '#232323' : '#fff';
  const textFieldBorder = isDarkMode ? '#444' : '#ccc';
  const textColor = isDarkMode ? '#fff' : '#000';

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
      transparent={false} // Ensure modal has its own background
    >
      <View style={[styles.modalContainer, { backgroundColor: modalBackgroundColor }]}>
        <ImagePreview
          image={mediaAsset}
          ocrText={ocrText}
          isLoadingOcr={isLoadingOcr}
        />
        {/* 이미지 밑 텍스트 필드 */}
        <View style={{ padding: 16 }}>
          <View
            style={{
              backgroundColor: textFieldBg,
              borderColor: textFieldBorder,
              borderWidth: 1,
              borderRadius: 8,
              paddingHorizontal: 12,
              paddingVertical: 8,
              marginTop: 12,
            }}
          >
            <TextInput
              style={{ color: textColor, fontSize: 16 }}
              placeholder="텍스트를 입력하세요..."
              placeholderTextColor={isDarkMode ? '#888' : '#aaa'}
              value={textFieldValue}
              onChangeText={setTextFieldValue}
              multiline
            />
          </View>
        </View>
        <TouchableOpacity style={styles.modalCloseButton} onPress={onClose}>
          <MaterialIcons name="close" size={30} color={closeButtonColor} />
        </TouchableOpacity>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    // backgroundColor is set dynamically
  },
  modalCloseButton: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 50 : 20,
    right: 20,
    zIndex: 20,
    padding: 10,
  },
});

export default MediaPreviewModal;
