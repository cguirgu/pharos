/**
 * Unit III — The Three Councils.
 *
 * Nicaea, Constantinople, Ephesus: the three ecumenical councils the Coptic
 * Church receives, what each one settled, and the Alexandrian hand in each.
 * This unit is the reason the next one hurts — by 431 Alexandria had led the
 * Church's defence three times running.
 */
import type { FaithUnit } from '../types';

export const COUNCILS: FaithUnit = {
  id: 'councils',
  numeral: 'III',
  title: 'The Three Councils',
  subtitle: 'Nicaea, Constantinople, Ephesus — and the Creed they left behind.',
  glyph: 'Ⲅ',
  essentials: [
    'Say what question each of the three councils answered, and what was at stake if it had gone the other way.',
    'Explain why the Coptic Church receives three ecumenical councils and no more.',
    'Say what *Theotokos* guards — and why the argument over St. Mary’s title is really an argument about Christ.',
  ],
  creedClauseId: 'son',
  lessons: [
    {
      id: 'councils-1',
      unitId: 'councils',
      title: 'Nicaea, 325',
      cards: [
        {
          id: 'councils-1-c1',
          heading: 'The question that could not be left open',
          body:
            'Arius, a priest of Alexandria, taught that the Son was made — the highest of creatures, but a creature, with a time before which He was not. If that were true, then what met humanity in Christ was not God, and the whole account of salvation changes. The Emperor Constantine convened a council at Nicaea in 325 AD; tradition numbers the bishops at 318.',
          pull: '325 AD · traditionally 318 bishops.',
          glyph: 'Ⲛ',
          sources: ['lacopts-brief-history', 'lacopts-history'],
          reviewed: true,
        },
        {
          id: 'councils-1-c2',
          heading: 'Athanasius at Nicaea',
          body:
            'St. Athanasius came to Nicaea as a young deacon in the party of Pope Alexander of Alexandria, and argued the Son\'s full divinity so forcefully that the fight became his life. He would later be the twentieth Pope of Alexandria and be exiled five times over it. The phrase remembered from that struggle is *Athanasius contra mundum* — Athanasius against the world.',
          pull: 'St. Athanasius: 20th Pope of Alexandria, 328–373. Exiled five times.',
          sources: ['lacopts-brief-history', 'synax-athanasius'],
          reviewed: true,
        },
        {
          id: 'councils-1-c3',
          heading: 'What Nicaea produced',
          body:
            'The council condemned Arianism and confessed the Son to be of one essence with the Father — not made, but begotten. It also gave the Church the first part of the Creed still said at every Coptic liturgy, and its canons name Alexandria among the ancient apostolic sees.',
          sources: ['lacopts-brief-history', 'suscopts-creed-facts'],
          reviewed: true,
        },
      ],
      questions: [
        {
          id: 'councils-1-q1',
          kind: 'choice',
          tier: 'core',
          prompt: 'What did Arius teach that the Council of Nicaea condemned?',
          answer: 'That the Son is a creature, made rather than begotten',
          options: [
            'That the Son is a creature, made rather than begotten',
            'That the Holy Spirit is created',
            'That St. Mary should not be called Theotokos',
            'That Christ had only the appearance of a body',
          ],
          explain:
            'Arianism denied the Son’s full divinity. Nicaea answered that He is of one essence with the Father — begotten, not made.',
          sources: ['lacopts-brief-history'],
          reviewed: true,
        },
        {
          id: 'councils-1-q3',
          kind: 'truefalse',
          tier: 'support',
          prompt: 'St. Athanasius was already Pope of Alexandria when he attended the Council of Nicaea.',
          answer: 'False',
          options: [],
          explain:
            'He came as a young deacon with Pope Alexander. He became the twentieth Pope in 328, three years after the council.',
          sources: ['lacopts-brief-history', 'synax-athanasius'],
          reviewed: true,
        },
      ],
    },
    {
      id: 'councils-2',
      unitId: 'councils',
      title: 'Constantinople, 381',
      cards: [
        {
          id: 'councils-2-c1',
          heading: 'The Spirit’s turn',
          body:
            'Nicaea had settled the Son. Macedonius then taught that the Holy Spirit was created — the same error moved one Person along. The second ecumenical council met at Constantinople in 381 AD with 150 bishops, condemned it, and completed the Creed by confessing the Spirit as Lord and Giver of Life, who proceeds from the Father.',
          pull: '381 AD · 150 bishops · the Spirit confessed as Lord and Giver of Life.',
          glyph: 'Ⲕ',
          sources: ['lacopts-brief-history', 'suscopts-creed-facts'],
          reviewed: true,
        },
        {
          id: 'councils-2-c2',
          heading: 'An Alexandrian wrote that clause',
          body:
            'St. Timothy, the twenty-second Pope of Alexandria, was instrumental in composing the portion of the Creed about the Holy Spirit. Alexandria had now shaped both halves of the Creed the whole Church says.',
          sources: ['suscopts-creed-facts'],
          reviewed: true,
        },
        {
          id: 'councils-2-c3',
          heading: 'And no Filioque',
          body:
            'Centuries later the Latin West added *filioque* — "and the Son" — to the clause on the Spirit\'s procession. The Coptic Church, with the rest of Orthodoxy, has never accepted it: partly because it seemed to set two ultimate sources in the Godhead, and partly on the plain ground that a Creed agreed by an ecumenical council is not one church\'s to edit.',
          pull: 'The Spirit proceeds from the Father. The Creed is not amended.',
          sources: ['suscopts-filioque'],
          reviewed: true,
        },
      ],
      questions: [
        {
          id: 'councils-2-q1',
          kind: 'choice',
          tier: 'core',
          prompt: 'The Council of Constantinople (381) was called mainly to answer which error?',
          answer: 'That the Holy Spirit is created',
          options: [
            'That the Holy Spirit is created',
            'That the Son is created',
            'That Christ has two persons',
            'That icons must not be venerated',
          ],
          explain:
            'Macedonianism. The council confessed the Spirit as the Lord and Giver of Life, proceeding from the Father.',
          sources: ['lacopts-brief-history'],
          reviewed: true,
        },
        {
          id: 'councils-2-q2',
          kind: 'choice',
          tier: 'core',
          prompt: 'The Coptic Church rejects the Filioque. What does that word add to the Creed?',
          answer: '“and the Son” — to the Spirit’s procession',
          options: [
            '“and the Son” — to the Spirit’s procession',
            '“of one essence” — to the Son’s divinity',
            '“Mother of God” — to St. Mary',
            '“one nature” — to the Incarnate Word',
          ],
          explain:
            'The Church holds that the Spirit proceeds from the Father, as Constantinople confessed — and that no single church may amend a conciliar Creed.',
          sources: ['suscopts-filioque'],
          reviewed: true,
        },
        {
          id: 'councils-2-q3',
          kind: 'truefalse',
          tier: 'support',
          prompt: 'A Pope of Alexandria helped write the Creed’s clause on the Holy Spirit.',
          answer: 'True',
          options: [],
          explain:
            'St. Timothy, twenty-second Pope of Alexandria, was instrumental in that portion at Constantinople in 381.',
          sources: ['suscopts-creed-facts'],
          reviewed: true,
        },
      ],
    },
    {
      id: 'councils-3',
      unitId: 'councils',
      title: 'Ephesus, 431',
      cards: [
        {
          id: 'councils-3-c1',
          heading: 'Theotokos',
          body:
            'Nestorius, made archbishop of Constantinople in 428, refused to call St. Mary *Theotokos* — the one who gave birth to God — preferring a title that made her mother of the man only. The objection sounds like it is about her. It is about Him: to split the titles is to split Christ into two, one born of Mary and one not.',
          pull: 'The argument over her name is an argument about His unity.',
          glyph: 'Ⲉ',
          sources: ['lacopts-ephesus', 'synax-ephesus'],
          reviewed: true,
        },
        {
          id: 'councils-3-c2',
          heading: 'St. Cyril presides',
          body:
            'The third ecumenical council met at Ephesus in 431 AD with about 200 bishops, who elected St. Cyril of Alexandria — the twenty-fourth Pope — to preside. The council confirmed that the Virgin St. Mary gave birth to God the Word incarnate, and deposed Nestorius from his chair.',
          pull: '431 AD · about 200 bishops · St. Cyril of Alexandria presiding.',
          sources: ['lacopts-ephesus', 'synax-ephesus', 'synax-cyril'],
          reviewed: true,
        },
        {
          id: 'councils-3-c3',
          heading: 'Three, and no more',
          body:
            'Nicaea, Constantinople, Ephesus. These are the three ecumenical councils the Coptic Orthodox Church receives — and in the 1990 agreed statement both Orthodox families named them expressly as their common heritage. What happened at the fourth council is the whole of the next unit.',
          pull: 'The Coptic Church receives three ecumenical councils.',
          sources: ['chambesy-1990', 'lacopts-two-families'],
          reviewed: true,
        },
      ],
      questions: [
        {
          id: 'councils-3-q1',
          kind: 'choice',
          tier: 'core',
          prompt: 'Nestorius refused to call St. Mary *Theotokos* — the one who gave birth to God. Why did the Church treat that as an attack on Christ rather than on His mother?',
          answer: 'Because splitting her titles splits Him — one born of Mary, another not',
          options: [
            'Because splitting her titles splits Him — one born of Mary, another not',
            'Because it denied that she remained a virgin',
            'Because it lowered her below the apostles',
            'Because it questioned whether she was present at the Cross',
          ],
          explain:
            'This is the hinge of Unit III, and Unit IV will turn on it again. The objection sounds like it is about her. It is about Him: if the one she bore is not God the Word incarnate, then there are two Christs — and only one of them saves. Guarding her title is how the Church guards His unity.',
          sources: ['lacopts-ephesus'],
          reviewed: true,
        },
        {
          id: 'councils-3-q2',
          kind: 'order',
          tier: 'core',
          prompt: 'Put the three councils the Coptic Church receives in order.',
          answer: 'Nicaea 325 → Constantinople 381 → Ephesus 431',
          options: ['Nicaea 325', 'Constantinople 381', 'Ephesus 431'],
          explain:
            'The Son at Nicaea, the Spirit at Constantinople, the unity of Christ at Ephesus. Three councils, three questions, one Creed.',
          sources: ['lacopts-brief-history', 'chambesy-1990'],
          reviewed: true,
        },
        {
          id: 'councils-3-q3',
          kind: 'choice',
          tier: 'core',
          prompt: 'How many ecumenical councils does the Coptic Orthodox Church receive?',
          answer: 'Three',
          options: ['Three', 'Four', 'Seven', 'Twenty-one'],
          explain:
            'Three. The 1990 agreed statement records both Orthodox families accepting these three as their common heritage — the parting comes at the fourth.',
          sources: ['chambesy-1990'],
          reviewed: true,
        },
        {
          id: 'councils-3-q4',
          kind: 'truefalse',
          tier: 'support',
          prompt: 'St. Cyril of Alexandria presided at the Council of Ephesus.',
          answer: 'True',
          options: [],
          explain:
            'The assembled bishops elected him to preside. He was the twenty-fourth Pope of Alexandria.',
          sources: ['lacopts-ephesus', 'synax-cyril'],
          reviewed: true,
        },
      ],
    },
  ],
};
