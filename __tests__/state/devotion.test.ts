/**
 * Journal / Reading / Offices store tests (MemoryRepo): CRUD, progress, and
 * per-account isolation + persistence.
 */
import { useJournal } from '../../src/state/journal';
import { useReading } from '../../src/state/reading';
import { useOffices } from '../../src/state/offices';
import { MemoryRepo, setRepo, getRepo } from '../../src/db/repo';
import type { CivilDate } from '../../src/domain/coptic';

const TODAY: CivilDate = { year: 2026, month: 10, day: 20 };

beforeEach(() => {
  setRepo(new MemoryRepo());
  useJournal.getState().clear();
  useReading.getState().clear();
  useOffices.getState().clear();
});

describe('journal store', () => {
  test('create, update, list newest-first, and remove', async () => {
    const j = useJournal.getState();
    await j.load('a');
    const id1 = await j.save({ date: TODAY, title: 'First', body: 'one' });
    await j.save({ date: TODAY, title: 'Second', body: 'two' });
    expect(useJournal.getState().entries.map((e) => e.title)).toEqual(['Second', 'First']);

    await j.save({ id: id1, date: TODAY, title: 'First (edited)', body: 'one!' });
    expect(useJournal.getState().get(id1)?.title).toBe('First (edited)');

    await j.remove(id1);
    expect(useJournal.getState().entries.map((e) => e.title)).toEqual(['Second']);
  });

  test('entries are isolated per account', async () => {
    const repo = new MemoryRepo();
    setRepo(repo);
    await useJournal.getState().load('a');
    await useJournal.getState().save({ date: TODAY, title: 'A note', body: '' });
    expect(await repo.listJournal('a')).toHaveLength(1);
    expect(await repo.listJournal('b')).toHaveLength(0);
    // switching the active account to 'b' shows nothing
    await useJournal.getState().load('b');
    expect(useJournal.getState().entries).toHaveLength(0);
  });
});

describe('reading store', () => {
  test('enrolls on first load and tracks completed days', async () => {
    const r = useReading.getState();
    await r.load('a', TODAY);
    expect(useReading.getState().startDate).toEqual(TODAY);
    const prog0 = useReading.getState().progress(TODAY)!;
    expect(prog0.dayNumber).toBe(1);
    expect(prog0.total).toBe(89);
    expect(prog0.percent).toBe(0);
    expect(prog0.todayLabel).toBe('Matthew 1');

    await useReading.getState().markRead(1, TODAY);
    await useReading.getState().markRead(1, TODAY); // idempotent
    expect(useReading.getState().completedDays).toEqual([1]);
    expect(useReading.getState().progress(TODAY)!.percent).toBe(1);
  });

  test('progress is isolated per account', async () => {
    const repo = new MemoryRepo();
    setRepo(repo);
    await useReading.getState().load('a', TODAY);
    await useReading.getState().markRead(1, TODAY);
    await useReading.getState().load('b', TODAY);
    expect(useReading.getState().completedDays).toEqual([]);
  });
});

describe('offices store', () => {
  test('toggle reflects prayed offices and the running total', async () => {
    const o = useOffices.getState();
    await o.load('a');
    await o.ensureDate(TODAY);
    expect(useOffices.getState().prayedOn(TODAY)).toEqual([]);

    await useOffices.getState().toggle(TODAY, 'sext', true);
    expect(useOffices.getState().prayedOn(TODAY)).toContain('sext');
    expect(useOffices.getState().total).toBe(1);

    await useOffices.getState().toggle(TODAY, 'sext', false);
    expect(useOffices.getState().prayedOn(TODAY)).not.toContain('sext');
    expect(useOffices.getState().total).toBe(0);
  });

  test('office logs are isolated per account', async () => {
    const repo = new MemoryRepo();
    setRepo(repo);
    await useOffices.getState().load('a');
    await useOffices.getState().toggle(TODAY, 'prime', true);
    expect(await repo.countOfficeLogs('a')).toBe(1);
    expect(await repo.countOfficeLogs('b')).toBe(0);
  });
});
