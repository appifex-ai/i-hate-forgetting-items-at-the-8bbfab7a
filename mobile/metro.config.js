const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Optimize module IDs for faster bundling
config.serializer = {
  ...config.serializer,
  createModuleIdFactory: () => (path) => {
    return require('crypto')
      .createHash('md5')
      .update(path)
      .digest('hex')
      .substr(0, 8);
  },
};

// Optimize transformer for faster processing
config.transformer = {
  ...config.transformer,
  minifierConfig: {
    output: {
      comments: false,
    },
  },
  // Skip expensive babel transformations in node_modules
  enableBabelRCLookup: false,
};

// Optimize resolver for web-only builds
config.resolver = {
  ...config.resolver,
  platforms: ['web'],
};

module.exports = config;
