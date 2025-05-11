import { GOOGLE_CLOUD_VISION_API_KEY, OPENAI_API_KEY } from '@env';
import { MaterialIcons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import * as ImagePicker from 'expo-image-picker';
import type { ImagePickerAsset } from 'expo-image-picker';
import { useEffect, useRef, useState } from 'react';
import { Alert, Animated, Image, Modal, ScrollView, Text, TouchableOpacity, TouchableWithoutFeedback, View, ActivityIndicator } from 'react-native';
import { ocrWithGoogleVision } from '../api/googleVisionApi';
import { getInfoFromTextWithOpenAI } from '../api/openaiApi';
import { extractTextFromVideo } from '../api/videoOcrApi';
import ImagePreview from '../components/ImagePreview';
import SummarizationSection from '../components/SummarizationSection';
import VideoPreview from '../components/VideoPreview';
import { homeScreenStyles as styles } from '../styles/HomeScreen.styles';

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

export default function HomeScreen() {
  const [selectedImages, setSelectedImages] = useState<ImagePickerAsset[]>([]);
  const [infoResult, setInfoResult] = useState<string | null>(null);
  const [ocrResults, setOcrResults] = useState<{[uri: string]: string | null}>({});
  const [isLoadingOcr, setIsLoadingOcr] = useState<OcrLoadingState>({});
  const [questionText, setQuestionText] = useState<string>('');
  const [previewMediaAsset, setPreviewMediaAsset] = useState<ImagePickerAsset | null>(null);
  const [isFetchingInfo, setIsFetchingInfo] = useState<boolean>(false);
  const [cameraPermissionStatus, setCameraPermissionStatus] = useState<ImagePicker.PermissionStatus | null>(null);
  const [assetUriMap, setAssetUriMap] = useState<{ [internalUri: string]: string | undefined }>({});
  const fadeAnim = useRef(new Animated.Value(0)).current;

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
      } else {
        setOcrResults(prevResults => ({ ...prevResults, [imageUri]: null }));
      }
    } catch (error) {
      console.error(`이미지 OCR 오류 (${imageUri}):`, error);
      setOcrResults(prevResults => ({ ...prevResults, [imageUri]: null }));
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
    const lastMedia = selectedImages[selectedImages.length - 1];
    if (!lastMedia || !lastMedia.uri) {
      setInfoResult('선택된 미디어가 유효하지 않습니다.');
      return;
    }

    const lastMediaOcrText = ocrResults[lastMedia.uri];
    if (!lastMediaOcrText) {
      setInfoResult('선택된 미디어의 텍스트를 인식하지 못했습니다. 다른 미디어를 시도해주세요.');
      return;
    }

    // 질문에서 특정 순서를 파악
    const question = questionText.trim();
    if (!question) {
      setInfoResult('질문을 입력해주세요.');
      return;
    }

    let targetIndex = selectedImages.length - 1; // 기본적으로 마지막 사진
    if (question.includes('첫 번째')) {
      targetIndex = 0;
    } else if (question.includes('두 번째')) {
      targetIndex = 1;
    } else if (question.includes('세 번째')) {
      targetIndex = 2;
    } else if (question.includes('네 번째')) {
      targetIndex = 3;
    } else if (question.includes('다섯 번째')) {
      targetIndex = 4;
    }

    // 선택된 순서의 이미지 가져오기
    const targetImage = selectedImages[targetIndex];
    if (!targetImage || !targetImage.uri) {
      setInfoResult('질문에 해당하는 이미지가 없습니다.');
      return;
    }

    const ocrText = ocrResults[targetImage.uri];
    if (!ocrText) {
      setInfoResult('선택된 이미지의 텍스트를 인식하지 못했습니다. 다른 이미지를 시도해주세요.');
      return;
    }

    setIsFetchingInfo(true);
    try {
      const textForOpenAI = `${ocrText}\n\n질문: ${question}`;
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

      <Modal
        visible={!!previewMediaAsset}
        transparent={true} // 배경 투명도를 위해 true 유지, modalOverlay에서 배경색 제어
        animationType="slide" // 아래에서 위로 올라오는 효과
        presentationStyle={"pageSheet"} // iOS에서 시트 형태로 표시
        onRequestClose={closePreview}
      >
        <TouchableWithoutFeedback onPress={closePreview}>
          <Animated.View
            style={[
              styles.modalOverlay,
              { opacity: fadeAnim },
            ]}
          >
            {previewMediaAsset && (
              <ImagePreview
                image={previewMediaAsset}
                ocrText={ocrResults[previewMediaAsset.uri] || ''}
                isLoadingOcr={!!isLoadingOcr[previewMediaAsset.uri]}
              />
            )}
          </Animated.View>
        </TouchableWithoutFeedback>
      </Modal>

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
