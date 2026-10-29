<h2>The plan</h2>
<p>Four pieces of work, biggest win first. Nothing changes in the app until your picks on this page are in.</p>
<div class="scroll"><table>
<thead><tr><th>Ticket</th><th>What changes</th><th>Size</th></tr></thead>
<tbody>
<tr><td><b>VOX-1</b><br>Retune the letter sounds by ear</td><td>Your picks on the Letter sounds tab go into <code>overrides.json</code>. Already known: D, CH, X, the blends, L, Z/V/voiced TH, the long vowels, the "uh" after B/K/G, and loudness evened out by how loud each sound is heard, not by its raw level. For any "None are right", a new round of takes on this page.</td><td>M</td></tr>
<tr><td><b>VOX-2</b><br>Clean word edges</td><td>A word said on its own sometimes gains a little vowel before or after it ("cup-ee", "a-sheep"). That's about 1 word in 8 (59 of 451), many of them the short words children sound out. Rendering each word with a full stop after it fixes most of these: Whisper understood 17 of 30 problem words that way, against 8 today. The Word endings on the Words tab are there to check by ear.</td><td>S</td></tr>
<tr><td><b>VOX-3</b><br>The phoneme spelling, as your ear decides</td><td>Your picks on the Words, Letter names and Sentences tabs decide this one. If the fix wins: a committed pronunciation table, built once by misaki and fixable by hand, replaces today's spelling tricks ("eigh", "ef", "uh"). If it's mixed: keep espeak, add misaki's own conversion so R words, J and CH come out right, and fix the few letter names that are off. Then one full re-render (about an hour on the Mac).</td><td>M</td></tr>
<tr><td><b>VOX-4</b><br>A sound check that can fail</td><td>The scripts behind this page, kept small in the know-how folder: machine checks for "D heard as J", a vowel after a stop, a blend's missing second sound, a word's extra vowel, and loudness. Run before VOX-1 closes, proven to fail on today's clips.</td><td>S</td></tr>
</tbody></table></div>
<h3>Later, if needed</h3>
<ol>
<li><b>Letter teams with two sounds</b> (OW in snow and cow, OO in moon and book, EA in eat and bread). Each team has one sound today. This belongs with CUR-4, when lessons use them.</li>
<li><b>A person's recording</b> for any sound that still fails after VOX-1. The app already takes recordings, but the repo is public and the clips ship in the app, so a real person's voice would be published. Converting the recording into Luna's voice avoids that.</li>
</ol>
<h3>Why not a different model</h3>
<p>The newer voices (Chatterbox, Orpheus, Qwen3-TTS and others) only take text and decide the pronunciation themselves. Phonics needs the opposite: to say exactly the sound we ask for. Kokoro takes exact phonemes. Its problems here are in how we cut the letter sounds and how it ends a word said on its own, and both can be fixed around it. A new model would also change Luna's voice in every line.</p>
