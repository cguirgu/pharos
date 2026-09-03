/**
 * The Faith course's SOURCE REGISTRY — every teaching card and every question
 * in `src/domain/faith/units/*` must cite at least one entry here, and the
 * structural test (`__tests__/faith/sources.test.ts`) fails the build if one
 * does not. This is the machine-readable half of the project's golden rule
 * (docs/CONTENT-SOURCES.md): *ship only verified, official text; never invent.*
 *
 * ⚠️ ACCURACY: unlike the Coptic-language course — where letter forms and
 * phonetic values are structural linguistic facts — this course teaches
 * DOCTRINE and HISTORY. Nothing here is safe to paraphrase from memory. Each
 * card is written from the cited source and carries `reviewed: false` until the
 * project owner (Coptic Orthodox) signs it off; unreviewed cards are hidden
 * behind `FAITH_SHOW_UNREVIEWED` (src/content/flags.ts).
 *
 * `tier` records how much weight a source carries when two disagree:
 *   'official'  — a diocese, the Papal see, or a signed inter-church statement
 *   'synaxarium'— the Church's own book of the saints (read liturgically)
 *   'patristic' — a Father's own text, or a Pope's published book
 *   'reference' — scholarly/encyclopaedic; used only to date or cross-check,
 *                 never as the sole authority for a doctrinal claim
 */

export type SourceTier = 'official' | 'synaxarium' | 'patristic' | 'reference';

export interface FaithSource {
  readonly id: string;
  /** The page/work title, as published. */
  readonly title: string;
  /** Who published it — the diocese, see, or press. */
  readonly publisher: string;
  readonly url: string;
  readonly tier: SourceTier;
}

