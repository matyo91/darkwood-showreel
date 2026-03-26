#!/usr/bin/env bash
# Fetch the showreel soundtrack MP3 from the RFURecordingz YouTube upload.
# If cookie extraction hangs, quit Brave first, or export a fresh Netscape
# youtube.cookies.txt and pass: --cookies youtube.cookies.txt
set -euo pipefail
cd "$(dirname "$0")"
exec yt-dlp \
  --js-runtimes node \
  --remote-components ejs:github \
  --cookies-from-browser brave \
  -x --audio-format mp3 \
  -o "assets/audio/showreel-track.%(ext)s" \
  --no-playlist \
  "https://www.youtube.com/watch?v=D6ZITMzMfTg"
