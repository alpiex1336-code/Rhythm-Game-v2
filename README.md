# Rhythm Drop v2 (alpiex)

## What's New in v2

- **Alternate keys** — `G` / `H` / `J` / `K` map to Left / Up / Right / Down. Use arrows or letter keys.
- **Import MIDI & MP3** — Add your own songs. MP3 uses AI transcription (Spotify Basic Pitch, first load ~30s).
- **Faster 4★ & 5★** — Faster drop speed for Fur Elise and Can-Can; keys are more separated.
- **Grading improvements** — Hit-time forgiveness for input delay; wider PERFECT / GREAT thresholds.
- **FX Volume & Latency Offset** — Tune effects and compensate for audio/display delay.
- **Delete song** — Remove imported songs.
- **PWA-ready** — Manifest and service worker for installability.
- **Piano-tiles style** — You play the melody; no background track. Hit all keys correctly.

---

## Quick Start

After downloading this folder:

```bash
cd "$HOME/Downloads/rhythm-drop-v2-alpiex"
npm install
npm run build
cd dist && python3 -m http.server 8000
```

Or for development (hot reload):

```bash
cd "$HOME/Downloads/rhythm-drop-v2-alpiex"
npm install
npm run dev
```

Open [http://localhost:8000](http://localhost:8000) (production) or [http://localhost:5173](http://localhost:5173) (dev).

---

## About

Rhythm Drop is a browser rhythm game with:

- Falling arrow lanes (`Left`, `Up`, `Right`, `Down` or `G`, `H`, `J`, `K`)
- Tap and hold notes with graded judgement
- 5-level difficulty (1★–5★)
- Song selection and import (MIDI / MP3)
- Combo scoring, retry, and result summary

## Controls

- `ArrowLeft` / `G` → left lane  
- `ArrowUp` / `H` → up lane  
- `ArrowRight` / `J` → right lane  
- `ArrowDown` / `K` → down lane  

Home screen: **FX Volume**, **Latency Offset**, **Import MIDI**, **Import MP3**, **Delete song**.

## Builtin Songs

- Twinkle Twinkle
- Mary Had a Little Lamb
- Ode to Joy
- Fur Elise Intro
- Can-Can Theme

## 100% Offline

No paid APIs or external CDN. All game assets are in this folder.

## License

MIT License. See `LICENSE`.
