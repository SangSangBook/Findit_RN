import React, { useState, useEffect } from 'react';
import { getInfoFromTextWithOpenAI } from '../api/openaiApi'; // OpenAI 정보 추출 함수 임포트
import { ocrWithGoogleVision } from '../api/googleVisionApi'; // Google Vision OCR 함수 임포트
import { StyleSheet, View, Text, ScrollView, Platform, Alert, Image } from 'react-native'; // 필요한 컴포넌트만 남김
import * as ImagePicker from 'expo-image-picker';
import Button from '../components/Button'; // 공통 버튼 컴포넌트
import ImagePreview from '../components/ImagePreview'; // 이미지 미리보기 컴포넌트
import SummarizationSection from '../components/SummarizationSection'; // 요약 섹션 컴포넌트
import { OPENAI_API_KEY, GOOGLE_CLOUD_VISION_API_KEY } from '@env';

interface SelectedImage {
  uri: string;
  width?: number;
  height?: number;
  assetId?: string;
  type?: 'image' | 'video'; // expo-image-picker의 AssetInfo 타입과 유사하게
}

// OCR 로딩 상태를 위한 인터페이스 (각 이미지 URI별로 boolean 값)
interface OcrLoadingState {
  [uri: string]: boolean;
}

export default function HomeScreen() {
  // 선택된 이미지 상태 (expo-image-picker의 Asset 객체 배열)
  const [selectedImages, setSelectedImages] = useState<ImagePicker.ImagePickerAsset[]>([]);
  // OCR 결과 상태 (이미지 URI를 키로, OCR 결과 문자열 또는 null을 값으로 가짐)
  const [ocrResults, setOcrResults] = useState<{[uri: string]: string | null}>({});
  // 로딩 상태 (이미지 URI를 키로, 로딩 중 여부를 값으로 가짐)
  const [isLoadingOcr, setIsLoadingOcr] = useState<OcrLoadingState>({});
  // OpenAI 정보 추출을 위한 상태 변수들
  const [questionText, setQuestionText] = useState<string>(''); // OCR 텍스트에 대한 사용자 질문
  const [infoResult, setInfoResult] = useState<string | null>(null); // 정보 추출 결과
  const [isFetchingInfo, setIsFetchingInfo] = useState<boolean>(false); // 정보 추출 진행 중 상태
  const [assetUriMap, setAssetUriMap] = useState<{ [internalUri: string]: string | undefined }>({});
  const [cameraPermissionStatus, setCameraPermissionStatus] = useState<ImagePicker.PermissionStatus | null>(null);

  useEffect(() => {
    if (!OPENAI_API_KEY || !GOOGLE_CLOUD_VISION_API_KEY) {
      Alert.alert(
        'API 키 오류',
        'OpenAI 또는 Google Cloud Vision API 키가 설정되지 않았습니다. .env 파일을 확인해주세요.',
      );
    }
    // 앱 시작 시 카메라 권한 요청
    (async () => {
      const permission = await ImagePicker.requestCameraPermissionsAsync();
      setCameraPermissionStatus(permission.status);
    })();
  }, []);

  // 카메라 권한 확인 및 요청 함수
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

  // 이미지 선택 핸들러
  const handleChooseImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsMultipleSelection: true, // 여러 이미지 선택 허용
        quality: 1,
      });

      if (!result.canceled && result.assets) {
        setSelectedImages(prevImages => [...prevImages, ...result.assets]);
        
        const newAssetUriMap = { ...assetUriMap };
        result.assets.forEach(asset => {
          newAssetUriMap[asset.uri] = asset.assetId ?? undefined; // 내부 URI와 실제 assetId 매핑
        });
        setAssetUriMap(newAssetUriMap);

        // 선택된 각 이미지에 대해 OCR 실행
        result.assets.forEach(async (asset) => {
          if (asset.uri) {
            setIsLoadingOcr(prev => ({ ...prev, [asset.uri]: true }));
            try {
              const text = await ocrWithGoogleVision(asset.uri); // OCR API 호출
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

  // 사진 촬영 핸들러
  const handleTakePhoto = async () => {
    const hasPermission = await verifyCameraPermissions();
    if (!hasPermission) {
      return;
    }

    try {
      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: false, // 촬영 후 편집 허용 안 함
        quality: 1,
      });

      if (!result.canceled && result.assets) {
        const newImage = result.assets[0];
        setSelectedImages(prevImages => [...prevImages, newImage]);

        const newAssetUriMap = { ...assetUriMap };
        newAssetUriMap[newImage.uri] = newImage.assetId ?? undefined;
        
        // 촬영된 이미지에 대해 OCR 실행
        setIsLoadingOcr(prev => ({ ...prev, [newImage.uri]: true }));
        try {
          const text = await ocrWithGoogleVision(newImage.uri); // OCR API 호출
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

  // OCR 텍스트와 사용자 질문을 기반으로 OpenAI를 사용하여 정보를 추출하는 함수
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

    setIsFetchingInfo(true); // 정보 추출 시작
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
      setIsFetchingInfo(false); // 정보 추출 완료
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.scrollContainer} keyboardShouldPersistTaps="handled">
      <View style={styles.container}>
        <Text style={styles.logo}>Findit</Text>
        <View style={styles.buttonContainer}>
          <Button title="사진 업로드" onPress={handleChooseImage} />
          <Button title="사진 촬영" onPress={handleTakePhoto} />
        </View>

        {selectedImages.length > 0 && (
          <Text style={styles.sectionTitle}>선택된 이미지 및 OCR 결과</Text>
        )}
        <ScrollView horizontal contentContainerStyle={styles.imagePreviewListContainer}>
          {selectedImages.map((image) => (
            <ImagePreview
              key={image.uri} // 각 Asset은 고유한 uri를 가질 수 있음
              image={image}
              ocrText={ocrResults[image.uri]}
              isLoadingOcr={isLoadingOcr[image.uri] || false} // isLoadingOcr[image.uri]가 undefined일 경우 false
            />
          ))}
        </ScrollView>

        {/* OCR 텍스트에 대한 질문 및 OpenAI 정보 추출 UI */}
        <SummarizationSection 
          questionText={questionText} 
          setQuestionText={setQuestionText} 
          infoResult={infoResult}
          isFetchingInfo={isFetchingInfo}
          handleGetInfo={handleGetInfo}
        />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1, // ScrollView가 전체 화면을 채우도록 함
  },
  container: {
    flex: 1,
    alignItems: 'center',
    // justifyContent: 'center', // ScrollView 사용 시 중앙 정렬은 scrollContainer에서 관리
    backgroundColor: '#fff',
    paddingTop: Platform.OS === 'android' ? 25 : 50, // 안드로이드 상태 표시줄 높이 고려 및 iOS 상단 여백
    paddingBottom: 20, // 하단 여백 추가
  },
  logo: {
    fontSize: 48,
    fontWeight: 'bold',
    // marginTop: 40, // paddingTop으로 대체
    marginBottom: 30,
    color: '#000',
  },
  buttonContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  sectionTitle: { // 섹션 제목 스타일 추가
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 20,
    marginBottom: 10,
    color: '#333',
  },
  imagePreviewListContainer: { // 가로 스크롤 컨테이너 스타일
    paddingHorizontal: 10, // 좌우 패딩
    alignItems: 'flex-start', // 아이템들을 위쪽으로 정렬
  },
  // 기존 imageContainer, previewImage, ocrTextScrollView, ocrText 스타일은 ImagePreview.tsx로 이동
  // 기존 summarizeContainer, summarizeTitle, textInput, summaryResultScrollView, summaryResultText 스타일은 SummarizationSection.tsx로 이동
  // 기존 button, buttonText 스타일은 Button.tsx로 이동
});
