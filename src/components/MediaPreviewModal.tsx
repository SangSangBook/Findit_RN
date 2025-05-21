// MediaPreviewModal.tsx
import { MaterialIcons } from '@expo/vector-icons';
import { Audio } from 'expo-av';
import { ImagePickerAsset } from 'expo-image-picker';
import React, { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Animated,
  Dimensions,
  Keyboard,
  Platform,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import Modal from 'react-native-modal';
import { getInfoFromTextWithOpenAI } from '../api/openaiApi';
import { speechToText, startRecording, stopRecording, textToSpeech } from '../api/speechApi';
import { getThemedStyles } from '../styles/MediaPreviewModal.styles';
import ImagePreview from './ImagePreview';
import LoadingWave from './LoadingWave'; // LoadingWave 컴포넌트 임포트

import type { OcrResult } from '../api/googleVisionApi';

interface MediaPreviewModalProps {
  visible: boolean;
  onClose: () => void;
  mediaAsset: ImagePickerAsset | null;
  ocrResult: OcrResult | null;
  isLoadingOcr: boolean;
  colorScheme: 'light' | 'dark';
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  analysisResult: {
    objects: Array<{
      name: string;
      confidence: number;
      boundingBox: Array<{ x: number; y: number }>;
    }>;
  } | null;
  children?: React.ReactNode;
}

const MediaPreviewModal: React.FC<MediaPreviewModalProps> = ({
  visible,
  onClose,
  mediaAsset,
  ocrResult,
  isLoadingOcr,
  colorScheme,
  searchTerm,
  setSearchTerm,
  analysisResult = null,
  children,
}) => {
  const [textFieldValue, setTextFieldValue] = useState('');
  const [modalHeight, setModalHeight] = useState(0.8);
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const searchFieldPosition = new Animated.Value(0);
  const underlineAnim = useRef(new Animated.Value(0)).current;
  
  // 로컬에서 직접 상태 관리
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessingSpeech, setIsProcessingSpeech] = useState(false);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [isProcessingAI, setIsProcessingAI] = useState(false);
  
  // 녹음 관련 참조
  const recordingRef = useRef<Audio.Recording | null>(null);
  const soundRef = useRef<Audio.Sound | null>(null);
  const recordingStartTimeRef = useRef<number>(0);
  
  // 녹음 버튼 비활성화 여부 계산
  const isRecordButtonDisabled = isLoadingOcr || isProcessingSpeech || isProcessingAI || 
    !ocrResult || !ocrResult.fullText || ocrResult.fullText.trim() === '';

  // 오디오 중지 함수
  const stopCurrentAudio = async () => {
    try {
      if (soundRef.current) {
        await soundRef.current.stopAsync();
        await soundRef.current.unloadAsync();
        soundRef.current = null;
      }
      setIsPlayingAudio(false);
    } catch (error) {
      console.error('오디오 중지 중 오류:', error);
      setIsPlayingAudio(false);
    }
  };

  // 상태 초기화 함수
  const resetStates = () => {
    setIsRecording(false);
    setIsProcessingSpeech(false);
    setIsPlayingAudio(false);
    setIsProcessingAI(false);
  };

  // 음성 녹음 시작
  const handleStartRecording = async () => {
    try {
      // 이미 녹음 중이면 무시
      if (isRecording) return;
      
      // 오디오 재생 중이면 중지
      await stopCurrentAudio();
      
      // 녹음 시작 시간 기록
      recordingStartTimeRef.current = Date.now();
      
      // 녹음 시작
      setIsRecording(true);
      recordingRef.current = await startRecording();
      console.log('녹음 시작됨');
    } catch (error) {
      console.error('녹음 시작 오류:', error);
      setIsRecording(false);
      recordingRef.current = null;
    }
  };

  // 음성 녹음 중지 및 처리
  const handleStopRecording = async () => {
    try {
      // 녹음 중이 아니면 무시
      if (!isRecording || !recordingRef.current) {
        setIsRecording(false);
        return;
      }
      
      // 녹음 시간 계산
      const recordingDuration = Date.now() - recordingStartTimeRef.current;
      console.log(`녹음 시간: ${recordingDuration}ms`);
      
      // 너무 짧은 녹음인 경우 처리 중단 (300ms 미만)
      if (recordingDuration < 300) {
        console.log('녹음이 너무 짧습니다. 처리 중단');
        
        try {
          // 녹음 중지는 시도하되 결과는 무시
          await recordingRef.current.stopAndUnloadAsync();
        } catch (stopError) {
          console.error('짧은 녹음 중지 중 오류:', stopError);
        }
        
        recordingRef.current = null;
        setIsRecording(false);
        return;
      }
      
      // 녹음 중지 및 STT 처리 시작
      setIsRecording(false);
      setIsProcessingSpeech(true);
      
      // 녹음된 오디오 URI 가져오기
      const audioUri = await stopRecording(recordingRef.current);
      recordingRef.current = null;
      
      // STT 처리
      const transcribedText = await speechToText(audioUri);
      
      // 텍스트가 없거나 '인식된 텍스트가 없습니다.' 메시지인 경우
      if (!transcribedText || transcribedText.trim() === '' || transcribedText === '인식된 텍스트가 없습니다.') {
        console.log('음성 인식 실패 또는 텍스트 없음');
        setIsProcessingSpeech(false);
        return;
      }
      
      console.log('변환된 텍스트:', transcribedText);
      
      // OpenAI API 호출 및 TTS 처리
      await processVoiceCommand(transcribedText);
      
    } catch (error) {
      console.error('녹음 중지 처리 중 오류:', error);
      resetStates();
    }
  };

  // 음성 명령 처리 함수
  const processVoiceCommand = async (transcribedText: string) => {
    try {
      if (!ocrResult || !ocrResult.fullText) {
        setIsProcessingSpeech(false);
        return;
      }
      
      // AI 처리 중 상태 활성화
      setIsProcessingAI(true);
      
      // OCR 결과 및 물체 인식 결과 포함
      let analysisText = ocrResult.fullText;
      
      // 물체 인식 결과 추가
      if (analysisResult && analysisResult.objects && analysisResult.objects.length > 0) {
        analysisText += '\n\n[감지된 물체]\n';
        analysisResult.objects.forEach(obj => {
          analysisText += `- ${obj.name} (신뢰도: ${Math.round(obj.confidence * 100)}%)\n`;
        });
      }
      
      // 음성으로 받은 질문 추가
      analysisText += `\n\n질문: ${transcribedText.trim()}`;
      
      // OpenAI API 호출
      const aiResponse = await getInfoFromTextWithOpenAI(analysisText);
      console.log('AI 응답 받음');
      
      // TTS 변환 및 재생
      const ttsUri = await textToSpeech(aiResponse);
      
      if (ttsUri) {
        setIsPlayingAudio(true);
        
        // 오디오 로드 및 재생
        const { sound } = await Audio.Sound.createAsync(
          { uri: ttsUri },
          { shouldPlay: true }
        );
        
        soundRef.current = sound;
        
        // 재생 완료 감지
        sound.setOnPlaybackStatusUpdate((status) => {
          if (status.isLoaded && status.didJustFinish) {
            sound.unloadAsync();
            soundRef.current = null;
            setIsPlayingAudio(false);
          }
        });
      }
    } catch (error) {
      console.error('음성 명령 처리 중 오류:', error);
    } finally {
      setIsProcessingSpeech(false);
      setIsProcessingAI(false);
    }
  };
  
  // 텍스트 입력 변경 핸들러
  const handleTextChange = (text: string) => {
    setTextFieldValue(text);
    setSearchTerm(text);
  };

  useEffect(() => {
    if (mediaAsset) {
      const screenHeight = Dimensions.get('window').height;
      const screenWidth = Dimensions.get('window').width;
      const imageRatio = mediaAsset.width / mediaAsset.height;
      const screenRatio = screenWidth / screenHeight;

      let heightRatio = 0.8;
      if (imageRatio < screenRatio) {
        // 세로로 긴 이미지: 더 많은 화면을 사용
        heightRatio = Math.min(0.95, mediaAsset.height / screenHeight + 0.15);
      } else {
        // 가로로 넓은 이미지: 기본값 또는 더 작은 값
        heightRatio = 0.7;
      }
      setModalHeight(heightRatio);
    }
  }, [mediaAsset]);

  useEffect(() => {
    const keyboardWillShow = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow',
      (e) => {
        setKeyboardHeight(e.endCoordinates.height);
        Animated.timing(searchFieldPosition, {
          toValue: -e.endCoordinates.height,
          duration: 250,
          useNativeDriver: true,
        }).start();
      }
    );

    const keyboardWillHide = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide',
      () => {
        setKeyboardHeight(0);
        Animated.timing(searchFieldPosition, {
          toValue: 0,
          duration: 250,
          useNativeDriver: true,
        }).start();
      }
    );

    return () => {
      keyboardWillShow.remove();
      keyboardWillHide.remove();
      
      // 모달이 닫힐 때 오디오 정리
      stopCurrentAudio();
    };
  }, []);

  useEffect(() => {
    Animated.timing(underlineAnim, {
      toValue: textFieldValue.length > 0 ? 1 : 0,
      duration: 250,
      useNativeDriver: false,
    }).start();
  }, [textFieldValue]);
  
  // 모달 닫힐 때 상태 초기화
  useEffect(() => {
    if (!visible) {
      resetStates();
      stopCurrentAudio();
      
      // 녹음 객체가 있으면 중지
      if (recordingRef.current) {
        recordingRef.current.stopAndUnloadAsync().catch(error => {
          console.error('녹음 객체 정리 중 오류:', error);
        }).finally(() => {
          recordingRef.current = null;
        });
      }
    }
  }, [visible]);

  // 디버깅용 로그
  useEffect(() => {
    console.log('녹음 상태 변경:', isRecording);
  }, [isRecording]);

  useEffect(() => {
    console.log('오디오 재생 상태 변경:', isPlayingAudio);
  }, [isPlayingAudio]);

  if (!mediaAsset) {
    return null;
  }

  const isDarkMode = colorScheme === 'dark';
  const { styles, closeButtonIconColor, placeholderTextColor } = getThemedStyles(isDarkMode);

  return (
    <Modal
      isVisible={visible}
      onBackdropPress={onClose}
      onSwipeComplete={onClose}
      swipeDirection={['down']}
      style={styles.modal}
      backdropOpacity={0.4}
      animationIn="slideInUp"
      animationOut="slideOutDown"
      propagateSwipe={true}
      statusBarTranslucent={true}
    >
      <View style={[styles.bottomSheet, { height: `${modalHeight * 100}%` }]}>
        <View style={styles.bottomSheetHeader}>
          <View style={styles.bottomSheetHandle} />
        </View>
        
        <View style={styles.bottomSheetContent}>
          <View style={styles.previewTitleContainer}>
            <Text style={styles.previewTitle}>Find it</Text>
            <Text style={[styles.previewTitle, styles.previewTitleDot]}>!</Text>
          </View>

          <View style={{ flex: 1 }}>
            <ImagePreview
              image={mediaAsset}
              ocrResult={ocrResult}
              isLoadingOcr={isLoadingOcr}
              searchTerm={searchTerm}
              analysisResult={analysisResult}
            />
          </View>

          <Animated.View
            style={[
              styles.textFieldWrapper,
              {
                position: 'absolute',
                left: 0,
                right: 0,
                bottom: Platform.OS === 'ios' ? Math.max(0, keyboardHeight - 19) : keyboardHeight + 5,
                zIndex: 1000,
                backgroundColor: styles.textFieldWrapper.backgroundColor,
              }
            ]}
          >
            <View style={styles.textFieldContainerRow}>
              <TouchableOpacity
                style={[
                  styles.circleButton,
                  isRecording && styles.circleButtonRecording,
                  isPlayingAudio && styles.circleButtonPlaying,
                  (!isRecording && !isPlayingAudio && isRecordButtonDisabled) && styles.circleButtonDisabled
                ]}
                onPressIn={(!isRecording && !isPlayingAudio && !isRecordButtonDisabled) ? handleStartRecording : undefined}
                onPressOut={isRecording ? handleStopRecording : undefined}
                onPress={isPlayingAudio ? stopCurrentAudio : undefined}
                disabled={(!isRecording && !isPlayingAudio && isRecordButtonDisabled) || isProcessingSpeech || isProcessingAI}
              >
                {isLoadingOcr ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : isProcessingSpeech || isProcessingAI ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : isPlayingAudio ? (
                  <LoadingWave color="#FFFFFF" size="small" />
                ) : (
                  <MaterialIcons 
                    name="mic" 
                    size={20} 
                    color={(!isRecording && !isPlayingAudio && isRecordButtonDisabled) ? "#AAAAAA" : "#FFFFFF"} 
                  />
                )}
              </TouchableOpacity>

              <TextInput
                style={styles.textInput}
                placeholder="텍스트를 입력하세요..."
                placeholderTextColor={placeholderTextColor}
                value={textFieldValue}
                onChangeText={handleTextChange}
                returnKeyType="search"
              />

              <TouchableOpacity
                style={styles.clearButton}
                onPress={() => {
                  if (textFieldValue.length > 0) {
                    setTextFieldValue('');
                    setSearchTerm('');
                  }
                }}
                accessibilityLabel="입력 지우기"
                activeOpacity={textFieldValue.length > 0 ? 0.7 : 1}
              >
                <MaterialIcons name="close" size={20} color={textFieldValue.length > 0 ? '#888' : '#ddd'} />
              </TouchableOpacity>
            </View>

            <Animated.View
              style={{
                height: 1,
                backgroundColor: underlineAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: ['#efefef', '#4299E2']
                }),
                marginTop: 2
              }}
            />
          </Animated.View>
        </View>
      </View>
    </Modal>
  );
};

export default MediaPreviewModal;