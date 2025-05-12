import { ResizeMode, Video } from 'expo-av';
import { ImagePickerAsset } from 'expo-image-picker';
import React, { useRef, useState } from 'react';
import { ActivityIndicator, Image, Text, TouchableWithoutFeedback, View } from 'react-native'; // Animated 제거, Image 추가
import { imagePreviewStyles as styles } from '../styles/ImagePreview.styles';

interface ImagePreviewProps {
  image: ImagePickerAsset;
  ocrText: string | null;
  isLoadingOcr: boolean;
}

const ImagePreview: React.FC<ImagePreviewProps> = ({ image, ocrText, isLoadingOcr }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const videoRef = useRef<Video>(null);

  const handleVideoPress = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pauseAsync();
      } else {
        videoRef.current.playAsync();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const stopPropagation = (e: any) => {
    e.stopPropagation();
  };

  return (
    <TouchableWithoutFeedback onPress={stopPropagation}> 
      <View style={styles.imageContainer}>
        {image.type === 'video' ? (
          <TouchableWithoutFeedback onPress={handleVideoPress}>
            <Video
              ref={videoRef}
              source={{ uri: image.uri }}
              style={styles.previewImage}
              resizeMode={ResizeMode.CONTAIN}
              useNativeControls={false}
              isLooping
              shouldPlay={isPlaying}
              onPlaybackStatusUpdate={(status) => {
                if (status.isLoaded && status.didJustFinish) {
                  setIsPlaying(false);
                  videoRef.current?.setPositionAsync(0);
                }
              }}
            />
          </TouchableWithoutFeedback>
        ) : (
          <Image // 일반 Image 컴포넌트 사용
            source={{ uri: image.uri }}
            style={styles.previewImage}
            resizeMode="contain"
          />
        )}

        {isLoadingOcr && (
          <View style={styles.loadingOverlay}>
            <ActivityIndicator size="large" color="#fff" />
            <Text style={styles.loadingText}>텍스트 인식 중...</Text>
          </View>
        )}
      </View>
    </TouchableWithoutFeedback>
  );
};

export default ImagePreview;
