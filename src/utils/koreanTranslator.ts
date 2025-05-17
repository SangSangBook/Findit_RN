import OpenAI from 'openai';
import { englishToKorean, koreanToEnglish } from '../constants/languageMapping';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// 영어 단어를 한글로 번역
export const translateToKorean = async (english: string): Promise<string[]> => {
  try {
    // 이미 매핑된 단어가 있는지 확인
    if (englishToKorean[english.toLowerCase()]) {
      return englishToKorean[english.toLowerCase()];
    }

    const prompt = `다음 영어 단어의 한글 번역을 JSON 배열로 반환해주세요. 
    일반적으로 사용되는 번역어들을 포함해주세요.
    예시: "printer" -> ["프린터", "인쇄기"]
    단어: "${english}"`;

    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: "You are a helpful assistant that provides Korean translations for English words. Return only a JSON array of strings."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 100
    });

    const result = response.choices[0]?.message?.content;
    if (result) {
      try {
        const koreanTranslations = JSON.parse(result);
        if (Array.isArray(koreanTranslations)) {
          // 매핑에 추가
          koreanTranslations.forEach(korean => {
            if (!koreanToEnglish[korean]) {
              koreanToEnglish[korean] = [];
            }
            if (!koreanToEnglish[korean].includes(english.toLowerCase())) {
              koreanToEnglish[korean].push(english.toLowerCase());
            }
          });

          if (!englishToKorean[english.toLowerCase()]) {
            englishToKorean[english.toLowerCase()] = [];
          }
          koreanTranslations.forEach(korean => {
            if (!englishToKorean[english.toLowerCase()].includes(korean)) {
              englishToKorean[english.toLowerCase()].push(korean);
            }
          });

          return koreanTranslations;
        }
      } catch (e) {
        console.error('Error parsing AI response:', e);
      }
    }
    return [];
  } catch (error) {
    console.error('Error translating to Korean:', error);
    return [];
  }
}; 