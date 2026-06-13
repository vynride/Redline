// Browser audio helpers: capture mic as PCM16 mono 16k (for Saaras STT) and play
// back Bulbul's PCM 24k stream via Web Audio. Both are client-only.

const STT_RATE = 16000;
const TTS_RATE = 24000;

function downsampleToInt16(input: Float32Array, inRate: number, outRate: number): ArrayBuffer {
  if (outRate >= inRate) {
    const out = new Int16Array(input.length);
    for (let i = 0; i < input.length; i++) out[i] = clampPcm(input[i]);
    return out.buffer;
  }
  const ratio = inRate / outRate;
  const outLen = Math.floor(input.length / ratio);
  const out = new Int16Array(outLen);
  for (let i = 0; i < outLen; i++) out[i] = clampPcm(input[Math.floor(i * ratio)]);
  return out.buffer;
}

function clampPcm(v: number): number {
  return Math.max(-1, Math.min(1, v)) * 0x7fff;
}

/** Captures the mic and emits raw PCM16 mono @16k chunks for STT. */
export class MicCapture {
  private ctx: AudioContext | null = null;
  private stream: MediaStream | null = null;
  private node: ScriptProcessorNode | null = null;
  private source: MediaStreamAudioSourceNode | null = null;

  constructor(private onChunk: (pcm: ArrayBuffer) => void) {}

  async start(): Promise<void> {
    this.stream = await navigator.mediaDevices.getUserMedia({
      audio: { channelCount: 1, echoCancellation: true, noiseSuppression: true },
    });
    this.ctx = new AudioContext();
    this.source = this.ctx.createMediaStreamSource(this.stream);
    const node = this.ctx.createScriptProcessor(4096, 1, 1);
    node.onaudioprocess = (e: AudioProcessingEvent) => {
      const input = e.inputBuffer.getChannelData(0);
      const pcm = downsampleToInt16(input, this.ctx!.sampleRate, STT_RATE);
      if (pcm.byteLength) this.onChunk(pcm);
    };
    this.source.connect(node);
    node.connect(this.ctx.destination);
    this.node = node;
  }

  stop(): void {
    this.node?.disconnect();
    this.source?.disconnect();
    this.stream?.getTracks().forEach((t) => t.stop());
    void this.ctx?.close();
    this.ctx = this.stream = this.node = this.source = null;
  }
}

/** Schedules incoming PCM16 @24k chunks back-to-back for gapless playback. */
export class PcmPlayer {
  private ctx: AudioContext;
  private nextTime = 0;

  constructor() {
    this.ctx = new AudioContext({ sampleRate: TTS_RATE });
  }

  async resume(): Promise<void> {
    if (this.ctx.state === "suspended") await this.ctx.resume();
  }

  enqueue(buf: ArrayBuffer): void {
    const i16 = new Int16Array(buf);
    if (!i16.length) return;
    const f32 = new Float32Array(i16.length);
    for (let i = 0; i < i16.length; i++) f32[i] = i16[i] / 0x8000;

    const audioBuf = this.ctx.createBuffer(1, f32.length, TTS_RATE);
    audioBuf.copyToChannel(f32, 0);
    const src = this.ctx.createBufferSource();
    src.buffer = audioBuf;
    src.connect(this.ctx.destination);

    this.nextTime = Math.max(this.nextTime, this.ctx.currentTime);
    src.start(this.nextTime);
    this.nextTime += audioBuf.duration;
  }

  close(): void {
    void this.ctx.close();
  }
}
