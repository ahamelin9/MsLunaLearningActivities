# Human-recorded sounds

Anything dropped in here replaces the generated clip of the same name. The
generated phonics sounds are cut from real words Luna says and held carefully
(see `../phonemes.mjs`), but a person is still the gold standard for an
isolated phoneme, so this is the way to replace one you are not happy with.

Name a file `<kind>__<value>.<ext>`, where the value is the key the app asks
for, with anything that is not a letter or digit replaced by `_`:

```
sound__B.wav        the /b/ phoneme
sound__SH.wav       the /sh/ phoneme
sound__TH_alt.wav   the voiced /th/ of "this"
name__W.wav         the letter name "double-u"
word__cat.wav       the word "cat"
```

Several keys share one generated sound — C, K and CK all make /k/ — and a
recording replaces only the key it is named for. To replace /k/ everywhere,
record `sound__C`, `sound__K` and `sound__CK` (the same file three times is
fine).

Accepted: `.wav .aiff .aif .mp3 .m4a .flac .ogg`. Any sample rate or channel
count — it is resampled to mono 24 kHz on the way in.

A recording is trimmed and levelled to match the rest of the set, and nothing
more: a person saying "mmmm" has already held it.

Then `npm run voice:render -- --only sound`. The renderer notices the file by
its contents, so replacing a recording re-renders that clip and deleting one
falls back to the generated sound.
