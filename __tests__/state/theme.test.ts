/**
 * Theme store — persistence + palette resolution (pure store logic; no render).
 */
import { Appearance } from 'react-native';
import { useTheme } from '../../src/state/theme';
import { darkPalette, lightPalette } from '../../src/ui/theme';
import { MemoryRepo, setRepo, getRepo } from '../../src/db/repo';

const KEY = 'app.theme.mode';

beforeEach(() => {
  setRepo(new MemoryRepo());
});

describe('theme store', () => {
  test('defaults to dark when nothing is stored', async () => {
    await useTheme.getState().load();
    expect(useTheme.getState().mode).toBe('dark');
    expect(useTheme.getState().palette).toBe(darkPalette);
    expect(useTheme.getState().ready).toBe(true);
  });

  test('load restores the persisted mode and resolves its palette by reference', async () => {
    await getRepo().setSetting(KEY, 'light');
    await useTheme.getState().load();
    expect(useTheme.getState().mode).toBe('light');
    expect(useTheme.getState().palette).toBe(lightPalette);
  });

  test('setMode swaps the palette by reference and persists the choice', async () => {
    await useTheme.getState().setMode('light');
    expect(useTheme.getState().palette).toBe(lightPalette);
    expect(await getRepo().getSetting(KEY)).toBe('light');

    await useTheme.getState().setMode('dark');
    expect(useTheme.getState().palette).toBe(darkPalette);
    expect(await getRepo().getSetting(KEY)).toBe('dark');
  });

  test('system mode follows the OS colour scheme', async () => {
    const scheme = jest.spyOn(Appearance, 'getColorScheme').mockReturnValue('light');
    const listen = jest
      .spyOn(Appearance, 'addChangeListener')
      .mockReturnValue({ remove: () => {} } as ReturnType<typeof Appearance.addChangeListener>);

    await useTheme.getState().setMode('system');
    expect(useTheme.getState().palette).toBe(lightPalette);

    scheme.mockReturnValue('dark');
    await useTheme.getState().setMode('system');
    expect(useTheme.getState().palette).toBe(darkPalette);

    scheme.mockRestore();
    listen.mockRestore();
  });
});