export const SOURCES: readonly FaithSource[] = [
  // --- Diocesan teaching sites (official) ---------------------------------
  {
    id: 'lacopts-establishment',
    title: 'Establishment of the Church of Alexandria',
    publisher: 'Coptic Orthodox Diocese of Los Angeles',
    url: 'https://www.lacopts.org/orthodoxy/coptic-orthodox-church/history/establishment/',
    tier: 'official',
  },
  {
    id: 'lacopts-history',
    title: 'History of the Coptic Orthodox Church',
    publisher: 'Coptic Orthodox Diocese of Los Angeles',
    url: 'https://www.lacopts.org/orthodoxy/coptic-orthodox-church/history/',
    tier: 'official',
  },
  {
    id: 'lacopts-brief-history',
    title: 'A Brief History of the Christian Church',
    publisher: 'Coptic Orthodox Diocese of Los Angeles',
    url: 'https://www.lacopts.org/orthodoxy/coptic-orthodox-church/brief-history/',
    tier: 'official',
  },
  {
    id: 'lacopts-monasticism',
    title: 'A Brief History of Coptic Monasticism',
    publisher: 'Coptic Orthodox Diocese of Los Angeles',
    url: 'https://www.lacopts.org/orthodoxy/coptic-orthodox-church/history/a-brief-history-of-coptic-monasticism/',
    tier: 'official',
  },
  {
    id: 'lacopts-two-families',
    title: 'Two Families of Orthodox',
    publisher: 'Coptic Orthodox Diocese of Los Angeles',
    url: 'https://www.lacopts.org/orthodoxy/orthodox-life/two-families-of-orthodox/',
    tier: 'official',
  },
  {
    id: 'lacopts-intercessions',
    title: 'On Intercessions',
    publisher: 'Coptic Orthodox Diocese of Los Angeles',
    url: 'https://www.lacopts.org/orthodoxy/our-faith/the-saints/on-intercessions/',
    tier: 'official',
  },
  {
    id: 'lacopts-liturgies',
    title: 'Liturgies of the Coptic Orthodox Church',
    publisher: 'Coptic Orthodox Diocese of Los Angeles',
    url: 'https://www.lacopts.org/orthodoxy/coptic-orthodox-church/liturgies-of-the-coptic-orthodox-church/',
    tier: 'official',
  },
  {
    id: 'lacopts-holy-family',
    title: 'The Holy Family in Egypt',
    publisher: 'Coptic Orthodox Diocese of Los Angeles',
    url: 'https://www.lacopts.org/orthodoxy/coptic-orthodox-church/history/the-holy-family-in-egypt/',
    tier: 'official',
  },
  {
    id: 'lacopts-kyrillos',
    title: 'Practical and Mystical: Patriarch Kyrillos VI (1959–1971)',
    publisher: 'Coptic Orthodox Diocese of Los Angeles',
    url: 'https://www.lacopts.org/story/practical-and-mystical-patriarch-kyrillos-vi-1959-1971/',
    tier: 'official',
  },
  {
    id: 'lacopts-libya-martyrs',
    title: 'The New Martyrs of Libya added to the Coptic Synaxarium',
    publisher: 'Coptic Orthodox Diocese of Los Angeles',
    url: 'https://www.lacopts.org/news/the-new-martyrs-of-libya-added-to-the-coptic-synaxarium/',
    tier: 'official',
  },
  {
    id: 'lacopts-ephesus',
    title: 'Saint Cyril of Alexandria and the Council of Ephesus',
    publisher: 'Coptic Orthodox Diocese of Los Angeles',
    url: 'https://www.lacopts.org/story/saint-cyril-of-alexandria-and-the-council-of-ephesus/',
    tier: 'official',
  },
  {
    id: 'lacopts-creed',
    title: 'The Creed of Faith',
    publisher: 'Coptic Orthodox Diocese of Los Angeles',
    url: 'https://www.lacopts.org/orthodoxy/our-faith/faith-of-the-church/',
    tier: 'official',
  },
  {
    id: 'lacopts-lent',
    title: 'The Meaning of the Great Lent',
    publisher: 'Coptic Orthodox Diocese of Los Angeles',
    url: 'https://www.lacopts.org/story/the-meaning-of-the-great-lent/',
    tier: 'official',
  },
  {
    id: 'lacopts-tawadros',
    title: 'His Holiness Pope Tawadros II',
    publisher: 'Coptic Orthodox Diocese of Los Angeles',
    url: 'https://www.lacopts.org/orthodoxy/pope-of-alexandria/his-holiness-pope-tawadros-ii/',
    tier: 'official',
  },

  {
    id: 'suscopts-saint-mark',
    title: 'St. Mark, the Founder of the Coptic Church',
    publisher: 'Coptic Orthodox Metropolis of the Southern United States',
    url: 'https://suscopts.org/coptic-orthodox/church/saint-mark',
    tier: 'official',
  },
  {
    id: 'suscopts-sacraments',
    title: 'Church Sacraments',
    publisher: 'Coptic Orthodox Metropolis of the Southern United States',
    url: 'https://suscopts.org/coptic-orthodox/church/sacraments',
    tier: 'official',
  },
  {
    id: 'suscopts-real-presence',
    title: 'The Question of the Real Presence',
    publisher: 'Coptic Orthodox Metropolis of the Southern United States',
    url: 'https://suscopts.org/wiki/The_Question_of_the_Real_Presence',
    tier: 'official',
  },
  {
    id: 'suscopts-filioque',
    title: 'The Filioque Controversy (Pneumatology, Lecture 3)',
    publisher: 'Coptic Orthodox Diocese of the Southern United States',
    url: 'https://www.suscopts.org/messages/lectures/pneumlecture3.pdf',
    tier: 'official',
  },
  {
    id: 'suscopts-creed-facts',
    title: 'The Nicene Creed',
    publisher: 'Coptic Orthodox Metropolis of the Southern United States',
    url: 'https://suscopts.org/resources/interesting-facts/10/the-nicene-creed',
    tier: 'official',
  },
  {
    id: 'suscopts-salvation',
    title: 'Salvation in the Orthodox Perspective',
    publisher: 'Coptic Orthodox Metropolis of the Southern United States',
    url: 'https://suscopts.org/coptic-orthodox/doctrine-and-theology-series/salvation-in-the-orthodox-perspective/',
    tier: 'official',
  },
  {
    id: 'suscopts-post-chalcedon',
    title: 'HIS 103 — Post-Chalcedon and the Islamic Era (Servants Prep)',
    publisher: 'Coptic Orthodox Diocese of the Southern United States',
    url: 'https://cdn.suscopts.org/files/servantsprep/pdf/his/his102_postchalcedonandtheislamicera.pdf',
    tier: 'official',
  },
  {
    id: 'suscopts-coptic-language',
    title: 'CPT 100 — The Coptic Language (Servants Prep)',
    publisher: 'Coptic Orthodox Diocese of the Southern United States',
    url: 'https://cdn.suscopts.org/files/servantsprep/pdf/cpt/cpt100-copticlanguage.pdf',
    tier: 'official',
  },
  {
    id: 'suscopts-holy-family',
    title: 'Flight of the Holy Family into Egypt',
    publisher: 'Coptic Orthodox Metropolis of the Southern United States',
    url: 'https://suscopts.org/resources/literature/254/flight-of-the-holy-family-into-egypt/',
    tier: 'official',
  },

  {
    id: 'copticchurch-language-origin',
    title: 'Origin and Evolution of the Coptic Language',
    publisher: 'CopticChurch.net',
    url: 'https://www.copticchurch.net/coptic_language/origin_of_coptic_language',
    tier: 'official',
  },
  {
    id: 'copticchurch-calendar',
    title: 'The Coptic Calendar of Martyrs & Easter Calculations',
    publisher: 'CopticChurch.net',
    url: 'https://www.copticchurch.net/calendar',
    tier: 'official',
  },
  {
    id: 'copticchurch-eucharist',
    title: 'Sacramental Rites in the Coptic Orthodox Church — The Eucharist (H.G. Bishop Mettaous)',
    publisher: 'CopticChurch.net',
    url: 'https://www.copticchurch.net/introduction-to-the-coptic-church/sacraments/4_eucharist',
    tier: 'official',
  },
  {
    id: 'copticchurch-school-alexandria',
    title: 'The School of Alexandria (Fr. Tadros Y. Malaty)',
    publisher: 'CopticChurch.net',
    url: 'http://www.copticchurch.net/topics/patrology/schoolofalex/index.html',
    tier: 'patristic',
  },
  {
    id: 'copticchurch-apostolic',
    title: 'The Coptic Church as an Apostolic Church (Fr. Tadros Y. Malaty)',
    publisher: 'CopticChurch.net',
    url: 'https://www.copticchurch.net/introduction-to-the-coptic-church/book/church1',
    tier: 'patristic',
  },

  {
    id: 'copticorthodox-dioscorus',
    title: 'Pope Dioscorus I, “Orthodoxy Champion”',
    publisher: 'The Coptic Orthodox Church (Papal Residence, Cairo)',
    url: 'https://copticorthodox.church/en/popes/pope-dioscorus-i/',
    tier: 'official',
  },
  {
    id: 'copticorthodox-history',
    title: 'Coptic History',
    publisher: 'The Coptic Orthodox Church (Papal Residence, Cairo)',
    url: 'https://copticorthodox.church/en/coptic-church/coptic-history/',
    tier: 'official',
  },
  {
    id: 'copticorthodox-tawadros',
    title: 'Pope Tawadros II',
    publisher: 'The Coptic Orthodox Church (Papal Residence, Cairo)',
    url: 'https://copticorthodox.church/en/popes/pope-tawadros-ii/',
    tier: 'official',
  },
  {
    id: 'copticorthodox-what-is-coc',
    title: 'What is the Coptic Orthodox Church?',
    publisher: 'The Coptic Orthodox Church (Papal Residence, Cairo)',
    url: 'https://copticorthodox.church/en/coptic-church/what-is-coc/',
    tier: 'official',
  },

  // --- The Synaxarium (the Church's own book of the saints) ---------------
  {
    id: 'synax-anthony',
    title: 'Synaxarium, Tobe 22 — St. Anthony the Great',
    publisher: 'CopticChurch.net (Coptic Synaxarium)',
    url: 'https://www.copticchurch.net/synaxarium/5_22.html',
    tier: 'synaxarium',
  },
  {
    id: 'synax-pachomius',
    title: 'Synaxarium, Bashans 14 — St. Pachomius, father of cenobitic monasticism',
    publisher: 'St-Takla.org (Coptic Synaxarium)',
    url: 'https://st-takla.org/books/en/church/synaxarium/09-bashans/14-pashans-pachomius.html',
    tier: 'synaxarium',
  },
  {
    id: 'synax-athanasius',
    title: 'Synaxarium, Bashans 7 — St. Athanasius the Apostolic, 20th Pope of Alexandria',
    publisher: 'CopticChurch.net (Coptic Synaxarium)',
    url: 'https://www.copticchurch.net/synaxarium/9_7.html',
    tier: 'synaxarium',
  },
  {
    id: 'synax-dioscorus',
    title: 'Synaxarium, Tout 7 — St. Dioscorus, 25th Pope of Alexandria',
    publisher: 'CopticChurch.net (Coptic Synaxarium)',
    url: 'https://www.copticchurch.net/synaxarium/1_7.html',
    tier: 'synaxarium',
  },
  {
    id: 'synax-ephesus',
    title: 'Synaxarium, Tout 12 — The Third Ecumenical Council at Ephesus',
    publisher: 'CopticChurch.net (Coptic Synaxarium)',
    url: 'https://www.copticchurch.net/synaxarium/1_12.html',
    tier: 'synaxarium',
  },
  {
    id: 'synax-cyril',
    title: 'Synaxarium, Abib 3 — St. Cyril I, 24th Pope of Alexandria',
    publisher: 'CopticChurch.net (Coptic Synaxarium)',
    url: 'https://www.copticchurch.net/synaxarium/11_03.html',
    tier: 'synaxarium',
  },
  {
    id: 'synax-zeitoun',
    title: 'Synaxarium, Baramhat 24 — The Apparition of the Virgin at Zeitoun',
    publisher: 'St-Takla.org (Coptic Synaxarium)',
    url: 'https://st-takla.org/books/en/church/synaxarium/07-baramhat/24-paramhat-zeiton.html',
    tier: 'synaxarium',
  },

  // --- Patristic / papal texts --------------------------------------------
  {
    id: 'shenouda-nature-of-christ',
    title: 'The Nature of Christ (H.H. Pope Shenouda III)',
    publisher: 'St-Takla.org',
    url: 'https://st-takla.org/books/en/pope-shenouda-iii/nature-of-christ/index.html',
    tier: 'patristic',
  },
  {
    id: 'shenouda-one-will',
    title: 'The One Will and the One Act — The Nature of Christ (H.H. Pope Shenouda III)',
    publisher: 'St-Takla.org',
    url: 'https://st-takla.org/books/en/pope-shenouda-iii/nature-of-christ/one-will-one-act.html',
    tier: 'patristic',
  },
  {
    id: 'shenouda-agreed-statement',
    title: 'The Agreed Statement on Christology — The Nature of Christ (H.H. Pope Shenouda III)',
    publisher: 'St-Takla.org',
    url: 'https://st-takla.org/books/en/pope-shenouda-iii/nature-of-christ/agreed-statement.html',
    tier: 'patristic',
  },
  {
    id: 'shenouda-comparative-theology',
    title: 'Comparative Theology (H.H. Pope Shenouda III)',
    publisher: 'St-Takla.org',
    url: 'https://st-takla.org/books/en/pope-shenouda-iii/comparative-theology/index.html',
    tier: 'patristic',
  },
  {
    id: 'athanasius-on-the-incarnation',
    title: 'On the Incarnation (St. Athanasius the Apostolic)',
    publisher: 'The Coptic Treasures Project',
    url: 'https://ml.coptic-treasures.com/book/on-the-incarnation-saint-athanasius/',
    tier: 'patristic',
  },

  // --- Signed inter-church statements --------------------------------------
  {
    id: 'chambesy-1990',
    title: 'Second Agreed Statement, Joint Commission of the Orthodox Church and the Oriental Orthodox Churches (Chambésy, 23–28 September 1990)',
    publisher: 'Ecumenical Patriarchate — Permanent Delegation to the World Council of Churches',
    url: 'https://www.ecupatria.org/documents/second-agreed-statement-1990/',
    tier: 'official',
  },

  // --- Reference (dating / cross-check only) -------------------------------
  {
    id: 'st-takla-coptic-calendar',
    title: 'The Coptic Calendar',
    publisher: 'St-Takla.org',
    url: 'https://st-takla.org/faith/en/terms/calendar-coptic.html',
    tier: 'reference',
  },
  {
    id: 'st-takla-fasting',
    title: 'Article on Fasting — The Great Lent & Holy Week',
    publisher: 'St-Takla.org',
    url: 'https://st-takla.org/Feastes-&-Special-Events/Great-Lent-Baskha/Coptic-El-Soom-Al-Kabir-03-Article-on-Fasting.html',
    tier: 'reference',
  },
];

const BY_ID = new Map(SOURCES.map((s) => [s.id, s]));

export function sourceById(id: string): FaithSource | undefined {
  return BY_ID.get(id);
}

/** Resolve a card's citation ids to sources, dropping any that do not exist. */
export function citations(ids: readonly string[]): FaithSource[] {
  return ids.map((id) => BY_ID.get(id)).filter((s): s is FaithSource => !!s);
}
