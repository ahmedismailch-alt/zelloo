"use client";

import {
  useEffect,
  useRef,
  useState,
  type FormEvent,
  type KeyboardEvent,
} from "react";
import type { OrderLang, OrderStrings } from "../../lib/order-i18n";

const MAX_RECORDING_SECONDS = 30;
const RECORDING_TYPES = [
  "audio/webm;codecs=opus",
  "audio/webm",
  "audio/mp4",
  "audio/ogg",
];

type MicState = "idle" | "recording" | "transcribing";

function pickRecordingType(): string | undefined {
  if (typeof MediaRecorder === "undefined") return undefined;
  return RECORDING_TYPES.find((type) => MediaRecorder.isTypeSupported(type));
}

function MicIcon() {
  return (
    <svg
      aria-hidden="true"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="9" y="2" width="6" height="12" rx="3" />
      <path d="M5 10a7 7 0 0 0 14 0" />
      <path d="M12 17v5" />
    </svg>
  );
}

function StopIcon() {
  return (
    <svg aria-hidden="true" width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
      <rect x="6" y="6" width="12" height="12" rx="2" />
    </svg>
  );
}

export type ParsedItem = {
  menuItemId: string;
  quantity: number;
  note: string | null;
};

type SuggestionOption = {
  menuItemId: string;
  name: string;
  nameAr: string | null;
  priceCents: number;
};

type Suggestion = {
  query: string;
  quantity: number;
  note: string | null;
  options: SuggestionOption[];
};

type Props = {
  restaurantId: string;
  t: OrderStrings;
  lang: OrderLang;
  showArabic: boolean;
  onItems: (items: ParsedItem[]) => void;
};

function formatChf(cents: number) {
  return `CHF ${(cents / 100).toFixed(2)}`;
}

