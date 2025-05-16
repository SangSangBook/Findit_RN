import { ResizeMode, Video } from 'expo-av';
import { ImagePickerAsset } from 'expo-image-picker';
import React, { useEffect, useRef, useState } from 'react';
import { Animated, Image, Text, TouchableWithoutFeedback, View } from 'react-native';
import Svg, { Rect, Text as SvgText } from 'react-native-svg';
import type { OcrResult, OcrTextBox } from '../api/googleVisionApi';
import { imagePreviewStyles as styles } from '../styles/ImagePreview.styles';

interface ImageLayout {
  width: number;
  height: number;
}

interface ImagePreviewProps {
  image: ImagePickerAsset;
  ocrResult: OcrResult | null;
  isLoadingOcr: boolean;
  searchTerm?: string;
}

const ImagePreview: React.FC<ImagePreviewProps> = ({ image, ocrResult, isLoadingOcr, searchTerm = '' }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [imageLayout, setImageLayout] = useState<ImageLayout | null>(null);
  const [containerLayout, setContainerLayout] = useState<ImageLayout | null>(null);
  const [imageNaturalSize, setImageNaturalSize] = useState<{ width: number; height: number } | null>(null);
  
  // 로딩 애니메이션을 위한 Animated 값
  const rotateAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (isLoadingOcr) {
      Animated.loop(
        Animated.timing(rotateAnim, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: false,
        })
      ).start();
    } else {
      rotateAnim.setValue(0);
    }
  }, [isLoadingOcr]);

  const spin = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg']
  });

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

  // 검색어와 일치하는 OCR 결과만 필터링 (대소문자 무시)
  const matches = ocrResult && searchTerm.length > 0
    ? ocrResult.textBoxes.filter(item => {
        // 너무 긴 텍스트는 제외 (안전장치)
        if (item.description.length > 100) return false;
        return item.description.toLowerCase().includes(searchTerm.toLowerCase());
      })
    : [];
    
  // 전체 텍스트 검색 결과 (검색어가 전체 텍스트에 있는지 확인)
  const fullTextMatch = ocrResult && searchTerm.length > 0
    ? ocrResult.fullText.toLowerCase().includes(searchTerm.toLowerCase())
    : false;

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
              {/* 검색 결과(매칭 OCR)만 네모 박스 오버레이 */}
              {containerLayout && imageLayout && (matches.length > 0 || fullTextMatch) && (
                (() => {
                  const origWidth = imageNaturalSize?.width || imageLayout.width;
                  const origHeight = imageNaturalSize?.height || imageLayout.height;
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
                      {/* 전체 텍스트 검색 결과가 있으면 전체 이미지에 표시 */}
                      {fullTextMatch && matches.length === 0 && (
                        <>
                          <Rect
                            x={0}
                            y={0}
                            width={contained.width}
                            height={contained.height}
                            stroke="rgba(255, 165, 0, 0.8)"
                            strokeWidth={4}
                            strokeDasharray="10,5"
                            fill="rgba(255, 165, 0, 0.05)"
                            rx={8}
                            ry={8}
                          />
                          <SvgText
                            x={contained.width / 2}
                            y={20}
                            fontSize="16"
                            fontWeight="bold"
                            fill="rgba(255, 165, 0, 0.9)"
                            textAnchor="middle"
                          >
                            텍스트 발견됨
                          </SvgText>
                        </>
                      )}
                      
                      {/* 개별 텍스트 매칭 박스 */}
                      {matches.map((item: OcrTextBox, idx: number) => {
                        if (!item.boundingPoly || !item.boundingPoly.vertices || item.boundingPoly.vertices.length < 4) return null;
                        const v = item.boundingPoly.vertices;
                        const scaleX = contained.width / origWidth;
                        const scaleY = contained.height / origHeight;
                        const x1 = v[0].x * scaleX;
                        const y1 = v[0].y * scaleY;
                        const x2 = v[2].x * scaleX;
                        const y2 = v[2].y * scaleY;
                        const boxWidth = Math.abs(x2 - x1);
                        const boxHeight = Math.abs(y2 - y1);
                        const centerX = Math.min(x1, x2) + boxWidth / 2;
                        const centerY = Math.min(y1, y2) + boxHeight / 2;
                        
                        return (
                          <React.Fragment key={idx}>
                            <Rect
                              x={Math.min(x1, x2)}
                              y={Math.min(y1, y2)}
                              width={boxWidth}
                              height={boxHeight}
                              stroke="rgb(0, 255, 0)"
                              strokeWidth={3}
                              fill="rgba(0, 255, 0, 0.1)"
                              rx={4}
                              ry={4}
                            />
                            <SvgText
                              x={centerX}
                              y={Math.min(y1, y2) - 5}
                              fontSize="12"
                              fontWeight="bold"
                              fill="rgb(0, 255, 0)"
                              textAnchor="middle"
                            >
                              {item.description}
                            </SvgText>
                          </React.Fragment>
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
            <Animated.View
              style={{
                transform: [{ rotate: spin }],
                width: 40,
                height: 40,
                borderRadius: 20,
                borderWidth: 3,
                borderColor: '#fff',
                borderTopColor: 'transparent',
              }}
            />
            <Text style={[styles.loadingText, { marginTop: 15 }]}>텍스트 인식 중...</Text>
          </View>
        )}
      </View>
    </TouchableWithoutFeedback>
  );
};

export default ImagePreview;
