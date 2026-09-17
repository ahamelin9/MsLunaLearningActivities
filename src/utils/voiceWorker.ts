/// <reference lib="webworker" />
//
// Ms. Luna's voice runs here, off the main thread, so generating speech
// never freezes an animation or a tap. The worker owns the model; the
// pronunciation service just sends it text or IPA and gets samples back.

import { KokoroTTS } from 'kokoro-js';

export type VoiceQuality = 'best' | 'compact';

type InMessage =
  | { id: number; type: 'init'; quality: VoiceQuality }
  | { id: number; type: 'generate'; voice: string; speed: number; text?: string; ipa?: string };

type OutMessage =
  | { id: number; type: 'progress'; progress: number }
  | { id: number; type: 'ready'; device: string; dtype: string }
  | { id: number; type: 'samples'; samples: Float32Array }
  | { id: number; type: 'error'; message: string };

const post = (message: OutMessage, transfer?: Transferable[]) =>
  (self as unknown as DedicatedWorkerGlobalScope).postMessage(message, transfer ?? []);

let tts: KokoroTTS | null = null;
let loading: Promise<KokoroTTS> | null = null;

async function hasWebGpu(): Promise<boolean> {
  try {
    const gpu = (navigator as unknown as { gpu?: { requestAdapter(): Promise<unknown> } }).gpu;
    if (!gpu) return false;
    return (await gpu.requestAdapter()) !== null;
  } catch {
    return false;
  }
}

async function load(id: number, quality: VoiceQuality): Promise<KokoroTTS> {
  if (tts) return tts;
  if (loading) return loading;

  loading = (async () => {
    const webgpu = await hasWebGpu();

    // Measured on this model, comparing each build against full precision:
    // the half-precision builds (fp16, q4f16) add audible high-frequency noise
    // and lose periodicity — they sound gritty. Only fp32 and q8 are clean.
    // fp32 is also fast on WebGPU, so quality wins there; q8 is the small,
    // clean option and the only sensible choice on WASM.
    // The 8-bit build is no faster on WebGPU than on WASM (parts of it fall
    // back to the CPU anyway), so the compact voice simply runs on WASM.
    const useGpu = webgpu && quality === 'best';
    const device: 'webgpu' | 'wasm' = useGpu ? 'webgpu' : 'wasm';
    const dtype: 'fp32' | 'q8' = useGpu ? 'fp32' : 'q8';

    const seen = new Map<string, number>();
    const model = await KokoroTTS.from_pretrained('onnx-community/Kokoro-82M-v1.0-ONNX', {
      dtype,
      device,
      progress_callback: (p: { status?: string; file?: string; progress?: number }) => {
        if (p.status === 'progress' && p.file) {
          seen.set(p.file, p.progress ?? 0);
          const values = [...seen.values()];
          post({
            id,
            type: 'progress',
            progress: Math.round(values.reduce((a, b) => a + b, 0) / values.length)
          });
        }
      }
    });

    tts = model;
    post({ id, type: 'ready', device, dtype });
    return model;
  })();

  try {
    return await loading;
  } catch (error) {
    loading = null;
    throw error;
  }
}

self.onmessage = async (event: MessageEvent<InMessage>) => {
  const message = event.data;

  try {
    if (message.type === 'init') {
      await load(message.id, message.quality);
      return;
    }

    if (message.type === 'generate') {
      const model = tts ?? (await load(message.id, 'best'));
      type GenerateOpts = NonNullable<Parameters<KokoroTTS['generate']>[1]>;
      const voice = message.voice as NonNullable<GenerateOpts['voice']>;

      // IPA skips grapheme conversion entirely, which is the only way to get
      // an isolated /v/ instead of the letter name "vee".
      const audio = message.ipa
        ? await model.generate_from_ids(model.tokenizer(message.ipa, { truncation: true }).input_ids, {
            voice,
            speed: message.speed
          })
        : await model.generate(message.text ?? '', { voice, speed: message.speed });

      const samples = audio.audio as Float32Array;
      const copy = new Float32Array(samples);
      post({ id: message.id, type: 'samples', samples: copy }, [copy.buffer]);
    }
  } catch (error) {
    post({
      id: message.id,
      type: 'error',
      message: error instanceof Error ? error.message : String(error)
    });
  }
};
