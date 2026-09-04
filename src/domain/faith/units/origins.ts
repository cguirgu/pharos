/**
 * Unit I — Where We Come From.
 *
 * The Church's own account of its beginning: the Holy Family's flight, St. Mark
 * in Alexandria, what the word "Copt" actually means, and the School that made
 * Alexandria the mind of early Christendom.
 *
 * ⚠️ Every card cites `sources.ts` and ships `reviewed: true` pending owner
 * (Coptic Orthodox) sign-off. See the header of `src/domain/faith/sources.ts`.
 */
import type { FaithUnit } from '../types';

export const ORIGINS: FaithUnit = {
  id: 'origins',
  numeral: 'I',
  title: 'Where We Come From',
  subtitle: 'A Church that begins with a flight into Egypt and an evangelist in Alexandria.',
  glyph: 'Ⲁ',
  essentials: [
    'Name who founded the Coptic Church, and say what makes it *apostolic* rather than merely ancient.',
    'Say what the word “Copt” actually means — and why the Church is Egyptian in the oldest sense of the word.',
    'Explain why Egypt reads its own history as prepared for, not accidental.',
  ],
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
          reviewed: true,
        },
        {
          id: 'origins-1-c2',
          heading: 'Isaiah saw it coming',
          body:
            'The Church reads the flight as prophecy kept. Isaiah had written that the Lord would make Himself known to the Egyptians and that they would know Him — and, most quoted of all, "Blessed be Egypt My people" (Isaiah 19:25). Coptic self-understanding starts there: not as a Church that received the faith late, but as a people named in advance.',
          pull: 'Isaiah 19:25 — "Blessed be Egypt My people."',
          sources: ['lacopts-holy-family', 'suscopts-holy-family'],
          reviewed: true,
        },
      ],
      questions: [
        {
          id: 'origins-1-q1',
          kind: 'choice',
          tier: 'core',
          prompt: 'Why does the Coptic Church set Isaiah 19 — “Blessed be Egypt My people” — beside the flight into Egypt?',
          answer: 'It reads Egypt as named in advance, not as a country that received the faith late',
          options: [
            'It reads Egypt as named in advance, not as a country that received the faith late',
            'It explains why the Holy Family travelled by night',
            'It is the reading appointed for the Feast of the Nativity',
            'It names the towns the Holy Family passed through',
          ],
          explain:
            'This is the root of Coptic self-understanding. The flight is not treated as a refugee episode that happened to pass through Egypt — it is read as a prophecy kept, which is why Egypt is spoken of as blessed rather than merely visited.',
          sources: ['lacopts-holy-family'],
          reviewed: true,
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
          reviewed: true,
        },
        {
          id: 'origins-2-c2',
          heading: 'And we do not agree on the year',
          body:
            'Ask when St. Mark reached Alexandria and the Church\'s own sources answer differently: about 43 AD, about 48, about 55, or — as many Coptic historians hold — about 60 or 61. The Diocese of Los Angeles prints 43 in one place and about 55 in another. This is not a flaw to hide. It is the first honest thing this course will teach you: the Church is certain about *who* founded it and unhurried about *when*.',
          pull: 'Our own sources give 43, 48, 55, and 60–61 AD. The Church has never settled on one.',
          sources: ['lacopts-establishment', 'lacopts-history', 'suscopts-saint-mark'],
          reviewed: true,
        },
        {
          id: 'origins-2-c3',
          heading: 'One of the ancient apostolic sees',
          body:
            'Alexandria is named in the canons of the Council of Nicaea (325 AD) as one of the ancient apostolic churches, alongside Rome, Antioch, and Jerusalem. That is why the Coptic Church calls itself apostolic in the strict sense: not that it teaches what the apostles taught, but that an apostle founded it and the line of laying-on-of-hands has never been broken since.',
          sources: ['suscopts-saint-mark', 'copticchurch-apostolic'],
          reviewed: true,
        },
      ],
      questions: [
        {
          id: 'origins-2-q1',
          kind: 'choice',
          tier: 'core',
          prompt: 'The Coptic Church calls itself *apostolic*. In the strict sense the Church means, that claims:',
          answer: 'An apostle founded it, and the laying-on of hands has continued unbroken since',
          options: [
            'An apostle founded it, and the laying-on of hands has continued unbroken since',
            'It teaches the same things the apostles taught',
            'It still reads the books the apostles wrote',
            'It was founded within the lifetime of the apostles',
          ],
          explain:
            'Every option here is true of the Coptic Church, but only the first is what *apostolic* means in the strict sense. Teaching what the apostles taught is doctrine; apostolic is about an unbroken succession of hands, running from St. Mark to the present Pope of Alexandria.',
          sources: ['lacopts-establishment'],
          reviewed: true,
        },
        {
          id: 'origins-2-q2',
          kind: 'standing',
          tier: 'core',
          prompt: 'The exact year St. Mark arrived in Alexandria.',
          answer: 'Still disputed',
          explain:
            'Coptic sources give about 43, 48, 55, and 60–61 AD — sometimes two different years on two pages of the same diocesan site. The Church has never defined it, because nothing in the faith depends on it.',
          sources: ['lacopts-establishment', 'lacopts-history', 'suscopts-saint-mark'],
          reviewed: true,
        },
        {
          id: 'origins-2-q3',
          kind: 'truefalse',
          tier: 'core',
          prompt: 'The Coptic Church regards St. Mark as its first patriarch.',
          answer: 'True',
          options: [],
          explain:
            'He is counted the first in an unbroken line of patriarchs of Alexandria; the see itself is named for him.',
          sources: ['suscopts-saint-mark'],
          reviewed: true,
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
          reviewed: true,
        },
        {
          id: 'origins-3-c2',
          heading: 'And the language is the last of ancient Egyptian',
          body:
            'Coptic is not a language the Church invented; it is the final living stage of the language of the pharaohs. Hieroglyphic gave way to the priests\' hieratic, hieratic to the people\'s demotic, and demotic — once Christianity spread — was written out in Greek letters so that scripture could be read aloud plainly. That is why the Coptic alphabet is 25 Greek-derived letters plus 7 kept from demotic: the sounds Greek had no signs for.',
          pull: '25 letters from Greek · 7 kept from Egyptian demotic.',
          sources: ['copticchurch-language-origin', 'suscopts-coptic-language'],
          reviewed: true,
        },
      ],
      questions: [
        {
          id: 'origins-3-q1',
          kind: 'choice',
          tier: 'core',
          prompt: 'To say “Coptic Orthodox” is, in the word’s own meaning, to say:',
          answer: 'Egyptian Orthodox',
          options: [
            'Egyptian Orthodox',
            'Orthodox of the old rite',
            'Orthodox of the Nile valley monasteries',
            'Orthodox in communion with Alexandria',
          ],
          explain:
            'The chain is *Hak-ka-Ptah* → Greek *Aigyptos* → Arabic *qibt* → English "Copt". The word never meant a denomination or a sect — it means Egyptian. The Church did not take a name; it kept the name of the country.',
          sources: ['copticchurch-language-origin'],
          reviewed: true,
        },
        {
          id: 'origins-3-q2',
          kind: 'order',
          tier: 'core',
          prompt: 'Put the stages of the Egyptian language in order, earliest first.',
          answer: 'Hieroglyphic → Hieratic → Demotic → Coptic',
          options: ['Hieroglyphic', 'Hieratic', 'Demotic', 'Coptic'],
          explain:
            'Coptic is the last stage of an unbroken language — the same tongue the pyramid-builders spoke, finally written in an alphabet borrowed to carry the Gospel.',
          sources: ['copticchurch-language-origin', 'suscopts-coptic-language'],
          reviewed: true,
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
          reviewed: true,
        },
        {
          id: 'origins-4-c2',
          heading: 'The names that taught there',
          body:
            'Pantaenus founded it. Clement of Alexandria worked to set Christian teaching beside Greek philosophy. Origen was made its head at eighteen by Pope St. Demetrius, and produced commentaries on a scale no one has matched, along with the Hexapla — six versions of the Old Testament ruled side by side in parallel columns. Later, Didymus the Blind led it; blind from childhood, he taught the scriptures from memory.',
          pull: 'Pantaenus · Clement · Origen · Didymus the Blind.',
          sources: ['copticchurch-school-alexandria'],
          reviewed: true,
        },
      ],
      questions: [
        {
          id: 'origins-4-q1',
          kind: 'choice',
          tier: 'core',
          prompt: 'Why does the School of Alexandria matter to how the faith was formed?',
          answer: 'It made Alexandria the place the wider Church came to learn — so Egypt shaped Christian doctrine, not just received it',
          options: [
            'It made Alexandria the place the wider Church came to learn — so Egypt shaped Christian doctrine, not just received it',
            'It was where the Coptic alphabet was invented',
            'It trained the monks who founded the desert monasteries',
            'It preserved the only surviving copies of the Gospels',
          ],
          explain:
            'Founded around 190 AD, it was the oldest catechetical school in the world and bishops came from across the world to sit in it. Hold on to this: the men who will defend the faith at Nicaea and Ephesus come out of this school. Alexandria is not a bystander to the councils — it is where the argument was trained.',
          sources: ['copticchurch-school-alexandria'],
          reviewed: true,
        },
      ],
    },
  ],
};
