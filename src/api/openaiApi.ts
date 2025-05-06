import OpenAI from 'openai';
import { OPENAI_API_KEY } from '@env';

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
          content: `당신은 지능형 Q&A 및 정보 추출 어시스턴트입니다. 분석할 텍스트가 제공될 것입니다.
당신의 임무는 다음과 같습니다:
1. 전체 텍스트를 주의 깊게 읽고 이해합니다.
2. 텍스트의 끝부분에 특정 질문이 포함되어 있는지 확인합니다.
3. 특정 질문이 있는 경우:
    a. 텍스트의 이전 부분에 있는 정보만을 사용하여 질문에 간결하게 답변합니다.
    b. 질문에 대한 답변을 텍스트에서 찾을 수 없는 경우, "제공된 텍스트에서 해당 질문에 대한 답변을 찾을 수 없습니다."라고 응답합니다.
4. 특정 질문이 없는 경우:
    a. 텍스트에서 핵심 정보, 사실, 주요 개체(예: 이름, 날짜, 장소, 회사, 특정 항목 및 해당 값) 및 중요한 세부 정보를 추출하여 제시합니다.
    b. 이 정보를 명확하고 구조화된 방식으로 제시합니다. (예: "주요 항목: 값").

예시 1 (질문 포함):
텍스트: "문서 내용입니다. 프로젝트명: 오로라, 책임자: 이지혜, 시작일: 2024-03-01. 질문: 이 프로젝트의 책임자는 누구인가요?"
당신의 응답: "이지혜"

예시 2 (질문 없음):
텍스트: "회의록 요약: 안건 - 신규 마케팅 전략 논의. 참석자: 김민준, 박서연, 최현우. 결정사항: 1분기 내 소셜 미디어 캠페인 실행."
당신의 응답: "안건: 신규 마케팅 전략 논의\n참석자: 김민준, 박서연, 최현우\n결정사항: 1분기 내 소셜 미디어 캠페인 실행"

예시 3 (질문은 있으나 답변을 찾을 수 없음):
텍스트: "제품 설명서: 스마트 워치 모델 X. 주요 기능: 심박수 측정, GPS, 방수. 질문: 배터리 지속 시간은 얼마나 되나요?"
당신의 응답: "제공된 텍스트에서 해당 질문에 대한 답변을 찾을 수 없습니다."

제공된 텍스트를 기반으로 정확하고 간결하게 응답해주세요.`
        },
        { role: 'user', content: text },
      ],
      max_tokens: 250, // 더 포괄적인 정보를 위해 약간 늘림
      temperature: 0.3, // 사실적 추출을 위해 약간 낮춤
    });

    const information = completion.choices[0]?.message?.content;
    return information || '텍스트에서 정보를 가져올 수 없습니다.';

  } catch (error) {
    console.error('정보 추출을 위해 OpenAI API 호출 중 오류:', error);
    if (error instanceof OpenAI.APIError) {
        return `OpenAI API 오류: ${error.status} ${error.name} ${error.message}`;
    }
    return '예기치 않은 오류로 인해 정보를 추출하지 못했습니다.';
  }
};
