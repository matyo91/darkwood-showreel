#!/usr/bin/env python3
"""Download playlist_tracks.json entries as MP3 via yt-dlp YouTube search."""
import json
import subprocess
import sys
from pathlib import Path

BASE = Path(__file__).resolve().parent
PLAYLIST = BASE / "playlist_tracks.json"
COOKIES = BASE / "youtube.cookies.txt"
OUT = BASE / "download_cursor"


def main() -> None:
    if not COOKIES.is_file():
        print(f"Missing cookies file: {COOKIES}", file=sys.stderr)
        sys.exit(1)
    OUT.mkdir(parents=True, exist_ok=True)

    with PLAYLIST.open(encoding="utf-8") as f:
        data = json.load(f)

    tracks = data.get("tracks", [])
    total = len(tracks)
    for i, t in enumerate(tracks, start=1):
        idx = int(t["index"])
        title = t["title"]
        artists = t["artists"]
        query = f"{artists} - {title}"
        url = f"ytsearch1:{query}"
        out_tmpl = str(OUT / f"{idx:03d} - %(title)s.%(ext)s")
        cmd = [
            "yt-dlp",
            # Homebrew yt-dlp needs Node + remote EJS for YouTube signature challenges
            "--js-runtimes",
            "node",
            "--remote-components",
            "ejs:github",
            "--cookies",
            str(COOKIES),
            "-x",
            "--audio-format",
            "mp3",
            "-o",
            out_tmpl,
            "--no-playlist",
            "--restrict-filenames",
            "--sleep-requests",
            "1",
            url,
        ]
        print(f"[{i}/{total}] {query}", flush=True)
        r = subprocess.run(cmd)
        if r.returncode != 0:
            print(f"  FAILED (exit {r.returncode})", file=sys.stderr)


if __name__ == "__main__":
    main()
