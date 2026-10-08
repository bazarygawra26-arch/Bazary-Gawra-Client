import 'server-only';
import { env } from '../../config/env';

/**
 * Helper to call Gemini 3.8 Flash model and parse structured JSON responses
 */
export async function generateJson<T>(prompt: string, options?: { systemInstruction?: string }): Promise<T | null> {
  const apiKey = env.GEMINI_API_KEY;
  if (!apiKey) {
    console.warn('GEMINI_API_KEY not configured on server.');
    return null;
  }

  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.8-flash:generateContent?key=${apiKey}`;

  const contents: any[] = [];
  if (options?.systemInstruction) {
    contents.push({
      role: 'user',
      parts: [{ text: `SYSTEM INSTRUCTION: ${options.systemInstruction}` }],
    });
  }

  contents.push({
    role: 'user',
    parts: [{ text: prompt }],
  });

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents,
      generationConfig: {
        responseMimeType: 'application/json',
        temperature: 0.1,
      },
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('Gemini API Error:', response.status, errorText);
    return null;
  }

  const result = await response.json();
  const textOutput = result.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!textOutput) return null;

  try {
    return JSON.parse(textOutput) as T;
  } catch (err) {
    console.error('Failed to parse Gemini JSON output:', err, textOutput);
    return null;
  }
}

/**
 * Multimodal helper to inspect image and return structured JSON
 */
export async function generateMultimodalJson<T>(
  prompt: string,
  base64Image: string,
  mimeType: string = 'image/jpeg'
): Promise<T | null> {
  const apiKey = env.GEMINI_API_KEY;
  if (!apiKey) {
    console.warn('GEMINI_API_KEY not configured on server.');
    return null;
  }

  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.8-flash:generateContent?key=${apiKey}`;

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [
        {
          role: 'user',
          parts: [
            { text: prompt },
            {
              inlineData: {
                mimeType,
                data: base64Image,
              },
            },
          ],
        },
      ],
      generationConfig: {
        responseMimeType: 'application/json',
        temperature: 0.2,
      },
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('Gemini Multimodal Vision Error:', response.status, errorText);
    return null;
  }

  const result = await response.json();
  const textOutput = result.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!textOutput) return null;

  try {
    return JSON.parse(textOutput) as T;
  } catch (err) {
    console.error('Failed to parse Gemini Vision JSON output:', err, textOutput);
    return null;
  }
}
