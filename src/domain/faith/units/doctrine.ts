/**
 * Unit V — What We Believe.
 *
 * The doctrinal core: the Incarnation as St. Athanasius argued it, salvation as
 * the Orthodox describe it (corruption rather than inherited guilt; synergy
 * rather than faith alone), the saints and their intercession, the seven
 * mysteries, and what the Church says — and pointedly does not say — about the
 * Eucharist and about the dead.
 */
import type { FaithUnit } from '../types';

export const DOCTRINE: FaithUnit = {
  id: 'doctrine',
  numeral: 'V',
  title: 'What We Believe',
  subtitle: 'The Incarnation, salvation, the saints, and the seven mysteries.',
  glyph: 'Ⲑ',
  creedClauseId: 'crucified',
  lessons: [
    {
      id: 'doctrine-1',
      unitId: 'doctrine',
      title: 'The Incarnation',
      cards: [
        {
          id: 'doctrine-1-c1',
          heading: 'Athanasius’ argument',
          body:
            'St. Athanasius wrote *On the Incarnation* as a young man, and it remains the Coptic Church\'s clearest account of why God became man. The argument runs: humanity was made for incorruption and turned toward death; God would not simply revoke the consequence, nor abandon what He had made; so the Word took a body capable of death, and by dying in it destroyed death from the inside.',
          pull: 'He took what was ours so that we might receive what is His.',
          glyph: 'Ⲓ',
          sources: ['athanasius-on-the-incarnation'],
          reviewed: false,
        },
        {
          id: 'doctrine-1-c2',
          heading: 'Why the Christology mattered so much',
          body:
            'Hold Unit IV beside this and the stakes become obvious. If the Son is a creature, a creature died and nothing changed. If Christ is two, then one of them died and the other did not, and it is not God who has met death. The councils were not scholars arguing about words. They were the Church protecting the only account of salvation it had.',
          sources: ['athanasius-on-the-incarnation', 'shenouda-nature-of-christ'],
          reviewed: false,
        },
      ],
      questions: [
        {
          id: 'doctrine-1-q1',
          kind: 'choice',
          prompt: 'Who wrote *On the Incarnation*?',
          answer: 'St. Athanasius the Apostolic',
          options: [
            'St. Athanasius the Apostolic',
            'St. Cyril of Alexandria',
            'Origen',
            'St. Anthony the Great',
          ],
          explain:
            'He wrote it while still young — before the exiles, before the papacy — and it has been a theological beacon ever since.',
          sources: ['athanasius-on-the-incarnation'],
          reviewed: false,
        },
        {
          id: 'doctrine-1-q2',
          kind: 'truefalse',
          prompt: 'Coptic teaching holds that the Word took a body in order to destroy death from within it.',
          answer: 'True',
          options: [],
          explain:
            'That is the shape of Athanasius’ argument: a body capable of death, so that death could be undone in the one place it had no claim.',
          sources: ['athanasius-on-the-incarnation'],
          reviewed: false,
        },
      ],
    },
    {
      id: 'doctrine-2',
      unitId: 'doctrine',
      title: 'Salvation',
      cards: [
        {
          id: 'doctrine-2-c1',
          heading: 'Corruption, not inherited guilt',
          body:
            'Coptic teaching is that what passes from Adam is corruption — mortality, and a nature bent toward sin — rather than personal guilt for another\'s act. This is a real difference from the Augustinian West, and it changes the tone of everything downstream: salvation is described less as a verdict overturned and more as a nature healed.',
          pull: 'We inherit death, not blame.',
          glyph: 'Ⲥ',
          sources: ['suscopts-salvation'],
          reviewed: false,
        },
        {
          id: 'doctrine-2-c2',
          heading: 'Salvation is personal, and it is worked out',
          body:
            'Salvation is not inherited from believing parents; each person is joined to Christ by faith, baptism, chrismation, and the Eucharist, and begins a re-creation in the image of God. Nor is it faith alone: the Orthodox account is co-operation — God\'s grace is the whole cause, and the person\'s response is genuinely required. Repentance is not a single moment but the ordinary shape of a Christian life.',
          sources: ['suscopts-salvation', 'shenouda-comparative-theology'],
          reviewed: false,
        },
      ],
      questions: [
        {
          id: 'doctrine-2-q1',
          kind: 'choice',
          prompt: 'What does Coptic Orthodox teaching say we inherit from Adam?',
          answer: 'Corruption — mortality and a nature inclined to sin',
          options: [
            'Corruption — mortality and a nature inclined to sin',
            'Personal guilt for Adam’s sin',
            'Nothing at all',
            'A debt payable by good works',
          ],
          explain:
            'The distinction from inherited guilt is deliberate, and it is why Orthodox soteriology speaks of healing rather than acquittal.',
          sources: ['suscopts-salvation'],
          reviewed: false,
        },
        {
          id: 'doctrine-2-q2',
          kind: 'truefalse',
          prompt: 'In Coptic teaching, a person is saved by their parents’ faith and baptism.',
          answer: 'False',
          options: [],
          explain:
            'Salvation is individual — it needs this person’s repentance, faith, and the means of grace, whatever the parents received.',
          sources: ['suscopts-salvation'],
          reviewed: false,
        },
      ],
    },
    {
      id: 'doctrine-3',
      unitId: 'doctrine',
      title: 'St. Mary and the Saints',
      cards: [
        {
          id: 'doctrine-3-c1',
          heading: 'Intercession is not mediation',
          body:
            'The Coptic Church draws the line sharply. Christ\'s advocacy is *propitiatory* — He satisfies divine justice by His own sacrifice, and no one else can do it or share in it. What the saints offer is *supplicatory* intercession: prayer on our behalf. Asking a saint to pray for you is the same act as asking a friend to, extended to those who have finished their course.',
          pull: 'A saint prays for you. Christ redeems you. These are not the same verb.',
          glyph: 'Ⲙ',
          sources: ['lacopts-intercessions'],
          reviewed: false,
        },
        {
          id: 'doctrine-3-c2',
          heading: 'Why the departed can be asked at all',
          body:
            'Because they are not gone. The Church holds that the righteous are alive in paradise, that they know more than we do rather than less, and that death does not sever the bond of love between them and the Church on earth. The scriptural pattern cited is intercession itself — Abraham praying for Abimelech, Job for his friends, and the plain instruction to pray for one another.',
          sources: ['lacopts-intercessions'],
          reviewed: false,
        },
      ],
      questions: [
        {
          id: 'doctrine-3-q1',
          kind: 'choice',
          prompt: 'The Coptic Church distinguishes the saints’ intercession from Christ’s advocacy. The saints’ is:',
          answer: 'Supplicatory — prayer offered on our behalf',
          options: [
            'Supplicatory — prayer offered on our behalf',
            'Propitiatory — satisfying divine justice',
            'Substitutionary — taking our place',
            'Sacramental — conferring grace directly',
          ],
          explain:
            'Only Christ’s is propitiatory. The saints pray; they do not redeem. Coptic teaching is careful to keep the two words apart.',
          sources: ['lacopts-intercessions'],
          reviewed: false,
        },
        {
          id: 'doctrine-3-q2',
          kind: 'truefalse',
          prompt: 'Asking St. Mary to intercede is, in Coptic teaching, a form of worship offered to her.',
          answer: 'False',
          options: [],
          explain:
            'It is honour, not worship. Worship belongs to God alone; asking for prayer is what the Church does with all its living members, including those in paradise.',
          sources: ['lacopts-intercessions'],
          reviewed: false,
        },
      ],
    },
    {
      id: 'doctrine-4',
      unitId: 'doctrine',
      title: 'The Seven Mysteries',
      cards: [
        {
          id: 'doctrine-4-c1',
          heading: 'Seven',
          body:
            'Baptism, Chrismation, Confession, the Eucharist, Marriage, Priesthood, and the Anointing of the Sick. The Coptic Church calls them mysteries rather than sacraments — the Greek word behind both — because the point is not that something is being explained but that something invisible is really being given.',
          pull: 'Baptism · Chrismation · Confession · Eucharist · Marriage · Priesthood · Anointing of the Sick.',
          glyph: 'Ⲍ',
          sources: ['suscopts-sacraments'],
          reviewed: false,
        },
        {
          id: 'doctrine-4-c2',
          heading: 'Channels, not rewards',
          body:
            'The mysteries are described as the channels by which the grace and blessing of the Holy Spirit reach a person — some preventive, some curative, some sustaining. They are not marks of achievement handed out for progress; they are how the life of God is administered to a body that needs it.',
          sources: ['suscopts-sacraments'],
          reviewed: false,
        },
      ],
      questions: [
        {
          id: 'doctrine-4-q1',
          kind: 'choice',
          prompt: 'Which of these is NOT one of the seven mysteries?',
          answer: 'Pilgrimage',
          options: ['Pilgrimage', 'Chrismation', 'Anointing of the Sick', 'Priesthood'],
          explain:
            'The seven are Baptism, Chrismation, Confession, Eucharist, Marriage, Priesthood, and the Anointing of the Sick.',
          sources: ['suscopts-sacraments'],
          reviewed: false,
        },
        {
          id: 'doctrine-4-q2',
          kind: 'choice',
          prompt: 'Why does the Church prefer the word “mystery” to “sacrament”?',
          answer: 'Because an invisible grace is really given, not merely signified',
          options: [
            'Because an invisible grace is really given, not merely signified',
            'Because the rites are performed in secret',
            'Because their number has never been fixed',
            'Because they are reserved to monks',
          ],
          explain:
            'The mysteries of grace are those in which the Holy Spirit grants invisible gifts — the emphasis falls on the giving, not the sign.',
          sources: ['suscopts-sacraments'],
          reviewed: false,
        },
      ],
    },
    {
      id: 'doctrine-5',
      unitId: 'doctrine',
      title: 'The Eucharist, and the Departed',
      cards: [
        {
          id: 'doctrine-5-c1',
          heading: 'Real, and not explained',
          body:
            'The Coptic Church believes the bread and wine truly become the Body and Blood of Christ, at the priest\'s prayer for the descent of the Holy Spirit. It has deliberately not adopted a philosophical mechanism for how. Transubstantiation is a Roman Catholic account using Aristotle\'s categories of substance and accident; the Orthodox have generally declined to speculate and left the doctrine standing as a mystery.',
          pull: 'The change is affirmed. The mechanism is not defined.',
          glyph: 'Ⲉ',
          sources: ['suscopts-real-presence', 'copticchurch-eucharist'],
          reviewed: false,
        },
        {
          id: 'doctrine-5-c2',
          heading: 'Paradise and Hades — and no purgatory',
          body:
            'The Church teaches that Christ\'s death opened paradise, and that the spirits of the righteous are alive there, awaiting the general resurrection. It rejects purgatory: purging is the work of the Holy Spirit in repentance in this life, not a punishment served after death. And it prays for the departed — the Litany of the Departed asks that they be reposed in the bosom of the fathers, in a green pasture, by the water of rest.',
          pull: 'We pray for the dead. We do not teach a place of punishment where the prayers land.',
          sources: ['lacopts-intercessions', 'suscopts-salvation'],
          reviewed: false,
        },
      ],
      questions: [
        {
          id: 'doctrine-5-q1',
          kind: 'standing',
          prompt: 'How the bread and wine become the Body and Blood.',
          answer: 'Held in mystery',
          explain:
            'That they do is affirmed without hesitation. How is left undefined on purpose — the Church has declined to adopt a philosophical mechanism for it.',
          sources: ['suscopts-real-presence'],
          reviewed: false,
        },
        {
          id: 'doctrine-5-q2',
          kind: 'choice',
          prompt: 'The Coptic Church’s position on purgatory is that:',
          answer: 'It rejects it — purging happens through repentance in this life',
          options: [
            'It rejects it — purging happens through repentance in this life',
            'It accepts it under a different name',
            'It has never considered the question',
            'It applies only to those who died unbaptised',
          ],
          explain:
            'Purging is the work of the Holy Spirit in repentance now, not tormenting flames afterward. Prayers for the departed continue regardless.',
          sources: ['suscopts-salvation'],
          reviewed: false,
        },
        {
          id: 'doctrine-5-q3',
          kind: 'truefalse',
          prompt: 'Because it rejects purgatory, the Coptic Church does not pray for the dead.',
          answer: 'False',
          options: [],
          explain:
            'It prays for them in every liturgy. The Litany of the Departed is part of the ordinary rite — rejecting purgatory is not rejecting the prayer.',
          sources: ['lacopts-intercessions'],
          reviewed: false,
        },
      ],
    },
  ],
};
