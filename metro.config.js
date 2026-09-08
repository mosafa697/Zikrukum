const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const config = getDefaultConfig(__dirname);

// Ensure web is a known platform for resolver (Expo web uses Metro)
if (!config.resolver.platforms.includes('web')) {
  config.resolver.platforms.push('web');
}

const emptyMock = path.resolve(__dirname, 'src/mocks/empty.js');

const defaultResolveRequest = config.resolver.resolveRequest
  ? config.resolver.resolveRequest.bind(config.resolver)
  : null;

config.resolver.resolveRequest = (context, moduleName, platform) => {
  if (platform === 'web') {
    if (
      moduleName === 'react-native-track-player' ||
      moduleName.startsWith('react-native-track-player/') ||
      moduleName === 'shaka-player' ||
      moduleName.startsWith('shaka-player/')
    ) {
      return {
        filePath: emptyMock,
        type: 'sourceFile',
      };
    }
  }

  if (defaultResolveRequest) {
    return defaultResolveRequest(context, moduleName, platform);
  }
  return context.resolveRequest(context, moduleName, platform);
};

module.exports = config;
