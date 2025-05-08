// /Users/kkm/Findit_RN/Findit/src/components/ImagePreview.tsx
import React from 'react';
import { View, Text, Image, ScrollView, ActivityIndicator } from 'react-native';
import { ImagePickerAsset } from 'expo-image-picker';
import { imagePreviewStyles as styles } from '../styles/ImagePreview.styles';

interface ImagePreviewProps {
  image: ImagePickerAsset;
  ocrText: string | null;
  isLoadingOcr: boolean;
}

const ImagePreview: React.FC<ImagePreviewProps> = ({ image, ocrText, isLoadingOcr }) => {
  return (
    <View style={styles.imageContainer}>
      <Image source={{ uri: image.uri }} style={styles.previewImage} />
      {isLoadingOcr && <ActivityIndicator size="small" color="#0000ff" style={styles.loadingIndicator} />}
      {ocrText !== null && !isLoadingOcr && ( // 로딩 중이 아닐 때만 OCR 텍스트 표시
        <ScrollView style={styles.ocrTextScrollView}>
          <Text style={styles.ocrText}>{ocrText || '텍스트를 인식하지 못했습니다.'}</Text>
        </ScrollView>
      )}
      {ocrText === null && !isLoadingOcr && ( // OCR 결과가 null이고 로딩 중이 아닐 때 (예: OCR 실패)
         <Text style={styles.ocrText}>OCR 실패</Text>
      )}
    </View>
  );
};

export default ImagePreview;
