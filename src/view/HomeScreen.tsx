import { GOOGLE_CLOUD_VISION_API_KEY, OPENAI_API_KEY } from '@env';
import { MaterialIcons } from '@expo/vector-icons'; // MaterialIcons는 MediaPreviewModal에서 사용될 수 있으므로 유지하거나, HomeScreen에서 직접 사용되지 않으면 삭제 가능
import { BlurView } from 'expo-blur';
import * as ImageManipulator from 'expo-image-manipulator';
import type { ImagePickerAsset } from 'expo-image-picker';
import * as ImagePicker from 'expo-image-picker';
import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Alert, Animated, Image, Platform, ScrollView, Text, TouchableOpacity, View, useColorScheme, ActionSheetIOS } from 'react-native';
import type { OcrResult } from '../api/googleVisionApi';
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
const [ocrResults, setOcrResults] = useState<{[uri: string]: OcrResult | null}>({});
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
      const ocrResult = await ocrWithGoogleVision(imageUri);
      console.log('OCR Result:', {
        imageUri,
        ocrResult
      });

      if (ocrResult && ocrResult.textBoxes.length > 0) {
        setOcrResults(prevResults => ({ ...prevResults, [imageUri]: ocrResult }));
        const detectedType = detectImageType(ocrResult.fullText);
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
        // combinedText은 string이므로 타입 오류 발생. null로 대체하거나, OcrTextBox[]로 변환 필요
      setOcrResults(prevResults => ({ ...prevResults, [videoUri]: null })); // 또는 적절한 OcrTextBox[] 데이터로 변경
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

  const showMediaOptions = () => {
    if (Platform.OS === 'ios') {
      ActionSheetIOS.showActionSheetWithOptions(
        {
          options: ['취소', '사진 보관함', '사진 찍기', '파일 선택'],
          cancelButtonIndex: 0,
        },
        (buttonIndex) => {
          if (buttonIndex === 1) {
            handleChooseMedia();
          } else if (buttonIndex === 2) {
            handleTakePhoto();
          } else if (buttonIndex === 3) {
            handleChooseDocument();
          }
        }
      );
    } else {
      // Android용 Alert 다이얼로그
      Alert.alert(
        '미디어 선택',
        '원하는 옵션을 선택하세요',
        [
          { text: '취소', style: 'cancel' },
          { text: '사진 보관함', onPress: () => handleChooseMedia() },
          { text: '사진 찍기', onPress: () => handleTakePhoto() },
          { text: '파일 선택', onPress: () => handleChooseDocument() },
        ],
        { cancelable: true }
      );
    }
  };

  const handleChooseMedia = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.All, // Using MediaTypeOptions until updated to newer version
        allowsMultipleSelection: true,
        quality: 1,
      });

      if (!result.canceled && result.assets) {
        // 정방향 변환 적용 (이미지에만)
        const manipulatedAssets = await Promise.all(result.assets.map(async asset => {
          if (asset.type === 'image' && asset.uri) {
            const manipulated = await ImageManipulator.manipulateAsync(
              asset.uri,
              [], // no-op, just strip EXIF
              { compress: 1, format: ImageManipulator.SaveFormat.JPEG }
            );
            return { ...asset, uri: manipulated.uri };
          }
          return asset;
        }));

        setSelectedImages(prevImages => [...prevImages, ...manipulatedAssets]);
        const newAssetUriMap = { ...assetUriMap };
        manipulatedAssets.forEach(asset => {
          newAssetUriMap[asset.uri] = asset.assetId ?? undefined;
        });
        setAssetUriMap(newAssetUriMap);

        // 각 미디어에 대해 OCR 처리
        for (const asset of manipulatedAssets) {
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
  
  const handleChooseDocument = async () => {
    try {
      // 문서 선택 기능은 Expo의 DocumentPicker를 사용해야 하지만,
      // 현재 프로젝트에 포함되어 있지 않아 알림으로 대체합니다.
      Alert.alert(
        '알림',
        '문서 선택 기능을 사용하려면 expo-document-picker 패키지를 설치해야 합니다.',
        [{ text: '확인', onPress: () => console.log('문서 선택 기능 필요') }]
      );
      
      // 실제 구현은 아래와 같이 할 수 있습니다:
      // import * as DocumentPicker from 'expo-document-picker';
      // const result = await DocumentPicker.getDocumentAsync({ type: '*/*' });
      // if (result.type === 'success') {
      //   // 선택된 문서 처리
      // }
    } catch (error) {
      console.error('문서 선택 오류:', error);
      Alert.alert('오류', '문서를 선택하는 중 오류가 발생했습니다.');
    }
  };

  const handleTakePhoto = async () => {
    const hasPermission = await verifyCameraPermissions();
    if (!hasPermission) return;

    try {
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images, // Using MediaTypeOptions until updated to newer version
        allowsEditing: false,
        quality: 1,
      });

      if (!result.canceled && result.assets) {
        let newImage = result.assets[0];
        if (newImage.type === 'image' && newImage.uri) {
          const manipulated = await ImageManipulator.manipulateAsync(
            newImage.uri,
            [], // no-op, just strip EXIF
            { compress: 1, format: ImageManipulator.SaveFormat.JPEG }
          );
          newImage = { ...newImage, uri: manipulated.uri };
        }
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
    // 선택된 이미지가 없으면 알림 표시
    if (selectedImages.length === 0) {
      Alert.alert('알림', '이미지를 먼저 선택해주세요.');
      return;
    }

    // OCR 결과가 없는 이미지가 있으면 처리 중이라고 알림
    const notProcessedImages = selectedImages.filter(img => !ocrResults[img.uri]);
    if (notProcessedImages.length > 0) {
      const isOcrRunning = Object.values(isLoadingOcr).some(loading => loading);
      if (isOcrRunning) {
        Alert.alert('처리 중', '일부 이미지의 텍스트 인식이 아직 진행 중입니다. 잠시 후 다시 시도해주세요.');
      } else {
        Alert.alert('텍스트 인식 필요', '일부 이미지에서 텍스트를 인식하지 못했습니다. 다시 시도해주세요.');
      }
      return;
    }

    setIsFetchingInfo(true);
    setInfoResult(null);

    try {
      // 선택된 모든 이미지의 OCR 텍스트를 결합
      let allText = '';
      let questionPrompt = '';

      // 이미지 유형에 따라 프롬프트 추가
      selectedImages.forEach(img => {
        const uri = img.uri;
        const ocrResult = ocrResults[uri];
        const imageType = imageTypes[uri] || 'OTHER';

        if (ocrResult) {
          // OCR 텍스트 결합 (전체 텍스트 사용)
          allText += ocrResult.fullText + '\n\n';

          // 이미지 유형에 따른 프롬프트 추가
          const typePrompt = IMAGE_TYPE_PROMPTS[imageType];
          if (typePrompt) {
            questionPrompt += typePrompt + '\n';
          }
        }
      });

      // 사용자 질문 추가
      if (questionText.trim()) {
        questionPrompt += `질문: ${questionText.trim()}`;
      }

      // 최종 텍스트 구성
      const finalText = allText + (questionPrompt ? '\n\n' + questionPrompt : '');

      // OpenAI API 호출
      const information = await getInfoFromTextWithOpenAI(finalText);
      setInfoResult(information);

      // 애니메이션 효과 적용
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }).start();

      console.log('Sending to OpenAI:', finalText);
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
        {/* <Image style={styles.logo} source={require('../../assets/images/logoBlue.png')} /> */}
        <View style={styles.headerTextContainer}>
          <Text style={styles.title}>Findit!</Text>
          <Text style={styles.subtitle}>
            미디어에서{'\n'}
            정보를{'\n'}
            찾아보세요{'\n'}
          </Text>
        </View>
      </BlurView>

      <View style={styles.summarySection}>
        <SummarizationSection
          questionText={questionText}
          setQuestionText={setQuestionText}
          handleGetInfo={handleGetInfo}
          infoResult={infoResult}
          isFetchingInfo={isFetchingInfo}
        />
        
        <TouchableOpacity
          style={styles.imageUploadButton}
          onPress={showMediaOptions}
        >
          <MaterialIcons name="add" size={48} color="#8e8e8e" />
          <Text style={styles.imageUploadButtonText}>미디어 업로드</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.getInfoButton} onPress={handleGetInfo}>
          <Text style={styles.getInfoButtonText}>미디어 정보 가져오기</Text>
        </TouchableOpacity>
      </View>

      {/* <View style={styles.buttonContainer}>
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
      </View> */}

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
        ocrResult={ocrResults[previewMediaAsset?.uri || '']}
        isLoadingOcr={isLoadingOcr[previewMediaAsset?.uri || '']}
        colorScheme={colorScheme}
      >
        <Text>이미지 유형: {imageTypes[previewMediaAsset?.uri || ''] || '기타'}</Text>
      </MediaPreviewModal>
    </ScrollView>
  );
}
