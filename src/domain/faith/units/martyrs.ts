/**
 * Unit II — The Church of the Martyrs.
 *
 * Why a Church would date its own calendar from the year its worst persecutor
 * took the throne, and what that decision still means. Ends in the present: the
 * twenty-one of Libya, entered in the Synaxarium within a week of their death.
 *
 * The calendar facts here are the same ones implemented and tested in
 * `src/domain/coptic/copticDate.ts` (1 Thout 1 AM = 29 Aug 284, Julian).
 */
import type { FaithUnit } from '../types';

export const MARTYRS: FaithUnit = {
  id: 'martyrs',
  numeral: 'II',
  title: 'The Church of the Martyrs',
  subtitle: 'A calendar that counts from a catastrophe, and never stopped counting.',
  glyph: 'Ⲧ',
  essentials: [
    'Explain why the Coptic calendar begins at a catastrophe, and what that choice says about the Church.',
    'Say how the Church keeps the martyrs present — not as history, but as the shape of every year.',
    'Recognise that the record of martyrs is still open in our own lifetime.',
  ],
  creedClauseId: 'unseen',
  lessons: [
    {
      id: 'martyrs-1',
      unitId: 'martyrs',
      title: 'The Era of the Martyrs',
      cards: [
        {
          id: 'martyrs-1-c1',
          heading: 'Year one is the worst year',
          body:
            'Most calendars begin at something good — a founding, a birth, a victory. The Coptic calendar begins in 284 AD, the year Diocletian became emperor and ordered the fiercest persecution the Christians had known. The Church calls it the Era of the Martyrs — *Anno Martyrum*, AM. Rather than forget the year that nearly ended it, the Church made it the year everything is counted from.',
          pull: 'AM 1 = 284 AD, the accession of Diocletian.',
          glyph: 'Ⲧ',
          sources: ['copticchurch-calendar', 'st-takla-coptic-calendar'],
          reviewed: true,
        },
        {
          id: 'martyrs-1-c2',
          heading: 'Nayrouz — where the year turns',
          body:
            'The Coptic year opens on the first of Thout, which falls on or about 11 September. The feast is called Nayrouz, and its colour is red: the vestments, the readings, and the hymns all turn toward the martyrs. The new year in this Church is not a fresh page. It is a remembrance.',
          pull: '1 Thout ≈ 11 September — the Feast of Nayrouz.',
          sources: ['copticchurch-calendar', 'st-takla-coptic-calendar'],
          reviewed: true,
        },
      ],
      questions: [
        {
          id: 'martyrs-1-q1',
          kind: 'choice',
          tier: 'core',
          prompt: 'Most calendars count from something good. The Coptic calendar counts from the accession of Diocletian — the emperor who persecuted it hardest. What does that choice say?',
          answer: 'That the Church refuses to forget the year that nearly ended it, and measures everything from it',
          options: [
            'That the Church refuses to forget the year that nearly ended it, and measures everything from it',
            'That the Church had no calendar of its own before 284',
            'That Diocletian was later honoured by the Church',
            'That the persecution ended in that year',
          ],
          explain:
            'Year one is the worst year. The Church calls it the Era of the Martyrs — *Anno Martyrum* — and rather than bury the memory it made it the thing every other date is counted from. This is the single most revealing fact about how the Coptic Church holds its own history.',
          sources: ['copticchurch-calendar'],
          reviewed: true,
        },
        {
          id: 'martyrs-1-q2',
          kind: 'choice',
          tier: 'support',
          prompt: 'What is the first month of the Coptic year called, and roughly when does it begin?',
          answer: 'Thout, around 11 September',
          options: [
            'Thout, around 11 September',
            'Kiahk, around 10 December',
            'Amshir, around 8 February',
            'Bashans, around 9 May',
          ],
          explain:
            'The Feast of Nayrouz falls on 1 Thout — on or about 11 September in the civil calendar.',
          sources: ['copticchurch-calendar', 'st-takla-coptic-calendar'],
          reviewed: true,
        },
        {
          id: 'martyrs-1-q3',
          kind: 'truefalse',
          tier: 'support',
          prompt: 'The abbreviation AM after a Coptic year stands for Anno Martyrum — the Year of the Martyrs.',
          answer: 'True',
          options: [],
          explain:
            'Anno Martyrum. So a Coptic date written 1742 AM means the 1742nd year since Diocletian took the throne.',
          sources: ['copticchurch-calendar'],
          reviewed: true,
        },
      ],
    },
    {
      id: 'martyrs-2',
      unitId: 'martyrs',
      title: 'Martyrdom as a Way of Reading',
      cards: [
        {
          id: 'martyrs-2-c1',
          heading: 'The Synaxarium is the shape of the year',
          body:
            'Every day of the Coptic year carries the memory of particular saints, read aloud in the liturgy from the Synaxarium. Because the calendar is the Era of the Martyrs, the book of the days is largely a book of the killed. To pray the Coptic year is to be told, every morning, the name of someone who did not recant.',
          sources: ['copticchurch-calendar', 'copticorthodox-history'],
          reviewed: true,
        },
        {
          id: 'martyrs-2-c2',
          heading: 'Why this shapes doctrine, not just memory',
          body:
            'A Church formed under persecution asks different questions. It is slow to soften what it confesses, because it has watched people die rather than adjust a word. This is worth holding on to when Unit IV reaches Chalcedon: the Alexandrian refusal to accept a new formula was not stubbornness about vocabulary. It came from a community for whom a formula had already cost lives.',
          sources: ['copticorthodox-history', 'copticorthodox-dioscorus'],
          reviewed: true,
        },
      ],
      questions: [
        {
          id: 'martyrs-2-q1',
          kind: 'choice',
          tier: 'core',
          prompt: 'The Synaxarium is:',
          answer: 'The Church’s book of the saints, read day by day through the year',
          options: [
            'The Church’s book of the saints, read day by day through the year',
            'The book of the seven prayer hours',
            'The Coptic translation of the Psalms',
            'The rite for consecrating a bishop',
          ],
          explain:
            'It is arranged by Coptic month and day, and a portion is read in the liturgy each day — which is why the year itself teaches the martyrs.',
          sources: ['copticchurch-calendar'],
          reviewed: true,
        },
        {
          id: 'martyrs-2-q2',
          kind: 'choice',
          tier: 'core',
          prompt: 'How does a history of persecution shape the way this Church holds its doctrine?',
          answer: 'It makes the Church slow to soften what it confesses, having seen people die rather than adjust it',
          options: [
            'It makes the Church slow to soften what it confesses, having seen people die rather than adjust it',
            'It makes the Church avoid defining doctrine at all',
            'It makes the Church defer to the decisions of other patriarchates',
            'It makes the Church keep its teachings secret',
          ],
          explain:
            'Hold this when Unit IV reaches Chalcedon. The Alexandrian refusal to accept a new formula was not stubbornness about vocabulary — it came from a community for whom a formula had already cost lives.',
          sources: ['copticorthodox-history', 'copticorthodox-dioscorus'],
          reviewed: true,
        },
      ],
    },
    {
      id: 'martyrs-3',
      unitId: 'martyrs',
      title: 'The Twenty-One',
      cards: [
        {
          id: 'martyrs-3-c1',
          heading: 'Not only ancient history',
          body:
            'In February 2015, twenty-one Christian workers held in Sirte, Libya, were killed for refusing to deny Christ. Twenty were Egyptian Copts. The twenty-first, Matthew Ayariga, was Ghanaian — and by the account that has come down, he was not one of the group but chose to stand with them.',
          pull: 'Twenty Egyptians and one Ghanaian who would not be separated from them.',
          glyph: '☩',
          sources: ['lacopts-libya-martyrs'],
          reviewed: true,
        },
        {
          id: 'martyrs-3-c2',
          heading: 'Entered in the Synaxarium within the week',
          body:
            'On 21 February 2015 — a week after their deaths became known — Pope Tawadros II declared them martyrs and their names were entered into the Synaxarium, commemorated on 8 Amshir. The book of the martyrs is not closed. It is a living record, and the Church added to it in our lifetime.',
          pull: 'Commemorated 8 Amshir · declared 21 February 2015.',
          sources: ['lacopts-libya-martyrs'],
          reviewed: true,
        },
      ],
      questions: [
        {
          id: 'martyrs-3-q1',
          kind: 'choice',
          tier: 'core',
          prompt: 'What was distinctive about the twenty-first martyr of Libya?',
          answer: 'He was Ghanaian, and chose to stand with the Copts',
          options: [
            'He was Ghanaian, and chose to stand with the Copts',
            'He was a bishop',
            'He was the only one to survive',
            'He was a monk of St. Anthony’s',
          ],
          explain:
            'Matthew Ayariga was not Egyptian and, by the received account, was not among those originally taken — he refused to be separated from them.',
          sources: ['lacopts-libya-martyrs'],
          reviewed: true,
        },
        {
          id: 'martyrs-3-q2',
          kind: 'truefalse',
          tier: 'core',
          prompt: 'The Coptic Synaxarium is closed — no new saints have been added in modern times.',
          answer: 'False',
          options: [],
          explain:
            'The twenty-one martyrs of Libya were added in 2015, commemorated on 8 Amshir. The record is still being written.',
          sources: ['lacopts-libya-martyrs'],
          reviewed: true,
        },
      ],
    },
  ],
};
