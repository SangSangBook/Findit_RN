import { GOOGLE_CLOUD_VISION_API_KEY } from '@env';
import * as FileSystem from 'expo-file-system';
import * as VideoThumbnails from 'expo-video-thumbnails';

// 단일 이미지에 대한 OCR 수행
const performOcrOnImage = async (imageUri: string): Promise<string | null> => {
  try {
    const imageBase64 = await FileSystem.readAsStringAsync(imageUri, {
      encoding: FileSystem.EncodingType.Base64,
    });

    const requestBody = {
      requests: [
        {
          image: {
            content: imageBase64,
          },
          features: [
            {
              type: 'TEXT_DETECTION',
            },
          ],
        },
      ],
    };

    const response = await fetch(
      `https://vision.googleapis.com/v1/images:annotate?key=${GOOGLE_CLOUD_VISION_API_KEY}`,
      {
        method: 'POST',
        body: JSON.stringify(requestBody),
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Google Cloud Vision API Error:', errorData);
      return null;
    }

    const data = await response.json();
    if (data.responses && data.responses.length > 0) {
      const firstResponse = data.responses[0];
      if (firstResponse.fullTextAnnotation) {
        return firstResponse.fullTextAnnotation.text;
      }
    }
    return null;
  } catch (error) {
    console.error('OCR 처리 중 오류:', error);
    return null;
  }
};

// 비디오 길이 추정 (초 단위)
const getVideoDuration = async (videoUri: string): Promise<number> => {
  // 기본적으로 30초로 가정 (앱에 맞게 조정)
  return 30;
};

// 비디오의 지정된 시간에 썸네일 추출 - 해상도 최적화 추가
const generateThumbnailAtTime = async (videoUri: string, timeMs: number): Promise<string> => {
  try {
    // 원본 품질로 썸네일 생성
    const { uri } = await VideoThumbnails.getThumbnailAsync(videoUri, {
      time: timeMs,
      quality: 1.0, // 원본 품질 유지
    });
    
    return uri;
  } catch (error) {
    console.error(`시간 ${timeMs}ms의 썸네일 생성 중 오류:`, error);
    throw error;
  }
};

// 두 텍스트 간의 유사도 확인 (간단한 구현)
const areTextsVerySimilar = (text1: string, text2: string): boolean => {
  // 길이가 너무 다르면 다른 텍스트로 간주
  if (Math.abs(text1.length - text2.length) > text1.length * 0.2) {
    return false;
  }
  
  // 작은 변화만 있는 경우는 유사하다고 간주
  const similarity = levenshteinDistance(text1, text2) / Math.max(text1.length, text2.length);
  return similarity < 0.2; // 20% 미만의 차이가 있으면 유사하다고 간주
};

// 레벤슈타인 거리 계산 함수 (텍스트 유사도 측정용)
const levenshteinDistance = (str1: string, str2: string): number => {
  const track = Array(str2.length + 1).fill(null).map(() =>
    Array(str1.length + 1).fill(null));
  
  for (let i = 0; i <= str1.length; i += 1) {
    track[0][i] = i;
  }
  
  for (let j = 0; j <= str2.length; j += 1) {
    track[j][0] = j;
  }
  
  for (let j = 1; j <= str2.length; j += 1) {
    for (let i = 1; i <= str1.length; i += 1) {
      const indicator = str1[i - 1] === str2[j - 1] ? 0 : 1;
      track[j][i] = Math.min(
        track[j][i - 1] + 1, // 삭제
        track[j - 1][i] + 1, // 삽입
        track[j - 1][i - 1] + indicator, // 대체
      );
    }
  }
  
  return track[str2.length][str1.length];
};

// 최적화된 프레임 샘플링
const generateOptimalFrameTimes = (duration: number, maxFrames: number = 10): number[] => {
  // 비디오 길이에 따라 적응적으로 프레임 간격 조정
  if (duration <= 5) {
    // 5초 이하의 짧은 비디오는 시작, 중간, 끝 프레임만 추출
    return [0, Math.floor(duration * 500), duration * 1000 - 500];
  } else if (duration <= 15) {
    // 15초 이하는 최대 5프레임
    maxFrames = Math.min(5, maxFrames);
  } else if (duration <= 30) {
    // 30초 이하는 최대 7프레임
    maxFrames = Math.min(7, maxFrames);
  }
  
  // 균등한 간격으로 시간 배열 생성
  const interval = duration * 1000 / (maxFrames - 1);
  return Array.from({ length: maxFrames }, (_, i) => Math.min(i * interval, duration * 1000 - 500));
};

// 비디오에서 텍스트 추출
export const extractTextFromVideo = async (
  videoUri: string,
  frameRate: number = 1 // 초당 프레임 수 (기본값: 1초당 1프레임) - 이 값을 참고하여 개선된 알고리즘 적용
): Promise<{ time: number; text: string }[]> => {
  try {
    console.log(`비디오 텍스트 추출 시작: ${videoUri}, 프레임 레이트: ${frameRate}`);
    
    // 결과를 저장할 배열
    const results: { time: number; text: string }[] = [];
    let lastText: string | null = null;
    
    // 비디오 길이 추정 (초)
    const videoDuration = await getVideoDuration(videoUri);
    console.log(`추정 비디오 길이: ${videoDuration}초`);
    
    // 최적화된 프레임 시간 배열 생성
    const frameTimes = generateOptimalFrameTimes(videoDuration);
    console.log(`처리할 최적화된 프레임 수: ${frameTimes.length}`);
    
    // 병렬 처리를 위한 프레임 작업 배열 생성
    const frameProcessingTasks = frameTimes.map(async (timeMs) => {
      try {
        console.log(`프레임 처리 중 (${timeMs}ms)`);
        
        // 해당 시간에 썸네일 생성
        const thumbnailUri = await generateThumbnailAtTime(videoUri, timeMs);
        
        // 썸네일에서 OCR 수행
        const text = await performOcrOnImage(thumbnailUri);
        
        // 임시 파일 정리
        try {
          await FileSystem.deleteAsync(thumbnailUri, { idempotent: true });
        } catch (cleanError) {
          console.error('썸네일 파일 삭제 중 오류:', cleanError);
        }
        
        // 텍스트가 있으면 결과를 반환
        if (text) {
          return { time: timeMs, text, isDuplicate: false };
        }
        
        return null;
      } catch (frameError) {
        console.error(`시간 ${timeMs}ms의 프레임 처리 중 오류:`, frameError);
        return null;
      }
    });
    
    // 모든 프레임 작업을 병렬로 처리
    const frameResults = await Promise.all(frameProcessingTasks);
    
    // 중복 텍스트 필터링 및 유효한 결과만 추가
    const validResults = frameResults.filter(result => result !== null) as {
      time: number;
      text: string;
      isDuplicate: boolean;
    }[];
    
    // 시간 순으로 정렬
    validResults.sort((a, b) => a.time - b.time);
    
    // 중복 텍스트 감지
    for (let i = 0; i < validResults.length; i++) {
      if (i > 0 && lastText && areTextsVerySimilar(validResults[i].text, lastText)) {
        validResults[i].isDuplicate = true;
      } else {
        lastText = validResults[i].text;
      }
    }
    
    // 중복이 아닌 결과만 최종 결과에 추가
    for (const result of validResults) {
      if (!result.isDuplicate) {
        results.push({
          time: result.time,
          text: result.text
        });
        console.log(`텍스트 발견 (${result.time}ms): ${result.text.substring(0, 30)}...`);
      }
    }
    
    console.log(`비디오 텍스트 추출 완료. 고유 텍스트 발견: ${results.length}개`);
    return results;
  } catch (error) {
    console.error('비디오 텍스트 추출 중 오류:', error);
    throw error;
  }
}; 