import { MaterialIcons } from '@expo/vector-icons';
import { ImagePickerAsset } from 'expo-image-picker';
import React, { useState } from 'react';
import {
  ColorSchemeName,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import Modal from 'react-native-modal';
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
      isVisible={visible}
      onBackdropPress={onClose}
      onSwipeComplete={onClose}
      swipeDirection={['down']}
      style={styles.modal}
      backdropOpacity={0.4}
      animationIn="slideInUp"
      animationOut="slideOutDown"
      propagateSwipe={true}
      statusBarTranslucent={true}
    >
      <View style={styles.bottomSheet}>
        <View style={styles.bottomSheetHeader}>
          <View style={styles.bottomSheetHandle} />
        </View>
        
        <View style={styles.bottomSheetContent}>
          <View style={styles.previewTitleContainer}>
            <Text style={styles.previewTitle}>선택한 사진</Text>
            <Text style={[styles.previewTitle, styles.previewTitleDot]}> .</Text>
          </View>
          <ImagePreview
            image={mediaAsset}
            ocrResult={ocrResult}
            isLoadingOcr={isLoadingOcr}
            searchTerm={searchTerm}
          />
          
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
        </View>
      </View>
    </Modal>
  );
};

export default MediaPreviewModal;
