// The recording page's microphone (VOX-7): raw samples, with the browser's
// echo cancelling, noise suppression and automatic gain off, so a held "thhh"
// or a quiet "d" reaches the file as said. Saved as 16-bit mono WAV at the
// microphone's own rate; the convert script resamples. Dev only: the app
// itself never records (its audio is `utils/audioEngine.ts`).

export interface Take {
  wav: Blob;
  /** the loudest sample, 0 to 1: past 0.98 it clipped, under 0.05 it's too quiet */
  peak: number;
  seconds: number;
}

let mic: { context: AudioContext; source: MediaStreamAudioSourceNode; tap: ScriptProcessorNode } | null = null;
let chunks: Float32Array[] | null = null;

async function open() {
  if (mic) return mic;
  const stream = await navigator.mediaDevices.getUserMedia({
    audio: { channelCount: 1, echoCancellation: false, noiseSuppression: false, autoGainControl: false }
  });
  const context = new AudioContext();
  const source = context.createMediaStreamSource(stream);
  const tap = context.createScriptProcessor(4096, 1, 1);
  tap.onaudioprocess = e => {
    if (chunks) chunks.push(new Float32Array(e.inputBuffer.getChannelData(0)));
  };
  // a tap only runs when it reaches the speakers; a silent gain keeps the
  // microphone out of them
  const silent = context.createGain();
  silent.gain.value = 0;
  source.connect(tap);
  tap.connect(silent);
  silent.connect(context.destination);
  mic = { context, source, tap };
  return mic;
}

export async function startTake(): Promise<void> {
  const { context } = await open();
  if (context.state !== 'running') await context.resume();
  chunks = [];
}

export function stopTake(): Take | null {
  if (!mic || !chunks) return null;
  const got = chunks;
  chunks = null;
  const length = got.reduce((n, c) => n + c.length, 0);
  const samples = new Float32Array(length);
  let at = 0;
  let peak = 0;
  for (const c of got) {
    samples.set(c, at);
    at += c.length;
    for (const s of c) peak = Math.max(peak, Math.abs(s));
  }
  const rate = mic.context.sampleRate;
  return { wav: toWav(samples, rate), peak, seconds: length / rate };
}

export const recording = () => chunks !== null;

function toWav(samples: Float32Array, rate: number): Blob {
  const data = new DataView(new ArrayBuffer(44 + samples.length * 2));
  const text = (at: number, s: string) => [...s].forEach((ch, i) => data.setUint8(at + i, ch.charCodeAt(0)));
  text(0, 'RIFF');
  data.setUint32(4, 36 + samples.length * 2, true);
  text(8, 'WAVE');
  text(12, 'fmt ');
  data.setUint32(16, 16, true);
  data.setUint16(20, 1, true); // PCM
  data.setUint16(22, 1, true); // mono
  data.setUint32(24, rate, true);
  data.setUint32(28, rate * 2, true);
  data.setUint16(32, 2, true);
  data.setUint16(34, 16, true);
  text(36, 'data');
  data.setUint32(40, samples.length * 2, true);
  samples.forEach((s, i) => data.setInt16(44 + i * 2, Math.max(-1, Math.min(1, s)) * 0x7fff, true));
  return new Blob([data.buffer], { type: 'audio/wav' });
}
