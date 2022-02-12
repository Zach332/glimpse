const CopyPlugin = require('copy-webpack-plugin');

module.exports = {
  entry: { background: 'src/background.ts' },
  optimization: {
    runtimeChunk: false,
  },
  plugins: [
    new CopyPlugin({
      patterns: [{ from: 'src/manifest-chrome.json', to: 'manifest.json' }],
    }),
  ],
};
