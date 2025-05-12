import { IMAGE_TYPE_KEYWORDS, ImageType } from '../constants/ImageTypes';

/**
 * OCR 텍스트를 분석하여 이미지 유형을 자동으로 감지합니다.
 * @param ocrText OCR로 추출된 텍스트
 * @returns 감지된 이미지 유형
 */
export const detectImageType = (ocrText: string): ImageType => {
  // OCR 텍스트가 없는 경우 OTHER 반환
  if (!ocrText) return 'OTHER';

  // 각 유형별 키워드 매칭 점수 계산
  const scores: Record<ImageType, number> = {
    CONTRACT: 0,
    PAYMENT: 0,
    DOCUMENT: 0,
    PRODUCT: 0,
    OTHER: 0
  };

  // 각 유형별 키워드 검사
  Object.entries(IMAGE_TYPE_KEYWORDS).forEach(([type, keywords]) => {
    keywords.forEach(keyword => {
      if (ocrText.includes(keyword)) {
        scores[type as ImageType]++;
      }
    });
  });

  // 가장 높은 점수의 유형 찾기
  let maxScore = 0;
  let detectedType: ImageType = 'OTHER';

  Object.entries(scores).forEach(([type, score]) => {
    if (score > maxScore) {
      maxScore = score;
      detectedType = type as ImageType;
    }
  });

  // 점수가 0이면 OTHER 반환
  return maxScore === 0 ? 'OTHER' : detectedType;
}; 