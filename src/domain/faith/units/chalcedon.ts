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
  essentials: [
    'Trace the line from Nestorius to Chalcedon, and say what the Coptic Church objected to.',
    'State the Coptic confession — one nature out of two — and name the four ways of getting Christ wrong that it refuses.',
    'Say why *miaphysite* and *monophysite* are not the same word, and which one the Church anathematizes.',
    'Name the two families of Orthodox, what the 1990 statement settled, and what it did not.',
  ],
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
            'The Diocese of Los Angeles puts the line plainly: Nestorius\'s refusal of "Mother of God" "led to the inference of the dual nature of the Lord Jesus; His divinity and His humanity. This dualism was decreed in the Council of Chalcedon in 451 A.D., in spite of the objection of the Coptic Pope Dioscorus." The Church then "was divided into two groups: Rome and Constantinople, who accepted the doctrine of two united natures, on one side, and Alexandria and Antioch who held the belief of one nature out of two natures of the Incarnate Lord."',
          pull: 'Two united natures · or one nature out of two natures.',
          sources: ['copticorthodox-dioscorus', 'lacopts-two-families'],
          reviewed: false,
        },
      ],
      questions: [
        {
          id: 'chalcedon-1-q0',
          kind: 'choice',
          tier: 'core',
          prompt: 'In one line, what divided the Church at Chalcedon in 451?',
          answer: 'Rome and Constantinople held two united natures; Alexandria and Antioch held one nature out of two natures',
          options: [
            'Rome and Constantinople held two united natures; Alexandria and Antioch held one nature out of two natures',
            'Rome held that Christ was divine; Alexandria held that He was human',
            'Alexandria rejected the divinity of the Holy Spirit',
            'Alexandria refused to accept the Nicene Creed',
          ],
          explain:
            'Memorise this pairing — it is the whole division in one sentence, in the diocese\'s own words. Both sides confess Christ fully God and fully man. They divide on how the union is *said*: two united natures, or one nature out of two.',
          sources: ['lacopts-brief-history', 'copticorthodox-dioscorus'],
          reviewed: false,
        },
        {
          id: 'chalcedon-1-q1b',
          kind: 'choice',
          tier: 'core',
          prompt: 'Why did Alexandria hear Chalcedon’s wording as dangerous, so soon after Ephesus?',
          answer: 'Because it sounded like the dualism Ephesus had just condemned in Nestorius, returning with official approval',
          options: [
            'Because it sounded like the dualism Ephesus had just condemned in Nestorius, returning with official approval',
            'Because it denied that Christ was born of the Virgin',
            'Because it added the Filioque to the Creed',
            'Because it placed Constantinople above Alexandria in rank',
          ],
          explain:
            'Twenty years earlier Alexandria had led the Church in condemning Nestorius for dividing Christ. When Chalcedon then decreed language of two natures, Alexandria read it as the same dualism coming back — which is why the objection was fierce rather than academic.',
          sources: ['lacopts-brief-history', 'copticorthodox-dioscorus'],
          reviewed: false,
        },
        {
          id: 'chalcedon-1-q2',
          kind: 'choice',
          tier: 'support',
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
          tier: 'support',
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
          tier: 'core',
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
          tier: 'core',
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
          tier: 'core',
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
          tier: 'core',
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
      id: 'chalcedon-2b',
      unitId: 'chalcedon',
      title: 'Four Ways to Get Christ Wrong',
      cards: [
        {
          id: 'chalcedon-2b-c1',
          heading: 'The Church rejects four errors, not one',
          body:
            'Pope Shenouda III sets the Coptic confession against four named heresies, and they fail in four different directions. **Arius** made Christ a creature — pre-eminent, but made. **Apollinarius** taught that the Divinity of the Word replaced the human spirit in Him. **Nestorius** distinguished Jesus from God the Logos, as though the Logos merely dwelt in a man born of a woman. **Eutyches** taught that the human nature was absorbed and dissolved in the Divine, "as a drop of vinegar in the ocean".',
          pull: 'Not fully God · not fully man · divided in two · humanity dissolved.',
          glyph: 'Ⲇ',
          sources: ['shenouda-nature-of-christ'],
          reviewed: false,
        },
        {
          id: 'chalcedon-2b-c2',
          heading: 'Iron in the fire',
          body:
            'Pope Shenouda\'s image for the union: ignited iron. We do not say there are two natures here, iron and fire — we say iron united with fire. The iron is not changed into fire, nor fire into iron; they are united without mingling, confusion or alteration, and the ignited iron keeps every property of iron and every property of fire at once. St. Cyril and St. Dioscorus used the same kind of image with the soul and the body: one human nature, neither soul alone nor body alone.',
          pull: 'One glowing iron. All the properties of both. Nothing lost, nothing blended.',
          sources: ['shenouda-nature-of-christ'],
          reviewed: false,
        },
      ],
      questions: [
        {
          id: 'chalcedon-2b-q1',
          kind: 'choice',
          tier: 'core',
          prompt: 'Arius and Apollinarius fail in opposite directions. Which pair states them correctly?',
          answer: 'Arius denied that Christ is fully God; Apollinarius denied that He is fully man',
          options: [
            'Arius denied that Christ is fully God; Apollinarius denied that He is fully man',
            'Arius denied that Christ is fully man; Apollinarius denied that He is fully God',
            'Both denied that Christ has a human body',
            'Both denied that Christ was born of the Virgin',
          ],
          explain:
            'Arius made the Son a creature. Apollinarius taught that the Divinity of the Word replaced the human spirit in Him — a body without a full human mind. One error empties the divinity, the other empties the humanity.',
          sources: ['shenouda-nature-of-christ'],
          reviewed: false,
        },
        {
          id: 'chalcedon-2b-q2',
          kind: 'choice',
          tier: 'core',
          prompt: 'Nestorius and Eutyches also fail in opposite directions. Which pair states them correctly?',
          answer: 'Nestorius divided Christ into two; Eutyches dissolved the humanity into the divinity',
          options: [
            'Nestorius divided Christ into two; Eutyches dissolved the humanity into the divinity',
            'Nestorius dissolved the humanity; Eutyches divided Christ into two',
            'Both taught that Christ was only a man',
            'Both taught that Christ had no human will',
          ],
          explain:
            'Nestorius spoke as though the Logos merely dwelt in a man born of a woman. Eutyches said the humanity was absorbed "as a drop of vinegar in the ocean". The Coptic confession — one nature out of two, without mingling or confusion — is the narrow path between dividing Him and blending Him.',
          sources: ['shenouda-nature-of-christ'],
          reviewed: false,
        },
        {
          id: 'chalcedon-2b-q3',
          kind: 'choice',
          tier: 'core',
          prompt: 'In the image of iron in the fire, what is the point of saying the iron keeps every property of iron and the fire every property of fire?',
          answer: 'That nothing of either nature is lost or blended in the union',
          options: [
            'That nothing of either nature is lost or blended in the union',
            'That the divinity is stronger than the humanity',
            'That the union lasts only while the fire burns',
            'That the two natures take turns acting',
          ],
          explain:
            'It is a guard against Eutyches on one side and Nestorius on the other. One glowing iron — you cannot pull the fire back out of it, and you cannot say the iron stopped being iron.',
          sources: ['shenouda-nature-of-christ'],
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
          tier: 'core',
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
          tier: 'core',
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
          tier: 'core',
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
          id: 'chalcedon-4-q2',
          kind: 'standing',
          tier: 'core',
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
          tier: 'core',
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
          tier: 'core',
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
          tier: 'core',
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
