import { GOOGLE_CLOUD_VISION_API_KEY, OPENAI_API_KEY } from '@env';
import { MaterialIcons } from '@expo/vector-icons'; // MaterialIcons는 MediaPreviewModal에서 사용될 수 있으므로 유지하거나, HomeScreen에서 직접 사용되지 않으면 삭제 가능
import { BlurView } from 'expo-blur';
import type { ImagePickerAsset } from 'expo-image-picker';
import * as ImagePicker from 'expo-image-picker';
import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Alert, Animated, Image, ScrollView, Text, TouchableOpacity, View, useColorScheme } from 'react-native'; // Modal은 이미지 유형 선택에 사용
import { ocrWithGoogleVision } from '../api/googleVisionApi';
import { getInfoFromTextWithOpenAI } from '../api/openaiApi';
import { extractTextFromVideo } from '../api/videoOcrApi';
import ImageTypeSelector from '../components/ImageTypeSelector';
import MediaPreviewModal from '../components/MediaPreviewModal'; // 새로 추가
import SummarizationSection from '../components/SummarizationSection';
import VideoPreview from '../components/VideoPreview';
import { IMAGE_TYPE_PROMPTS, ImageType } from '../constants/ImageTypes';
import { homeScreenStyles as styles } from '../styles/HomeScreen.styles';
import { detectImageType } from '../utils/imageTypeDetector';

interface SelectedImage {
  uri: string;
  width?: number;
  height?: number;
  assetId?: string;
  type?: 'image' | 'video'; 
}

interface OcrLoadingState {
  [uri: string]: boolean;
}

interface ImageTypeState {
  [uri: string]: ImageType;
}

