// /Users/kkm/Findit_RN/Findit/src/components/ImagePreview.tsx
import { Video, ResizeMode } from 'expo-av';
import { ImagePickerAsset } from 'expo-image-picker';
import React from 'react';
import { ActivityIndicator, Image, Text, View } from 'react-native';
import { imagePreviewStyles as styles } from '../styles/ImagePreview.styles';

interface ImagePreviewProps {
  image: ImagePickerAsset;
  ocrText: string | null;
  isLoadingOcr: boolean;
}

const ImagePreview: React.FC<ImagePreviewProps> = ({ image, ocrText, isLoadingOcr }) => {
  return (
    <View style={styles.imageContainer}>
      {image.type === 'video' ? (
        <Video
          source={{ uri: image.uri }}
          style={styles.previewImage}
          resizeMode={ResizeMode.COVER}
          useNativeControls
          isLooping
        />
      ) : (
        <Image
          source={{ uri: image.uri }}
          style={styles.previewImage}
          resizeMode="cover"
        />
      )}
      
      {isLoadingOcr && (
        <View style={styles.loadingIndicator}>
          <ActivityIndicator size="large" color="#fff" />
          <Text style={styles.ocrText}>텍스트 인식 중...</Text>
        </View>
      )}
      
    </View>
  );
};

export default ImagePreview;
