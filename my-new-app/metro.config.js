const { getDefaultConfig } = require('@expo/metro-config');

const config = getDefaultConfig(__dirname);

// Add environment variables
process.env.EXPO_ROUTER_APP_ROOT = './app';

// Modify the config for expo-router
config.resolver = {
  ...config.resolver,
  requireCond: {
    ...config.resolver.requireCond,
    fileConditions: ['require', 'react-native']
  },
  sourceExts: [...config.resolver.sourceExts, 'mjs']
};

module.exports = config; 