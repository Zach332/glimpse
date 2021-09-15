var CopyWebpackPlugin = require('copy-webpack-plugin');

module.exports = {
  entry: { background: 'src/background.ts' },
  plugins: [
    new CopyWebpackPlugin({
      patterns: [
        {
          from: 'node_modules/webextension-polyfill/dist/browser-polyfill.js',
        },
      ],
    }),
  ],
};
