const path = require('path');
const paths = require('./paths');
const merge = require('webpack-merge');
const baseConfig = require('./webpack.base.config.js');
const HtmlWebPackPlugin = require("html-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");

const getClientEnvironment = require('./env');
const publicPath = paths.servedPath;

module.exports = merge(baseConfig, {
  mode: 'development',
  output: {
    path: paths.appBuild,
    pathinfo: true,
    filename: 'static/js/bundle.js',
    chunkFilename: 'static/js/[name].chunk.js',
    // This is the URL that app is served from. We use "/" in development.
    publicPath: publicPath,
    // Point sourcemap entries to original disk location (format as URL on Windows)
    devtoolModuleFilenameTemplate: info =>
      path.resolve(info.absoluteResourcePath).replace(/\\/g, '/'),
  },
  devServer: {
    writeToDisk: true
  },
  plugins: [
    new MiniCssExtractPlugin({
      filename: 'static/js/style.css',
    }),
    new HtmlWebPackPlugin({
      template: paths.appHtml,
      favicon: paths.favicon,
      fileName:paths.appHtml,
    }),
  ],
  // Emit a source map for easier debugging
  // See https://webpack.js.org/configuration/devtool/#devtool
  devtool: 'source-map',
  performance: {
    hints:false
  }
});