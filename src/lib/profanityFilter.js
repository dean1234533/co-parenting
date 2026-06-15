// Comprehensive profanity filter for co-parenting chat
const BLOCKED_WORDS = [
  "fuck", "shit", "ass", "damn", "bitch", "bastard", "dick", "cock",
  "piss", "crap", "bollocks", "wanker", "tosser", "twat", "prick",
  "arsehole", "asshole", "bullshit", "horseshit", "cunt", "motherfucker",
  "fucker", "fucking", "shitty", "dumbass", "jackass", "dipshit",
  "goddamn", "hell", "bloody", "bugger", "sod", "slag", "whore",
  "slut", "retard", "idiot", "moron", "stupid", "dumb", "loser",
  "pathetic", "useless", "worthless", "hate you", "scum", "pig",
  "cow", "git", "plonker", "muppet", "pillock", "numpty", "bellend",
  "knob", "nonce", "scumbag", "deadbeat", "selfish"
];

export function containsProfanity(text) {
  const lower = text.toLowerCase();
  for (const word of BLOCKED_WORDS) {
    // Match whole word or word with common suffixes
    const regex = new RegExp(`\\b${word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}(s|ed|ing|er|est)?\\b`, 'i');
    if (regex.test(lower)) {
      return true;
    }
  }
  return false;
}

export function getBlockedWord(text) {
  const lower = text.toLowerCase();
  for (const word of BLOCKED_WORDS) {
    const regex = new RegExp(`\\b${word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}(s|ed|ing|er|est)?\\b`, 'i');
    if (regex.test(lower)) {
      return word;
    }
  }
  return null;
}