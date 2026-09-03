/**
 * Citations — one anchoring vocabulary for scripture, the Synaxarium and the
 * Agpeya hours. Selective barrel, in the style of src/domain/rule/index.ts.
 */
export type { Citation, CitationAnchor, CitationSource, OfficeAnchor } from './types';
export { CITATION_SOURCES, isCitationAnchor, isOfficeAnchor } from './types';
export { citationRefLabel, normalizeCitationAnchor } from './label';
export type { LabelNames } from './label';
export { citationFromSelection, officeAnchorFromSelection } from './selection';
export type { CitationTarget } from './selection';
export { decodeCitation, encodeCitation } from './codec';
