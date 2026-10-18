#!/bin/sh
# Chrome in a Claude Code cloud session (OPS-10). The session runs as root in a
# container, where Chrome can't sandbox itself, so every launch gets
# --no-sandbox; /dev/shm is small there too. scripts/chrome-path.cjs points the
# checks and ui:shots here when it finds a Linux Chrome: a system one, or the
# newest that `npx @puppeteer/browsers install chrome@stable` put in
# ~/.cache/puppeteer. Setup: docs/cloud-sessions.md.
cached=$(ls -d "$HOME"/.cache/puppeteer/chrome/linux-*/chrome-linux64/chrome 2>/dev/null | sort | tail -n 1)
for c in "$CHROMIUM_BIN" /usr/bin/chromium /usr/bin/chromium-browser /usr/bin/google-chrome /usr/bin/google-chrome-stable "$cached"; do
  if [ -n "$c" ] && [ -x "$c" ]; then
    exec "$c" --no-sandbox --disable-dev-shm-usage "$@"
  fi
done
echo "chrome.sh: no Chrome found; see docs/cloud-sessions.md" >&2
exit 1
