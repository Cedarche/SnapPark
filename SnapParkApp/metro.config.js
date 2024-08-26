const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Include 'nativewind.cjs' in sourceExts
config.resolver.sourceExts.push('cjs', 'nativewind.cjs');

module.exports = config;
