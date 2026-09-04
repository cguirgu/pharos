/**
 * Unit VIII — The Church Now.
 *
 * How a Pope of Alexandria is actually chosen, and the three papacies that made
 * the modern Coptic Church: Kyrillos VI, Shenouda III, Tawadros II.
 */
import type { FaithUnit } from '../types';

export const TODAY: FaithUnit = {
  id: 'today',
  numeral: 'VIII',
  title: 'The Church Now',
  subtitle: 'How a Pope is chosen, and the three who shaped the century.',
  glyph: 'Ⲧ',
  essentials: [
    'Explain how a Pope of Alexandria is chosen, and what the method is meant to say.',
    'Recognise that the Church’s life did not stop with the fathers — it continues in living memory.',
  ],
  creedClauseId: 'spirit',
  lessons: [
    {
      id: 'today-1',
      unitId: 'today',
      title: 'The Altar Lot',
      cards: [
        {
          id: 'today-1-c1',
          heading: 'The last step is not a vote',
          body:
            'The Coptic Church narrows its candidates for the papacy by election — and then stops choosing. The three final names are placed in a chalice, sealed on the altar during the Divine Liturgy, and a blindfolded child draws one. The Church\'s position is that the last word belongs to God, and the mechanism is built so that no one can claim it belonged to them.',
          pull: 'Sealed on the altar. Drawn by a blindfolded child.',
          glyph: 'Ⲡ',
          sources: ['copticorthodox-tawadros', 'lacopts-tawadros'],
          reviewed: true,
        },
        {
          id: 'today-1-c2',
          heading: 'Pope Tawadros II',
          body:
            'On 4 November 2012 — his sixtieth birthday — his name was drawn from the chalice by a blindfolded boy, at a liturgy led by Metropolitan Pachomios, locum tenens of the see. He was enthroned on 18 November 2012 as the 118th Pope of Alexandria and successor of St. Mark.',
          pull: '118th Pope · drawn 4 November 2012 · enthroned 18 November 2012.',
          sources: ['copticorthodox-tawadros', 'lacopts-tawadros'],
          reviewed: true,
        },
      ],
      questions: [
        {
          id: 'today-1-q1',
          kind: 'choice',
          tier: 'core',
          prompt: 'How is the final choice of a Pope of Alexandria made?',
          answer: 'By lot — a blindfolded child draws a name from a chalice on the altar',
          options: [
            'By lot — a blindfolded child draws a name from a chalice on the altar',
            'By a majority vote of the Holy Synod',
            'By the outgoing Pope naming a successor',
            'By seniority among the metropolitans',
          ],
          explain:
            'Election narrows the field to three; the altar lot decides among them. The Church deliberately removes the last decision from human hands.',
          sources: ['copticorthodox-tawadros'],
          reviewed: true,
        },
        {
          id: 'today-1-q2',
          kind: 'choice',
          tier: 'core',
          prompt: 'Pope Tawadros II is counted the 118th Pope of Alexandria. What does that number actually assert?',
          answer: 'That the line of laying-on of hands from St. Mark has never been broken',
          options: [
            'That the line of laying-on of hands from St. Mark has never been broken',
            'That 118 popes have been canonised as saints',
            'That the Church has existed for 118 generations',
            'That 118 councils have been held at Alexandria',
          ],
          explain:
            'This is Unit I\'s claim about apostolicity, still being counted. The Church numbers its popes because the number is the claim: one continuous succession of hands from the evangelist who founded the see to the man who holds it now.',
          sources: ['copticorthodox-tawadros', 'lacopts-tawadros'],
          reviewed: true,
        },
      ],
    },
    {
      id: 'today-2',
      unitId: 'today',
      title: 'Kyrillos VI and Zeitoun',
      cards: [
        {
          id: 'today-2-c1',
          heading: 'The 116th Pope',
          body:
            'Pope Kyrillos VI led the Church from 1959 to 1971 — a monk and a hermit before he was a patriarch, and remembered as both practical and mystical. His papacy is the hinge on which the modern revival of Coptic monasticism turns.',
          pull: 'Pope Kyrillos VI, 116th Pope, 1959–1971.',
          glyph: 'Ⲕ',
          sources: ['lacopts-kyrillos'],
          reviewed: true,
        },
        {
          id: 'today-2-c2',
          heading: 'Zeitoun, 1968',
          body:
            'On 2 April 1968, during his papacy, luminous appearances of the Virgin began over the domes of her church at Zeitoun, a suburb of Cairo. They continued on following nights for hours at a time, before crowds of every race and religion — a Muslim mechanic was among the first to see. It came a year after the country\'s defeat in the 1967 war, and the Church entered it into the Synaxarium on 24 Baramhat.',
          pull: 'Zeitoun, from 2 April 1968 · commemorated 24 Baramhat.',
          sources: ['synax-zeitoun', 'lacopts-kyrillos'],
          reviewed: true,
        },
      ],
      questions: [
        {
          id: 'today-2-q2',
          kind: 'truefalse',
          tier: 'core',
          prompt: 'Only Coptic Christians reported seeing the apparitions at Zeitoun.',
          answer: 'False',
          options: [],
          explain:
            'They were witnessed by crowds of every race and religion; a Muslim mechanic was among the first to report them.',
          sources: ['synax-zeitoun', 'lacopts-kyrillos'],
          reviewed: true,
        },
        {
          id: 'today-2-q3',
          kind: 'choice',
          tier: 'support',
          prompt: 'What was Pope Kyrillos VI before he was patriarch?',
          answer: 'A monk and a hermit',
          options: ['A monk and a hermit', 'A parish priest in Cairo', 'A professor of theology', 'A bishop of Alexandria'],
          explain:
            'Remembered as both practical and mystical, and his papacy (1959–1971) is the hinge on which the modern revival of Coptic monasticism turns.',
          sources: ['lacopts-kyrillos'],
          reviewed: true,
        },
      ],
    },
    {
      id: 'today-3',
      unitId: 'today',
      title: 'Pope Shenouda III',
      cards: [
        {
          id: 'today-3-c1',
          heading: 'The teaching papacy',
          body:
            'Pope Shenouda III succeeded Kyrillos VI in 1971 as the 117th Pope. His papacy is the one this course quotes most: *The Nature of Christ*, *Comparative Theology*, and the christological work behind the agreed statements of 1988–1990. Much of what an English-speaking Copt today knows about their own doctrine, they know in his words.',
          pull: '117th Pope, from 1971. The Church’s most-published teacher.',
          glyph: 'Ϣ',
          sources: ['shenouda-nature-of-christ', 'shenouda-comparative-theology', 'lacopts-kyrillos'],
          reviewed: true,
        },
        {
          id: 'today-3-c2',
          heading: 'And a Church that had to travel',
          body:
            'The same century scattered the Coptic Church across the world — dioceses in North America, Europe, Australia, and Africa, where none had existed. The diocesan sites this course cites are themselves a product of that: Los Angeles and the Southern United States teaching Coptic doctrine in English, because that is now a language the Church has to teach it in.',
          sources: ['lacopts-history', 'copticorthodox-what-is-coc'],
          reviewed: true,
        },
      ],
      questions: [
        {
          id: 'today-3-q1',
          kind: 'order',
          tier: 'support',
          prompt: 'Put these three Popes of Alexandria in order.',
          answer: 'Kyrillos VI → Shenouda III → Tawadros II',
          options: ['Kyrillos VI', 'Shenouda III', 'Tawadros II'],
          explain:
            'The 116th, 117th and 118th successors of St. Mark: 1959–1971, from 1971, and from 2012.',
          sources: ['lacopts-kyrillos', 'copticorthodox-tawadros'],
          reviewed: true,
        },
        {
          id: 'today-3-q2',
          kind: 'choice',
          tier: 'core',
          prompt: 'Why do English-language diocesan sites — Los Angeles, the Southern United States — exist at all?',
          answer: 'Because the twentieth century scattered the Coptic Church worldwide, and it now has to teach its doctrine in English',
          options: [
            'Because the twentieth century scattered the Coptic Church worldwide, and it now has to teach its doctrine in English',
            'Because the Coptic language was abandoned by the Church',
            'Because the Holy Synod moved its seat out of Egypt',
            'Because English became a liturgical language of the Church',
          ],
          explain:
            'Dioceses now stand in North America, Europe, Australia and across Africa where none existed. The sources this whole course cites are themselves a product of that scattering.',
          sources: ['lacopts-history', 'copticorthodox-what-is-coc'],
          reviewed: true,
        },
      ],
    },
  ],
};
