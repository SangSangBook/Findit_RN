import React from 'react';
import {
  Modal,
  View,
  TouchableOpacity,
  StyleSheet,
  Platform,
  ColorSchemeName,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { ImagePickerAsset } from 'expo-image-picker';
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
  if (!mediaAsset) {
    return null;
  }

  const isDarkMode = colorScheme === 'dark';
  const modalBackgroundColor = isDarkMode ? '#1C1C1E' : '#F2F2F7';
  const closeButtonColor = isDarkMode ? '#FFFFFF' : '#000000';

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
