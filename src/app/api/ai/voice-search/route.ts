import "server-only";
import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const maxDuration = 30;
export const dynamic = "force-dynamic";

const CANDIDATE_MODELS = [
  process.env.GEMINI_MODEL,
  "gemini-3.7-flash",
  "gemini-3.5-flash-lite",
  "gemini-3.1-flash-lite",
  "gemini-flash-lite-latest",
  "gemini-3.8-flash",
].filter(Boolean) as string[];

const MAX_BYTES = 8 * 1024 * 1024;

const fail = (status: number, code: string, message: string) => {
  console.error(`[voice-search] ${code}: ${message}`);
  return NextResponse.json({ data: null, error: { code, message } }, { status });
};

// "audio/webm;codecs=opus" -> "audio/webm"; Safari's "audio/mp4" -> "audio/m4a"
function normalizeMime(raw: string, filename: string): string {
  const base = raw.split(";")[0].trim().toLowerCase();
  if (base === "audio/mp4" || filename.endsWith(".m4a")) return "audio/m4a";
  if (base.startsWith("audio/")) return base;
  if (filename.endsWith(".ogg")) return "audio/ogg";
  return "audio/webm";
}

const LANG_HINT: Record<string, string> = {
  ku: "Central Kurdish (Sorani), written in Arabic script with Sorani letters (ڕ ڵ ۆ ێ ە ک ی)",
  ckb: "Central Kurdish (Sorani), written in Arabic script with Sorani letters (ڕ ڵ ۆ ێ ە ک ی)",
  ar: "Iraqi Arabic, written in Arabic script",
  en: "English",
};

export async function POST(req: Request) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return fail(500, "NO_API_KEY", "GEMINI_API_KEY is missing on the server.");

  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    return fail(400, "BAD_REQUEST", "Expected multipart form data with an 'audio' file.");
  }

  const file = form.get("audio");
  if (!(file instanceof File)) return fail(400, "NO_AUDIO", "No audio file was received.");
  if (file.size < 1500) return fail(400, "TOO_SMALL", `Audio is too small (${file.size} bytes).`);
  if (file.size > MAX_BYTES) return fail(413, "TOO_LARGE", "Audio is larger than 8 MB.");

  const rawLang = String(form.get("lang") ?? "ku");
  const lang = rawLang === "ckb" ? "ku" : rawLang;
  const mime = normalizeMime(file.type, file.name);
  const data = Buffer.from(await file.arrayBuffer()).toString("base64");
  const started = Date.now();

  const promptText = [
    "Transcribe the speech in this audio exactly as spoken. Do not answer it, translate it, or summarise it.",
    `The speaker most likely uses ${LANG_HINT[lang] ?? LANG_HINT.ku}. If they clearly use another of Kurdish, Arabic or English, transcribe that language instead.`,
    "Keep numbers and prices as the speaker said them (for example ٢٠٠ هەزار).",
    "If there is no intelligible speech, return an empty transcript with confidence low. Never invent words.",
    "Return JSON only with keys: transcript (string), language ('ku' | 'ar' | 'en' | 'unknown'), confidence ('low' | 'medium' | 'high').",
  ].join("\n");

  let lastError: any = null;

  for (const model of CANDIDATE_MODELS) {
    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        signal: AbortSignal.timeout(15000),
        body: JSON.stringify({
          contents: [
            {
              role: "user",
              parts: [
                { text: promptText },
                {
                  inlineData: {
                    mimeType: mime,
                    data,
                  },
                },
              ],
            },
          ],
          generationConfig: {
            responseMimeType: "application/json",
            temperature: 0.1,
          },
        }),
      });

      if (!response.ok) {
        const errText = await response.text();
        console.warn(`[voice-search] ${model} returned ${response.status}:`, errText.slice(0, 100));
        lastError = new Error(`${model} status ${response.status}: ${errText.slice(0, 100)}`);
        continue;
      }

      const resJson = await response.json();
      const outputText = resJson.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!outputText) continue;

      const parsed = JSON.parse(outputText) as {
        transcript?: string;
        language?: string;
        confidence?: string;
      };
      const transcript = (parsed.transcript ?? "").trim();

      console.info(`[voice-search] ok model=${model} mime=${mime} bytes=${file.size} ms=${Date.now() - started} chars=${transcript.length}`);

      if (!transcript) return fail(422, "EMPTY_TRANSCRIPT", "No speech was recognised. Please try again.");

      return NextResponse.json({
        data: { transcript, language: parsed.language ?? lang, confidence: parsed.confidence ?? "high" },
        error: null,
      });
    } catch (e) {
      lastError = e;
      console.warn(`[voice-search] call failed on ${model}:`, e instanceof Error ? e.message : String(e));
    }
  }

  return fail(502, "GEMINI_ERROR", lastError instanceof Error ? lastError.message : String(lastError || "All models failed"));
}
