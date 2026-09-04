/**
 * Unit IX — What We Hold in Silence.
 *
 * The unit the owner asked for by name: not only what Coptic theology answers,
 * but what it declines to answer and what it has not settled. Three categories
 * are kept strictly distinct, and the `standing` question kind exists for this
 * unit — the learner has to sort a real question into DEFINED, HELD IN MYSTERY,
 * or STILL DISPUTED.
 *
 * ⚠️ The discipline here is stricter than anywhere else in the course. A claim
 * that the Church "has no position" is as much a doctrinal claim as any other,
 * and is just as easy to get wrong. Every card below is limited to what a cited
 * source actually says — where the Church has been silent, this unit reports the
 * silence rather than filling it. Anything that could not be sourced was cut,
 * not softened. Owner review matters most on this unit.
 */
import type { FaithUnit } from '../types';

export const MYSTERY: FaithUnit = {
  id: 'mystery',
  numeral: 'IX',
  title: 'What We Hold in Silence',
  subtitle: 'What is defined, what is left as mystery, and what is genuinely still open.',
  glyph: 'Ⲱ',
  essentials: [
    'Sort a real question into defined, held in mystery, or still disputed — and say why the three differ.',
    'Recognise that an undefined question is not an unimportant one.',
    'Hold the Church’s certainties and its open questions without confusing either for the other.',
  ],
  creedClauseId: 'resurrection',
  lessons: [
    {
      id: 'mystery-1',
      unitId: 'mystery',
      title: 'Three Kinds of Question',
      cards: [
        {
          id: 'mystery-1-c1',
          heading: 'They are not the same thing',
          body:
            'A question can stand in three quite different places. **Defined**: the Church has settled it, usually because someone once denied it and the denial had consequences — that the Son is of one essence with the Father, that St. Mary is Theotokos, that the bread and wine truly become the Body and Blood. **Held in mystery**: the Church affirms *that* something is so and declines to define *how*. **Still disputed**: not settled, and known not to be — between churches, or between our own sources.',
          pull: 'Defined · Held in mystery · Still disputed. Confusing them is how error starts.',
          glyph: 'Ⲱ',
          sources: ['suscopts-real-presence', 'chambesy-1990'],
          reviewed: true,
        },
        {
          id: 'mystery-1-c2',
          heading: 'Why silence is a position',
          body:
            'The Orthodox habit of refusing to speculate is deliberate, not lazy. On the Eucharist the Church has generally declined philosophical explanation and rested on the status of the doctrine as a mystery — where the Latin West reached for Aristotle\'s substance and accident and produced transubstantiation. Both are answers to "how". One of them is: *we are not going to say.*',
          sources: ['suscopts-real-presence'],
          reviewed: true,
        },
      ],
      questions: [
        {
          id: 'mystery-1-q1',
          kind: 'standing',
          tier: 'core',
          prompt: 'That St. Mary is rightly called Theotokos.',
          answer: 'Defined',
          explain: 'Defined at Ephesus in 431 — one of the three councils the Coptic Church receives.',
          sources: ['lacopts-ephesus', 'synax-ephesus'],
          reviewed: true,
        },
        {
          id: 'mystery-1-q2',
          kind: 'standing',
          tier: 'core',
          prompt: 'How the bread and wine become the Body and Blood of Christ.',
          answer: 'Held in mystery',
          explain:
            'That they do is affirmed without qualification. How is left undefined — the Church has generally refrained from philosophical speculation here.',
          sources: ['suscopts-real-presence', 'copticchurch-eucharist'],
          reviewed: true,
        },
        {
          id: 'mystery-1-q3',
          kind: 'standing',
          tier: 'core',
          prompt: 'That the Son is of one essence with the Father.',
          answer: 'Defined',
          explain: 'Nicaea, 325. The council was convened precisely because Arius had denied it.',
          sources: ['lacopts-brief-history'],
          reviewed: true,
        },
      ],
    },
    {
      id: 'mystery-2',
      unitId: 'mystery',
      title: 'Where Our Own Sources Differ',
      cards: [
        {
          id: 'mystery-2-c1',
          heading: 'The dates move',
          body:
            'Through this course you have met four candidate years for St. Mark\'s arrival — 43, 48, 55, 60–61 — two for St. Anthony\'s departure, 355 in the Synaxarium and 356 in the diocesan history, and two for St. Pachomius, 348 and 346. These are not rival factions. They are the ordinary condition of ancient dating, reaching us through different reckonings.',
          pull: 'St. Mark: 43 · 48 · 55 · 60–61. Anthony: 355 · 356. Pachomius: 348 · 346.',
          glyph: 'Ⲇ',
          sources: ['lacopts-establishment', 'lacopts-history', 'synax-anthony', 'lacopts-monasticism', 'synax-pachomius'],
          reviewed: true,
        },
        {
          id: 'mystery-2-c2',
          heading: 'What this ought to teach',
          body:
            'That the Church is not staking its faith on a chronology. Nothing in the Creed depends on which year St. Mark landed. The confidence is placed on the confession and on the succession — and the years are held with an openness that is itself a kind of honesty. A tradition secure enough to print two dates is a tradition that is not bluffing.',
          sources: ['lacopts-establishment', 'suscopts-saint-mark'],
          reviewed: true,
        },
      ],
      questions: [
        {
          id: 'mystery-2-q1',
          kind: 'standing',
          tier: 'support',
          prompt: 'The year St. Pachomius departed.',
          answer: 'Still disputed',
          explain:
            'The Synaxarium gives 348; the diocesan history of Coptic monasticism gives about 292–346. Both are the Church’s own sources.',
          sources: ['synax-pachomius', 'lacopts-monasticism'],
          reviewed: true,
        },
        {
          id: 'mystery-2-q2',
          kind: 'truefalse',
          tier: 'core',
          prompt: 'Coptic sources agree on a single year for St. Mark’s arrival in Alexandria.',
          answer: 'False',
          options: [],
          explain:
            'They give about 43, 48, 55, and 60–61 — and two different diocesan pages can give two of them.',
          sources: ['lacopts-establishment', 'lacopts-history'],
          reviewed: true,
        },
      ],
    },
    {
      id: 'mystery-3',
      unitId: 'mystery',
      title: 'What Is Still Open Between Churches',
      cards: [
        {
          id: 'mystery-3-c1',
          heading: 'The unfinished agreement',
          body:
            'The Joint Commission found in 1990 that both Orthodox families have always held the same Christological faith in different terms. It then recommended that the anathemas be lifted, left jurisdiction to local churches, sent concelebration to a sub-committee, and asked for a period of preparation. Those recommendations have not been completed. The two families are still not in communion.',
          pull: 'The faith was agreed in 1990. The communion was not restored.',
          glyph: 'Ⲥ',
          sources: ['chambesy-1990', 'lacopts-two-families'],
          reviewed: true,
        },
        {
          id: 'mystery-3-c2',
          heading: 'One will, or two',
          body:
            'The clearest surviving difference. The Coptic Church, with Pope Shenouda III, teaches one will and one act in Christ. The Eastern Orthodox confess two wills, the human always freely consenting to the divine. The agreed statements addressed the union of the natures; this question was not on the page, and it remains open.',
          sources: ['shenouda-one-will', 'chambesy-1990'],
          reviewed: true,
        },
      ],
      questions: [
        {
          id: 'mystery-3-q1',
          kind: 'standing',
          tier: 'core',
          prompt: 'Whether the Eastern and Oriental Orthodox are in full communion.',
          answer: 'Still disputed',
          explain:
            'Not resolved. The 1990 statement asks for the anathemas to be lifted and for preparation; those steps are incomplete, and the families remain separated.',
          sources: ['chambesy-1990', 'lacopts-two-families'],
          reviewed: true,
        },
        {
          id: 'mystery-3-q2',
          kind: 'standing',
          tier: 'core',
          prompt: 'That the natures of Christ are united without confusion, change, division, or separation.',
          answer: 'Defined',
          explain:
            'Held by both Orthodox families, and set down in the same words in the Second Agreed Statement of 1990. Where the two families agree, they agree precisely.',
          sources: ['chambesy-1990'],
          reviewed: true,
        },
        {
          id: 'mystery-3-q3',
          kind: 'standing',
          tier: 'core',
          prompt: 'Whether Christ has one will or two.',
          answer: 'Still disputed',
          explain:
            'The Coptic Church teaches one will and one act; the Eastern Orthodox confess two. The dialogues did not reach it.',
          sources: ['shenouda-one-will', 'chambesy-1990'],
          reviewed: true,
        },
      ],
    },
    {
      id: 'mystery-4',
      unitId: 'mystery',
      title: 'Living With an Unfinished Answer',
      cards: [
        {
          id: 'mystery-4-c1',
          heading: 'What you have actually learned',
          body:
            'That the Coptic Church is apostolic and can name the apostle. That it receives three councils and can say why not four. That it is miaphysite and not monophysite, and that the difference is not a technicality. That it prays for the dead without teaching purgatory, affirms the Eucharist without explaining it, and signed an agreement in 1990 that it has not yet been able to complete.',
          glyph: '☩',
          sources: ['chambesy-1990', 'suscopts-real-presence', 'shenouda-nature-of-christ'],
          reviewed: true,
        },
        {
          id: 'mystery-4-c2',
          heading: 'And where to keep going',
          body:
            'This course is a map, not the country. Every card in it names its source, and those sources — the diocesan teaching sites, the Synaxarium, St. Athanasius, Pope Shenouda, the signed statements — are where the real reading is. If something here mattered to you, the honest next step is to go and read the page it came from.',
          pull: 'Every card in this course will show you its source. Go and read it.',
          sources: ['copticchurch-apostolic', 'athanasius-on-the-incarnation'],
          reviewed: true,
        },
      ],
      questions: [
        {
          id: 'mystery-4-q1',
          kind: 'choice',
          tier: 'core',
          prompt: 'Which best describes the Coptic Orthodox approach to questions it has not defined?',
          answer: 'It affirms what is revealed and declines to speculate beyond it',
          options: [
            'It affirms what is revealed and declines to speculate beyond it',
            'It leaves each bishop to decide',
            'It adopts whatever the Eastern Orthodox have defined',
            'It regards undefined questions as unimportant',
          ],
          explain:
            'The restraint is deliberate. The Church affirms the Eucharist and stops before the mechanism — the silence is guarded as carefully as the definitions.',
          sources: ['suscopts-real-presence'],
          reviewed: true,
        },
        {
          id: 'mystery-4-q2',
          kind: 'truefalse',
          tier: 'core',
          prompt: 'A question the Church has left undefined is a question the Church considers unimportant.',
          answer: 'False',
          options: [],
          explain:
            'The Eucharist is the centre of the Church’s life and its mechanism is undefined. Undefined is not unimportant — often it is the reverse.',
          sources: ['suscopts-real-presence', 'copticchurch-eucharist'],
          reviewed: true,
        },
      ],
    },
  ],
};
