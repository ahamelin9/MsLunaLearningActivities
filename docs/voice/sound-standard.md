# How each phonics sound should sound

The standard Luna's letter sounds are held to: what a US phonics teacher
says for each sound, what it must never sound like, and where Luna is
today. It comes from the research run of 2026-10-28
([research notes](research-2026-10-28.md)) and Alex's two rounds of picks
on the Sound Check page (VOX-1 in `kanban/epics/VOX.md`).

It's a reference, not a change: nothing in the app follows it until a VOX
ticket builds it and Alex has heard it.

## In one minute

- **No "uh" after a consonant.** Teachers call it "clipping" (Heggerty):
  /m/ is "mmm", never "muh". An added vowel makes children blend "cat" as
  "cuh-a-tuh". Every US guide read agrees on this.
- **Stretchy sounds are held; bouncy sounds are quick.** Held: m, n, ng, l,
  r, s, z, f, v, sh, both th's, h, and every vowel. Quick: b, d, g, p, t, k,
  ch, j.
- **A quick sound that can't stand alone is whispered, not voiced.** P and T
  are a puff or hiss of air. K is a short "radio static" at the back of the
  mouth, and G is the same with a little voice. B keeps the tiniest "uh" and
  D the tiniest "ih" (Kilpatrick).
- **R is the "fire engine" sound, L is "lll" with the tongue up.** Not "er"
  or "ruh", not "ul".
- **Long vowels say their name.** Long A, I and O (and OW, OY) are
  two-part glides in American English.
- **A blend keeps both sounds**, run together: "ffflllip", "sssnnn". In TR
  and DR the T and D naturally lean toward CH and J ("chrip"), and after S,
  P/T/K lose their puff ("sbin"). Both are normal.

## The rules, with where they come from

| Rule | Source |
|---|---|
| Don't add a vowel ("uh") to consonants in isolation; it disrupts blending ("cuh-a-tuh" for *cat*). | Kilpatrick, *Equipped for Reading Success*, ch. 12; UFLI glossary; Heggerty "clipping"; Colorado Dept. of Education |
| Continuous sounds can be held "as long as you have breath": m, n, l, r, s, f, v, z, sh, th, h, vowels. | Kilpatrick; This Reading Mama; Collaborative Classroom |
| Stops (b, d, g, p, t, k) are made by blocking the air and releasing a quick burst; they can't be held. | Colorado Dept. of Education; UFLI glossary |
| B, D, P, T can't be said alone at all: replace the "uh" with a whisper or hiss. B keeps a barely-there "uh", D a barely-there "ih". | Kilpatrick |
| K: "a quiet version of the static" between radio stations. Hard G: "halfway between radio static and an electric humming". | Kilpatrick |
| J: start "just" and hold the J before the vowel; take the voice away and it turns into CH. | Kilpatrick |
| H: a breath that can be held, as when fogging glasses. Don't add a voiced "u". | Kilpatrick; Reading Universe |
| QU is /kw/, close to the start of "coo", not "kwuh". Q is taught as QU. | Kilpatrick |
| R: "start to say *ruh*, but hold the /r/ and don't say the *uh*": a child's toy fire engine. Don't put a vowel before it either. | Kilpatrick; speech-therapy guides |
| L: tongue tip on the ridge behind the top teeth, voice on, held "l-l-l-l". A neutral tongue turns it into a vowel ("ul"). The dark L at the end of a word is a different sound. | Speech-language handouts (Handy Handouts, Pronuncian, Gold Coast Health) |
| W: lips in a small tight circle, an "oo" with the lips almost closed. Y: hold the start of "yes" before the vowel. | Kilpatrick |
| Glides (y, w, wh, h) pick up a little vowel when said alone. | Reading Universe (WETA/AFT). This disagrees with Kilpatrick for W and Y; Alex chose "wuh" over "ooo-wuh". |
| X is /k/+/s/, the end of "socks". | Kilpatrick |
| WH is said like W in American English. | Colorado Dept. of Education; Reading Universe |
| TR, DR lean toward "chr", "jr"; P, T, K after S lose their puff (so SP sounds like "sb"). | Colorado Dept. of Education (allophonic variation) |
| Blend by "connected phonation" ("mmmăăăp"), not with pauses between sounds: kindergartners taught this way decoded new words better, including words starting with stops. | Gonzalez-Frey & Ehri, *Scientific Studies of Reading* (2020); Reading Rockets |
| Long vowels are their names; long I, OW and OY move the mouth from one shape to another. R-controlled vowels AR, ER, OR are one sound each. | Colorado Dept. of Education |

