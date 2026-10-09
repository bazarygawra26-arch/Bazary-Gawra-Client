import { NextRequest, NextResponse } from 'next/server';
import { generateJson, generateMultimodalJson } from '../../../../server/ai/gemini';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { audio, mimeType, phoneticText, language = 'ku' } = body;

    // 1. Reconstruct Kurdish from browser phonetic text if provided
    if (phoneticText && typeof phoneticText === 'string' && phoneticText.trim().length > 0) {
      const prompt = `You are a specialized Sorani Kurdish AI speech interpreter for Bazary Gawra (a local marketplace in Kurdistan).
A Kurdish user was speaking Sorani Kurdish into their microphone.
Because their web browser does not support Kurdish speech recognition, the browser's English recognizer misheard the Kurdish pronunciation phonetically as English words:
"${phoneticText.trim()}"

YOUR TASK:
Reconstruct and translate what the user was saying in natural, grammatically correct Sorani Kurdish (using standard Kurdish Arabic script: سۆرانی).

Key phonetic patterns from Kurdish to English speech engines:
- "slow" or "hello" -> "سڵاو" (Slaw)
- "money" / "man" -> "ماڵ" / "مـ"
- "made it" / "madet" -> "دەوێت" (dewêt)
- "home goods" / "same house" -> "ئامێری ماڵ" / "پێداویستی ناوماڵ"
- "left my money" -> "بە نرخێکی گونجاو"
- "coffee" / "qawa" -> "ئامێری قاوە"
- "fryer" / "air fryer" -> "ئێرفرایەر"
- "honey" / "hangwen" -> "هەنگوینی سروشتی"
- "craft" / "dastkrd" -> "بەرهەمی دەستکرد"
- "slemani" / "suleimani" / "salam" -> "لە سلێمانی"
- "erbil" / "hawler" -> "لە هەولێر"
- "duhok" -> "لە دهۆک"
- numbers like "two thousand" / "200" / "thousand" -> "دینار" / "هەزار"

INSTRUCTIONS:
- Produce ONE clear, natural, and authentic Sorani Kurdish shopping request.
- Use Kurdish script (ئەلفوبێی سۆرانی: پ، چ، ژ، گ، ڤ، ۆ، ێ، ڵ، ڕ، ە).
- Do not repeat examples or provide options. Output just the clean sentence.

Return JSON:
{
  "transcript": "natural Sorani Kurdish sentence"
}`;

      const result = await generateJson<{ transcript: string }>(prompt);
      if (result && result.transcript) {
        return NextResponse.json({
          success: true,
          transcript: result.transcript.trim(),
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
  "transcript": "exact transcribed text in Kurdish script",
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
          transcript: result.transcript.trim(),
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
