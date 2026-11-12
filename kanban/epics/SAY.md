# SAY — Reading aloud, checked by ear

A child reads a sound or a word into the microphone, and the app hears whether
it's right (Alex, 2026-11-08). Whether a machine can judge that well enough
for a child is the first question, so this starts with a test on the Mac.

### SAY-1 · Can a machine tell a right sound from a wrong one? A test on Alex's recordings
Task · P1 · M · needs: —
- **Why:** Alex (2026-11-08): a mode where a student says a sound or word and the app checks it, phonics included. How hard that is depends on what a recognizer can hear, and the VOX research already measured some of it (`.claude/skills/know-how/voice-audit/README.md`): the phoneme recognizer is reliable for consonants inside words, but hears every vowel said alone as "ah", can't name a held sound ("sss", "mmm"), and scores stops said alone (b, d, p, t) near zero. So it's tested before anything is built.
- **How (on the Mac; nothing in the app):**
  1. Claude writes the recording list: the 26 letter sounds with SH, CH and TH, and about 20 words from the lessons; each said right, and said with the mistakes ESL readers make (short e as short a, "sh" as "s" or "ch", "v" as "b", a final sound dropped), 3 takes each. Plus a small local page that records them in one go.
  2. Alex records them on the Mac, and a few on an iPad or a Chromebook. The recordings stay out of the repo, since it's public.
  3. Claude judges every take three ways with what's already on the Mac: the phoneme recognizer (wav2vec2), Whisper for words, and a closed choice (was it "s" or "sh"?) matched against Alex's right takes and Luna's clips.
  4. A findings page, for words, sounds inside words and sounds alone: how many right takes were accepted and how many wrong takes were caught, with a recommendation.
- **The bar (Claude's pick):** a child who says it right should almost never hear "try again": at least 95 in 100 right takes accepted, and most wrong takes caught (80 in 100).
- **Not in this test, but next:** running it on the devices. These models are 0.5 to 1.2 GB, too heavy for a browser on a Chromebook, so it means a smaller model, or sending the audio to a server, which needs the school's OK because these are children's voices. A recording is never kept.
- **Complete when:** the list and the recording page exist; Alex's takes are judged all three ways; the findings page gives the numbers per kind and a recommendation (build it, build it for words only, or don't), for Alex's call.
