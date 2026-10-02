type AudioSessionNavigator = Navigator & {
  audioSession?: { type: string };
};

type WakeLockSentinelLike = { release: () => Promise<void> };
type WakeLockNavigator = Navigator & {
  wakeLock?: { request: (type: "screen") => Promise<WakeLockSentinelLike> };
};

function createSilentWavUrl() {
  const sampleRate = 8000;
  const samples = sampleRate;
  const buffer = new ArrayBuffer(44 + samples);
  const view = new DataView(buffer);
  const write = (offset: number, text: string) =>
    [...text].forEach((char, i) => view.setUint8(offset + i, char.charCodeAt(0)));

  write(0, "RIFF");
  view.setUint32(4, 36 + samples, true);
  write(8, "WAVE");
  write(12, "fmt ");
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, 1, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate, true);
  view.setUint16(32, 1, true);
  view.setUint16(34, 8, true);
  write(36, "data");
  view.setUint32(40, samples, true);
  for (let i = 0; i < samples; i++) view.setUint8(44 + i, 128);

  return URL.createObjectURL(new Blob([buffer], { type: "audio/wav" }));
}

export class OrderBell {
  private context: AudioContext | null = null;
  private output: AudioNode | null = null;
  private keepAlive: HTMLAudioElement | null = null;
  private keepAliveUrl: string | null = null;
  private wakeLock: WakeLockSentinelLike | null = null;
  private wantWakeLock = false;

  async enable() {
    const sessionNavigator = navigator as AudioSessionNavigator;
    if (sessionNavigator.audioSession) {
      // Lets the bell play even when the iPhone ring/silent switch is on.
      sessionNavigator.audioSession.type = "playback";
    }

    if (!this.keepAlive) {
      // A looping silent media element moves iOS into the "playback" audio
      // category on older Safari versions that lack navigator.audioSession.
      this.keepAliveUrl = createSilentWavUrl();
      this.keepAlive = new Audio(this.keepAliveUrl);
      this.keepAlive.loop = true;
      this.keepAlive.setAttribute("playsinline", "");
    }
    await this.keepAlive.play().catch(() => undefined);

    if (!this.context) {
      const AudioCtor =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext })
          .webkitAudioContext;
      this.context = new AudioCtor();

      const compressor = this.context.createDynamicsCompressor();
      compressor.threshold.value = -6;
      compressor.knee.value = 0;
      compressor.ratio.value = 20;
      compressor.attack.value = 0.002;
      compressor.release.value = 0.1;

      const master = this.context.createGain();
      master.gain.value = 1;
      master.connect(compressor).connect(this.context.destination);
      this.output = master;
    }
    await this.context.resume();

    this.wantWakeLock = true;
    await this.requestWakeLock();
  }

  async resume() {
    await this.context?.resume().catch(() => undefined);
    await this.keepAlive?.play().catch(() => undefined);
    if (this.wantWakeLock && !this.wakeLock) await this.requestWakeLock();
  }

  ring() {
    const context = this.context;
    const output = this.output;
    if (!context || !output) return;
    if (context.state === "suspended") void context.resume();

    const start = context.currentTime + 0.02;
    const strikes = [
      { at: 0, base: 1046.5 },
      { at: 0.35, base: 784 },
      { at: 0.9, base: 1046.5 },
      { at: 1.25, base: 784 },
    ];

    strikes.forEach(({ at, base }) => {
      [
        { ratio: 1, level: 0.9, type: "triangle" as OscillatorType },
        { ratio: 2.76, level: 0.35, type: "sine" as OscillatorType },
        { ratio: 5.4, level: 0.15, type: "sine" as OscillatorType },
      ].forEach(({ ratio, level, type }) => {
        const oscillator = context.createOscillator();
        const gain = context.createGain();
        const t = start + at;
        oscillator.type = type;
        oscillator.frequency.value = base * ratio;
        gain.gain.setValueAtTime(0.0001, t);
        gain.gain.exponentialRampToValueAtTime(level, t + 0.008);
        gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.7);
        oscillator.connect(gain).connect(output);
        oscillator.start(t);
        oscillator.stop(t + 0.75);
      });
    });
  }

  private async requestWakeLock() {
    const wakeNavigator = navigator as WakeLockNavigator;
    if (!wakeNavigator.wakeLock || document.visibilityState !== "visible") {
      return;
    }
    try {
      const sentinel = await wakeNavigator.wakeLock.request("screen");
      this.wakeLock = sentinel;
      (sentinel as unknown as EventTarget).addEventListener?.("release", () => {
        this.wakeLock = null;
      });
    } catch {
      this.wakeLock = null;
    }
  }

  dispose() {
    this.wantWakeLock = false;
    void this.wakeLock?.release().catch(() => undefined);
    this.wakeLock = null;
    this.keepAlive?.pause();
    this.keepAlive = null;
    if (this.keepAliveUrl) URL.revokeObjectURL(this.keepAliveUrl);
    this.keepAliveUrl = null;
    void this.context?.close().catch(() => undefined);
    this.context = null;
    this.output = null;
  }
}
