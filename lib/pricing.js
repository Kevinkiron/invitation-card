/* ══════════════════════════════════════════════════════════════════════
   PRICING — every invitation and every greeting card is ₹100. Three
   features are add-ons at ₹25 each, locked until the sender unlocks
   them in the chat (components/AddonLock.js):

     music    background music (picking a track or uploading a song)
     colour   your own colours: the background gradient on invitations;
              paper colour, text colour and font on greeting cards
     photos   uploading your own photographs (without them the page uses
              its default photos, lib/design/default-photos.js)

   Unlocked add-ons are stored on the tokens as `addons: ["music", …]`
   and paid for together with the ₹100 when the page is published.

   A page published before this existed has no `addons` list at all and
   keeps every feature it already had — hasAddon() returns true for it.
   Pages made from now on always carry the list, even when it is empty.
   ══════════════════════════════════════════════════════════════════════ */

export const BASE_PRICE = 100;
export const ADDON_PRICE = 25;

export const ADDONS = {
  music:  { label: "Background music", blurb: "Pick a track or upload your own song." },
  colour: { label: "Your own colours", blurb: "Choose the background, text colour and font." },
  photos: { label: "Your own photos",  blurb: "Upload your own photographs instead of ours." },
};

export function addonsOf(tokens) {
  return Array.isArray(tokens?.addons) ? tokens.addons.filter((a) => a in ADDONS) : null;
}

export function hasAddon(tokens, id) {
  const list = addonsOf(tokens);
  return list === null ? true : list.includes(id);
}

export function priceOf(tokens) {
  return BASE_PRICE + ADDON_PRICE * (addonsOf(tokens) || []).length;
}

/* The `plan` text stored on the payment row, e.g. "BASE+music+photos". */
export function planLabel(tokens) {
  return ["BASE", ...(addonsOf(tokens) || [])].join("+");
}