## Each sound

**Status** is where Alex's picks stand after round 2 (2026-10-28) and his
listen to the Research tab (2026-10-29).
**Luna today** is what's wrong with the clip in the app now, by Alex's ear
(quoted) and by measurement. **Next** is the fix the research points to.
Measured targets from real American speech are in the
[research notes](research-2026-10-28.md#measured-targets).

### Short vowels: settled

| Sound | Teachers say | Status | Notes |
|---|---|---|---|
| /ă/ (apple) | "a" as in *cat*, held | Settled: from "cat" | Today's app clip is more open than Luna's own "a" in speech (F1 1040 vs 823 Hz), which is why "cat" won. |
| /ĕ/ (egg) | "e" as in *bed* | Settled: from "egg" | |
| /ĭ/ (igloo) | "i" as in *it* | Settled: from "it" | Today's app clip drifts toward "uh" in its middle (F2 1029 vs 2122 Hz in speech). |
| /ŏ/ (ox) | "o" as in *hot* | Settled: from "dot" | |
| /ŭ/ (umbrella) | "u" as in *cup* | Settled: today's | |

**The sounds are settled; the same vowels inside words aren't.** In the
app's single-word clips, Luna's short i sits where a real short e is, her
short e leans toward short a, and the "oo" of "book" isn't heard as itself
(second pass, 2026-10-29, in the research notes). That's a habit of her
voice (`af_heart`) and needs its own fix: decision 12 in the notes.

### Long vowels and R vowels

| Sound | Teachers say | Must not | Status | Luna today | Next |
|---|---|---|---|---|---|
| /ā/ (cake) | its name, "ay" (a glide) | be clipped, have anything in front | Picked: said on its own, slowly | 171 ms, a blip. The slow version has the right glide but a stray sound in front. | Said on its own slowly, cut from where the vowel starts (aligned): 361 ms, gliding from "eh" (F1 861, F2 2370) to "ee" (549, 2633). On the Research tab. |
| /ē/ (tree) | its name, "ee" | have an "h" in front | Settled: said on its own, slowly | Today's starts with the h of "he". | |
| /ī/ (kite) | its name, "eye" (a glide) | sound like "high" | Picked: from "my", said slowly | Today's starts with the h of "high". Round 2's take was broken (165 ms). | Said on its own slowly, aligned cut: 308–361 ms, gliding from "ah" (F1 about 1100) to "ee" (F1 about 615, F2 about 2500). On the Research tab. |
| /ō/ (bone) | its name, "oh" (a glide) | be robotic | Settled: said on its own, slowly | | |
| /oo/ (moon) | "oo" | be "aw" or a glide | Open: the slow takes "sound like 'ew'" | Today's measures like "aw" (F1 941 Hz, a real "oo" is about 450). Round 2's "shoe" take was broken. | Said on its own slowly, or the vowel of "zoo" said slowly (F1 about 480–550, F2 falling to about 1000, rounded). On the Research tab. |
| /ū/ (unicorn) | "you" | sound forced | Picked: today's | | "you" said slowly, trimmed, with wobble. |
| /ar/ (star) | one sound, "ar" | cut off, be fast | Picked: from "car", said slowly | 341 ms with an abrupt end; the slow take was broken (60 ms). | "are" or the vowel of "car" said slowly, aligned cut (363–411 ms), ending in an R (F3 down to about 2040 in "car"). On the Research tab. |
| /or/ (fork) | one sound, "or" | start with a breath | Picked: from "door", said slowly | The k breath of "core" is left in front. | The vowel of "door" or "more" said slowly, aligned so nothing comes before it (351–373 ms), ending in a real R (F3 1930–2050). On the Research tab. |
| /er/ (her) | one sound, "er" | be fast | Picked: from "fur", said slowly; "drag that rrr out a bit longer" | F1 707 vs 516 Hz in speech (too open); slow take broken. | "er" or the vowel of "fur" said slowly (344–361 ms; "fur" holds F3 about 1950–2090). On the Research tab. |

### Stops (quick sounds)

| Sound | Teachers say | Must not | Status | Luna today | Next |
|---|---|---|---|---|---|
| /b/ | burst + the tiniest "uh" | "buh" | Open: none ("don't even sound like letters") | 60 ms of voiced "uh" after the burst. Shorter takes lost the B entirely. | Kilpatrick's whisper: the burst, then a whispered vowel (on the Sound Check page, 60 and 90 ms). |
| /d/ | burst + the tiniest "ih" | "duh"; "j" | Open: none ("don't even sound like letters") | Heard as /j/ (96%): "duck" affricates. 85 ms of "uh". | Burst from "dip"/"dig", whispered "ih" after it. |
| /g/ | voiced "radio static" | "guh" | Open: none ("don't even sound like letters") | 85 ms of "uh". | Whispered release, or a held voiced velar hiss. |
| /p/ | an unvoiced puff | be forceful | Settled: from "pup", softer. The whispered 70 ms puff was "good but kind of loud" too | | |
| /t/ | a short hiss, "like air out of a tire" | "tuh" | Picked: a whispered hiss, 70 ms; "good but kind of loud" | No voicing (good), just short. | A longer aspiration (puff), not a vowel. The whispered take at 70 ms is too hissy (heard as "s"); try 40 ms. |
| /k/ | quiet "radio static" | "kuh"; abrupt | Picked: "radio static", 90 ms; "good but loud" | The least-vowel take ends abruptly. | Longer aspiration with a soft 40 ms fade (whisper). |

### Hisses and buzzes (held)

| Sound | Teachers say | Must not | Status | Luna today | Next |
|---|---|---|---|---|---|
| /s/ | "sss" | be long | Settled: today's at 450 ms | | |
| /sh/ | "shh" | be long | Settled: today's at 420 ms | | |
| /h/ | a held breath | "huh" | Settled: today's at 330 ms | | |
| /f/ | "fff", lip on teeth | sound like TV static | Today's, over the new takes ("none of the other options sound good"); all three bitrates sound bad | Held from fresh synthetic noise (round 1) or 40 ms grains of her hiss (round 2). Both are far too bright: today's is 115% brighter than a real F (1–7.8 kHz centroid 4929 Hz, real 2290). Every hiss Alex passed was within about 35% (S, SH, H); every one he called static was over 40%. Compression doesn't change brightness. | Her real hiss held with long grains, softer. On the Research tab, "from cuff, softer" measures +24% and is the measures' pick; the others are +52% to +131%. |
| /th/ (thumb) | "thhh", tongue between teeth | static; "vibrating" | Open: none ("don't even sound like letters") | 40 ms grains at half overlap flutter about 50 times a second: that's the "vibrating". Today's is 143% brighter than a real TH. | Long grains, softer. On the Research tab, "from tooth, softer" measures within 1% of a real TH and is the measures' pick; the others are +86% to +147%. |
| /th/ (this) | voiced "thhh" | be worse than /th/ | Open: none ("don't even sound like letters") | Today's is darker than a real one (1803 Hz against 2178) and Alex found it "worse than the other one". Kokoro does voice the TH at the start of "this" said slowly: held, it measures 2192 Hz. | Held from "this" (Research tab, round 3 candidates), or a person's recording. |
| /v/ | "vvv" | static | Today's, over the new takes ("none of the other options sound good") | A held hum with her hiss over it: 190% brighter than a real V (5904 Hz against 2039), the "static". | Held from the start of "van": 2318 Hz (+14%), voiced throughout. The V at the end of "five" can't be used: Kokoro devoices it. On the Research tab. |
| /z/ | "zzz" | static | Today's, over the new takes ("none of the other options sound good") | Today's is 42% brighter than a real Z (6259 Hz against 4421), the "bit static"; round 2's were the same. | A Z held from "zoo" alone is too dull (2436 Hz: a hum). With her real S hiss mixed under it, eased off above 7 kHz: 4827 Hz (+9%), or 3786 with less hiss. On the Research tab. |

### Hums, liquids, glides, J, CH, X, QU

| Sound | Teachers say | Must not | Status | Luna today | Next |
|---|---|---|---|---|---|
| /m/ | "mmm" | robotic | Settled: held with a natural wobble | | |
| /n/ | "nnn" | robotic | Settled: held with a natural wobble | | |
| /ng/ | "ng" | "nnn" with no g | Open: none ("don't even sound like letters") | Today's isn't heard as NG at all (2%). | An NG held on its own is heard as N: what tells NG from N is the move into it from the vowel. "From king, with the end of the i in front" is heard as NG (the best the machine ear gave, 42%). On the Research tab. |
| /l/ | "lll", tongue tip up | "ul", a vowel | Today's, over the new takes ("none of the other options sound good") | Today's middle measures like the "e" of "bell" (F1 868, F2 2048 Hz). Real women's light L is 564 / 1476, and Luna's L in speech 509 / 1503. Round 2's "slow" takes were broken (60 ms), and so was every blend joined to an L. The "clear" takes from "lip"/"luck" went too dark (F2 about 1000). | A light L held from the start of a word before a front vowel, from the exact stretch the aligner finds, checked so **F1 is about 550 and F2 about 1450–1500**; with wobble. Found: "leap" held measures 506 / 1529, "leaf" 505 / 1378. On the Research tab. |
| /r/ | the "fire engine" sound | "er", "ruh" | Today's, over the new takes ("none of the other options sound good"); round 2: "maybe shorter" | Today's is an R-coloured vowel: F2 1979 (real women's R: 1540), F3 2123. "The R at the end of 'fur'" measured closest (F2 1722, F3 1969) but wasn't picked. The "clear" takes from "run"/"red" measure like W (F2 about 1040). | Aimed at **F2 about 1500, F3 at most 2000**: the first half of the R at the start of a word, from the stretch the aligner finds, held with wobble. Found: "red" 518 / 1491 / 1927, "rat" 564 / 1513 / 1979, "reek" 543 / 1482 / 1958. On the Research tab, against today's. |
| /w/ | quick "w" | "ooo-wuh" | Open: none; Alex: "take it from 'what', just the wh part?" | 205 ms, most of it an "ooo" (F1 392, F2 1038 Hz). | Cut from "wet" or "we" with 45 ms of the vowel after it, 120–180 ms in all; the machine ear is 91–95% sure of a W. On the Research tab. |
| /y/ | the start of "yes" | fast | Picked: "yes" said slowly, cut after the Y; "still a bit off, maybe too fast on the e" | 140 ms; the machine ear is 51% sure of a Y. | "Yes" said slowly, cut after the Y (175 ms, 85% sure), or the Y of "yum" held (79%). On the Research tab. |
| /j/ | the J of "just", held | cut off | Picked: the whole J of "jump"; "jet or jump both seem right, they end differently" | 140 ms. | The whole J of "jet" or "jump" with a little of the vowel (145–205 ms, 94–96% sure of a J). On the Research tab. |
| /ch/ | a quick "ch" | "tsh" | Settled: today's | | |
| /ks/ (X) | the end of "socks" | | Settled: today's | | |
| /kw/ (QU) | "coo"-ish, Kilpatrick: not "kwuh" | "qui" | Open: Alex asked for "kwuh" | | **Alex's call:** Kilpatrick says no "uh"; round 1 asked for "kwuh". |

### Blends

| Blends | Teachers say | Status | Luna today | Next |
|---|---|---|---|---|
| SL, SN | "sssllll", "sssnnnn" | Settled: the second sound held longer | | |
| SK, ST | a short S, then the stop | Settled: a short s, then k / t | | |
| SM | "sssmmm" | Picked: his S, then his M louder; "less of a gap between the two, but much better" | | Alex's picked S, then his picked M (the natural wobble) 3 or 6 dB louder than the S. On the Research tab. |
| SP | "ssssp" | Picked: his S, a 25 ms gap, his P | The P after S is built aspirated, and the "spin" cut has no puff at all, so it's heard as "s-b" (the machine ear hears "b"). | Alex's picked S, a 25 or 50 ms gap, then his picked P ("pup, softer"): heard as S + P (84% with the longer gap). On the Research tab. |
| SW | "ssswww" | Open | | The W fix, then held. |
| BL, CL, FL, GL, PL | both sounds, the L held | Open (FL picked with "needs more f") | Every joined L blend in round 2 used the broken L, so they had almost no L. | Redo once /l/ is picked. |
| BR, CR, DR, FR, GR, PR, TR | both sounds, the R held | Open: CR "much better", TR picked ("r weird, less on top of one another") | The joined R blends use round 2's R; a small gap between the sounds may help. | Redo once /r/ is picked; try a 20–40 ms gap. |
| TW | both longer | Open | | The T and W fixes. |
