import { NextRequest, NextResponse } from 'next/server';
import { generateJson, generateMultimodalJson } from '../../../../server/ai/gemini';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { audio, mimeType, phoneticText, language = 'ku' } = body;

    // 1. Reconstruct Kurdish from browser phonetic text if provided
    if (phoneticText && typeof phoneticText === 'string' && phoneticText.trim().length > 0) {
      const prompt = `A user was speaking Sorani Kurdish in Sulaymaniyah, Kurdistan into a voice shopping assistant.
Because the browser speech recognition engine does not natively support Sorani Kurdish, it misheard the Kurdish speech phonetically as English or garbled words: "${phoneticText.trim()}".
Task:
1. Reconstruct what the user said in natural Sorani Kurdish (using Kurdish Arabic alphabet: سڵاو، ئامێری قاوە، بەرهەمی دەستکرد، نرخ، گەرەنتی، سلێمانی، هەولێر...).
2. If the user said "slow", it was "سڵاو" (Slaw / Hello).
3. If the user spoke numbers or product names (e.g. coffee machine, home appliance, honey, rug), reconstruct into authentic Sorani Kurdish.
Return JSON format:
{
  "transcript": "reconstructed Sorani Kurdish text in Kurdish script",
  "explanation": "brief reason"
}`;

      const result = await generateJson<{ transcript: string; explanation?: string }>(prompt);
      if (result && result.transcript) {
        return NextResponse.json({
          success: true,
          transcript: result.transcript,
          original: phoneticText,
          method: 'phonetic_reconstruction',
        });
      }
    }

    // 2. Transcribe actual recorded audio bytes via Gemini Multimodal if provided
    if (audio && typeof audio === 'string') {
      const cleanBase64 = audio.includes(',') ? audio.split(',')[1] : audio;
      const prompt = `You are an expert Sorani Kurdish speech recognition transcriber for Bazary Gawra (a marketplace in Kurdistan).
Listen carefully to this audio recording and transcribe what was spoken into natural Sorani Kurdish (using Kurdish Arabic alphabet: ئەلفوبێی کوردی).
If the audio contains a shopping request (e.g. searching for products in Sulaymaniyah or Erbil), transcribe it faithfully in Kurdish.
If Arabic was spoken, transcribe in Arabic. If English was spoken, transcribe in English.
Return JSON format:
{
  "transcript": "exact transcribed text",
  "detected_language": "ckb"
}`;

      const result = await generateMultimodalJson<{ transcript: string; detected_language?: string }>(
        prompt,
        cleanBase64,
        mimeType || 'audio/webm'
      );

      if (result && result.transcript) {
        return NextResponse.json({
          success: true,
          transcript: result.transcript,
          detected_language: result.detected_language || 'ckb',
          method: 'audio_transcription',
        });
      }
    }

    return NextResponse.json({
      success: false,
      transcript: phoneticText || '',
      message: 'Could not reconstruct Kurdish speech',
    });
  } catch (error: any) {
    console.error('API /api/ai/voice-transcribe error:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
