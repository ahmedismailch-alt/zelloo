let audioContext: AudioContext | null = null;

function getContext(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (audioContext) return audioContext;
  const Ctor =
    window.AudioContext ??
    (window as unknown as { webkitAudioContext?: typeof AudioContext })
      .webkitAudioContext;
  if (!Ctor) return null;
  try {
    audioContext = new Ctor();
  } catch {
    return null;
  }
  return audioContext;
}

// Browsers only allow audio after a user gesture, so call this from the tap
// that sends the order. The chime can then play later when the status changes.
export function unlockReadyChime() {
  const context = getContext();
  if (context && context.state === "suspended") {
    void context.resume().catch(() => {});
  }
}

export function playReadyChime() {
  try {
    navigator.vibrate?.([200, 100, 200]);
  } catch {
    // Vibration is not supported everywhere (e.g. iPhone).
  }

  const context = getContext();
  if (!context) return;
  if (context.state === "suspended") {
    void context.resume().catch(() => {});
  }

  const notes = [659.25, 880];
  const start = context.currentTime;
  notes.forEach((frequency, index) => {
    const oscillator = context.createOscillator();
    const gain = context.createGain();
    const noteStart = start + index * 0.18;
    oscillator.type = "sine";
    oscillator.frequency.value = frequency;
    gain.gain.setValueAtTime(0.0001, noteStart);
    gain.gain.exponentialRampToValueAtTime(0.25, noteStart + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, noteStart + 0.5);
    oscillator.connect(gain);
    gain.connect(context.destination);
    oscillator.start(noteStart);
    oscillator.stop(noteStart + 0.55);
  });
}