export function AiOrderBox({ restaurantId, t, lang, showArabic, onItems }: Props) {
  const labelFor = (option: SuggestionOption) =>
    showArabic && option.nameAr ? option.nameAr : option.name;
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [micState, setMicState] = useState<MicState>("idle");
  const [seconds, setSeconds] = useState(0);

  const recorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  function releaseMic() {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = null;
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
  }

  useEffect(() => {
    return () => {
      const recorder = recorderRef.current;
      if (recorder && recorder.state !== "inactive") {
        recorder.onstop = null;
        recorder.stop();
      }
      if (timerRef.current) clearInterval(timerRef.current);
      streamRef.current?.getTracks().forEach((track) => track.stop());
    };
  }, []);

  async function transcribe(audio: Blob) {
    setMicState("transcribing");
    try {
      const form = new FormData();
      form.append("restaurantId", restaurantId);
      form.append("lang", lang);
      form.append("audio", audio);
      const response = await fetch("/api/order-transcribe", {
        method: "POST",
        body: form,
      });
      const data = await response.json().catch(() => ({}));
      const spoken = typeof data.text === "string" ? data.text.trim() : "";
      if (!response.ok || !spoken) throw new Error(t.micError);
      setText((current) =>
        (current.trim() ? `${current.trim()} ${spoken}` : spoken).slice(0, 500)
      );
    } catch {
      setError(t.micError);
    } finally {
      setMicState("idle");
    }
  }

  function stopRecording() {
    const recorder = recorderRef.current;
    if (recorder && recorder.state !== "inactive") recorder.stop();
  }

  async function startRecording() {
    setError("");
    setMessage("");
    setSuggestions([]);

    const mimeType = pickRecordingType();
    if (!navigator.mediaDevices?.getUserMedia || mimeType === undefined) {
      setError(t.micUnsupported);
      return;
    }

    let stream: MediaStream;
    try {
      stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    } catch {
      setError(t.micDenied);
      return;
    }

    streamRef.current = stream;
    chunksRef.current = [];
    const recorder = new MediaRecorder(stream, {
      mimeType,
      audioBitsPerSecond: 64000,
    });
    recorderRef.current = recorder;

    recorder.ondataavailable = (event) => {
      if (event.data.size > 0) chunksRef.current.push(event.data);
    };
    recorder.onstop = () => {
      releaseMic();
      const audio = new Blob(chunksRef.current, {
        type: recorder.mimeType || mimeType,
      });
      chunksRef.current = [];
      if (audio.size === 0) {
        setMicState("idle");
        setError(t.micError);
        return;
      }
      void transcribe(audio);
    };

    recorder.start();
    setSeconds(0);
    setMicState("recording");
    timerRef.current = setInterval(() => {
      setSeconds((value) => {
        const next = value + 1;
        if (next >= MAX_RECORDING_SECONDS) stopRecording();
        return next;
      });
    }, 1000);
  }

  function toggleMic() {
    if (micState === "recording") stopRecording();
    else if (micState === "idle") void startRecording();
  }

  async function submit(event?: FormEvent) {
    event?.preventDefault();
    const value = text.trim();
    if (!value || loading) return;

    setLoading(true);
    setError("");
    setMessage("");
    setSuggestions([]);

    try {
      const response = await fetch("/api/order-parse", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ restaurantId, text: value }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(t.aiError);

      const items = (data.items || []) as ParsedItem[];
      const notFound = (data.notFound || []) as string[];
      const nextSuggestions = (data.suggestions || []) as Suggestion[];

      if (items.length > 0) onItems(items);
      setSuggestions(nextSuggestions);

      const parts: string[] = [];
      if (items.length > 0) {
        parts.push(t.aiAdded(items.length));
      }
      if (notFound.length > 0) {
        parts.push(t.aiNotFound(notFound.join(", ")));
      }
      if (parts.length === 0 && nextSuggestions.length === 0) {
        parts.push(t.aiNothing);
      }
      if (nextSuggestions.length === 0 && notFound.length === 0) {
        setText("");
      }
      setMessage(parts.join(" "));
    } catch (err) {
      setError(err instanceof Error ? err.message : t.aiError);
    } finally {
      setLoading(false);
    }
  }

  function pickSuggestion(index: number, option: SuggestionOption) {
    const suggestion = suggestions[index];
    if (!suggestion) return;

    onItems([
      {
        menuItemId: option.menuItemId,
        quantity: suggestion.quantity,
        note: suggestion.note,
      },
    ]);

    const remaining = suggestions.filter((_, i) => i !== index);
    setSuggestions(remaining);
    setMessage(t.aiAddedOne(suggestion.quantity, labelFor(option)));
    if (remaining.length === 0) setText("");
  }

  function handleKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (event.nativeEvent.isComposing || event.keyCode === 229) return;
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      void submit();
    }
  }

  return (
    <section className="bg-white border-2 border-black rounded-2xl p-4 flex flex-col gap-3">
      <div className="flex flex-col gap-1">
        <h2 className="font-black">{t.aiTitle}</h2>
        <p className="text-sm text-gray-500 leading-relaxed">
          {t.aiExample}
        </p>
      </div>

      <form onSubmit={submit} className="flex flex-col gap-3">
        <label htmlFor="ai-order" className="sr-only">
          {t.aiLabel}
        </label>
        <textarea
          id="ai-order"
          value={text}
          onChange={(event) => setText(event.target.value)}
          onKeyDown={handleKeyDown}
          maxLength={500}
          rows={2}
          placeholder={t.aiPlaceholder}
          dir="auto"
          className="w-full resize-none rounded-xl border bg-[#f8f9fb] p-3 text-base leading-relaxed outline-none focus:border-black"
        />
        <button
          type="button"
          onClick={toggleMic}
          disabled={micState === "transcribing" || loading}
          aria-pressed={micState === "recording"}
          className={`flex min-h-14 items-center justify-center gap-3 rounded-xl border-2 px-4 py-3 font-bold disabled:opacity-60 ${
            micState === "recording"
              ? "border-red-600 bg-red-600 text-white"
              : "border-black bg-white text-black"
          }`}
        >
          {micState === "recording" ? (
            <>
              <span className="relative flex size-3" aria-hidden="true">
                <span className="absolute inline-flex size-full animate-ping rounded-full bg-white opacity-75" />
                <span className="relative inline-flex size-3 rounded-full bg-white" />
              </span>
              <span>{t.micListening}</span>
              <span className="tabular-nums" dir="ltr">
                {`0:${String(seconds).padStart(2, "0")} / 0:${MAX_RECORDING_SECONDS}`}
              </span>
              <StopIcon />
              <span className="sr-only">{t.micStop}</span>
            </>
          ) : micState === "transcribing" ? (
            <span role="status">{t.micTranscribing}</span>
          ) : (
            <>
              <MicIcon />
              <span>{t.micStart}</span>
            </>
          )}
        </button>
        <button
          type="submit"
          disabled={loading || micState !== "idle" || !text.trim()}
          className="min-h-11 rounded-xl bg-orange-500 px-4 py-3 font-bold text-black disabled:opacity-50"
        >
          {loading ? t.aiLoading : t.aiSubmit}
        </button>
      </form>

      {suggestions.map((suggestion, index) => (
        <div
          key={`${suggestion.query}-${index}`}
          className="flex flex-col gap-2 rounded-xl bg-[#f8f9fb] p-3"
        >
          <p className="text-sm leading-relaxed">
            <span className="font-bold">{t.didYouMean}</span>{" "}
            <span className="text-gray-500">
              {`«${suggestion.query}»`}
              {suggestion.quantity > 1 ? ` · ${suggestion.quantity}×` : ""}
            </span>
          </p>
          <ul className="flex flex-col gap-2">
            {suggestion.options.map((option) => (
              <li key={option.menuItemId}>
                <button
                  type="button"
                  onClick={() => pickSuggestion(index, option)}
                  className="flex min-h-11 w-full items-center justify-between gap-3 rounded-xl border-2 border-black bg-white px-4 py-3 text-start"
                >
                  <span className="flex min-w-0 flex-col">
                    <span className="font-bold text-pretty" dir="auto">{labelFor(option)}</span>
                    {showArabic && option.nameAr && (
                      <span className="text-xs text-gray-400" dir="ltr" lang="de">
                        {option.name}
                      </span>
                    )}
                  </span>
                  <span className="shrink-0 text-sm font-bold" dir="ltr">
                    {formatChf(option.priceCents)}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      ))}

      {message && (
        <p role="status" className="text-sm bg-[#f8f9fb] rounded-lg p-3">
          {message}
        </p>
      )}
      {error && (
        <p role="alert" className="text-sm text-red-700 bg-red-50 rounded-lg p-3">
          {error}
        </p>
      )}
    </section>
  );
}
