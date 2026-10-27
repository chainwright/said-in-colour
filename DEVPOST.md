# Devpost draft: Said in Colour (v0, 27.10). Track: eCommerce VTO. Entrant: Elite Product LLC.

## Inspiration
Ask a colour-blind man how he buys a shirt online and you'll hear the same workaround: he asks someone. A partner, a sister, a friend on the phone — because the photo doesn't settle it and the name on the label makes it worse. "Dusty rose", "sage", "stone", "olive". Those words mean nothing to him. About 1 in 12 men of Northern-European descent has red-green colour vision deficiency, roughly 8%; for women it's closer to 1 in 200 (National Eye Institute; Colour Blind Awareness). Deuteranomaly — green-weak — is the most common kind.

What trips him up isn't that the world looks grey. It doesn't. It's that certain colours quietly collapse into each other. A pink shirt and a khaki one can land on the same word in his head. So he buys the pink one thinking it's beige, it arrives, someone tells him, and it goes back. "Colour not as expected" is one of the named reasons clothes get returned, and returns are the tax the whole category pays.

Said in Colour is a fitting room built for that man. It puts the shirt on him, tells him in plain words what colour it actually is, and shows him the same photo twice — once through his eyes, once through everyone else's — so he can see for himself where the trap is.

## What it does
- **Try it on.** He uploads one photo from the chest up, and YouCam's AI Clothes puts the shirt on him. That render is the thing everyone else would see.
- **See it his way.** The same render, run through a published colour-blindness model, pixel by pixel. A steel loupe glides over the shirt: inside the lens is his view, outside is everyone's. He can drag it, or flip the whole picture — ONE: YOU, TWO: EVERYONE.
- **Read it in words.** We measure the shirt on the chest and name it twice: what everyone calls it, and what it reads as to him. "You see khaki. They see coral." Then a verdict — **TRAP**, **CAREFUL** or **SAFE** — and the colour difference as a number he can check.
- **Pick from the case.** A trial-lens case of twelve shirts, each already tagged by how it reads *to him*, not how it's sold. Dusty rose, lavender, coral and burgundy are traps for a green-weak eye; navy, grey and cobalt read the same to everyone. He sees the tags before he spends anything.
- **Set his own eyes.** Green-weak, red-weak or blue-yellow, with a strength slider. Every tag and every word on the page updates to match.

## How we used the YouCam API
| Step | Endpoint | What it gives us |
|---|---|---|
| Try-on | `POST /s2s/v2.0/task/cloth-v4` with `garment_category: upper_body`, then `GET …/task/cloth-v4/{id}` | The shirt on his own photo — 2 units a render |
| Plumbing | `POST /s2s/v2.0/file`, `GET /s2s/v1.0/client/credit` | Uploads, and a budget guard that pauses live calls under 150 units |

AI Clothes is the whole point of the demo, used against type. Most virtual try-ons exist to tell you that you look good. This one uses the exact same render to tell you the truth about a colour — twice, side by side. Everything after the render is arithmetic you can check, with no opinion from a model.

## How the reading works
Every number comes from our own code:
- **His view:** the Machado, Oliveira & Fernandes (2009) model, applied in linear RGB to every pixel of the render. It simulates a *typical* colour-blind eye — not his exactly — and the strength slider blends toward normal vision for the milder, more common forms.
- **The words:** we take the colour off a chest patch and find the nearest of 36 menswear colour names by CIEDE2000, once as everyone sees it and once through the simulation. We checked our CIEDE2000 against the published Sharma, Wu & Dalal reference pairs.
- **The verdict:** different names *and* a difference of 8 or more — **TRAP**. Between 4 and 8 — **CAREFUL**. Otherwise **SAFE**. The threshold is measured on the real catalogue, not guessed.

## Honesty, by design
- **It's a shopping aid, not a medical test.** We say so on the page. The simulation is a typical eye; his own vision may differ, and the milder settings are an approximation, labelled as one.
- **The maths is on the table.** The method panel shows the actual Machado matrix and names the formula. Nothing is hidden behind "AI".
- **Nothing is stored.** The photo goes to YouCam only to render the try-on. The key lives server-side in one function; the browser never sees it, and the function only ever asks for upper-body garments.
- **The example is labelled.** The demo man and the shirts are AI-generated. Every try-on shown is a real YouCam render, frozen once so judges can click through without spending credits — the live try-on on your own photo runs the real call.

## Challenges
- **Colour that drifts.** A render's colour shifts with light and fabric, so we read the shirt where it sits on the chest, take the median of a patch, and name it from that — not from the flat product swatch, which can land on a different word.
- **A UI for colour-blind eyes.** The audience is the one group we can't signal to with red and green. So every verdict carries a shape and a word as well as a colour — ▲ trap, ◆ careful, ✓ safe — and we checked the whole page under our own simulation.
- **Making the invisible obvious in five seconds.** The loupe and the whole-picture flip came out of that: a judge who never reads a word should still see one shirt, two colours, same face.

## What's next
- A real retailer catalogue, each product measured the same way, so the tags sit on live listings.
- Outfit check: two garments at once — do they clash for everyone else even when they look fine to him?
- Contrast against his own skin and hair, from a one-time Facial Color Tones reading, to move from "safe colour" to "good on you".

## Built with
YouCam API (AI Clothes, cloth-v4), JavaScript (ES modules), Netlify Functions, Machado et al. 2009 CVD model, CIEDE2000, Atkinson Hyperlegible (Google Fonts).
