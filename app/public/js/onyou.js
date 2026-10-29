// "Good on you": how the shirt sits against the person's skin and hair.
// Skin comes from YouCam's Facial Color Tones as a measured colour, so we compare against it.
// Hair comes back as a palette category (a grey-haired man and a dark-haired man both got "Auburn"),
// so we never treat it as the person's hair. Only a hair colour the person picks gives a hair verdict.
import { deltaE2000, hexToRgb, rgbToLab } from "./colour.js";

// Typical hair colours for the picker. The person's choice always wins over the API's category.
export const HAIR = {
  dark: "#2b2420", brown: "#6b4a32", blond: "#c9a46a",
  red: "#9a4a28", grey: "#9c9a96", white: "#e4e2dc",
};

export function contrastWord(dE) {
  return dE < 12 ? "close to it (can wash you out)" : dE < 25 ? "a gentle contrast" : "stands out";
}

// Returns { skin, hair, palette }:
//   skin    — contrast word against the measured skin colour, or null
//   hair    — { pick, word } only when the person picked a hair colour, otherwise null
//   palette — YouCam's hair category name (shown as a label, never used for a verdict), or null
export function goodOnYou(shirtRgb, tones, hairPick) {
  const c = (tones && tones.color) || {};
  const shirt = rgbToLab(shirtRgb);
  const vs = (hex) => contrastWord(deltaE2000(shirt, rgbToLab(hexToRgb(hex))));
  return {
    skin: c.skin_color ? vs(c.skin_color) : null,
    hair: HAIR[hairPick] ? { pick: hairPick, word: vs(HAIR[hairPick]) } : null,
    palette: c.hair_color_name || null,
  };
}
