// /Users/kkm/Findit_RN/Findit/src/components/ImagePreview.tsx
import React from 'react';
import { View, Image, ActivityIndicator } from 'react-native';
import { ImagePickerAsset } from 'expo-image-picker';
import { imagePreviewStyles as styles } from '../styles/ImagePreview.styles';

interface ImagePreviewProps {
  image: ImagePickerAsset;
  ocrText: string | null;
  isLoadingOcr: boolean;
}

const ImagePreview: React.FC<ImagePreviewProps> = ({ image, isLoadingOcr }) => {
  return (
    <View style={styles.imageContainer}>
      <Image source={{ uri: image.uri }} style={styles.previewImage} />
      {isLoadingOcr && <ActivityIndicator size="small" color="#0000ff" style={styles.loadingIndicator} />}
    </View>
  );
};

export default ImagePreview;
