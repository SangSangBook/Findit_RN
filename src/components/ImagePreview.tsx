// /Users/kkm/Findit_RN/Findit/src/components/ImagePreview.tsx
import { Video } from 'expo-av';
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
    <View style={styles.container}>
      {image.type === 'video' ? (
        <Video
          source={{ uri: image.uri }}
          style={styles.media}
          resizeMode="cover"
          useNativeControls
          isLooping
        />
      ) : (
        <Image
          source={{ uri: image.uri }}
          style={styles.media}
          resizeMode="cover"
        />
      )}
      
      {isLoadingOcr && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#fff" />
          <Text style={styles.loadingText}>텍스트 인식 중...</Text>
        </View>
      )}
      
      {ocrText && !isLoadingOcr && (
        <View style={styles.textContainer}>
          <Text style={styles.text} numberOfLines={3}>
            {ocrText}
          </Text>
        </View>
      )}
    </View>
  );
};

export default ImagePreview;
