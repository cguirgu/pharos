module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    // Reanimated 4 uses the worklets plugin; it must be listed last.
    plugins: ['react-native-worklets/plugin'],
  };
};
