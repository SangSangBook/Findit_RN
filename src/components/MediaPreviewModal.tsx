import { MaterialIcons } from '@expo/vector-icons';
import { ImagePickerAsset } from 'expo-image-picker';
import React, { useState } from 'react';
import {
  ColorSchemeName,
  Modal,
  TextInput,
  TouchableOpacity,
  View,
  Text
} from 'react-native';
import { getThemedStyles } from '../styles/MediaPreviewModal.styles';
import ImagePreview from './ImagePreview';

import type { OcrTextBox } from '../api/googleVisionApi';

interface MediaPreviewModalProps {
  visible: boolean;
  onClose: () => void;
  mediaAsset: ImagePickerAsset | null;
  ocrText: OcrTextBox[] | null;
  isLoadingOcr: boolean;
  colorScheme: ColorSchemeName;
  children?: React.ReactNode;
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
  const [searchTerm, setSearchTerm] = useState('');

  const handleSearch = () => {
    setSearchTerm(textFieldValue);
  };

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
          searchTerm={searchTerm}
        />
        {/* 이미지 밑 텍스트 필드와 검색 버튼 */}
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
          <TouchableOpacity
            style={{ marginTop: 10, backgroundColor: '#4299e1', borderRadius: 8, paddingVertical: 8, alignItems: 'center' }}
            onPress={handleSearch}
          >
            <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 16 }}>검색</Text>
          </TouchableOpacity>
        </View>
        <TouchableOpacity style={styles.modalCloseButton} onPress={onClose}>
          <MaterialIcons name="close" size={30} color={closeButtonIconColor} />
        </TouchableOpacity>
      </View>
    </Modal>
  );
};

export default MediaPreviewModal;
