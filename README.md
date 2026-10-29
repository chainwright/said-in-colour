# Said in Colour

**A fitting room that tells a colour-blind shopper what colour the shirt really is.**

Live: https://said-in-colour.netlify.app (the example shirts open instantly; your own photo runs a live try-on)

About 1 in 12 men of Northern-European descent have red-green colour vision deficiency. A shirt sold as "dusty rose" can look light grey to them, and they only find out when someone asks why they bought pink. Said in Colour puts the shirt on your own photo and then says it plainly: "You see light grey. They see pink." Under that sits a verdict, **TRAP**, **CAREFUL** or **SAFE**, with the colour difference as a number.

- **The loupe and the flip.** A loupe on the shirt shows your view inside the lens and everyone else's outside. Or flip the whole photo between ONE: YOU and TWO: EVERYONE.
- **The case.** Twelve shirts tagged by how they read to *you*, not by how they are sold.
- **Your eyes.** Green-weak, red-weak or blue-yellow, with a strength slider. Every tag follows it.
- **Good on you.** Skin tone from YouCam, and the same colour maths says whether the shirt stands out against it or washes you out.

## YouCam APIs used

| What | Endpoint | Why |
|---|---|---|
| AI Clothes | `POST /s2s/v2.0/task/cloth-v4` with `garment_category: upper_body` | Puts the shirt on your photo; we find the shirt on you from the pixels the try-on changed |
| Facial Color Tones | `POST /s2s/v2.0/task/skin-tone-analysis` | Skin colour for the "good on you" line; the hair palette category is shown as a label only |
| Files and balance | `POST /s2s/v2.0/file`, `GET /s2s/v1.0/client/credit` | Uploads, and a reserve of units the live demo won't spend |

Everything else is our own code: the Machado, Oliveira & Fernandes (2009) colour vision model in linear RGB (the paper's own matrix for each 0.1 step of strength), 36 menswear colour names matched by CIEDE2000, and the trap/careful/safe rule (different names and a difference of 8 or more is a trap, 4 to 8 is careful).

## Run it

```bash
cd app
npm install                 # esbuild, for the function bundle
npm test                    # 17 tests: colour maths, CVD model, contrast check, API function
python3 build.py            # copies the tested core into public/js and builds the catalogue
NETLIFY_TOKEN=... YOUCAM_API_KEY=... python3 scripts/deploy.py --yes --env
```

`app/public/` is the static page (plain ES modules). `app/netlify/functions/api.js` is the only server code: it holds the YouCam key, answers only the site's own page, and limits each visitor per hour with a daily ceiling. `app/src/` holds the tested modules the browser also loads.

## Honesty

- It's a shopping aid, not an eye test. It simulates a typical colour-blind eye; yours may differ.
- Your photo goes to YouCam for the try-on and the tone reading. We keep none of it.
- **The man in the example and the twelve shirts are AI-generated.** Every render of him on the page is a real YouCam result, saved once so the example opens instantly without spending units.

## Built for

The YouCam API Skin AI & eCommerce VTO Hackathon (Devpost), 2026.

MIT License · © 2026 Elite Product LLC
