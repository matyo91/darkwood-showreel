#!/usr/bin/env bash
# Download "People like trance" (Kuebass) via spotDL: https://spotdl.github.io/spotify-downloader/
#
# Prerequisites: python3 -m pip show spotdl, ffmpeg, youtube.cookies.txt (Netscape export).
#
# Spotify Web API notes (spotDL uses it for track metadata):
# - Default spotDL client credentials are shared; you may see a 24h rate limit — wait or use your own app.
# - If you pass --client-id / --client-secret from .env.local, Spotify may return 403 until the
#   developer account linked to that app has an active Premium subscription (Spotify policy).
#
# Usage (from this directory):
#   chmod +x spotdl_people_like_trance.sh && ./spotdl_people_like_trance.sh
#
set -euo pipefail
cd "$(dirname "$0")"

TRACK_URL="https://open.spotify.com/track/4IJZV0KAlNIu93HcYfDvPy"

python3 -m spotdl download "$TRACK_URL" \
  --output "download_cursor" \
  --format mp3 \
  --cookie-file "youtube.cookies.txt"
