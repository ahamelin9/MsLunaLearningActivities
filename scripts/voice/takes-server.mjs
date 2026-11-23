// The recording page's save (VOX-7): a Vite dev-server plugin, so a take
// recorded at `/?record` lands as a WAV in scripts/voice/takes/, which git
// ignores. Alex's raw voice stays on his Mac: only takes converted into
// Luna's voice go further (.claude/skills/know-how/voice-audit/convert-takes.py).
// It only runs under `npm run dev` (apply: 'serve'); the build has none of it.
//
//   GET  /__takes          the names saved so far, as JSON
//   GET  /__takes/<name>   one take
//   PUT  /__takes/<name>   save one take (the request body is the WAV)
//   DELETE /__takes/<name> drop one take

import { existsSync, mkdirSync, readFileSync, readdirSync, unlinkSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

export const TAKES_DIR = join(dirname(fileURLToPath(import.meta.url)), 'takes');
/** sound__B__take1.wav, sound__TH_alt__word.wav, name__B__take1.wav: nothing else can be written */
const NAME = /^(sound|name)__[A-Za-z_]+__(take[123]|word)\.wav$/;
/** a take is seconds long; a WAV past this is a mistake */
const MOST_BYTES = 20 * 1024 * 1024;

export function takesServer() {
  return {
    name: 'luna-takes',
    apply: 'serve',
    configureServer(server) {
      server.middlewares.use('/__takes', (req, res) => {
        const name = decodeURIComponent((req.url ?? '/').replace(/^\//, '').split('?')[0]);
        const send = (status, body, type = 'application/json') => {
          res.statusCode = status;
          res.setHeader('Content-Type', type);
          res.end(body);
        };
        if (name === '') {
          if (req.method !== 'GET') return send(405, '"GET only"');
          const names = existsSync(TAKES_DIR) ? readdirSync(TAKES_DIR).filter(n => NAME.test(n)) : [];
          return send(200, JSON.stringify(names));
        }
        if (!NAME.test(name)) return send(400, '"not a take name"');
        const path = join(TAKES_DIR, name);
        if (req.method === 'GET') {
          if (!existsSync(path)) return send(404, '"no such take"');
          return send(200, readFileSync(path), 'audio/wav');
        }
        if (req.method === 'DELETE') {
          if (existsSync(path)) unlinkSync(path);
          return send(200, '"dropped"');
        }
        if (req.method !== 'PUT') return send(405, '"GET, PUT or DELETE"');
        const chunks = [];
        let size = 0;
        req.on('data', c => {
          size += c.length;
          if (size <= MOST_BYTES) chunks.push(c);
        });
        req.on('end', () => {
          const body = Buffer.concat(chunks);
          if (size > MOST_BYTES) return send(413, '"too long"');
          if (body.subarray(0, 4).toString('latin1') !== 'RIFF' || body.subarray(8, 12).toString('latin1') !== 'WAVE')
            return send(400, '"not a WAV"');
          mkdirSync(TAKES_DIR, { recursive: true });
          writeFileSync(path, body);
          send(200, '"saved"');
        });
      });
    }
  };
}
