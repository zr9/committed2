const path = require('path');
const CopyPlugin = require('copy-webpack-plugin');

const URL_PATTERNS = require('./src/constants/url').URL_PATTERNS;
const env = process.env.NODE_ENV || 'development';

module.exports = {
  mode: env,
  devtool: 'none',
  entry: {
    background: './src/background.js',
    contentScript: './src/contentScript.js',
  },
  output: {
    path: path.resolve(__dirname, 'build'),
    filename: '[name].js'
  },

  plugins: [
    new CopyPlugin([
      {
        from: 'public/manifest.json',
        to: 'manifest.json',
        transform(content, absoluteFrom) {
          return modify(content);
        },
      }
    ]),
  ]
};

function modify(buffer){
  let manifest = buffer.toString();
  return manifest.replace(new RegExp('#APP_URL', 'g'), URL_PATTERNS);
}
