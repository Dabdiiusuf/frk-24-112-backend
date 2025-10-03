// utils/pirateNames.js
const FIRST = [
  "Captain",
  "Mad",
  "Old",
  "One-Eyed",
  "Pegleg",
  "Dirty",
  "Salty",
  "Barnacle",
  "Sir",
  "Lady",
  "Dread",
  "Fearsome",
  "Jolly",
  "Rum-Soaked",
  "Soggy",
  "Smelly",
  "Greedy",
  "Wobbly",
  "Cursed",
];

const LAST = [
  "Steelfoot",
  "Short-Limb",
  "Crooked Nose",
  "Toothless",
  "Beard-o’-Doom",
  "Iron Hook",
  "Squid Breath",
  "Ragged Beard",
  "Clam Smasher",
  "Fishguts",
  "Sharkbait",
  "Parrot Breath",
  "Crusty Toe",
  "Sea Belly",
  "Grog Guzzler",
  "Storm Pants",
  "Soggy Boot",
  "Barnacle Butt",
  "Long Tongue",
  "Cannon Ear",
];

// Optional tiny RNG so you can pass a seed for repeatable names
function rng(seed) {
  let s = seed ?? Math.floor(Math.random() * 2 ** 31);
  return () => (s = (s * 1664525 + 1013904223) % 2 ** 32) / 2 ** 32;
}

export function generatePirateName(seed) {
  const r = rng(seed);
  const f = FIRST[Math.floor(r() * FIRST.length)];
  const l = LAST[Math.floor(r() * LAST.length)];
  return `${f} ${l}`;
}
