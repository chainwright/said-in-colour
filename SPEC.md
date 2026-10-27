# Said in Colour — build spec (direction A "One… or two?", wow level approved by Roma 27.10, msgs 14299/14304/14306)

Reference frames (build to these, not to prose): `mockups/wowA_hero.png` (hero) and `mockups/wowA_case.png` (shirt picker).
In the case mockup the model mislabelled some tags — tags in the build come ONLY from `src/names.js` readColour().level.

## Tokens
| Token | Value | Use |
|---|---|---|
| `--room` | `#0B0F14` | page ground: the darkened exam room (soft radial falloff to #070A0E at edges) |
| `--light` | `#EEF3F4` | projected chart letters, primary text (contrast on room ≈ 17:1) |
| `--light-dim` | `rgba(238,243,244,.62)` | secondary text |
| `--signal` | `#0072B2` | Okabe blue: active segment, focus rings, links. Never red/green anywhere |
| `--steel` | `#C9CED3` → `#7E858C` | lens rim gradient (the only gradient, it's metal) |
| `--velvet` | `#14203A` | case lining |
| `--walnut` | `#5A3A24` / `#3E281A` | case frame |
| `--card` | `#EDE9DF` | small ivory tag cards (ink text #0B0F14) |
- States are never colour-only: TRAP = word + ▲ + diagonal hatch; CAREFUL = word + ◆; SAFE = word + ✓.
- Under our own cvd.js (deutan/protan 1.0) every text/background pair keeps ≥ 4.5:1 — enforce in a test.

## Type
- Display / chart: **Atkinson Hyperlegible Next**, 800, caps, tracking .04em; chart lines step down ×0.78 per line (Sloan-like rhythm).
- Body: Atkinson Hyperlegible Next 400/600. Numbers & notation: Atkinson Hyperlegible Mono.
- (Optician Sans rejected: licence unverifiable — repo has no LICENSE file, npm says OFL, another source CC BY-NC.)

## Hero (screen 1)
- Left 58%: the render, full-bleed to bottom, portrait-lit (vignette). Right 42%: the projected chart
  `YOU SEE / STONE / THEY SEE / ROSE / said in colour` — words come from readColour() of the current shirt (you/everyone names).
- The trial lens: canvas clip circle ≈ 30% photo height; inside = cvd.simulatePixels of the same render; outside = render.
  Steel rim (SVG ring with metal gradient), handle tab at 4 o'clock engraved `DEUTAN 1.0` (type + severity, live).
  Specular highlight (static SVG arc), 1px refraction ring (inner edge shows 1.03× magnified ring), soft drop shadow.
- Drag by lens or tab (pointer events, keyboard arrows move 2%, space flips). Lens drifts in on load and settles on the chest.
- "Focus" motion: the last chart line starts blurred (filter: blur(6px)) and sharpens when the lens settles (600 ms ease-out).
- Bottom-right segmented control `ONE: YOU` / `TWO: EVERYONE` (full-frame flip). Small caption under the photo:
  `1 = your eyes (simulated: deuteranopia) · 2 = everyone else`. Prefers-reduced-motion: no drift, no blur.

## Shirt picker (screen 2) — the trial-lens case
- Walnut case, navy velvet, 12 lens wells. Each lens shows a fabric crop of the shirt (from catalog/raw), steel rim + tab.
- Ivory tag per lens: `No. 01` + plain name first (`PINK, MUTED`) + small `sold as: dusty rose`.
- Corner tag from the measured tier. Clicking/lifting a lens (tab drag up) = try that shirt on (YouCam cloth-v4, or the
  frozen demo render), the lens flies to the hero.
- Header `PICK A SHIRT` + `Tagged by how it reads to you, not how it is sold.`

## Other screens (keep in the same world)
- Your photo: capture card styled like a patient card; rules from cloth-v4 (standing, front, shoulders visible, chest-up).
- Type selector: deutan (default "not sure? most common") / protan / tritan + severity slider "how strong" (honest note:
  milder forms are an interpolation).
- "In words" panel: real name, his name, ΔE, verdict, contrast with his skin/hair (Facial Color Tones, once, cached).
- Safe picks: case lenses filtered to SAFE that also contrast with him.
- Methods: Machado 2009 matrices (shown), CIEDE2000 (Sharma-checked), thresholds (trap ≥ 8 with name change, careful 4–8),
  limits ("a typical dichromat, not your eyes"; cosmetic only), AI-generated example person labelled.
