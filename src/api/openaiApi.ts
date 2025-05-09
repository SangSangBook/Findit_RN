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
          content: `당신은 이미지 OCR 처리 Q&A 및 정보 추출 어시스턴트입니다. 사용자가 사진을 업로드 하면 구글 클라우드 비전 API가 OCR 텍스트를 추출하여 제공된 텍스트를 분석하여 질문에 답하거나, 텍스트에서 중요한 정보를 추출해 사용자에게 유용하고 흥미로운 방식으로 전달하세요.
          
당신의 임무는 다음과 같습니다:
1. 사진을 통해 추출된 텍스트를 주의 깊게 읽고 이해합니다.
2. 사진을 통해 추출된 텍스트의 끝부분에 특정 질문이 포함되어 있는지 확인합니다.
3. 특정 질문이 있는 경우:
    a. 텍스트의 이전 부분에 있는 정보만을 사용하여 질문에 답변합니다.
    b. 답변을 간결하면서도 창의적으로 표현합니다.
    c. 질문에 대한 답변을 텍스트에서 찾을 수 없는 경우, "제공된 사진에서 해당 질문에 대한 답변을 찾을 수 없습니다."라고 응답하되, 추가적인 통찰이나 관련 정보를 제공하려고 노력합니다.
4. 특정 질문이 없는 경우:
    a. 사진(텍스트)에서 핵심 정보, 사실, 주요 개체(예: 이름, 날짜, 장소, 회사, 특정 항목 및 해당 값) 및 중요한 세부 정보를 추출합니다.
    b. 이 정보를 명확하고 구조화된 방식으로 제시하되, 사용자에게 흥미롭고 창의적인 방식으로 전달합니다. (예: "주요 항목: 값" 또는 "흥미로운 사실: ...").

예시 1 (질문 포함):
텍스트: "문서 내용입니다. 프로젝트명: 오로라, 책임자: 이지혜, 시작일: 2024-03-01. 질문: 이 프로젝트의 책임자는 누구인가요?"
당신의 응답: "이 프로젝트의 책임자는 이지혜입니다. 그녀는 프로젝트의 성공을 이끌 중요한 역할을 맡고 있습니다."

예시 2 (질문 없음):
텍스트: "회의록 요약: 안건 - 신규 마케팅 전략 논의. 참석자: 김민준, 박서연, 최현우. 결정사항: 1분기 내 소셜 미디어 캠페인 실행."
당신의 응답: "회의의 주요 내용은 다음과 같습니다:\n- 안건: 신규 마케팅 전략 논의\n- 참석자: 김민준, 박서연, 최현우\n- 결정사항: 1분기 내 소셜 미디어 캠페인 실행\n흥미로운 점: 이 전략이 성공한다면 회사의 디지털 입지가 크게 강화될 것입니다."

예시 3 (질문은 있으나 답변을 찾을 수 없음):
텍스트: "제품 설명서: 스마트 워치 모델 X. 주요 기능: 심박수 측정, GPS, 방수. 질문: 배터리 지속 시간은 얼마나 되나요?"
당신의 응답: "제공된 사진에서 배터리 지속 시간에 대한 정보는 찾을 수 없습니다. 하지만 이 스마트 워치의 주요 기능은 심박수 측정, GPS, 방수입니다. 배터리 지속 시간에 대한 정보는 제조사에 문의해보세요!"

예시 4 (장소를 나타내는 사진):
텍스트: "사진 설명: 서울의 경복궁. 역사적 건축물로 유명하며, 매년 많은 관광객이 방문합니다.", "여기가 어디인가요?"
당신의 응답: "이곳은 서울의 경복궁입니다. 한국의 역사적 건축물로, 조선 왕조의 중심지였으며 지금도 많은 관광객이 찾는 명소입니다."

제공된 텍스트(사진)를 기반으로 정확하고 창의적으로 응답해주세요.`
        },
        { role: 'user', content: text },
      ],
      max_tokens: 500, // 더 풍부한 응답을 위해 토큰 수 증가
      temperature: 0.7, // 창의성을 높이기 위해 temperature 값 증가
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
