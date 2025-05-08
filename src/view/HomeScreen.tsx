import React, { useState, useEffect } from 'react';
import { getInfoFromTextWithOpenAI } from '../api/openaiApi'; 
import { ocrWithGoogleVision } from '../api/googleVisionApi'; 
import { ScrollView, View, Text, Platform, Alert, TouchableOpacity } from 'react-native'; 
import * as ImagePicker from 'expo-image-picker';
import Button from '../components/Button'; 
import ImagePreview from '../components/ImagePreview'; 
import SummarizationSection from '../components/SummarizationSection'; 
import { OPENAI_API_KEY, GOOGLE_CLOUD_VISION_API_KEY } from '@env';
import { BlurView } from 'expo-blur';
import { MaterialIcons } from '@expo/vector-icons';
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
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
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

        result.assets.forEach(async (asset) => {
          if (asset.uri) {
            setIsLoadingOcr(prev => ({ ...prev, [asset.uri]: true }));
            try {
              const text = await ocrWithGoogleVision(asset.uri);
              setOcrResults(prevResults => ({ ...prevResults, [asset.uri]: text }));
            } catch (error) {
              console.error(`이미지 OCR 오류 (${asset.uri}):`, error);
              setOcrResults(prevResults => ({ ...prevResults, [asset.uri]: 'OCR 실패' }));
            }
            setIsLoadingOcr(prev => ({ ...prev, [asset.uri]: false }));
          }
        });
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
        allowsEditing: false,
        quality: 1,
      });

      if (!result.canceled && result.assets) {
        const newImage = result.assets[0];
        setSelectedImages(prevImages => [...prevImages, newImage]);
        const newAssetUriMap = { ...assetUriMap };
        newAssetUriMap[newImage.uri] = newImage.assetId ?? undefined;
        setAssetUriMap(newAssetUriMap);

        setIsLoadingOcr(prev => ({ ...prev, [newImage.uri]: true }));
        try {
          const text = await ocrWithGoogleVision(newImage.uri);
          setOcrResults(prevResults => ({ ...prevResults, [newImage.uri]: text }));
        } catch (error) {
          console.error(`사진 OCR 오류 (${newImage.uri}):`, error);
          setOcrResults(prevResults => ({ ...prevResults, [newImage.uri]: 'OCR 실패' }));
        }
        setIsLoadingOcr(prev => ({ ...prev, [newImage.uri]: false }));
      }
    } catch (error) {
      console.error('사진 촬영 오류:', error);
      Alert.alert('오류', '사진을 촬영하는 중 오류가 발생했습니다.');
    }
  };

  const handleGetInfo = async () => {
    if (selectedImages.length === 0) {
      setInfoResult('정보를 추출하려면 먼저 이미지를 선택하거나 촬영하고 OCR을 실행해주세요.');
      return;
    }
    const lastImage = selectedImages[selectedImages.length - 1];
    if (!lastImage || !lastImage.uri) {
      setInfoResult('선택된 이미지가 유효하지 않습니다.');
      return;
    }
    const activeOcrText = ocrResults[lastImage.uri];
    if (!activeOcrText || !activeOcrText.trim()) {
      setInfoResult('선택된 이미지의 OCR 텍스트가 없거나 비어있습니다. OCR이 완료되었는지 확인해주세요.');
      return;
    }
    setIsFetchingInfo(true);
    try {
      let textForOpenAI = activeOcrText;
      if (questionText.trim()) {
        textForOpenAI = `${activeOcrText}\n\n질문: ${questionText.trim()}`;
      }
      const result = await getInfoFromTextWithOpenAI(textForOpenAI);
      setInfoResult(result);
    } catch (error) {
      console.error('OpenAI 정보 추출 오류:', error);
      setInfoResult('정보를 추출하는 중 오류가 발생했습니다.');
    } finally {
      setIsFetchingInfo(false);
    }
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
                <ImagePreview
                  image={image}
                  ocrText={ocrResults[image.uri]}
                  isLoadingOcr={isLoadingOcr[image.uri] || false}
                />
              </View>
            ))}
          </ScrollView>
        </View>
      )}

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
