export function xpRequiredForLevel(level: number): number {
  if (level <= 1) return 0;
  return 50 * ((level * (level + 1)) / 2 - 1);
}

export function levelForXp(xp: number): number {
  let level = 1;
  while (xp >= xpRequiredForLevel(level + 1)) {
    level += 1;
  }
  return level;
}