export default function HomeScreen() {
  const colorScheme = useColorScheme();
  const [selectedImages, setSelectedImages] = useState<ImagePickerAsset[]>([]);
  const [infoResult, setInfoResult] = useState<string | null>(null);
  const [ocrResults, setOcrResults] = useState<{[uri: string]: string | null}>({});
  const [isLoadingOcr, setIsLoadingOcr] = useState<OcrLoadingState>({});
  const [questionText, setQuestionText] = useState<string>('');
  const [previewMediaAsset, setPreviewMediaAsset] = useState<ImagePickerAsset | null>(null);
  const [isFetchingInfo, setIsFetchingInfo] = useState<boolean>(false);
  const [cameraPermissionStatus, setCameraPermissionStatus] = useState<ImagePicker.PermissionStatus | null>(null);
  const [assetUriMap, setAssetUriMap] = useState<{ [internalUri: string]: string | undefined }>({});
  const [imageTypes, setImageTypes] = useState<ImageTypeState>({});
  const fadeAnim = useRef(new Animated.Value(0)).current;

  const handleTypeChange = (uri: string, newType: ImageType) => {
    setImageTypes(prev => ({ ...prev, [uri]: newType }));
  };

  const processImageWithOCR = async (imageUri: string) => {
    setIsLoadingOcr(prev => ({ ...prev, [imageUri]: true }));
    try {
      const text = await ocrWithGoogleVision(imageUri);
      console.log('OCR Result:', {
        imageUri,
        text
      });

      if (text && text !== 'No text found in image.' && !text.includes('OCR failed')) {
        setOcrResults(prevResults => ({ ...prevResults, [imageUri]: text }));
        const detectedType = detectImageType(text);
        setImageTypes(prev => ({ ...prev, [imageUri]: detectedType }));
      } else {
        setOcrResults(prevResults => ({ ...prevResults, [imageUri]: null }));
        setImageTypes(prev => ({ ...prev, [imageUri]: 'OTHER' }));
      }
    } catch (error) {
      console.error(`이미지 OCR 오류 (${imageUri}):`, error);
      setOcrResults(prevResults => ({ ...prevResults, [imageUri]: null }));
      setImageTypes(prev => ({ ...prev, [imageUri]: 'OTHER' }));
    } finally {
      setIsLoadingOcr(prev => ({ ...prev, [imageUri]: false }));
    }
  };

  const processVideoWithOCR = async (videoUri: string) => {
    setIsLoadingOcr(prev => ({ ...prev, [videoUri]: true }));
    try {
      const results = await extractTextFromVideo(videoUri, 1); // 1초당 1프레임
      console.log('Video OCR Results:', results);

      if (results.length > 0) {
        // 모든 프레임의 텍스트를 하나로 합침
        const combinedText = results
          .map(result => `[${result.time/1000}초] ${result.text}`)
          .join('\n\n');
        setOcrResults(prevResults => ({ ...prevResults, [videoUri]: combinedText }));
      } else {
        setOcrResults(prevResults => ({ ...prevResults, [videoUri]: null }));
      }
    } catch (error) {
      console.error(`비디오 OCR 오류 (${videoUri}):`, error);
      setOcrResults(prevResults => ({ ...prevResults, [videoUri]: null }));
    } finally {
      setIsLoadingOcr(prev => ({ ...prev, [videoUri]: false }));
    }
  };

  useEffect(() => {
    if (!OPENAI_API_KEY || !GOOGLE_CLOUD_VISION_API_KEY) {
      Alert.alert(
        'API 키 오류',
        'OpenAI 또는 Google Cloud Vision API 키가 설정되지 않았습니다. .env 파일을 확인해주세요.',
      );
    }
    (async () => {
      const permission = await ImagePicker.requestCameraPermissionsAsync();
      setCameraPermissionStatus(permission.status);
    })();
  }, []);

  const verifyCameraPermissions = async () => {
    if (cameraPermissionStatus === ImagePicker.PermissionStatus.UNDETERMINED) { 
      const permissionResponse = await ImagePicker.requestCameraPermissionsAsync();
      setCameraPermissionStatus(permissionResponse.status);
      return permissionResponse.granted;
    }
    if (cameraPermissionStatus === ImagePicker.PermissionStatus.DENIED) { 
      Alert.alert('권한 필요', '카메라 사용을 위해 권한을 허용해주세요.');
      return false;
    }
    return true; 
  };

  const handleChooseMedia = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.All,
        allowsMultipleSelection: true,
        quality: 1,
      });

      if (!result.canceled && result.assets) {
        setSelectedImages(prevImages => [...prevImages, ...result.assets]);
        const newAssetUriMap = { ...assetUriMap };
        result.assets.forEach(asset => {
          newAssetUriMap[asset.uri] = asset.assetId ?? undefined;
        });
        setAssetUriMap(newAssetUriMap);

        // 각 미디어에 대해 OCR 처리
        for (const asset of result.assets) {
          if (asset.uri) {
            if (asset.type === 'video') {
              await processVideoWithOCR(asset.uri);
            } else {
              await processImageWithOCR(asset.uri);
            }
          }
        }
      }
    } catch (error) {
      console.error('미디어 선택 오류:', error);
      Alert.alert('오류', '미디어를 선택하는 중 오류가 발생했습니다.');
    }
  };

  const handleTakePhoto = async () => {
    const hasPermission = await verifyCameraPermissions();
    if (!hasPermission) return;

    try {
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: false,
        quality: 1,
      });

      if (!result.canceled && result.assets) {
        const newImage = result.assets[0];
        setSelectedImages(prevImages => [...prevImages, newImage]);
        const newAssetUriMap = { ...assetUriMap };
        newAssetUriMap[newImage.uri] = newImage.assetId ?? undefined;
        setAssetUriMap(newAssetUriMap);

        if (newImage.uri) {
          await processImageWithOCR(newImage.uri);
        }
      }
    } catch (error) {
      console.error('사진 촬영 오류:', error);
      Alert.alert('오류', '사진을 촬영하는 중 오류가 발생했습니다.');
    }
  };

  const handleGetInfo = async () => {
    if (selectedImages.length === 0) {
      setInfoResult('정보를 추출하려면 먼저 이미지나 비디오를 선택하거나 촬영해주세요.');
      return;
    }

    const question = questionText.trim();
    if (!question) {
      setInfoResult('질문을 입력해주세요.');
      return;
    }

    setIsFetchingInfo(true);
    try {
      // 모든 이미지의 OCR 결과와 유형을 수집
      const imageResults = selectedImages.map(image => {
        const ocrText = ocrResults[image.uri];
        const type = imageTypes[image.uri] || 'OTHER';
        return { ocrText, type };
      }).filter(result => result.ocrText);

      if (imageResults.length === 0) {
        setInfoResult('인식된 텍스트가 없습니다. 다른 이미지를 시도해주세요.');
        return;
      }

      // 이미지 유형 한글 레이블
      const typeLabels: Record<ImageType, string> = {
        CONTRACT: '계약서',
        PAYMENT: '영수증',
        DOCUMENT: '문서',
        PRODUCT: '제품',
        OTHER: '기타'
      };

      // 각 이미지별로 유형에 맞는 프롬프트와 OCR 결과를 결합
      const combinedText = imageResults
        .map((result, index) => {
          const typePrompt = IMAGE_TYPE_PROMPTS[result.type];
          return `[이미지 ${index + 1} - ${typeLabels[result.type]}]\n${typePrompt}\n\n${result.ocrText}`;
        })
        .join('\n\n---\n\n');

      // 질문에 이미지 유형 정보와 불일치 감지 요청을 포함
      const enhancedQuestion = `다음은 ${imageResults.length}개의 이미지에 대한 OCR 결과입니다. 
각 이미지의 유형에 맞게 정보를 추출해주세요.
만약 이미지의 실제 내용이 지정된 유형과 일치하지 않는다면, 그 사실을 먼저 알려주고 실제 내용에 맞는 정보를 추출해주세요.

${question}`;
      
      const textForOpenAI = `${combinedText}\n\n질문: ${enhancedQuestion}`;
      console.log('Sending to OpenAI:', textForOpenAI);
      const result = await getInfoFromTextWithOpenAI(textForOpenAI);
      console.log('OpenAI Result:', result);
      setInfoResult(result);
    } catch (error) {
      setInfoResult('질문 처리 중 오류가 발생했습니다.');
    } finally {
      setIsFetchingInfo(false);
    }
  };

  const openPreview = (mediaAsset: ImagePickerAsset) => {
    setPreviewMediaAsset(mediaAsset);
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
  };

  const closePreview = () => {
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start(() => setPreviewMediaAsset(null));
  };

  const removeImage = (uri: string) => {
    setSelectedImages(prevImages => prevImages.filter(image => image.uri !== uri));
    setOcrResults(prevResults => {
      const updatedResults = { ...prevResults };
      delete updatedResults[uri];
      return updatedResults;
    });
  };

  const handleMediaPreview = (media: ImagePickerAsset) => {
    openPreview(media);
  };

  // 이미지 유형 변경 핸들러는 ImageTypeSelector.tsx에서 가져온 onTypeChange 프롭으로 대체됩니다.
  // const handleImageTypeChange = (uri: string, type: ImageType) => {
  //   setImageTypes(prev => ({ ...prev, [uri]: type }));
  // };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      keyboardShouldPersistTaps="handled"
    >
      <BlurView intensity={20} style={styles.header}>
        <Image style={styles.logo} source={require('../../assets/images/logoBlue.png')} />
        <View style={styles.headerTextContainer}>
          <Text style={styles.title}>찾기</Text>
          <Text style={styles.subtitle}>미디어에서 정보를 찾아보세요</Text>
        </View>
      </BlurView>

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[styles.actionButton, styles.uploadButton]}
          onPress={handleChooseMedia}
        >
          <MaterialIcons name="photo-library" size={24} color="#fff" />
          <Text style={styles.buttonText}>미디어 업로드</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionButton, styles.cameraButton]}
          onPress={handleTakePhoto}
        >
          <MaterialIcons name="camera-alt" size={24} color="#fff" />
          <Text style={styles.buttonText}>사진 촬영</Text>
        </TouchableOpacity>
      </View>

      {selectedImages.length > 0 && (
        <View style={styles.imagesSection}>
          <Text style={styles.sectionTitle}>선택된 미디어</Text>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.imagesScrollContainer}
          >
            {selectedImages.map((media, index) => (
              <View key={media.assetId || media.uri} style={styles.imageWrapper}>
                {media.type === 'video' ? (
                  <VideoPreview
                    videoUri={media.uri}
                    onPress={() => handleMediaPreview(media)}
                  />
                ) : (
                  <TouchableOpacity
                    onPress={() => handleMediaPreview(media)}
                    style={styles.imageTouchable}
                  >
                    <Image source={{ uri: media.uri }} style={styles.imageThumbnail} />
                    {isLoadingOcr[media.uri] && (
                      <View style={styles.loadingOverlayThumb}>
                        <ActivityIndicator size="small" color="#fff" />
                      </View>
                    )}
                  </TouchableOpacity>
                )}
                {/* Always show ImageTypeSelector if media exists, regardless of type */}
                <ImageTypeSelector 
                  uri={media.uri} 
                  currentType={imageTypes[media.uri] || 'OTHER'} 
                  onTypeChange={handleTypeChange} 
                />
                <TouchableOpacity
                  style={styles.deleteButton}
                  onPress={() => removeImage(media.uri)}
                >
                  <MaterialIcons name="close" size={20} color="#fff" />
                </TouchableOpacity>
              </View>
            ))}
          </ScrollView>
        </View>
      )}

      {/* 미디어 상세 보기 모달 (이전에 분리한 컴포넌트) */}
      <MediaPreviewModal
        visible={!!previewMediaAsset}
        onClose={closePreview}
        mediaAsset={previewMediaAsset}
        ocrText={previewMediaAsset ? ocrResults[previewMediaAsset.uri] || null : null}
        isLoadingOcr={previewMediaAsset ? !!isLoadingOcr[previewMediaAsset.uri] : false}
        colorScheme={colorScheme}
      >
        <Text>이미지 유형: {imageTypes[previewMediaAsset?.uri || ''] || '기타'}</Text>
      </MediaPreviewModal>

      <View style={styles.summarySection}>
        <SummarizationSection
          questionText={questionText}
          setQuestionText={setQuestionText}
          handleGetInfo={handleGetInfo}
          infoResult={infoResult}
          isFetchingInfo={isFetchingInfo}
        />
      </View>
    </ScrollView>
  );
}
