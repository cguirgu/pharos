// Learn more: https://docs.expo.dev/guides/customizing-metro/
const { getDefaultConfig } = require('expo/metro-config');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

// Allow Drizzle's `.sql` migration bundles to be imported by Metro.
config.resolver.sourceExts.push('sql');

// Bundle audio assets (UI sfx + any Coptic pronunciation clips).
for (const ext of ['wav', 'm4a', 'mp3']) {
  if (!config.resolver.assetExts.includes(ext)) config.resolver.assetExts.push(ext);
}

module.exports = config;
