/**
 * Data export — serialize an account's full data snapshot to a JSON file and
 * hand it to the OS share sheet (save / AirDrop / email). The snapshot is built
 * by the repo (`exportAccountData`); this layer only writes + shares it.
 */
import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import type { AccountExport } from '../db/repo';

/** Write the export to a cache file and open the share sheet. Returns the file URI. */
export async function exportAndShare(data: AccountExport, dateKey: string): Promise<string> {
  const json = JSON.stringify(data, null, 2);
  const dir = FileSystem.cacheDirectory ?? '';
  const uri = `${dir}pharos-export-${dateKey}.json`;
  await FileSystem.writeAsStringAsync(uri, json);
  if (await Sharing.isAvailableAsync()) {
    await Sharing.shareAsync(uri, {
      mimeType: 'application/json',
      UTI: 'public.json',
      dialogTitle: 'Export your Pharos data',
    });
  }
  return uri;
}
