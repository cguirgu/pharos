/**
 * Unit VII — Our Fathers.
 *
 * Who the great Coptic fathers actually are, and what each is remembered for.
 * Note the deliberate treatment of dates: where the Synaxarium and the diocesan
 * histories differ (Anthony 355 vs 356; Pachomius 348 vs 346), BOTH are printed.
 * Papering over that would teach a false confidence — and Unit IX will come back
 * for it.
 */
import type { FaithUnit } from '../types';

export const FATHERS: FaithUnit = {
  id: 'fathers',
  numeral: 'VII',
  title: 'Our Fathers',
  subtitle: 'The men the whole Church inherited from Egypt.',
  glyph: 'Ⲫ',
  essentials: [
    'Say what St. Athanasius and St. Cyril each defended, and why the Creed carries Alexandria’s fingerprints.',
    'Explain the difference between what St. Anthony began and what St. Pachomius began.',
    'Recognise that monasticism is Egypt’s gift to the whole Church, not an import.',
  ],
  creedClauseId: 'coming',
  lessons: [
    {
      id: 'fathers-1',
      unitId: 'fathers',
      title: 'St. Athanasius the Apostolic',
      cards: [
        {
          id: 'fathers-1-c1',
          heading: 'Twentieth Pope, and five times exiled',
          body:
            'St. Athanasius sat on the See of St. Mark from 328 to 373. He was driven from his chair five times by emperors who preferred Arianism; in one exile, in 367, he hid in his father\'s tomb. He kept writing throughout. Of him St. Jerome said that had he not existed, the whole world might have gone Arian.',
          pull: '20th Pope of Alexandria, 328–373. Exiled five times.',
          glyph: 'Ⲁ',
          sources: ['synax-athanasius', 'lacopts-brief-history'],
          reviewed: true,
        },
        {
          id: 'fathers-1-c2',
          heading: 'Why he is called Father of Orthodoxy',
          body:
            'Not because he invented anything, but because he refused to let a single word be softened. The whole content of Nicaea — that the Son is God in the full sense, not a superior creature — reached the rest of the Church through his stubbornness. The Coptic Church gives him the title *the Apostolic*.',
          sources: ['lacopts-history', 'synax-athanasius'],
          reviewed: true,
        },
      ],
      questions: [
        {
          id: 'fathers-1-q1',
          kind: 'choice',
          tier: 'support',
          prompt: 'How many times was St. Athanasius exiled?',
          answer: 'Five',
          options: ['Five', 'Twice', 'Once', 'Nine'],
          explain:
            'Five exiles across a papacy of forty-five years. “Athanasius against the world” is not a flourish; it is a summary.',
          sources: ['synax-athanasius'],
          reviewed: true,
        },
        {
          id: 'fathers-1-q2',
          kind: 'truefalse',
          tier: 'support',
          prompt: 'St. Athanasius was the twentieth Pope of Alexandria.',
          answer: 'True',
          options: [],
          explain:
            'From 328 to 373 — and the man who, as a young deacon, had already argued the Son’s divinity at Nicaea in 325.',
          sources: ['synax-athanasius'],
          reviewed: true,
        },
      ],
    },
    {
      id: 'fathers-2',
      unitId: 'fathers',
      title: 'St. Cyril the Great',
      cards: [
        {
          id: 'fathers-2-c1',
          heading: 'The twenty-fourth Pope',
          body:
            'St. Cyril of Alexandria, who died in 444, presided at Ephesus in 431 and gave the Church the formula the Coptic confession still rests on: one incarnate nature of God the Word. Where Athanasius defended who the Son is, Cyril defended how the Son is one — and the two together are the whole Alexandrian contribution to the Creed.',
          pull: '24th Pope of Alexandria · presided at Ephesus 431 · departed 444.',
          glyph: 'Ⲕ',
          sources: ['synax-cyril', 'lacopts-ephesus'],
          reviewed: true,
        },
      ],
      questions: [
        {
          id: 'fathers-2-q1',
          kind: 'choice',
          tier: 'core',
          prompt: 'St. Cyril of Alexandria is chiefly remembered for defending:',
          answer: 'The unity of Christ, and the title Theotokos',
          options: [
            'The unity of Christ, and the title Theotokos',
            'The divinity of the Son against Arius',
            'The divinity of the Holy Spirit',
            'The veneration of icons',
          ],
          explain:
            'Arius was Athanasius’ fight a century earlier. Cyril’s was Nestorius, and the question of whether Christ is one.',
          sources: ['lacopts-ephesus', 'synax-cyril'],
          reviewed: true,
        },
        {
          id: 'fathers-2-q2',
          kind: 'choice',
          tier: 'core',
          prompt: 'Which formula, still the Coptic confession today, comes from St. Cyril?',
          answer: 'One incarnate nature of God the Word',
          options: [
            'One incarnate nature of God the Word',
            'Two natures in one person, without confusion',
            'Of one essence with the Father',
            'Perfect God and perfect man, in two wills',
          ],
          explain:
            '“Of one essence with the Father” is Nicaea’s, defended by Athanasius. The two-natures formula is Chalcedon’s. St. Cyril’s is the one Alexandria kept — which is why the Coptic Church regards its Christology as simply Ephesus, held on to.',
          sources: ['synax-cyril', 'shenouda-nature-of-christ'],
          reviewed: true,
        },
      ],
    },
    {
      id: 'fathers-3',
      unitId: 'fathers',
      title: 'The Desert',
      cards: [
        {
          id: 'fathers-3-c1',
          heading: 'St. Anthony the Great',
          body:
            'Born about 251 to wealthy parents, Anthony heard the Gospel read at twenty — sell what you have and follow me — and did exactly that. He withdrew first to the edge of his town, then to a tomb, then to the inner wilderness of the eastern desert, where his monastery stands today. He is called the father of all monks. Egypt gave monasticism to the world; it did not import it.',
          pull: 'Born c. 251 · heard the Gospel at twenty · father of all monks.',
          glyph: 'Ⲁ',
          sources: ['synax-anthony', 'lacopts-monasticism'],
          reviewed: true,
        },
        {
          id: 'fathers-3-c2',
          heading: 'St. Pachomius and the common life',
          body:
            'Anthony went alone. Pachomius did the opposite: he founded the first *cenobitic* — community — monastery at Tabennesi and wrote a rule for it, the Koinonia. By his departure the federation held nine monasteries for men and two for women. Every rule-governed religious community in Christendom descends from that experiment.',
          pull: 'Anthony: the hermit. Pachomius: the community, and the rule.',
          sources: ['lacopts-monasticism', 'synax-pachomius'],
          reviewed: true,
        },
        {
          id: 'fathers-3-c3',
          heading: 'And the dates do not agree',
          body:
            'The Synaxarium records St. Anthony departing in 355 at the age of 105; the Diocese of Los Angeles gives about 254–356. For St. Pachomius the Synaxarium says 348; the diocesan history says about 292–346. Also named in that history: Abba Macarius the Egyptian, who established Scetis, and Abba Amoun, who founded Nitria and Kellia. Hold the names firmly and the years loosely.',
          pull: 'Anthony: 355 or 356. Pachomius: 348 or 346. Both are our own sources.',
          sources: ['synax-anthony', 'synax-pachomius', 'lacopts-monasticism'],
          reviewed: true,
        },
      ],
      questions: [
        {
          id: 'fathers-3-q1',
          kind: 'choice',
          tier: 'core',
          prompt: 'What distinguishes St. Pachomius from St. Anthony?',
          answer: 'He founded monasticism lived in community, under a written rule',
          options: [
            'He founded monasticism lived in community, under a written rule',
            'He was the first hermit',
            'He was a Pope of Alexandria',
            'He wrote against Arius',
          ],
          explain:
            'Anthony is the father of solitary monasticism; Pachomius established the first cenobitic monastery at Tabennesi and the Koinonia rule.',
          sources: ['lacopts-monasticism'],
          reviewed: true,
        },
        {
          id: 'fathers-3-q3',
          kind: 'standing',
          // Support, not core: this unit's essentials are about what the
          // fathers did, and the card itself tells the learner to hold the
          // dates loosely. The *concept* of a disputed date is drilled in Unit
          // IX, which is where it belongs.
          tier: 'support',
          prompt: 'The year St. Anthony the Great departed.',
          answer: 'Still disputed',
          explain:
            'The Synaxarium says 355; the diocesan history says 356. Neither is careless — ancient dates simply reach us through more than one reckoning.',
          sources: ['synax-anthony', 'lacopts-monasticism'],
          reviewed: true,
        },
        {
          id: 'fathers-3-q4',
          kind: 'truefalse',
          tier: 'core',
          prompt: 'Christian monasticism began in Egypt.',
          answer: 'True',
          options: [],
          explain:
            'It began in the third century in Egypt and flourished in the fourth. Anthony was the first to go out into the wilderness for it.',
          sources: ['lacopts-monasticism'],
          reviewed: true,
        },
      ],
    },
  ],
};
