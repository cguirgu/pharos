/**
 * Unit I — Where We Come From.
 *
 * The Church's own account of its beginning: the Holy Family's flight, St. Mark
 * in Alexandria, what the word "Copt" actually means, and the School that made
 * Alexandria the mind of early Christendom.
 *
 * ⚠️ Every card cites `sources.ts` and ships `reviewed: false` pending owner
 * (Coptic Orthodox) sign-off. See the header of `src/domain/faith/sources.ts`.
 */
import type { FaithUnit } from '../types';

export const ORIGINS: FaithUnit = {
  id: 'origins',
  numeral: 'I',
  title: 'Where We Come From',
  subtitle: 'A Church that begins with a flight into Egypt and an evangelist in Alexandria.',
  glyph: 'Ⲁ',
  creedClauseId: 'father',
  lessons: [
    {
      id: 'origins-1',
      unitId: 'origins',
      title: 'Egypt Before the Church',
      cards: [
        {
          id: 'origins-1-c1',
          heading: 'The Holy Family came here first',
          body:
            'Before there was a Coptic Church there was a Coptic welcome. Fleeing Herod, the Holy Family — the Lord Jesus, St. Mary, and St. Joseph — crossed into Egypt and travelled through it. The Church keeps the route as sacred geography: Al-Farma in the north, Tal Basta near Zagazig, Mostorod, and on into Upper Egypt, where the Monastery of Al-Muharraq holds the longest remembered stay.',
          pull: 'Egypt is the only country outside the Holy Land that the Lord Himself walked as a child.',
          glyph: 'Ⲁ',
          sources: ['lacopts-holy-family', 'suscopts-holy-family'],
          reviewed: false,
        },
        {
          id: 'origins-1-c2',
          heading: 'Isaiah saw it coming',
          body:
            'The Church reads the flight as prophecy kept. Isaiah had written that the Lord would make Himself known to the Egyptians and that they would know Him — and, most quoted of all, "Blessed be Egypt My people" (Isaiah 19:25). Coptic self-understanding starts there: not as a Church that received the faith late, but as a people named in advance.',
          pull: 'Isaiah 19:25 — "Blessed be Egypt My people."',
          sources: ['lacopts-holy-family', 'suscopts-holy-family'],
          reviewed: false,
        },
      ],
      questions: [
        {
          id: 'origins-1-q1',
          kind: 'choice',
          prompt: 'Which prophet does the Coptic Church read as foretelling the blessing of Egypt?',
          answer: 'Isaiah',
          options: ['Isaiah', 'Jeremiah', 'Ezekiel', 'Hosea'],
          explain:
            'Isaiah 19 — "Blessed be Egypt My people" — is the verse most often set beside the flight into Egypt in Coptic teaching.',
          sources: ['lacopts-holy-family'],
          reviewed: false,
        },
        {
          id: 'origins-1-q2',
          kind: 'truefalse',
          prompt: 'The Holy Family entered Egypt from the north, near where Al-Arish and Port Said stand today.',
          answer: 'True',
          options: [],
          explain:
            'The tradition names Al-Farma, between Al-Arish and Port Said, as the northern point of entry, and traces the journey southward from there.',
          sources: ['suscopts-holy-family'],
          reviewed: false,
        },
      ],
    },
    {
      id: 'origins-2',
      unitId: 'origins',
      title: 'St. Mark in Alexandria',
      cards: [
        {
          id: 'origins-2-c1',
          heading: 'The evangelist who founded a see',
          body:
            'St. Mark — one of the seventy, and the writer of the earliest Gospel — came to Alexandria and preached. He did four things the Church still lives on: he ordered its worship, he ordained a bishop and seven deacons, he founded the School of Alexandria, and he was martyred there. The Coptic Church counts him as its first patriarch, and every Pope of Alexandria since sits on what is called the See of St. Mark.',
          pull: 'Ordered the worship · ordained one bishop and seven deacons · founded the School · was martyred.',
          glyph: 'Ⲙ',
          sources: ['lacopts-establishment', 'suscopts-saint-mark'],
          reviewed: false,
        },
        {
          id: 'origins-2-c2',
          heading: 'And we do not agree on the year',
          body:
            'Ask when St. Mark reached Alexandria and the Church\'s own sources answer differently: about 43 AD, about 48, about 55, or — as many Coptic historians hold — about 60 or 61. The Diocese of Los Angeles prints 43 in one place and about 55 in another. This is not a flaw to hide. It is the first honest thing this course will teach you: the Church is certain about *who* founded it and unhurried about *when*.',
          pull: 'Our own sources give 43, 48, 55, and 60–61 AD. The Church has never settled on one.',
          sources: ['lacopts-establishment', 'lacopts-history', 'suscopts-saint-mark'],
          reviewed: false,
        },
        {
          id: 'origins-2-c3',
          heading: 'One of the ancient apostolic sees',
          body:
            'Alexandria is named in the canons of the Council of Nicaea (325 AD) as one of the ancient apostolic churches, alongside Rome, Antioch, and Jerusalem. That is why the Coptic Church calls itself apostolic in the strict sense: not that it teaches what the apostles taught, but that an apostle founded it and the line of laying-on-of-hands has never been broken since.',
          sources: ['suscopts-saint-mark', 'copticchurch-apostolic'],
          reviewed: false,
        },
      ],
      questions: [
        {
          id: 'origins-2-q1',
          kind: 'choice',
          prompt: 'What did St. Mark establish in Alexandria besides the church itself?',
          answer: 'The School of Alexandria',
          options: [
            'The School of Alexandria',
            'The Monastery of St. Anthony',
            'The Agpeya',
            'The Coptic calendar',
          ],
          explain:
            'St. Mark structured the worship, ordained a bishop and seven deacons, and founded the School of Alexandria — which became the most important centre of religious learning in early Christendom.',
          sources: ['lacopts-establishment'],
          reviewed: false,
        },
        {
          id: 'origins-2-q2',
          kind: 'standing',
          prompt: 'The exact year St. Mark arrived in Alexandria.',
          answer: 'Still disputed',
          explain:
            'Coptic sources give about 43, 48, 55, and 60–61 AD — sometimes two different years on two pages of the same diocesan site. The Church has never defined it, because nothing in the faith depends on it.',
          sources: ['lacopts-establishment', 'lacopts-history', 'suscopts-saint-mark'],
          reviewed: false,
        },
        {
          id: 'origins-2-q3',
          kind: 'truefalse',
          prompt: 'The Coptic Church regards St. Mark as its first patriarch.',
          answer: 'True',
          options: [],
          explain:
            'He is counted the first in an unbroken line of patriarchs of Alexandria; the see itself is named for him.',
          sources: ['suscopts-saint-mark'],
          reviewed: false,
        },
      ],
    },
    {
      id: 'origins-3',
      unitId: 'origins',
      title: 'What “Copt” Means',
      cards: [
        {
          id: 'origins-3-c1',
          heading: 'The word is just “Egyptian”',
          body:
            '"Copt" and "Egyptian" are the same word wearing different centuries. The Greek *Aigyptos* is a worn-down form of the ancient Egyptian *Hak-ka-Ptah* — "the house of the spirit of Ptah", a name for Memphis. Arabic clipped *Aigyptos* to *qibt*; English rendered that "Copt". So to say Coptic Orthodox is to say Egyptian Orthodox.',
          pull: 'Hak-ka-Ptah → Aigyptos → qibt → Copt.',
          glyph: 'Ϧ',
          sources: ['copticchurch-language-origin', 'suscopts-coptic-language'],
          reviewed: false,
        },
        {
          id: 'origins-3-c2',
          heading: 'And the language is the last of ancient Egyptian',
          body:
            'Coptic is not a language the Church invented; it is the final living stage of the language of the pharaohs. Hieroglyphic gave way to the priests\' hieratic, hieratic to the people\'s demotic, and demotic — once Christianity spread — was written out in Greek letters so that scripture could be read aloud plainly. That is why the Coptic alphabet is 25 Greek-derived letters plus 7 kept from demotic: the sounds Greek had no signs for.',
          pull: '25 letters from Greek · 7 kept from Egyptian demotic.',
          sources: ['copticchurch-language-origin', 'suscopts-coptic-language'],
          reviewed: false,
        },
      ],
      questions: [
        {
          id: 'origins-3-q1',
          kind: 'choice',
          prompt: 'The word “Copt” descends from an Egyptian name meaning:',
          answer: 'The house of the spirit of Ptah',
          options: [
            'The house of the spirit of Ptah',
            'The people of the river',
            'The followers of Mark',
            'The land of the black soil',
          ],
          explain:
            '*Hak-ka-Ptah* became Greek *Aigyptos*, which became Arabic *qibt* and English "Copt". The word means Egyptian — nothing narrower.',
          sources: ['copticchurch-language-origin'],
          reviewed: false,
        },
        {
          id: 'origins-3-q2',
          kind: 'order',
          prompt: 'Put the stages of the Egyptian language in order, earliest first.',
          answer: 'Hieroglyphic → Hieratic → Demotic → Coptic',
          options: ['Hieroglyphic', 'Hieratic', 'Demotic', 'Coptic'],
          explain:
            'Coptic is the last stage of an unbroken language — the same tongue the pyramid-builders spoke, finally written in an alphabet borrowed to carry the Gospel.',
          sources: ['copticchurch-language-origin', 'suscopts-coptic-language'],
          reviewed: false,
        },
        {
          id: 'origins-3-q3',
          kind: 'choice',
          prompt: 'How many letters of the Coptic alphabet come from Egyptian demotic rather than Greek?',
          answer: 'Seven',
          options: ['Seven', 'Three', 'Twelve', 'Twenty-five'],
          explain:
            'Seven — the sounds Greek could not spell. They are the last letters of the alphabet: ϣ ϥ ϧ ϩ ϫ ϭ ϯ.',
          sources: ['copticchurch-language-origin'],
          reviewed: false,
        },
      ],
    },
    {
      id: 'origins-4',
      unitId: 'origins',
      title: 'The School of Alexandria',
      cards: [
        {
          id: 'origins-4-c1',
          heading: 'The oldest catechetical school in the world',
          body:
            'Founded around 190 AD under the scholar Pantaenus, the Catechetical School of Alexandria began as what its name says: a place where those preparing for baptism were taught the faith. It became the most important institution of religious learning in Christendom, and bishops came from across the world to sit in it.',
          pull: 'Founded c. 190 AD — the oldest catechetical school in the world.',
          glyph: 'Ⲡ',
          sources: ['copticchurch-school-alexandria', 'lacopts-establishment'],
          reviewed: false,
        },
        {
          id: 'origins-4-c2',
          heading: 'The names that taught there',
          body:
            'Pantaenus founded it. Clement of Alexandria worked to set Christian teaching beside Greek philosophy. Origen was made its head at eighteen by Pope St. Demetrius, and produced commentaries on a scale no one has matched, along with the Hexapla — six versions of the Old Testament ruled side by side in parallel columns. Later, Didymus the Blind led it; blind from childhood, he taught the scriptures from memory.',
          pull: 'Pantaenus · Clement · Origen · Didymus the Blind.',
          sources: ['copticchurch-school-alexandria'],
          reviewed: false,
        },
      ],
      questions: [
        {
          id: 'origins-4-q1',
          kind: 'choice',
          prompt: 'Who founded the Catechetical School of Alexandria, around 190 AD?',
          answer: 'Pantaenus',
          options: ['Pantaenus', 'Origen', 'Clement', 'Didymus the Blind'],
          explain:
            'Pantaenus was its founding father and first president; Clement, Origen, and Didymus followed him.',
          sources: ['copticchurch-school-alexandria'],
          reviewed: false,
        },
        {
          id: 'origins-4-q2',
          kind: 'choice',
          prompt: 'Origen’s Hexapla was:',
          answer: 'Six versions of the Old Testament set in parallel columns',
          options: [
            'Six versions of the Old Testament set in parallel columns',
            'A six-volume life of Christ',
            'A rule for six monasteries',
            'A defence of the faith in six letters',
          ],
          explain:
            'The Hexapla laid six texts side by side so they could be compared — the beginning of comparative biblical study.',
          sources: ['copticchurch-school-alexandria'],
          reviewed: false,
        },
        {
          id: 'origins-4-q3',
          kind: 'truefalse',
          prompt: 'Origen was appointed head of the School of Alexandria at the age of eighteen.',
          answer: 'True',
          options: [],
          explain:
            'Pope St. Demetrius of Alexandria appointed him at eighteen, on the strength of his zeal to preach and catechise.',
          sources: ['copticchurch-school-alexandria'],
          reviewed: false,
        },
      ],
    },
  ],
};
