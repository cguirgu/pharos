/**
 * Unit VI — How We Pray.
 *
 * Coptic worship is not decoration around the doctrine; it is where the doctrine
 * is kept. Three liturgies, seven hours, and more fasting days than not. The
 * hours taught here are the same seven the app's own office reader carries
 * (`content/agpeya/hours/index.json`), and the fasts are the ones the calendar
 * engine already computes (`src/domain/coptic/fasting.ts`).
 */
import type { FaithUnit } from '../types';

export const WORSHIP: FaithUnit = {
  id: 'worship',
  numeral: 'VI',
  title: 'How We Pray',
  subtitle: 'Three liturgies, seven hours, and a year that is more than half fast.',
  glyph: 'Ⲗ',
  creedClauseId: 'ascended',
  lessons: [
    {
      id: 'worship-1',
      unitId: 'worship',
      title: 'The Three Liturgies',
      cards: [
        {
          id: 'worship-1-c1',
          heading: 'Basil, Gregory, Cyril',
          body:
            'The Coptic Church has three eucharistic liturgies. **St. Basil** is used through most of the year. **St. Gregory** is used on feasts and certain occasions. **St. Cyril** is the Coptic form of the liturgy attributed to St. Mark himself — long, and today only partly used.',
          pull: 'St. Basil most of the year · St. Gregory on feasts · St. Cyril in part.',
          glyph: 'Ⲅ',
          sources: ['lacopts-liturgies'],
          reviewed: false,
        },
        {
          id: 'worship-1-c2',
          heading: 'Each addressed to a different Person',
          body:
            'This is the detail worth carrying: the Liturgy of St. Basil is addressed to God the Father. The Liturgy of St. Gregory is addressed to the Son — it dwells on the Incarnation, the Passion, the Resurrection and the Ascension, speaking to Christ directly. St. Cyril\'s, like St. Mark\'s before it, is again addressed to the Father. The Church prays the Trinity by praying to the Persons in turn.',
          sources: ['lacopts-liturgies'],
          reviewed: false,
        },
      ],
      questions: [
        {
          id: 'worship-1-q1',
          kind: 'choice',
          prompt: 'The Liturgy of St. Gregory is addressed to:',
          answer: 'God the Son',
          options: ['God the Son', 'God the Father', 'The Holy Spirit', 'The Theotokos'],
          explain:
            'It speaks to Christ directly, dwelling on His Incarnation, Passion, Resurrection and Ascension. St. Basil’s and St. Cyril’s are addressed to the Father.',
          sources: ['lacopts-liturgies'],
          reviewed: false,
        },
        {
          id: 'worship-1-q2',
          kind: 'choice',
          prompt: 'Which liturgy is used on most days of the year?',
          answer: 'St. Basil',
          options: ['St. Basil', 'St. Gregory', 'St. Cyril', 'St. Mark'],
          explain:
            'St. Gregory is kept for feasts and special occasions; only portions of St. Cyril are used today.',
          sources: ['lacopts-liturgies'],
          reviewed: false,
        },
        {
          id: 'worship-1-q3',
          kind: 'truefalse',
          prompt: 'The Liturgy of St. Cyril is the Coptic form of a liturgy traced to St. Mark.',
          answer: 'True',
          options: [],
          explain:
            'St. Cyril rearranged the rites of St. Mark’s liturgy and added litanies to it — which is why the oldest liturgy in the Church carries the later name.',
          sources: ['lacopts-liturgies'],
          reviewed: false,
        },
      ],
    },
    {
      id: 'worship-2',
      unitId: 'worship',
      title: 'The Seven Hours',
      cards: [
        {
          id: 'worship-2-c1',
          heading: 'The Agpeya',
          body:
            'The Agpeya is the Coptic book of the hours, and it divides the day into seven prayers: the Midnight prayer, Prime, Terce, Sext, None, Vespers, and Compline. Each hour is built the same way — psalms, a Gospel, litanies — and each is tied to a moment of the Lord\'s Passion or of the Church\'s life, so that praying the hours walks the day through the Gospel.',
          pull: 'Midnight · Prime · Terce · Sext · None · Vespers · Compline.',
          glyph: 'Ⲍ',
          sources: ['copticorthodox-what-is-coc'],
          reviewed: false,
        },
        {
          id: 'worship-2-c2',
          heading: 'Three watches at midnight',
          body:
            'The Midnight prayer is not one prayer but three watches, prayed in succession — the tradition of keeping vigil against the parable of the bridegroom who comes at an unknown hour. It is the longest of the hours, and it is the one that shapes monastic life most directly.',
          sources: ['copticorthodox-what-is-coc'],
          reviewed: false,
        },
      ],
      questions: [
        {
          id: 'worship-2-q1',
          kind: 'choice',
          prompt: 'How many hours does the Agpeya divide the day into?',
          answer: 'Seven',
          options: ['Seven', 'Three', 'Five', 'Twelve'],
          explain:
            'Midnight, Prime, Terce, Sext, None, Vespers, and Compline — the same seven the Hours screen of this app carries.',
          sources: ['copticorthodox-what-is-coc'],
          reviewed: false,
        },
        {
          id: 'worship-2-q2',
          kind: 'truefalse',
          prompt: 'The Midnight prayer of the Agpeya is prayed in three watches.',
          answer: 'True',
          options: [],
          explain:
            'Three successive watches — the vigil kept for a bridegroom whose hour is not announced.',
          sources: ['copticorthodox-what-is-coc'],
          reviewed: false,
        },
      ],
    },
    {
      id: 'worship-3',
      unitId: 'worship',
      title: 'Why We Fast',
      cards: [
        {
          id: 'worship-3-c1',
          heading: 'More than half the year',
          body:
            'The Copts fast over 210 days of the year. The Nativity fast runs 43 days; the Great Lent 55; the Fast of the Apostles varies in length; St. Mary\'s fast is 14 days; and every Wednesday and Friday is a fast except in the fifty days after the Resurrection. Two weeks before Great Lent comes the three-day Fast of Nineveh, a fast of repentance.',
          pull: 'Over 210 fasting days in a 365-day year.',
          glyph: 'Ⲛ',
          sources: ['st-takla-fasting', 'lacopts-lent'],
          reviewed: false,
        },
        {
          id: 'worship-3-c2',
          heading: 'What the fast is for',
          body:
            'Not endurance, and not a diet. The purpose given is to give up a measure of dependence on the material world in order to feel, personally, one\'s hunger for God. And the Church insists the days are not gloomy: they are described as days of repentance and contrition that are at the same time periods of joy, because something is being won rather than merely given up.',
          pull: 'Days of repentance that are also days of joy.',
          sources: ['lacopts-lent', 'st-takla-fasting'],
          reviewed: false,
        },
        {
          id: 'worship-3-c3',
          heading: 'Why Great Lent is the holiest',
          body:
            'Because the Lord fasted it Himself — forty days and forty nights, on our behalf. The Coptic Great Lent is 55 days: the forty, with a preparatory week before and Holy Week after, all kept as one continuous fast.',
          pull: 'Great Lent: 55 days.',
          sources: ['lacopts-lent'],
          reviewed: false,
        },
      ],
      questions: [
        {
          id: 'worship-3-q1',
          kind: 'choice',
          prompt: 'Roughly how many days of the year does the Coptic Church fast?',
          answer: 'Over 210',
          options: ['Over 210', 'About 40', 'About 90', 'About 150'],
          explain:
            'More than half the year — the Nativity fast, Great Lent, the Apostles’ fast, St. Mary’s fast, most Wednesdays and Fridays, and Nineveh.',
          sources: ['st-takla-fasting'],
          reviewed: false,
        },
        {
          id: 'worship-3-q2',
          kind: 'choice',
          prompt: 'The Fast of Nineveh is:',
          answer: 'A three-day fast of repentance, two weeks before Great Lent',
          options: [
            'A three-day fast of repentance, two weeks before Great Lent',
            'The forty days before the Nativity',
            'A fourteen-day fast before the Assumption',
            'The fast kept on every Wednesday and Friday',
          ],
          explain:
            'Named for Jonah’s preaching to Nineveh, and kept as three days of repentance in preparation for the Great Fast.',
          sources: ['st-takla-fasting'],
          reviewed: false,
        },
        {
          id: 'worship-3-q3',
          kind: 'choice',
          prompt: 'The reason given for fasting is chiefly:',
          answer: 'To loosen dependence on the material world and feel one’s hunger for God',
          options: [
            'To loosen dependence on the material world and feel one’s hunger for God',
            'To make satisfaction for particular sins',
            'To imitate the monastic rule exactly',
            'To mark the seasons of the calendar',
          ],
          explain:
            'The Church describes the fast as freeing, not punitive — days of contrition that are also days of joy.',
          sources: ['lacopts-lent'],
          reviewed: false,
        },
      ],
    },
  ],
};
