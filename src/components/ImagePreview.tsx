import { ResizeMode, Video } from 'expo-av';
import { ImagePickerAsset } from 'expo-image-picker';
import React, { useRef, useState } from 'react';
import { ActivityIndicator, Image, Text, TouchableWithoutFeedback, View } from 'react-native';
import Svg, { Rect } from 'react-native-svg';
import type { OcrTextBox } from '../api/googleVisionApi';
import { imagePreviewStyles as styles } from '../styles/ImagePreview.styles';

interface ImageLayout {
  width: number;
  height: number;
}

interface ImagePreviewProps {
  image: ImagePickerAsset;
  ocrText: OcrTextBox[] | null;
  isLoadingOcr: boolean;
  searchTerm?: string;
}

const ImagePreview: React.FC<ImagePreviewProps> = ({ image, ocrText, isLoadingOcr, searchTerm = '' }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [imageLayout, setImageLayout] = useState<ImageLayout | null>(null);
  const [containerLayout, setContainerLayout] = useState<ImageLayout | null>(null);
  const [imageNaturalSize, setImageNaturalSize] = useState<{ width: number; height: number } | null>(null);

  // 원본 이미지 크기 가져오기 (Image.getSize)
  React.useEffect(() => {
    if (image?.uri) {
      // Image.getSize는 비동기
      // @ts-ignore
      Image.getSize(
        image.uri,
        (w: number, h: number) => setImageNaturalSize({ width: w, height: h }),
        () => setImageNaturalSize(null)
      );
    }
  }, [image?.uri]);

  // 이미지가 실제로 렌더링된 크기 측정 (Image의 부모 View)
  const onContainerLayout = (e: any) => {
    const { width, height } = e.nativeEvent.layout;
    setContainerLayout({ width, height });
  };

  // 이미지가 실제로 렌더링된 크기 측정 (Image 컴포넌트 자체)
  const onImageLayout = (e: any) => {
    const { width, height } = e.nativeEvent.layout;
    setImageLayout({ width, height });
  };

  // 실제 이미지가 View 내에서 차지하는 영역 계산 (contain 모드)
  function getContainedImageLayout(
    containerW: number,
    containerH: number,
    imgW: number,
    imgH: number
  ) {
    const containerRatio = containerW / containerH;
    const imageRatio = imgW / imgH;
    let width = containerW;
    let height = containerH;
    let offsetX = 0;
    let offsetY = 0;
    if (imageRatio > containerRatio) {
      // 이미지가 더 넓음
      width = containerW;
      height = containerW / imageRatio;
      offsetY = (containerH - height) / 2;
    } else {
      // 이미지가 더 높음
      height = containerH;
      width = containerH * imageRatio;
      offsetX = (containerW - width) / 2;
    }
    return { width, height, offsetX, offsetY };
  }

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

  const matches = ocrText && searchTerm.length > 0
    ? ocrText.filter(item => item.description.includes(searchTerm))
    : [];

  return (
    <TouchableWithoutFeedback onPress={stopPropagation}>
      <View style={styles.previewDisplayContainer}>
        {image.type === 'video' ? (
          <TouchableWithoutFeedback onPress={handleVideoPress}>
            <Video
              ref={videoRef}
              source={{ uri: image.uri }}
              style={styles.previewMedia}
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
          <View style={{ width: '100%', height: '100%' }} onLayout={onContainerLayout}>
            <View style={{ flex: 1 }}>
              <Image
                source={{ uri: image.uri }}
                style={styles.previewMedia}
                resizeMode="contain"
                onLayout={onImageLayout}
              />
              {/* SVG로 동그라미 오버레이 */}
              {containerLayout && imageLayout && ocrText && searchTerm && searchTerm.length > 0 && (
                (() => {
                  // 원본 이미지 사이즈 (getSize 결과 우선, fallback은 imageLayout)
                  const origWidth = imageNaturalSize?.width || imageLayout.width;
                  const origHeight = imageNaturalSize?.height || imageLayout.height;
                  // contain 모드에서 실제 이미지가 View 내에서 차지하는 영역 계산
                  const contained = getContainedImageLayout(
                    containerLayout.width,
                    containerLayout.height,
                    origWidth,
                    origHeight
                  );
                  return (
                    <Svg
                      style={{ position: 'absolute', left: contained.offsetX, top: contained.offsetY }}
                      width={contained.width}
                      height={contained.height}
                    >
                      {matches.map((item: OcrTextBox, idx: number) => {
                        if (!item.boundingPoly || !item.boundingPoly.vertices || item.boundingPoly.vertices.length < 4) return null;
                        const v = item.boundingPoly.vertices;
                        // OCR 좌표를 실제 이미지 영역에 맞춰 스케일링
                        const scaleX = contained.width / origWidth;
                        const scaleY = contained.height / origHeight;
                        const x1 = v[0].x * scaleX;
                        const y1 = v[0].y * scaleY;
                        const x2 = v[2].x * scaleX;
                        const y2 = v[2].y * scaleY;
                        const boxWidth = Math.abs(x2 - x1);
                        const boxHeight = Math.abs(y2 - y1);
                        return (
                          <Rect
                            key={idx}
                            x={Math.min(x1, x2)}
                            y={Math.min(y1, y2)}
                            width={boxWidth}
                            height={boxHeight}
                            stroke="red"
                            strokeWidth={3}
                            fill="none"
                            rx={4}
                            ry={4}
                          />
                        );
                      })}
                    </Svg>
                  );
                })()
              )}
            </View>
          </View>
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
