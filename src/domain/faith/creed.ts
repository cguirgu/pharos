/**
 * The Creed seal — the Faith course's signature reward.
 *
 * Each of the nine units, when completed, unseals one clause of the Nicene
 * Creed on the Faith home screen. By the end of the course the learner has
 * assembled the whole confession, in order, having earned each line by learning
 * what stands behind it — Unit III unseals the Son because Unit III is Nicaea;
 * Unit IV unseals the Incarnation because Unit IV is Chalcedon.
 *
 * ⚠️ TEXT: what is stored here is a short CLAUSE NAME and a plain-English
 * `gist` written for this app — deliberately NOT a reproduction of any
 * published liturgical translation, which would be a licensing question (see
 * docs/CONTENT-SOURCES.md, "Agpeya"). If the owner supplies the house English
 * text of the Creed, add it as a `text` field here and render it in place of
 * `gist`; nothing else needs to change.
 */
import { UNITS } from './units';

/**
 * The Creed screen shows content, so it cites like every other card does.
 * These ids are counted by the orphan check in `__tests__/faith/sources.test.ts`.
 */
export const CREED_SOURCES: readonly string[] = ['lacopts-creed', 'suscopts-creed-facts'];

export interface CreedClause {
  readonly id: string;
  /** 1-based position in the Creed. */
  readonly order: number;
  /** Short name of the clause — what it confesses. */
  readonly title: string;
  /** Plain-English description, written for this app. Not a liturgical text. */
  readonly gist: string;
  /** Which council fixed or completed this clause, for the shoulder note. */
  readonly council: string;
}

export const CREED_CLAUSES: readonly CreedClause[] = [
  {
    id: 'father',
    order: 1,
    title: 'One God, the Father, the Pantocrator',
    gist: 'One God — the Father, who holds all things, and who made heaven and earth.',
    council: 'Nicaea, 325',
  },
  {
    id: 'unseen',
    order: 2,
    title: 'Of all things seen and unseen',
    gist: 'Everything that is, visible and invisible alike, is His making.',
    council: 'Nicaea, 325',
  },
  {
    id: 'son',
    order: 3,
    title: 'One Lord Jesus Christ, of one essence with the Father',
    gist: 'The only-begotten Son, begotten of the Father before all ages — Light of Light, true God of true God; begotten, not made, and of one essence with the Father.',
    council: 'Nicaea, 325',
  },
  {
    id: 'incarnate',
    order: 4,
    title: 'Came down and was incarnate',
    gist: 'For us and for our salvation He came down from heaven, and was incarnate of the Holy Spirit and of the Virgin Mary, and became man.',
    council: 'Nicaea 325 · Ephesus 431',
  },
  {
    id: 'crucified',
    order: 5,
    title: 'Crucified, suffered, buried, and risen',
    gist: 'He was crucified for us under Pontius Pilate, suffered, and was buried; and on the third day He rose, as the scriptures said.',
    council: 'Nicaea, 325',
  },
  {
    id: 'ascended',
    order: 6,
    title: 'Ascended, and seated at the right hand',
    gist: 'He ascended into the heavens, and is seated at the right hand of the Father.',
    council: 'Nicaea, 325',
  },
  {
    id: 'coming',
    order: 7,
    title: 'He is coming again in glory',
    gist: 'He will come again in His glory to judge the living and the dead — and of His kingdom there is no end.',
    council: 'Nicaea 325 · Constantinople 381',
  },
  {
    id: 'spirit',
    order: 8,
    title: 'The Holy Spirit, the Lord, the Giver of Life',
    gist: 'The Holy Spirit — the Lord, the Giver of Life, who proceeds from the Father, and who spoke through the prophets.',
    council: 'Constantinople, 381',
  },
  {
    id: 'resurrection',
    order: 9,
    title: 'One baptism, and the life of the age to come',
    gist: 'One holy, catholic and apostolic Church; one baptism for the remission of sins; and we look for the resurrection of the dead and the life of the age to come.',
    council: 'Constantinople, 381',
  },
];

export function clauseById(id: string): CreedClause | undefined {
  return CREED_CLAUSES.find((c) => c.id === id);
}

/** The clause a unit unseals, or undefined if the unit names an unknown id. */
export function clauseForUnit(unitId: string): CreedClause | undefined {
  const unit = UNITS.find((u) => u.id === unitId);
  return unit ? clauseById(unit.creedClauseId) : undefined;
}

/**
 * The Creed as it currently stands for this learner: every clause, in order,
 * each marked sealed or unsealed. A clause is unsealed once EVERY lesson of the
 * unit that carries it has been passed.
 */
export interface SealedClause extends CreedClause {
  readonly unsealed: boolean;
  /** The unit that unseals it — shown on a sealed clause as the way in. */
  readonly unitId: string;
  readonly unitTitle: string;
}

export function creedSeal(passed: ReadonlySet<string>): SealedClause[] {
  const out: SealedClause[] = [];
  for (const clause of CREED_CLAUSES) {
    const unit = UNITS.find((u) => u.creedClauseId === clause.id);
    if (!unit) continue;
    const lessonIds = unit.lessons.map((l) => l.id);
    out.push({
      ...clause,
      unitId: unit.id,
      unitTitle: unit.title,
      unsealed: lessonIds.length > 0 && lessonIds.every((id) => passed.has(id)),
    });
  }
  return out;
}

/** How many clauses stand unsealed (the progress numerator). */
export function unsealedCount(passed: ReadonlySet<string>): number {
  return creedSeal(passed).filter((c) => c.unsealed).length;
}

/** Clauses unsealed by passing `lessonId` — for the celebration on the result card. */
export function clausesUnsealedBy(lessonId: string, passedAfter: ReadonlySet<string>): SealedClause[] {
  const before = new Set(passedAfter);
  before.delete(lessonId);
  const prior = new Set(creedSeal(before).filter((c) => c.unsealed).map((c) => c.id));
  return creedSeal(passedAfter).filter((c) => c.unsealed && !prior.has(c.id));
}
