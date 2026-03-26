# Darkwood Showreel

Static first-pass showreel landing page built with:

- HTML
- CSS
- Vanilla JavaScript
- GSAP + ScrollTrigger via CDN

The project also includes a dedicated 16:9 motion reel:

- `showreel.html`
- `showreel.css`
- `showreel.js`

## Structure

```text
darkwood-showreel/
├── assets/
│   ├── audio/
│   │   └── showreel-track.mp3        # RFURecordingz — Contraption — Higher, Forever (Breeze & Styles Remix); https://www.youtube.com/watch?v=kNmG75Tq4Kc
│   ├── media/
│   │   └── .gitkeep                  # future screenshots, portraits, logo plates, clips
│   └── posters/
│       └── .gitkeep                  # future poster frames / stills
├── index.html
├── showreel.html
├── showreel.css
├── showreel.js
├── playlist_tracks.json
├── script.js
├── style.css
└── README.md
```

## Run

Open `index.html` for the scroll-based identity page, or `showreel.html` for the 16:9 motion reel. Serving the folder from a local static server gives the best playback consistency.

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

## Motion reel notes

- `showreel.html` is a timeline-first composition designed as a centered 16:9 stage.
- Use the `Play reel` interaction to satisfy browser audio restrictions and start the soundtrack plus the GSAP timeline together.
- For screen capture or export, open `showreel.html`, optionally go full screen, then record the browser window with the capture workflow of your choice.

## Notes

- The page is intentionally strong without final media.
- `playlist_tracks.json` is read only as a lightweight metadata hint for the soundtrack button tooltip.
- If you want the soundtrack to use a different filename, update the `src` on the `<audio>` tag in `index.html`.
