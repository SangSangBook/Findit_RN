import { OPENAI_API_KEY } from '@env';
import OpenAI from 'openai';

if (!OPENAI_API_KEY) {
  throw new Error('OpenAI API key is not set. Please check your .env file.');
}

const openai = new OpenAI({
  apiKey: OPENAI_API_KEY,
});

/**
 * OpenAI API를 사용하여 주어진 텍스트를 요약합니다.
 * @param text 요약할 텍스트입니다.
 * @returns 요약된 텍스트 또는 오류 메시지를 반환하는 Promise 객체입니다.
 */
export const getInfoFromTextWithOpenAI = async (text: string): Promise<string | null> => {
  if (!text.trim()) {
    return '정보를 추출할 텍스트가 제공되지 않았습니다.';
  }
  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        { 
          role: 'system', 
          content: `당신은 이미지 분석 및 Q&A 어시스턴트입니다. 모든 응답은 마크다운 형식으로 작성하며, 간결하고 명확하게 정보를 전달하세요.

응답 형식:
1. **주요 정보 요약** (2-3문장)
2. **핵심 분석** (불릿 포인트로 간단히)
3. **추가 정보** (필요한 경우에만)

예시 1 (질문 포함):
분석 결과: "[텍스트 분석 결과] 회의록: 프로젝트 X 진행 상황 보고
[감지된 물체] - 노트북 - 사람 - 책상
[이미지 라벨] - 회의 - 사무실 - 비즈니스
[얼굴 감지 결과] 얼굴 1: - 기쁨: VERY_LIKELY
질문: 이 회의의 분위기는 어떠한가요?"

당신의 응답: "## 회의 분위기 분석

이 회의는 프로젝트 X의 진행 상황을 보고하는 자리로, 전반적으로 긍정적이고 활기찬 분위기입니다.

### 핵심 분석
* 😊 참석자들의 기쁨 표정이 두드러짐
* 💻 노트북을 활용한 진행 상황 보고
* 🏢 사무실 환경에서의 비즈니스 미팅

### 추가 정보
* 회의실의 밝은 조명과 깔끔한 환경이 긍정적인 분위기를 조성"

예시 2 (질문 없음):
분석 결과: "[텍스트 분석 결과] 제품명: 스마트 워치 Pro
[감지된 물체] - 스마트워치 - 손목
[이미지 라벨] - 전자제품 - 웨어러블
[로고 감지 결과] - Apple
[관련 주제] - 건강 모니터링"

당신의 응답: "## 제품 분석

Apple의 스마트 워치 Pro는 건강 모니터링 기능을 강조하는 프리미엄 웨어러블 기기입니다.

### 핵심 분석
* ⌚ 손목에 착용된 스마트워치
* 🍎 Apple 브랜드 제품
* ❤️ 건강 모니터링 기능 강조

### 추가 정보
* 검은색과 흰색의 대비가 강한 세련된 디자인
* 웨어러블 기술과 건강 관리의 결합을 강조하는 마케팅 이미지"

제공된 이미지 분석 결과를 기반으로 마크다운 형식의 간결한 응답을 제공해주세요.`
        },
        { role: 'user', content: text },
      ],
      max_tokens: 500, // 더 풍부한 응답을 위해 토큰 수 증가
      temperature: 0.7, // 창의성을 높이기 위해 temperature 값 증가
    });

    const information = completion.choices[0]?.message?.content;
    if (!information || information.trim() === '') {
      throw new Error('OpenAI 응답이 비어 있습니다.');
    }
    return information;

  } catch (error) {
    console.error('정보 추출을 위해 OpenAI API 호출 중 오류:', error);
    if (error instanceof OpenAI.APIError) {
        return `OpenAI API 오류: ${error.status} ${error.name} ${error.message}`;
    }
    return 'OpenAI 응답이 없거나, 예기치 않은 오류로 인해 정보를 추출하지 못했습니다.';
  }
};
