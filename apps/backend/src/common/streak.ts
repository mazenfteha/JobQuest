export interface StreakUpdate {
  currentStreak: number;
  longestStreak: number;
  lastActivityDate: Date;
}

function dayKey(date: Date): string {
  return date.toISOString().slice(0, 10);
}

export function updateStreak(
  currentStreak: number,
  longestStreak: number,
  lastActivityDate: Date | null,
  now: Date = new Date(),
): StreakUpdate {
  const today = dayKey(now);
  const yesterday = new Date(now);
  yesterday.setUTCDate(yesterday.getUTCDate() - 1);
  const yesterdayKey = dayKey(yesterday);

  let next = currentStreak;
  if (lastActivityDate === null) {
    next = 1;
  } else if (dayKey(lastActivityDate) !== today) {
    next = dayKey(lastActivityDate) === yesterdayKey ? currentStreak + 1 : 1;
  }

  return {
    currentStreak: next,
    longestStreak: Math.max(longestStreak, next),
    lastActivityDate: now,
  };
}
