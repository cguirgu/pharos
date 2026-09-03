/**
 * Unit IV — Chalcedon and the Two Families.
 *
 * The unit this whole course exists for: what happened in 451, why "Monophysite"
 * is a word the Coptic Church rejects for itself, who is in each family of
 * Orthodox, what the modern dialogues actually agreed — and, honestly, what they
 * did not.
 *
 * ⚠️ This is the most contested material in the course. Every card is written
 * from a named official source, and the two cards on what remains unresolved are
 * written from the signed 1990 statement rather than from any commentary on it.
 */
import type { FaithUnit } from '../types';

export const CHALCEDON: FaithUnit = {
  id: 'chalcedon',
  numeral: 'IV',
  title: 'Chalcedon and the Two Families',
  subtitle: 'The parting of 451 — what it was about, and what is still open.',
  glyph: 'Ⲇ',
  creedClauseId: 'incarnate',
  lessons: [
    {
      id: 'chalcedon-1',
      unitId: 'chalcedon',
      title: 'What Happened in 451',
      cards: [
        {
          id: 'chalcedon-1-c1',
          heading: 'Before the council',
          body:
            'Pope Dioscorus, the twenty-fifth of Alexandria, took the see in 444 AD. In 449 a council met again at Ephesus — 135 bishops, led by Dioscorus — which rejected the Tome of Leo, the letter in which the Bishop of Rome set out the language of two natures. Two years later the Emperor summoned a new council at Chalcedon.',
          pull: 'Pope Dioscorus, 25th of Alexandria, from 444 AD.',
          glyph: 'Ⲇ',
          sources: ['copticorthodox-dioscorus', 'suscopts-post-chalcedon'],
          reviewed: false,
        },
        {
          id: 'chalcedon-1-c2',
          heading: 'Deposed and exiled',
          body:
            'Chalcedon, in 451 AD, adopted the two-natures formula and deposed Dioscorus. He was exiled to Gangra, an island off Paphlagonia on the coast of Asia Minor, and stayed there five years until his departure in 454. The Coptic Church has never recognised the deposition: it commemorates him as a saint and calls him a champion of orthodoxy.',
          pull: 'Exiled to Gangra · departed 454 · commemorated as a saint.',
          sources: ['copticorthodox-dioscorus', 'synax-dioscorus'],
          reviewed: false,
        },
        {
          id: 'chalcedon-1-c3',
          heading: 'What actually divided',
          body:
            'The Coptic Church, with the Syriac, Armenian, and the other Oriental Orthodox Churches, did not accept Chalcedon\'s formula. From the Coptic side the objection was that the new wording risked dividing the one Christ into two — the very thing Ephesus had just condemned in Nestorius. Fifteen hundred years of separation follow from a disagreement about how to say something both sides insist they believe.',
          sources: ['copticorthodox-dioscorus', 'lacopts-two-families'],
          reviewed: false,
        },
      ],
      questions: [
        {
          id: 'chalcedon-1-q1',
          kind: 'choice',
          prompt: 'Where was Pope Dioscorus exiled after Chalcedon?',
          answer: 'Gangra',
          options: ['Gangra', 'Patmos', 'Trier', 'Cyprus'],
          explain:
            'An island off Paphlagonia, on the coast of Asia Minor. He remained there until his departure in 454.',
          sources: ['copticorthodox-dioscorus'],
          reviewed: false,
        },
        {
          id: 'chalcedon-1-q2',
          kind: 'choice',
          prompt: 'The Tome of Leo was:',
          answer: 'A letter from the Bishop of Rome setting out the two-natures language',
          options: [
            'A letter from the Bishop of Rome setting out the two-natures language',
            'The decree deposing Nestorius',
            'St. Cyril’s reply to the Antiochenes',
            'The canon list of the Council of Nicaea',
          ],
          explain:
            'The council of 449 at Ephesus, led by Dioscorus, rejected it; Chalcedon in 451 received it.',
          sources: ['copticorthodox-dioscorus'],
          reviewed: false,
        },
        {
          id: 'chalcedon-1-q3',
          kind: 'order',
          prompt: 'Put these in order.',
          answer: 'Ephesus 431 → Second Ephesus 449 → Chalcedon 451 → Dioscorus departs 454',
          options: ['Ephesus 431', 'Second Ephesus 449', 'Chalcedon 451', 'Dioscorus departs 454'],
          explain:
            'Twenty years separate the council Alexandria led from the council that deposed its Pope.',
          sources: ['copticorthodox-dioscorus', 'lacopts-ephesus'],
          reviewed: false,
        },
      ],
    },
    {
      id: 'chalcedon-2',
      unitId: 'chalcedon',
      title: 'Miaphysite, Not Monophysite',
      cards: [
        {
          id: 'chalcedon-2-c1',
          heading: 'The word the Church rejects for itself',
          body:
            '*Monophysite* was applied to the Oriental Orthodox by their opponents and means, in the sense they intended, that Christ has one nature because the human was absorbed or lost. That is the teaching of Eutyches — and the Coptic Church anathematizes Eutyches. The signed agreed statement condemns Nestorius and Eutyches together, in one sentence.',
          pull: 'We anathematize the doctrines of both Nestorius and Eutyches.',
          glyph: 'Ⲭ',
          sources: ['shenouda-agreed-statement', 'shenouda-nature-of-christ'],
          reviewed: false,
        },
        {
          id: 'chalcedon-2-c2',
          heading: 'What the Church does confess',
          body:
            'The Coptic formula comes from St. Cyril: *one incarnate nature of God the Word*. One nature out of two — divine and human — united in the womb of the Virgin without mixture, without mingling, without confusion, and never separated. The word used for this is *miaphysite*: not "only one nature", but "one united nature", which is a different claim entirely.',
          pull: 'Perfect in His divinity, perfect in His humanity — not separated for a moment or the twinkling of an eye.',
          sources: ['shenouda-nature-of-christ', 'shenouda-agreed-statement'],
          reviewed: false,
        },
        {
          id: 'chalcedon-2-c3',
          heading: 'Pope Shenouda’s question',
          body:
            'To the charge that Alexandria denies one of Christ\'s natures, Pope Shenouda III asked simply: which of the two would we be denying? Not the divine — Alexandria is the Church that fought Arius for a century over exactly that. Not the human — that is what the Incarnation is for. The accusation, put plainly, does not survive contact with the Church\'s own history.',
          sources: ['shenouda-nature-of-christ'],
          reviewed: false,
        },
      ],
      questions: [
        {
          id: 'chalcedon-2-q1',
          kind: 'choice',
          prompt: 'Whose teaching does the term “Monophysite” properly describe — the one the Coptic Church anathematizes?',
          answer: 'Eutyches',
          options: ['Eutyches', 'Nestorius', 'Arius', 'Macedonius'],
          explain:
            'Eutyches held that the humanity was absorbed into the divinity. The Coptic Church condemns him, alongside Nestorius, in the same breath.',
          sources: ['shenouda-agreed-statement'],
          reviewed: false,
        },
        {
          id: 'chalcedon-2-q2',
          kind: 'choice',
          prompt: 'The miaphysite formula the Coptic Church confesses comes from which father?',
          answer: 'St. Cyril of Alexandria',
          options: [
            'St. Cyril of Alexandria',
            'St. Athanasius the Apostolic',
            'St. Anthony the Great',
            'St. Basil the Great',
          ],
          explain:
            '“One incarnate nature of God the Word” is St. Cyril’s phrase — which is why the Coptic Church regards its Christology as simply Ephesus, kept.',
          sources: ['shenouda-nature-of-christ'],
          reviewed: false,
        },
        {
          id: 'chalcedon-2-q3',
          kind: 'truefalse',
          prompt: 'The Coptic Church teaches that Christ’s humanity was absorbed into His divinity.',
          answer: 'False',
          options: [],
          explain:
            'That is Eutychianism, which the Church anathematizes. The union is without mixture, mingling, or confusion — both remain whole.',
          sources: ['shenouda-nature-of-christ', 'shenouda-agreed-statement'],
          reviewed: false,
        },
        {
          id: 'chalcedon-2-q4',
          kind: 'choice',
          prompt: 'Which set of words does the Coptic Church use for how the two natures are united?',
          answer: 'Without mixture, without mingling, without confusion',
          options: [
            'Without mixture, without mingling, without confusion',
            'By adoption and indwelling',
            'By appearance only',
            'In sequence, divinity then humanity',
          ],
          explain:
            'And never separated — “not for a moment nor the twinkling of an eye” is the phrase the Church repeats.',
          sources: ['shenouda-agreed-statement'],
          reviewed: false,
        },
      ],
    },
    {
      id: 'chalcedon-3',
      unitId: 'chalcedon',
      title: 'Oriental and Eastern',
      cards: [
        {
          id: 'chalcedon-3-c1',
          heading: 'Two families, not one word apart in name only',
          body:
            'The **Oriental Orthodox** — the non-Chalcedonian family — are the Coptic Orthodox Church, the Syriac Orthodox Patriarchate of Antioch, the Armenian Catholicosates, the Malankara Orthodox Syrian Church, and the Ethiopian Orthodox Church. The **Eastern (Byzantine) Orthodox** — the Chalcedonian family — are the Ecumenical Patriarchate, the Greek Patriarchates, and the Russian, Romanian, Serbian, Bulgarian and Georgian Patriarchates, among others.',
          pull: 'Oriental = non-Chalcedonian. Eastern = Chalcedonian. Both are Orthodox.',
          glyph: 'Ⲃ',
          sources: ['lacopts-two-families'],
          reviewed: false,
        },
        {
          id: 'chalcedon-3-c2',
          heading: 'The one difference, stated carefully',
          body:
            'It is not that one family believes in Christ\'s divinity and the other in His humanity. Both confess both. The difference is in which grammar is used to hold them together: the Eastern Orthodox say two natures in one person, the Oriental Orthodox say one united divine-human nature. The Joint Commission put it in a single sentence — those who speak of two natures do not thereby deny the union, and those who speak of one united nature do not thereby deny the continuing presence of the divine and the human.',
          sources: ['lacopts-two-families'],
          reviewed: false,
        },
      ],
      questions: [
        {
          id: 'chalcedon-3-q1',
          kind: 'choice',
          prompt: 'Which of these is an Oriental Orthodox church?',
          answer: 'The Armenian Apostolic Church',
          options: [
            'The Armenian Apostolic Church',
            'The Russian Orthodox Church',
            'The Church of Greece',
            'The Romanian Patriarchate',
          ],
          explain:
            'The Oriental Orthodox family is Coptic, Syriac, Armenian, Malankara, Ethiopian (and Eritrean). The other three named here are Eastern Orthodox.',
          sources: ['lacopts-two-families'],
          reviewed: false,
        },
        {
          id: 'chalcedon-3-q2',
          kind: 'truefalse',
          prompt: '“Oriental Orthodox” and “Eastern Orthodox” are two names for the same family of churches.',
          answer: 'False',
          options: [],
          explain:
            'They are two distinct families, divided since Chalcedon in 451 — and not in communion with one another, even now.',
          sources: ['lacopts-two-families'],
          reviewed: false,
        },
        {
          id: 'chalcedon-3-q3',
          kind: 'choice',
          prompt: 'The Eastern Orthodox express the union of Christ’s natures as:',
          answer: 'Two natures in one person',
          options: [
            'Two natures in one person',
            'One united divine-human nature',
            'Two persons in one nature',
            'One nature and one person, the human absorbed',
          ],
          explain:
            'And the Oriental Orthodox say one united divine-human nature. The Joint Commission found these to be the same faith in different terminology.',
          sources: ['lacopts-two-families'],
          reviewed: false,
        },
      ],
    },
    {
      id: 'chalcedon-4',
      unitId: 'chalcedon',
      title: 'The Dialogues, and What They Settled',
      cards: [
        {
          id: 'chalcedon-4-c1',
          heading: 'Fifty years of talking',
          body:
            'Unofficial consultations ran from 1964 to 1971 — Aarhus, Bristol, Geneva, Addis Ababa. The official Joint Commission then met at Chambésy in 1985, at the Monastery of Anba Bishoy in Egypt in 1989, at Chambésy again from 23 to 28 September 1990, and once more in 1993.',
          pull: '1964–71 unofficial · 1985, 1989, 1990, 1993 official.',
          glyph: 'Ⲥ',
          sources: ['lacopts-two-families', 'chambesy-1990'],
          reviewed: false,
        },
        {
          id: 'chalcedon-4-c2',
          heading: 'What the Second Agreed Statement says',
          body:
            'The 1990 statement records both families confessing that the natures are united hypostatically and naturally — without confusion, without change, without division, without separation; that the Logos became composite by uniting His divine uncreated nature with created human nature; and that they hold the first three ecumenical councils as their common heritage. It concludes that both families have always maintained the same Orthodox Christological faith, in different terms.',
          pull: 'The same faith, in two vocabularies — signed, by both.',
          sources: ['chambesy-1990', 'lacopts-two-families'],
          reviewed: false,
        },
        {
          id: 'chalcedon-4-c3',
          heading: 'And what it did not do',
          body:
            'The statement recommends that all the anathemas and condemnations of the past be lifted by the churches — each deciding for itself how. It does not lift them. It leaves jurisdiction to local churches, sends concelebration to a sub-committee, and says a period of intense preparation of the people is needed first. Thirty-five years on, the two families are still not in communion. The theology was agreed. The rest was not.',
          pull: 'Agreement is signed. Communion is not restored.',
          sources: ['chambesy-1990', 'lacopts-two-families'],
          reviewed: false,
        },
      ],
      questions: [
        {
          id: 'chalcedon-4-q1',
          kind: 'choice',
          prompt: 'Where and when was the Second Agreed Statement of the Joint Commission signed?',
          answer: 'Chambésy, September 1990',
          options: [
            'Chambésy, September 1990',
            'Anba Bishoy Monastery, June 1989',
            'Addis Ababa, 1971',
            'Vienna, 1976',
          ],
          explain:
            'The first agreed statement was at Anba Bishoy in June 1989; the second at Chambésy, 23–28 September 1990.',
          sources: ['chambesy-1990'],
          reviewed: false,
        },
        {
          id: 'chalcedon-4-q2',
          kind: 'standing',
          prompt: 'Whether the mutual anathemas between the Eastern and Oriental Orthodox have been lifted.',
          answer: 'Still disputed',
          explain:
            'The 1990 statement *recommends* that both families lift them, each in its own manner. Recommending is not doing. The churches are still not in communion.',
          sources: ['chambesy-1990', 'lacopts-two-families'],
          reviewed: false,
        },
        {
          id: 'chalcedon-4-q3',
          kind: 'truefalse',
          prompt: 'Because the 1990 statement found a common Christological faith, the two families are now in full communion.',
          answer: 'False',
          options: [],
          explain:
            'They are not. The statement itself asks for the anathemas to be lifted and for a period of preparation; jurisdiction and concelebration were left unresolved.',
          sources: ['chambesy-1990', 'lacopts-two-families'],
          reviewed: false,
        },
      ],
    },
    {
      id: 'chalcedon-5',
      unitId: 'chalcedon',
      title: 'One Will, or Two',
      cards: [
        {
          id: 'chalcedon-5-c1',
          heading: 'A real difference that survives the agreement',
          body:
            'Pope Shenouda III taught that as the Incarnate Logos has one nature, so the will and the act are each one. His argument: sin is precisely the conflict of a human will with God\'s, and Christ is sinless, so no such division can be in Him; a divided will would mean internal conflict in the one who is our guide.',
          pull: '“We believe in One Will and One Act.” — Pope Shenouda III',
          glyph: 'Ⲱ',
          sources: ['shenouda-one-will'],
          reviewed: false,
        },
        {
          id: 'chalcedon-5-c2',
          heading: 'Why this is worth knowing',
          body:
            'The Eastern Orthodox, following a later council the Coptic Church does not receive, confess two wills in Christ — divine and human — with the human freely and always consenting to the divine. Both sides are guarding the same thing from opposite directions: one against dividing Christ, the other against thinning His humanity. It is the clearest example of what the dialogues did and did not reach. The Christology was agreed; this was not on the page.',
          sources: ['shenouda-one-will', 'chambesy-1990'],
          reviewed: false,
        },
      ],
      questions: [
        {
          id: 'chalcedon-5-q1',
          kind: 'choice',
          prompt: 'Pope Shenouda III’s argument for one will in Christ rests chiefly on:',
          answer: 'That sin is a conflict of wills, and Christ is sinless',
          options: [
            'That sin is a conflict of wills, and Christ is sinless',
            'That Christ’s humanity was incomplete',
            'That the Father’s will overrode the Son’s',
            'That the human will slept during the Passion',
          ],
          explain:
            'He reasons from sinlessness: where there is no conflict between the human and the divine, the will is one. The humanity is not diminished by it.',
          sources: ['shenouda-one-will'],
          reviewed: false,
        },
        {
          id: 'chalcedon-5-q2',
          kind: 'standing',
          prompt: 'Whether Christ has one will or two.',
          answer: 'Still disputed',
          explain:
            'The Coptic Church teaches one will and one act; the Eastern Orthodox confess two wills, the human always consenting. The agreed statements did not resolve this — they addressed the natures.',
          sources: ['shenouda-one-will', 'chambesy-1990'],
          reviewed: false,
        },
      ],
    },
  ],
};
