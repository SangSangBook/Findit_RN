import { MaterialIcons } from '@expo/vector-icons';
import { ImagePickerAsset } from 'expo-image-picker';
import React, { useState } from 'react';
import {
  ColorSchemeName,
  Modal,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { getThemedStyles } from '../styles/MediaPreviewModal.styles';
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
  const { styles, closeButtonIconColor, placeholderTextColor } = getThemedStyles(isDarkMode);

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
      transparent={false} // Ensure modal has its own background
    >
      <View style={styles.modalContainer}>
        <ImagePreview
          image={mediaAsset}
          ocrText={ocrText}
          isLoadingOcr={isLoadingOcr}
        />
        {/* 이미지 밑 텍스트 필드 */}
        <View style={styles.textFieldWrapper}>
          <View style={styles.textFieldContainer}>
            <TextInput
              style={styles.textInput}
              placeholder="텍스트를 입력하세요..."
              placeholderTextColor={placeholderTextColor}
              value={textFieldValue}
              onChangeText={setTextFieldValue}
              multiline
            />
          </View>
        </View>
        <TouchableOpacity style={styles.modalCloseButton} onPress={onClose}>
          <MaterialIcons name="close" size={30} color={closeButtonIconColor} />
        </TouchableOpacity>
      </View>
    </Modal>
  );
};

export default MediaPreviewModal;
