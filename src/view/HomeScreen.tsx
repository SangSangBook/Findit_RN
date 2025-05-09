import { GOOGLE_CLOUD_VISION_API_KEY, OPENAI_API_KEY } from '@env';
import { MaterialIcons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import * as ImagePicker from 'expo-image-picker';
import React, { useEffect, useRef, useState } from 'react';
import { Alert, Animated, Image, Modal, ScrollView, Text, TouchableOpacity, TouchableWithoutFeedback, View } from 'react-native';
import { ocrWithGoogleVision } from '../api/googleVisionApi';
import { getInfoFromTextWithOpenAI } from '../api/openaiApi';
import ImagePreview from '../components/ImagePreview';
import SummarizationSection from '../components/SummarizationSection';
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
  const [selectedImages, setSelectedImages] = useState<ImagePicker.ImagePickerAsset[]>([]);
  const [ocrResults, setOcrResults] = useState<{[uri: string]: string | null}>({});
  const [isLoadingOcr, setIsLoadingOcr] = useState<OcrLoadingState>({});
  const [questionText, setQuestionText] = useState<string>('');
  const [infoResult, setInfoResult] = useState<string | null>(null);
  const [isFetchingInfo, setIsFetchingInfo] = useState<boolean>(false);
  const [cameraPermissionStatus, setCameraPermissionStatus] = useState<ImagePicker.PermissionStatus | null>(null);
  const [assetUriMap, setAssetUriMap] = useState<{ [internalUri: string]: string | undefined }>({});
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  const processImageWithOCR = async (imageUri: string) => {
    setIsLoadingOcr(prev => ({ ...prev, [imageUri]: true }));
    try {
      const text = await ocrWithGoogleVision(imageUri);
      console.log('OCR Result:', {
        imageUri,
        text
      });

      // OCR 결과 저장
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

  const handleChooseImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: 'images',
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

        // 각 이미지에 대해 OCR 처리
        for (const asset of result.assets) {
          if (asset.uri) {
            await processImageWithOCR(asset.uri);
          }
        }
      }
    } catch (error) {
      console.error('이미지 선택 오류:', error);
      Alert.alert('오류', '이미지를 선택하는 중 오류가 발생했습니다.');
    }
  };

  const handleTakePhoto = async () => {
    const hasPermission = await verifyCameraPermissions();
    if (!hasPermission) return;

    try {
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: 'images',
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
      setInfoResult('정보를 추출하려면 먼저 이미지를 선택하거나 촬영해주세요.');
      return;
    }
    const lastImage = selectedImages[selectedImages.length - 1];
    if (!lastImage || !lastImage.uri) {
      setInfoResult('선택된 이미지가 유효하지 않습니다.');
      return;
    }

    const ocrText = ocrResults[lastImage.uri];
    if (!ocrText) {
      setInfoResult('선택된 이미지의 텍스트를 인식하지 못했습니다. 다른 이미지를 시도해주세요.');
      return;
    }

    const question = questionText.trim();
    if (!question) {
      setInfoResult('질문을 입력해주세요.');
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
      console.error('OpenAI 처리 오류:', error);
      setInfoResult('질문 처리 중 오류가 발생했습니다.');
    } finally {
      setIsFetchingInfo(false);
    }
  };

  const openPreview = (uri: string) => {
    setPreviewImage(uri);
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
    }).start(() => setPreviewImage(null));
  };

  const removeImage = (uri: string) => {
    setSelectedImages(prevImages => prevImages.filter(image => image.uri !== uri));
    setOcrResults(prevResults => {
      const updatedResults = { ...prevResults };
      delete updatedResults[uri];
      return updatedResults;
    });
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      keyboardShouldPersistTaps="handled"
    >
      <BlurView intensity={20} style={styles.header}>
        <Text style={styles.title}>Findit</Text>
        <Text style={styles.subtitle}>이미지에서 정보를 찾아보세요</Text>
      </BlurView>

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[styles.actionButton, styles.uploadButton]}
          onPress={handleChooseImage}
        >
          <MaterialIcons name="photo-library" size={24} color="#fff" />
          <Text style={styles.buttonText}>사진 업로드</Text>
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
          <Text style={styles.sectionTitle}>선택된 이미지</Text>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.imagesScrollContainer}
          >
            {selectedImages.map((image) => (
              <View key={image.uri} style={styles.imageWrapper}>
                <TouchableOpacity
                  onPress={() => openPreview(image.uri)}
                  style={styles.imageTouchable}
                >
                  <ImagePreview
                    image={image}
                    ocrText={ocrResults[image.uri]}
                    isLoadingOcr={isLoadingOcr[image.uri] || false}
                  />
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.deleteButton}
                  onPress={() => removeImage(image.uri)}
                >
                  <MaterialIcons name="close" size={20} color="#fff" />
                </TouchableOpacity>
              </View>
            ))}
          </ScrollView>
        </View>
      )}

      <Modal
        visible={!!previewImage}
        transparent={true}
        animationType="none"
        onRequestClose={closePreview}
      >
        <TouchableWithoutFeedback onPress={closePreview}>
          <Animated.View
            style={[
              styles.modalOverlay,
              { opacity: fadeAnim },
            ]}
          >
            {previewImage && (
              <Image
                source={{ uri: previewImage }}
                style={styles.previewImage}
                resizeMode="contain"
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
