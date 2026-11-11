import type { Segment } from "./engine";
type SpeechResult = { isFinal: boolean; 0: { transcript: string } };
type SpeechEvent = {
  resultIndex: number;
  results: { length: number; [key: number]: SpeechResult };
};
type Recognition = {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  onresult: ((event: SpeechEvent) => void) | null;
  onerror: ((event: { error: string }) => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
  abort: () => void;
};
type SpeechWindow = Window & {
  SpeechRecognition?: new () => Recognition;
  webkitSpeechRecognition?: new () => Recognition;
};
export function hasLiveSpeech() {
  const w = window as SpeechWindow;
  return Boolean(w.SpeechRecognition ?? w.webkitSpeechRecognition);
}
export function startLiveCaptions(
  onSegment: (segment: Segment) => void,
  onError: (message: string) => void,
) {
  const w = window as SpeechWindow;
  const Constructor = w.SpeechRecognition ?? w.webkitSpeechRecognition;
  if (!Constructor)
    throw new Error(
      "Este navegador no admite subtítulos en vivo. Puedes transcribir después desde el editor.",
    );
  const recognition = new Constructor();
  const started = performance.now();
  let previous = 0;
  recognition.lang = "es-PE";
  recognition.continuous = true;
  recognition.interimResults = false;
  recognition.onresult = (event) => {
    for (let i = event.resultIndex; i < event.results.length; i++) {
      const result = event.results[i];
      if (!result.isFinal) continue;
      const end = (performance.now() - started) / 1000;
      onSegment({
        start: previous,
        end: Math.max(previous + 0.1, end),
        text: result[0].transcript.trim(),
      });
      previous = end;
    }
  };
  recognition.onerror = (event) => {
    if (event.error !== "aborted")
      onError(
        "El reconocimiento de voz se interrumpió. La grabación continúa; puedes transcribirla en el editor.",
      );
  };
  recognition.start();
  return () => {
    recognition.onresult = null;
    recognition.onerror = null;
    recognition.onend = null;
    recognition.abort();
  };
}
