import { Video, ResizeMode } from 'expo-av';
import { ImagePickerAsset } from 'expo-image-picker';
import React, { useState, useRef } from 'react';
import { ActivityIndicator, Image, Text, View, TouchableWithoutFeedback } from 'react-native'; // Animated 제거, Image 추가
// import { Gesture, GestureDetector } from 'react-native-gesture-handler'; // 제거
import { imagePreviewStyles as styles } from '../styles/ImagePreview.styles';

interface ImagePreviewProps {
  image: ImagePickerAsset;
  ocrText: string | null;
  isLoadingOcr: boolean;
}

const ImagePreview: React.FC<ImagePreviewProps> = ({ image, ocrText, isLoadingOcr }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const videoRef = useRef<Video>(null);
  // const scaleValue = useRef(new Animated.Value(1)).current; // 제거
  // const [isZoomed, setIsZoomed] = useState(false); // 제거

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

  // const doubleTapGesture = Gesture.Tap() // 제거
  //   .numberOfTaps(2)
  //   .onStart(() => {
  //     const newScale = isZoomed ? 1 : 2;
  //     Animated.spring(scaleValue, {
  //       toValue: newScale,
  //       useNativeDriver: true,
  //     }).start(() => {
  //       setIsZoomed(!isZoomed); 
  //     });
  //   });

  const stopPropagation = (e: any) => {
    e.stopPropagation();
  };

  return (
    <TouchableWithoutFeedback onPress={stopPropagation}> 
      {/* View의 onTouchStart 대신 TouchableWithoutFeedback으로 감싸서 이벤트 처리 명확화 */}
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
          // <GestureDetector gesture={doubleTapGesture}> // 제거
          //   <Animated.Image // 제거
          //     source={{ uri: image.uri }}
          //     style={[styles.previewImage, { transform: [{ scale: scaleValue }] }]}
          //     resizeMode="contain"
          //   />
          // </GestureDetector> // 제거
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
