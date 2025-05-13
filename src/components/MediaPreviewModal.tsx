import { MaterialIcons } from '@expo/vector-icons';
import { ImagePickerAsset } from 'expo-image-picker';
import React, { useState } from 'react';
import {
  ColorSchemeName,
  Keyboard,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View
} from 'react-native';
import { getThemedStyles } from '../styles/MediaPreviewModal.styles';
import ImagePreview from './ImagePreview';

import type { OcrResult } from '../api/googleVisionApi';

interface MediaPreviewModalProps {
  visible: boolean;
  onClose: () => void;
  mediaAsset: ImagePickerAsset | null;
  ocrResult: OcrResult | null;
  isLoadingOcr: boolean;
  colorScheme: ColorSchemeName;
  children?: React.ReactNode;
}


const MediaPreviewModal: React.FC<MediaPreviewModalProps> = ({
  visible,
  onClose,
  mediaAsset,
  ocrResult,
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
      <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
        <View style={styles.modalContainer}>
          <ImagePreview
            image={mediaAsset}
            ocrResult={ocrResult}
            isLoadingOcr={isLoadingOcr}
            searchTerm={searchTerm}
          />
          {/* 이미지 밑 텍스트 필드와 검색 버튼 */}
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            keyboardVerticalOffset={Platform.OS === 'ios' ? 32 : 0}
          >
            <View style={styles.textFieldWrapper}>
              <View style={styles.textFieldContainerRow}>
                <TextInput
                  style={styles.textInput}
                  placeholder="텍스트를 입력하세요..."
                  placeholderTextColor={placeholderTextColor}
                  value={textFieldValue}
                  onChangeText={setTextFieldValue}
                  multiline
                />
                <TouchableOpacity
                  style={styles.dismissKeyboardButton}
                  onPress={Keyboard.dismiss}
                  accessibilityLabel="키보드 내리기"
                >
                  <MaterialIcons name="keyboard-hide" size={18} color="#666" />
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.searchButton}
                  onPress={handleSearch}
                >
                  <Text style={styles.searchButtonText}>검색</Text>
                </TouchableOpacity>
              </View>
            </View>
          </KeyboardAvoidingView>
          <TouchableOpacity style={styles.modalCloseButton} onPress={onClose}>
            <MaterialIcons name="close" size={30} color={closeButtonIconColor} />
          </TouchableOpacity>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

export default MediaPreviewModal;
