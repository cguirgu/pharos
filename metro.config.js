// Learn more: https://docs.expo.dev/guides/customizing-metro/
const { getDefaultConfig } = require('expo/metro-config');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

// Allow Drizzle's `.sql` migration bundles to be imported by Metro.
config.resolver.sourceExts.push('sql');

module.exports = config;
