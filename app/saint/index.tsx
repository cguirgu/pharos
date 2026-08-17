/**
 * `/saint` — a stable deep link to today's commemoration, so callers (the Today
 * card, a notification tap) need not compute a date key. The day screen itself
 * is `[date].tsx`.
 */
import React from 'react';
import { Redirect } from 'expo-router';
import { useClock } from '../../src/state/clock';
import { dateKey } from '../../src/domain/rule';

export default function SaintIndex() {
  const today = useClock((s) => s.today);
  return <Redirect href={`/saint/${dateKey(today)}`} />;
}
