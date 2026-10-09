"use client";

import { useCallback, useEffect, useRef, useState } from "react";

export type RecorderState = "idle" | "recording";
export type VoiceResult = { blob: Blob; mimeType: string; durationMs: number; peak: number };
export type VoiceLang = "ku" | "ar" | "en";

// Chrome/Edge/Firefox -> webm or ogg, Safari -> mp4. Pick whatever this browser supports.
const MIME_CANDIDATES = ["audio/webm;codecs=opus", "audio/webm", "audio/mp4", "audio/ogg;codecs=opus"];

function pickMimeType(): string | undefined {
  if (typeof MediaRecorder === "undefined") return undefined;
  return MIME_CANDIDATES.find((t) => MediaRecorder.isTypeSupported(t));
}

export function useVoiceRecorder() {
  const [state, setState] = useState<RecorderState>("idle");
  const [level, setLevel] = useState(0); // 0..1  -> drive the bars with this (REAL mic level)
  const [seconds, setSeconds] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const recorder = useRef<MediaRecorder | null>(null);
  const stream = useRef<MediaStream | null>(null);
  const audioCtx = useRef<AudioContext | null>(null);
  const raf = useRef(0);
  const timer = useRef<number | undefined>(undefined);
  const chunks = useRef<Blob[]>([]);
  const peak = useRef(0);
  const startedAt = useRef(0);

  const cleanup = useCallback(() => {
    cancelAnimationFrame(raf.current);
    if (timer.current !== undefined) {
      window.clearInterval(timer.current);
    }
    stream.current?.getTracks().forEach((t) => t.stop());
    audioCtx.current?.close().catch(() => {});
    stream.current = null;
    audioCtx.current = null;
    setLevel(0);
  }, []);

  useEffect(() => cleanup, [cleanup]);

  const start = useCallback(async () => {
    setError(null);
    setSeconds(0);

    if (typeof window !== "undefined" && !window.isSecureContext && window.location.hostname !== "localhost" && window.location.hostname !== "127.0.0.1") {
      setError("Microphone needs HTTPS or localhost.");
      return;
    }
    if (!navigator.mediaDevices?.getUserMedia || typeof MediaRecorder === "undefined") {
      setError("This browser cannot record audio. Try Chrome or Safari.");
      return;
    }

    try {
      const s = await navigator.mediaDevices.getUserMedia({
        audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true },
      });
      stream.current = s;

      // Real input level, so you can SEE whether the microphone hears you.
      const ctx = new AudioContext();
      audioCtx.current = ctx;
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 256;
      ctx.createMediaStreamSource(s).connect(analyser);
      const buf = new Uint8Array(analyser.fftSize);
      peak.current = 0;
      const tick = () => {
        analyser.getByteTimeDomainData(buf);
        let max = 0;
        for (const v of buf) max = Math.max(max, Math.abs(v - 128));
        const lvl = max / 128;
        peak.current = Math.max(peak.current, lvl);
        setLevel(lvl);
        raf.current = requestAnimationFrame(tick);
      };
      tick();

      const mimeType = pickMimeType();
      const mr = new MediaRecorder(s, mimeType ? { mimeType } : undefined);
      chunks.current = [];
      mr.ondataavailable = (e) => {
        if (e.data.size > 0) chunks.current.push(e.data);
      };
      recorder.current = mr;
      mr.start(250); // emit data every 250 ms so nothing is lost
      startedAt.current = Date.now();
      timer.current = window.setInterval(() => setSeconds(Math.floor((Date.now() - startedAt.current) / 1000)), 250);
      setState("recording");
    } catch (e) {
      cleanup();
      const name = (e as DOMException).name;
      if (name === "NotAllowedError") setError("Microphone is blocked. Click the lock icon in the address bar and allow it.");
      else if (name === "NotFoundError") setError("No microphone was found on this device.");
      else if (name === "NotReadableError") setError("Another app is using the microphone.");
      else setError("Could not start the microphone.");
    }
  }, [cleanup]);

  const stop = useCallback(
    () =>
      new Promise<VoiceResult | null>((resolve) => {
        const mr = recorder.current;
        if (!mr || mr.state === "inactive") {
          cleanup();
          setState("idle");
          return resolve(null);
        }
        mr.onstop = () => {
          const mimeType = mr.mimeType || "audio/webm";
          const blob = new Blob(chunks.current, { type: mimeType });
          const result = { blob, mimeType, durationMs: Date.now() - startedAt.current, peak: peak.current };
          cleanup();
          setState("idle");
          resolve(result);
        };
        mr.stop();
      }),
    [cleanup],
  );

  return { state, level, seconds, error, start, stop };
}

/** Sends the recording to the server and returns the transcript. Throws Error with a readable message. */
export async function transcribeVoice(result: VoiceResult, lang: VoiceLang) {
  if (result.durationMs < 700 || result.blob.size < 1500) {
    throw new Error("The recording is too short. Hold on a little longer and speak.");
  }
  if (result.peak < 0.03) {
    throw new Error("No sound reached the microphone. Check the selected microphone and the volume.");
  }

  const ext = result.mimeType.includes("mp4") ? "m4a" : result.mimeType.includes("ogg") ? "ogg" : "webm";
  const form = new FormData();
  form.append("audio", result.blob, `voice.${ext}`);
  form.append("lang", lang);

  const res = await fetch("/api/ai/voice-search", { method: "POST", body: form });
  const json = await res.json().catch(() => null);
  if (!res.ok || !json?.data) {
    throw new Error(json?.error?.message ?? `Server error ${res.status}`);
  }
  return json.data as { transcript: string; language: string; confidence: string };
}
