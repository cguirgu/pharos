/**
 * The Faith curriculum, in order. Nine units, each unsealing one clause of the
 * Creed (see `../creed.ts`).
 *
 * The arc is deliberate: history first, so that when Unit IV reaches Chalcedon
 * the learner already knows why Alexandria would not move; doctrine after,
 * because the councils are what the doctrine is defending; and the open
 * questions last, once there is enough ground to tell an undefined question
 * from an unimportant one.
 */
import type { FaithUnit } from '../types';
import { ORIGINS } from './origins';
import { MARTYRS } from './martyrs';
import { COUNCILS } from './councils';
import { CHALCEDON } from './chalcedon';
import { DOCTRINE } from './doctrine';
import { WORSHIP } from './worship';
import { FATHERS } from './fathers';
import { TODAY } from './today';
import { MYSTERY } from './mystery';

export const UNITS: readonly FaithUnit[] = [
  ORIGINS,
  MARTYRS,
  COUNCILS,
  CHALCEDON,
  DOCTRINE,
  WORSHIP,
  FATHERS,
  TODAY,
  MYSTERY,
];

/** Every lesson, flattened in course order. */
export const LESSONS = UNITS.flatMap((u) => u.lessons);

export function unitById(id: string): FaithUnit | undefined {
  return UNITS.find((u) => u.id === id);
}

export function lessonById(id: string) {
  return LESSONS.find((l) => l.id === id);
}

/** The unit a lesson belongs to. */
export function unitForLesson(lessonId: string): FaithUnit | undefined {
  return UNITS.find((u) => u.lessons.some((l) => l.id === lessonId));
}
