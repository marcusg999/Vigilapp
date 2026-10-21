# Pleroma — "Séance, brutalist key" (design showcase)

A standalone, zero-build visual showcase produced via `/surprise-me`. The dice
picked a **brutalist séance** direction; the render commits to three integrated
techniques:

1. **Real WebGL fly-through** (`scene.js`, three.js) — a concrete nave scrubbed by
   scroll, descending toward a single safety-orange flame on a low altar.
2. **View-Transitions ember morph** (`ui.js`) — the orange marker on the chapter
   rail morphs between marks as sections enter view.
3. **Generative ash backdrop** (`ui.js`, 2D canvas) — drifting motes, warm near
   the flame, grey above.

Type: Bodoni Moda (Didone display) + Instrument Sans (humanist body). Palette:
near-black `#07070a`, bone `#edeae3`, concrete `#8a8681`, one accent `#ff5a1f`.

The safety framing is non-negotiable and kept intact: the copy states plainly
this is *symbolic remembrance, not contact with the dead*, the echo never claims
to be the person, and the 988 line is surfaced in Chapter III.

## Run it

```bash
cd design/seance
python3 -m http.server 8099
# open http://localhost:8099/
```

Everything it needs is in `vendor/` (three.js module + woff2 fonts); no install
step. `shot.mjs` (not committed) is the Playwright audit-screenshot harness.
