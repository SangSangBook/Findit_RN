import { GOOGLE_CLOUD_VISION_API_KEY } from '@env';
import * as FileSystem from 'expo-file-system';

if (!GOOGLE_CLOUD_VISION_API_KEY) {
  throw new Error('Google Cloud Vision API key is not set. Please check your .env file.');
}

/**
 * Google Cloud Vision API를 사용하여 이미지에서 텍스트를 추출합니다. (OCR)
 * @param imageUri 처리할 이미지의 URI입니다.
 * @returns OCR 결과 텍스트 또는 null을 반환하는 Promise 객체입니다.
 */
export interface OcrTextBox {
  description: string;
  boundingPoly: { vertices: { x: number; y: number }[] };
}

export const ocrWithGoogleVision = async (imageUri: string): Promise<OcrTextBox[] | null> => {
  try {
    if (!imageUri) {
      console.warn('No image URI provided to ocrWithGoogleVision.');
      return null;
    }

    // 1. 이미지 파일을 읽고 base64로 인코딩합니다.
    const imageBase64 = await FileSystem.readAsStringAsync(imageUri, {
      encoding: FileSystem.EncodingType.Base64,
    });

    // 2. Google Cloud Vision API 요청 페이로드를 구성합니다.
    const requestBody = {
      requests: [
        {
          image: {
            content: imageBase64,
          },
          features: [
            {
              type: 'TEXT_DETECTION', // OCR 지정
            },
          ],
        },
      ],
    };

    // 3. API 요청을 보냅니다.
    const apiUrl = `https://vision.googleapis.com/v1/images:annotate?key=${GOOGLE_CLOUD_VISION_API_KEY}`;
    console.log('Sending request to:', apiUrl); // 디버깅을 위한 로그

    const response = await fetch(apiUrl, {
      method: 'POST',
      body: JSON.stringify(requestBody),
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Google Cloud Vision API Error:', errorData);
      return [];
    }

    const data = await response.json();
    console.log('API Response:', data); // 디버깅을 위한 로그

    // 4. 응답을 처리합니다.
    if (data.responses && data.responses.length > 0) {
      const firstResponse = data.responses[0];
      if (firstResponse.textAnnotations && Array.isArray(firstResponse.textAnnotations)) {
        // 첫 번째 항목은 전체 텍스트(전체 박스), 이후는 단어/문장별. 전체 박스는 제외!
        return firstResponse.textAnnotations.slice(1).map((anno: any) => ({
          description: anno.description,
          boundingPoly: anno.boundingPoly,
        }));
      } else if (firstResponse.error) {
        console.error('Google Cloud Vision API Error:', firstResponse.error.message);
        return null;
      }
      return null; // 텍스트가 없는 경우
    }
    return null; // 응답 형식이 예상과 다른 경우

  } catch (error) {
    console.error('Error during OCR with Google Vision:', error);
    // 네트워크 오류 또는 기타 예외 처리
    if (error instanceof Error) {
      return null;
    }
    return null;
  }
};
