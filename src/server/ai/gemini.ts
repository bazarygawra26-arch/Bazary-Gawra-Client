import 'server-only';
import { env } from '../../config/env';


const CANDIDATE_MODELS = [
  'gemini-3.1-flash-lite',
  'gemini-3.5-flash-lite',
  'gemini-3.5-flash',
  'gemini-3.7-flash',
  'gemini-3.8-flash',
];

/**
 * Helper to call Gemini model and parse structured JSON responses with automatic model fallback
 */
export async function generateJson<T>(prompt: string, options?: { systemInstruction?: string }): Promise<T | null> {
  const apiKey = env.GEMINI_API_KEY;
  if (!apiKey) {
    console.warn('GEMINI_API_KEY not configured on server.');
    return null;
  }

  const configuredModel = env.GEMINI_MODEL;
  const modelsToTry = configuredModel
    ? [configuredModel, ...CANDIDATE_MODELS.filter((m) => m !== configuredModel)]
    : CANDIDATE_MODELS;

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

  for (const model of modelsToTry) {
    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: AbortSignal.timeout(6000),
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
        console.warn(`Gemini API Error with ${model} (status ${response.status}):`, errorText.slice(0, 100));
        // Try next candidate model if rate-limited or unavailable
        continue;
      }

      const result = await response.json();
      const textOutput = result.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!textOutput) continue;

      return JSON.parse(textOutput) as T;
    } catch (err: any) {
      console.warn(`Gemini API call timed out or failed on ${model}:`, err?.message || err);
    }
  }

  return null;
}

/**
 * Multimodal helper to inspect image and return structured JSON with automatic model fallback
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

  const configuredModel = env.GEMINI_MODEL;
  const modelsToTry = configuredModel
    ? [configuredModel, ...CANDIDATE_MODELS.filter((m) => m !== configuredModel)]
    : CANDIDATE_MODELS;

  const cleanBase64 = base64Image.replace(/^data:image\/\w+;base64,/, '');

  for (const model of modelsToTry) {
    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: AbortSignal.timeout(8000),
        body: JSON.stringify({
          contents: [
            {
              role: 'user',
              parts: [
                { text: prompt },
                {
                  inlineData: {
                    mimeType,
                    data: cleanBase64,
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
        console.warn(`Gemini Multimodal Vision Error with ${model} (status ${response.status}):`, errorText.slice(0, 100));
        continue;
      }

      const result = await response.json();
      const textOutput = result.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!textOutput) continue;

      return JSON.parse(textOutput) as T;
    } catch (err: any) {
      console.warn(`Gemini Multimodal call failed on ${model}:`, err?.message || err);
    }
  }

  return null;
}
