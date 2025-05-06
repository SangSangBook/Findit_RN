// /Users/kkm/Findit_RN/Findit/src/components/ImagePreview.tsx
import React from 'react';
import { View, Text, Image, ScrollView, StyleSheet, ActivityIndicator } from 'react-native';
import { ImagePickerAsset } from 'expo-image-picker';

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

const styles = StyleSheet.create({
  imageContainer: { // 이미지와 OCR 텍스트를 담는 컨테이너
    alignItems: 'center',
    marginHorizontal: 5, // 좌우 여백 추가
    marginBottom: 20, // 이미지 아이템 간 간격
    width: 150, // 각 이미지 컨테이너의 너비 고정 (필요에 따라 조정)
  },
  previewImage: {
    width: 100,
    height: 100,
    borderRadius: 5,
    marginBottom: 5, // 이미지와 OCR 텍스트 간 간격
  },
  loadingIndicator: {
    marginTop: 10,
  },
  ocrTextScrollView: {
    maxHeight: 100, // OCR 텍스트 표시 영역의 최대 높이 제한
    width: '100%', // 부모 컨테이너 너비에 맞춤
    marginTop: 5,
    padding: 5,
    backgroundColor: '#f0f0f0',
    borderRadius: 3,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  ocrText: {
    fontSize: 12,
  },
});

export default ImagePreview;
