/* ══════════════════════════════════════════════════════════════════════
   A SECOND OPINION ON THE MODEL'S ANSWER

   The wedding interview never has this problem: it doesn't ask a model
   to read an answer at all, so a bad date or a junk name simply cannot
   parse (see wedding-script.js). Celebration Cinema's interview is the
   model itself deciding what a date or a name is, turn after turn — and
   a model that's told never to invent facts can still occasionally
   accept a garbled one it was only supposed to relay: "June 31st",
   "asdf" as an honouree's name, a deadline three years in the past.

   This is the backstop, not the first line of defence — the prompt
   already asks the model to push back on nonsense itself (see rule 11
   in celebration-prompt.js). This just catches what slips through,
   using the exact same date grammar and junk-detector the wedding
   interview already relies on, so both templates hold data to one
   standard rather than two.

   validateCelebrationPatch() never throws and never blocks a turn: a
   field that fails validation is simply dropped from the patch (so nothing
   bad gets written), and the caller is told what to ask instead. Every
   OTHER field in the same turn's patch — the venue named in the same
   breath as a garbled date — still goes through untouched.
   ══════════════════════════════════════════════════════════════════════ */

import { parseDate, isJunk } from "./wedding-script";

const has = (v) => typeof v === "string" && v.trim().length > 0;

/* Deep-clone just enough to safely delete keys without mutating the
   model's own response object (route.js still reads `patch.done` etc.
   off the original after this runs). */
function clonePatch(patch) {
  return JSON.parse(JSON.stringify(patch || {}));
}

export function validateCelebrationPatch(patch) {
  const out = clonePatch(patch);
  let correction = null;

  const flag = (field, message) => {
    if (!correction) correction = { field, message };
  };

  /* The event's own date. A patch this vague or malformed as a date is
     worse than no date at all — it would print wrong on the invitation
     and nobody would notice until a guest asked about it. */
  if (has(out.invitation?.displayDate) && !parseDate(out.invitation.displayDate)) {
    delete out.invitation.displayDate;
    delete out.invitation.countdownAt;
    flag("datetime", "That date didn't quite come through clearly — could you give me a specific day, like “14 March 2027”?");
  }

  /* The RSVP deadline is the other free-text date field in this schema. */
  if (has(out.rsvp?.deadline) && !parseDate(out.rsvp.deadline)) {
    delete out.rsvp.deadline;
    flag("date", "Could you give me the RSVP deadline as a specific date, like “1 March 2027”?");
  }

  /* The honouree's name and the venue's name are the two fields most
     likely to end up printed verbatim, largest, on the page — the same
     two the wedding script is strictest about. */
  if (has(out.host?.name) && isJunk(out.host.name)) {
    delete out.host.name;
    flag("text", "I didn't quite catch a name there — who is this celebration for?");
  }
  if (has(out.venue?.name) && isJunk(out.venue.name)) {
    delete out.venue.name;
    flag("text", "Could you tell me the venue's name again?");
  }

  return { patch: out, correction };
}
