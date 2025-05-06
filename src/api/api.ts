import OpenAI from 'openai';
import { OPENAI_API_KEY, GOOGLE_CLOUD_VISION_API_KEY } from '@env'; // GOOGLE_CLOUD_VISION_API_KEY 추가
import * as FileSystem from 'expo-file-system'; // expo-file-system 추가

if (!OPENAI_API_KEY) {
  throw new Error('OpenAI API key is not set. Please check your .env file.');
}

if (!GOOGLE_CLOUD_VISION_API_KEY) { // API 키 존재 여부 확인 추가
  throw new Error('Google Cloud Vision API key is not set. Please check your .env file.');
}

const openai = new OpenAI({
  apiKey: OPENAI_API_KEY,
});

/**
 * Summarizes the given text using OpenAI API.
 * @param text The text to summarize.
 * @returns A promise that resolves with the summarized text, or an error message.
 */
export const summarizeTextWithOpenAI = async (text: string): Promise<string | null> => {
  if (!text.trim()) {
    return 'No text provided to summarize.';
  }
  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        { role: 'system', content: 'You are a helpful assistant that summarizes text.' },
        { role: 'user', content: `Please summarize the following text:
\n${text}` },
      ],
      max_tokens: 150, // Adjust as needed
      temperature: 0.5, // Adjust for creativity vs. factuality
    });

    const summary = completion.choices[0]?.message?.content;
    return summary || 'Could not retrieve summary.';

  } catch (error) {
    console.error('Error calling OpenAI API for summarization:', error);
    if (error instanceof OpenAI.APIError) {
        return `OpenAI API Error: ${error.status} ${error.name} ${error.message}`;
    }
    return 'Failed to summarize text due to an unexpected error.';
  }
};

/**
 * Placeholder function for Google Cloud Vision API integration.
 * This function will be implemented later.
 * @param imageUri The URI of the image to process.
 * @returns A promise that resolves with the OCR result.
 */
export const ocrWithGoogleVision = async (imageUri: string): Promise<string | null> => {
  try {
    if (!imageUri) {
      return 'No image URI provided.';
    }

    // 1. Read the image file and encode it to base64
    const imageBase64 = await FileSystem.readAsStringAsync(imageUri, {
      encoding: FileSystem.EncodingType.Base64,
    });

    // 2. Construct the request payload for Google Cloud Vision API
    const requestBody = {
      requests: [
        {
          image: {
            content: imageBase64,
          },
          features: [
            {
              type: 'TEXT_DETECTION', // Specify OCR
            },
          ],
        },
      ],
    };

    // 3. Make the API request
    const response = await fetch(
      `https://vision.googleapis.com/v1/images:annotate?key=${GOOGLE_CLOUD_VISION_API_KEY}`,
      {
        method: 'POST',
        body: JSON.stringify(requestBody),
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

    const data = await response.json();

    // 4. Process the response
    if (data.responses && data.responses.length > 0) {
      const firstResponse = data.responses[0];
      if (firstResponse.fullTextAnnotation) {
        return firstResponse.fullTextAnnotation.text;
      } else if (firstResponse.error) {
        console.error('Google Cloud Vision API Error:', firstResponse.error.message);
        return `Google API Error: ${firstResponse.error.message}`;
      } else {
        return 'No text found in the image.';
      }
    } else {
      console.warn('No responses from Google Cloud Vision API:', data);
      return 'Could not get a response from Google Vision API.';
    }
  } catch (error) {
    console.error('Error calling Google Cloud Vision API:', error);
    if (error instanceof Error) {
        return `Error during OCR: ${error.message}`;
    }
    return 'Failed to process image with Google Vision API due to an unexpected error.';
  }
};
