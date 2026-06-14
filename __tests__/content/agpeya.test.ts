import {
  OFFICES,
  officesForDay,
  officeForHour,
  nextOffice,
  officeReader,
  SECTION_ORDER,
  TEXT_TBD,
} from '../../src/domain/content/agpeya';

describe('Agpeya structure', () => {
  test('there are exactly seven offices in order', () => {
    expect(OFFICES).toHaveLength(7);
    expect(OFFICES.map((o) => o.key)).toEqual([
      'matins', 'prime', 'terce', 'sext', 'none', 'vespers', 'compline',
    ]);
    expect(officesForDay()).toHaveLength(7);
  });

  test('officeForHour maps the day into periods', () => {
    expect(officeForHour(0).key).toBe('matins');
    expect(officeForHour(5).key).toBe('matins');
    expect(officeForHour(6).key).toBe('prime');
    expect(officeForHour(8).key).toBe('prime');
    expect(officeForHour(9).key).toBe('terce');
    expect(officeForHour(12).key).toBe('sext');
    expect(officeForHour(15).key).toBe('none');
    expect(officeForHour(18).key).toBe('vespers');
    expect(officeForHour(21).key).toBe('compline');
    expect(officeForHour(23).key).toBe('compline');
  });

  test('nextOffice advances and wraps to Matins', () => {
    expect(nextOffice(0).key).toBe('prime');
    expect(nextOffice(12).key).toBe('none');
    expect(nextOffice(21).key).toBe('matins'); // wrap
  });

  test('the reader has the 8 sections in order, with the ×41 counter', () => {
    expect(SECTION_ORDER.map((s) => s.kind)).toEqual([
      'introduction', 'thanksgiving', 'psalm50', 'psalms', 'gospel', 'litanies', 'lordHaveMercy', 'conclusion',
    ]);
    const { office, sections } = officeReader('sext');
    expect(office.key).toBe('sext');
    expect(sections).toHaveLength(8);
    expect(sections.find((s) => s.kind === 'lordHaveMercy')?.count).toBe(41);
  });

  test('all prose is a clearly-marked placeholder (no invented liturgical text)', () => {
    for (const s of officeReader('prime').sections) {
      expect(s.body).toBe(TEXT_TBD);
    }
  });
});
