import { useEffect, useState } from 'react';
import { pronunciation } from './pronunciation';

/**
 * True while one of Luna's clips is playing (DES-15). The kit's Luna follows
 * it, so her beak moves only while she is really talking.
 */
export function useSpeaking(): boolean {
  const [speaking, setSpeaking] = useState(false);
  useEffect(() => pronunciation.onSpeaking(setSpeaking), []);
  return speaking;
}
