// Learn more: https://docs.expo.dev/guides/customizing-metro/
const { getDefaultConfig } = require('expo/metro-config');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

// Allow Drizzle's `.sql` migration bundles to be imported by Metro.
config.resolver.sourceExts.push('sql');

// Bundle audio assets (UI sfx + any Coptic pronunciation clips), and `.wasm`.
// expo-sqlite's web build imports `wa-sqlite.wasm` directly; without it in
// assetExts Metro cannot resolve that import and the whole web bundle fails
// ("Unable to resolve module ./wa-sqlite/wa-sqlite.wasm"). Native builds are
// unaffected — they never touch the wasm path — which is why this stayed
// hidden until someone tried to build for web.
for (const ext of ['wav', 'm4a', 'mp3', 'wasm']) {
  if (!config.resolver.assetExts.includes(ext)) config.resolver.assetExts.push(ext);
}

module.exports = config;
