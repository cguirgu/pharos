/**
 * Ordering, filtering and search over questions and answers.
 *
 * Every comparator is TOTAL — it falls through to `id` — so a list never
 * reshuffles between renders when two posts tie. Search mirrors
 * src/domain/highlights/search.ts (and reuses its `normalizeText`) so the two
 * search boxes in the app behave identically.
 *
 * Pure TypeScript — no react/react-native/expo imports, no `new Date()`.
 */
import { normalizeText } from '../highlights/search';
import type { CitationSource } from '../citation';
import { isPubliclyVisible, isVisibleTo } from './moderation';
import type { ThreadNode } from './thread';
import type { Question, QuestionTopic } from './types';

// --- answers --------------------------------------------------------------

export type AnswerRanking = 'top' | 'newest' | 'oldest';

const byId = (a: ThreadNode, b: ThreadNode): number => (a.answer.id < b.answer.id ? -1 : a.answer.id > b.answer.id ? 1 : 0);

/**
 * `top` = most affirmed first, ties broken by the EARLIEST answer (the one that
 * has been serving longest wins), then by id for total determinism.
 */
export function rankAnswers(nodes: readonly ThreadNode[], ranking: AnswerRanking): ThreadNode[] {
  const out = nodes.slice();
  if (ranking === 'newest') {
    out.sort((a, b) => b.answer.createdAt - a.answer.createdAt || byId(a, b));
  } else if (ranking === 'oldest') {
    out.sort((a, b) => a.answer.createdAt - b.answer.createdAt || byId(a, b));
  } else {
    out.sort(
      (a, b) =>
        b.answer.affirmations - a.answer.affirmations ||
        a.answer.createdAt - b.answer.createdAt ||
        byId(a, b),
    );
  }
  return out;
}

// --- questions ------------------------------------------------------------

export type FeedSort = 'recent' | 'unanswered' | 'top';

export interface QuestionFilter {
  readonly topic?: QuestionTopic;
  readonly citationSource?: CitationSource;
  readonly authorAccountId?: string;
  readonly unansweredOnly?: boolean;
  readonly answeredOnly?: boolean;
  /** Who is looking — decides whether their own flagged/hidden posts show. */
  readonly viewerAccountId?: string | null;
}

function passes(q: Question, f?: QuestionFilter): boolean {
  const viewer = f?.viewerAccountId ?? null;
  if (!isVisibleTo(q.moderation, q.author.accountId, viewer)) return false;
  if (f?.topic && !q.topics.includes(f.topic)) return false;
  if (f?.citationSource && q.citation?.anchor.source !== f.citationSource) return false;
  if (f?.authorAccountId && q.author.accountId !== f.authorAccountId) return false;
  if (f?.unansweredOnly && q.answerCount > 0) return false;
  if (f?.answeredOnly && q.answerCount === 0) return false;
  return true;
}

export function filterQuestions(questions: readonly Question[], f?: QuestionFilter): Question[] {
  return questions.filter((q) => passes(q, f));
}

export function sortQuestions(questions: readonly Question[], sort: FeedSort): Question[] {
  const out = questions.slice();
  const tie = (a: Question, b: Question): number => (a.id < b.id ? -1 : a.id > b.id ? 1 : 0);
  if (sort === 'top') {
    out.sort((a, b) => b.affirmations - a.affirmations || b.createdAt - a.createdAt || tie(a, b));
  } else if (sort === 'unanswered') {
    // Fewest answers first, then the longest-waiting question.
    out.sort((a, b) => a.answerCount - b.answerCount || a.createdAt - b.createdAt || tie(a, b));
  } else {
    out.sort((a, b) => b.createdAt - a.createdAt || tie(a, b));
  }
  return out;
}

// --- search ---------------------------------------------------------------

export type QuestionField = 'title' | 'reference' | 'body';

const WEIGHT: Record<QuestionField, number> = { title: 3, reference: 2, body: 1 };

export interface QuestionSearchHit {
  readonly question: Question;
  readonly score: number;
  readonly field: QuestionField;
}

function escapeRegExp(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function scoreTerm(term: string, text: string, weight: number): number {
  if (!text) return 0;
  const idx = text.indexOf(term);
  if (idx < 0) return 0;
  const boundary = new RegExp(`\\b${escapeRegExp(term)}`).test(text);
  return weight * (boundary ? 2 : 1);
}

/** Ranked, diacritic-insensitive, AND across terms — as Saved's search is. */
export function searchQuestions(
  questions: readonly Question[],
  query: string,
  f?: QuestionFilter,
): QuestionSearchHit[] {
  const pool = filterQuestions(questions, f);
  const terms = normalizeText(query).split(/\s+/).filter(Boolean);
  if (terms.length === 0) return pool.map((question) => ({ question, score: 0, field: 'title' as const }));

  const hits: QuestionSearchHit[] = [];
  for (const question of pool) {
    const fields: Record<QuestionField, string> = {
      title: normalizeText(question.title),
      reference: normalizeText(question.citation?.referenceLabel ?? ''),
      body: normalizeText(question.body),
    };

    let total = 0;
    let best: QuestionField = 'title';
    let bestScore = -1;
    let matchedEvery = true;

    for (const term of terms) {
      let termScore = 0;
      for (const field of ['title', 'reference', 'body'] as QuestionField[]) {
        const s = scoreTerm(term, fields[field], WEIGHT[field]);
        if (s > 0 && s > bestScore) {
          bestScore = s;
          best = field;
        }
        termScore += s;
      }
      if (termScore === 0) {
        matchedEvery = false;
        break;
      }
      total += termScore;
    }

    if (matchedEvery) hits.push({ question, score: total, field: best });
  }

  hits.sort((a, b) => b.score - a.score || b.question.createdAt - a.question.createdAt);
  return hits;
}

/** Questions still awaiting their first answer — the feed's default invitation. */
export function unansweredQuestions(questions: readonly Question[]): Question[] {
  return questions.filter((q) => q.answerCount === 0 && isPubliclyVisible(q.moderation));
}
