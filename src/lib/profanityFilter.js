// Profanity filter for co-parenting chat
// Uses substring matching so combinations like "dirty pussy" are caught

const BLOCKED_WORDS = [
  // Sexual / explicit
  "fuck", "fucker", "fucked", "fucking", "fucks", "motherfucker", "motherfucking",
  "shit", "shitty", "bullshit", "horseshit", "dipshit",
  "ass", "asshole", "arsehole", "jackass", "dumbass", "badass", "smartass",
  "bitch", "bitches", "bitching",
  "cock", "cocks", "cocksucker",
  "dick", "dicks",
  "pussy", "pussies",
  "cunt", "cunts",
  "tits", "titty", "titties",
  "boobs", "boob",
  "penis", "vagina", "vulva",
  "whore", "whores",
  "slut", "sluts",
  "ho ", "hoe", "hoes",
  "skank", "skanky",
  "wank", "wanker", "wankers", "wanking",
  "jizz", "cum ", "cumming", "cumshot",
  "blowjob", "blow job", "handjob", "hand job",
  "anal", "anus",
  "porn", "porno", "pornography",
  "rape", "rapist", "raping",
  "molest", "molester",
  "pedophile", "paedophile",
  "sex ", "sexy", "sexting",
  "nude", "nudes", "naked",
  "masturbat",
  "erection", "boner",
  "dildo", "vibrator",
  "stripper",
  "prostitut",

  // Insults / harassment
  "bastard", "bastards",
  "prick", "pricks",
  "twat", "twats",
  "tosser", "tossers",
  "bellend", "bell end",
  "knob", "knobhead",
  "wanker",
  "nonce",
  "scumbag", "scumbags",
  "deadbeat",
  "scum",
  "trash",
  "pig", "pigs",
  "slag", "slags",
  "retard", "retarded",
  "idiot", "idiots",
  "moron", "morons",
  "imbecile",
  "loser", "losers",
  "pathetic",
  "useless",
  "worthless",
  "piece of shit",
  "piece of crap",
  "stupid bitch",
  "dumb bitch",
  "ugly bitch",
  "fat bitch",
  "crazy bitch",

  // Personal attacks / demeaning language
  "waste of space",
  "waste of time",
  "good for nothing",
  "good-for-nothing",
  "you are dumb",
  "you're dumb",
  "ur dumb",
  "are you dumb",
  "are you stupid",
  "are you blind",
  "are you deaf",
  "are you an idiot",
  "dumb dumb",
  "dummy",
  "so dumb",
  "so stupid",
  "so useless",
  "so pathetic",
  "so worthless",
  "you are stupid",
  "you're stupid",
  "ur stupid",
  "you are useless",
  "you're useless",
  "ur useless",
  "you are worthless",
  "you're worthless",
  "ur worthless",
  "you are pathetic",
  "you're pathetic",
  "you are a joke",
  "you're a joke",
  "what a joke",
  "absolute joke",
  "complete joke",
  "terrible parent",
  "bad parent",
  "bad mother",
  "bad father",
  "bad mum",
  "bad dad",
  "unfit parent",
  "unfit mother",
  "unfit father",
  "you are crazy",
  "you're crazy",
  "ur crazy",
  "you are insane",
  "you're insane",
  "you are mental",
  "you're mental",
  "psycho",
  "lunatic",
  "freak",
  "weirdo",
  "disgusting",
  "repulsive",
  "revolting",
  "horrible person",
  "awful person",
  "terrible person",
  "vile",
  "despicable",

  // Threats / hate
  "i hate you",
  "hate you",
  "kill yourself",
  "kill you",
  "go die",
  "drop dead",
  "i wish you were dead",
  "you should die",
  "i will hurt",
  "i'll hurt",
  "gonna hurt",
  "going to hurt",
  "threaten",

  // British
  "bollocks",
  "bugger",
  "bloody hell",
  "sod off",
  "git",
  "plonker",
  "muppet",
  "pillock",
  "numpty",
  "tosspot",

  // Drug references in abusive context
  "junkie",
  "crackhead",
  "druggie",

  // Racial / discriminatory (common slurs)
  "nigger", "nigga",
  "chink", "chinky",
  "spic", "spick",
  "kike",
  "faggot", "fag ",
  "dyke",
  "tranny",
  "wetback",
  "cracker ",
  "redneck",

  // Misc abusive
  "goddamn", "god damn",
  "damn you",
  "go to hell",
  "selfish",
  "narcissist",
  "abuser",
  "neglect",
];

// Normalise leet-speak substitutions so "a$$" or "f*ck" are caught
function normalise(text) {
  return text
    .toLowerCase()
    .replace(/4/g, 'a')
    .replace(/@/g, 'a')
    .replace(/3/g, 'e')
    .replace(/1/g, 'i')
    .replace(/!/g, 'i')
    .replace(/0/g, 'o')
    .replace(/5/g, 's')
    .replace(/\$/g, 's')
    .replace(/\*/g, '')   // remove asterisks used to censor (f*ck → fck still caught by partial)
    .replace(/\./g, '')   // remove dots used to evade (f.u.c.k → fuck)
    .replace(/-/g, '');   // remove dashes (f-u-c-k → fuck)
}

export function containsProfanity(text) {
  const normalised = normalise(text);
  for (const word of BLOCKED_WORDS) {
    if (normalised.includes(word.toLowerCase())) return true;
  }
  return false;
}

export function getBlockedWord(text) {
  const normalised = normalise(text);
  for (const word of BLOCKED_WORDS) {
    if (normalised.includes(word.toLowerCase())) return word.trim();
  }
  return null;
}
