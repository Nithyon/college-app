"use client";

import { useCallback, useEffect, useState } from "react";

export function useSpeechRecognition() {
  const [supported, setSupported] = useState(false);
  const [listening, setListening] = useState(false);

  useEffect(() => {
    setSupported(typeof window !== "undefined" && "webkitSpeechRecognition" in window);
  }, []);

  const listen = useCallback((onResult: (text: string) => void, onError?: (m: string) => void) => {
    if (typeof window === "undefined" || !("webkitSpeechRecognition" in window)) {
      onError?.("Speech recognition not supported in this browser.");
      return;
    }
    type RecType = {
      lang: string;
      interimResults: boolean;
      maxAlternatives: number;
      onstart: (() => void) | null;
      onend: (() => void) | null;
      onerror: (() => void) | null;
      onresult: ((ev: { results: { [key: number]: { [key: number]: { transcript: string } } } }) => void) | null;
      start: () => void;
    };
    const SR = (window as unknown as { webkitSpeechRecognition: new () => RecType }).webkitSpeechRecognition;
    const rec = new SR();
    rec.lang = "en-US";
    rec.interimResults = false;
    rec.maxAlternatives = 1;
    rec.onstart = () => setListening(true);
    rec.onend = () => setListening(false);
    rec.onerror = () => {
      setListening(false);
      onError?.("Voice input failed.");
    };
    rec.onresult = (ev) => {
      const text = ev.results[0]?.[0]?.transcript ?? "";
      onResult(text);
    };
    rec.start();
  }, []);

  return { supported, listening, listen };
}
