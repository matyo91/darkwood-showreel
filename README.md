# Darkwood Showreel

Static first-pass showreel landing page built with:

- HTML
- CSS
- Vanilla JavaScript
- GSAP + ScrollTrigger via CDN

## Structure

```text
darkwood-showreel/
├── assets/
│   ├── audio/
│   │   └── showreel-track.mp3        # optional soundtrack file
│   ├── media/
│   │   └── .gitkeep                  # future screenshots, portraits, logo plates, clips
│   └── posters/
│       └── .gitkeep                  # future poster frames / stills
├── index.html
├── playlist_tracks.json
├── script.js
├── style.css
└── README.md
```

## Run

Open `index.html` in a browser, or serve the folder with any static server for best results.

Examples:

```bash
python3 -m http.server
```

or

```bash
php -S localhost:8000
```

## Asset insertion points

- Hero right column:
  replace the primary slot with a portrait, still, or short muted opening clip.
- Precision assembly section:
  replace the `D4` placeholder module with screenshots, UI plates, or client/project imagery.
- Closing section:
  insert final identity, contact, or signature lockup.
- Audio:
  add a file at `assets/audio/showreel-track.mp3` to activate the soundtrack toggle immediately.

## Notes

- The page is intentionally strong without final media.
- `playlist_tracks.json` is read only as a lightweight metadata hint for the soundtrack button tooltip.
- If you want the soundtrack to use a different filename, update the `src` on the `<audio>` tag in `index.html`.
