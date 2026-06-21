/**
 * Data export — serialize an account's full data snapshot to a JSON file and
 * hand it to the OS share sheet (save / AirDrop / email). The snapshot is built
 * by the repo (`exportAccountData`); this layer only writes + shares it.
 *
 * The export contains the user's full PII, so the temp file is given an
 * UNPREDICTABLE name (not a guessable date) and is DELETED once the share sheet
 * closes — it must not linger in the cache where another process could read it.
 */
import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import type { AccountExport } from '../db/repo';
import { id } from './id';

/** Write the export to a cache file, open the share sheet, then delete the file.
 *  Returns the (now-removed) file URI. */
export async function exportAndShare(data: AccountExport, dateKey: string): Promise<string> {
  const json = JSON.stringify(data, null, 2);
  const dir = FileSystem.cacheDirectory ?? '';
  // User-facing name stays friendly; the random suffix makes the path unguessable.
  const uri = `${dir}pharos-export-${dateKey}-${id()}.json`;
  await FileSystem.writeAsStringAsync(uri, json);
  try {
    if (await Sharing.isAvailableAsync()) {
      await Sharing.shareAsync(uri, {
        mimeType: 'application/json',
        UTI: 'public.json',
        dialogTitle: 'Export your Pharos data',
      });
    }
  } finally {
    // Always clean up the PII-bearing temp file, share or not, success or throw.
    await FileSystem.deleteAsync(uri, { idempotent: true }).catch(() => {});
  }
  return uri;
}
