/**
 * Coptic liturgical calendar engine — public surface.
 *
 * Pure TypeScript. No react/react-native/expo imports (CLAUDE.md §1).
 * Answers, for any Gregorian date: the Coptic date, Orthodox Pascha, the
 * season/fast in effect, the feast of the day, and the fasting ruling.
 */
export * from './types';
export { getDayInfo, isFastDay } from './calendar';
export { orthodoxPascha } from './pascha';
export {
  toCoptic,
  fromCoptic,
  isCopticLeapYear,
  copticMonthLength,
  COPTIC_MONTHS,
} from './copticDate';
export { seasonOn, isParamon } from './seasons';
export { feastsOn, primaryFeast, isMajorLordFeast } from './feasts';
export { fastingOn } from './fasting';
export {
  gregorianToJDN,
  jdnToGregorian,
  weekday,
  addDays,
  diffDays,
  sameDay,
  inRange,
} from './julian';
export { today, setTodayProvider, setFixedToday, resetTodayProvider } from './clock';
