const path = require('path');
const paths = require('./paths');
const webpack = require('webpack');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const CircularDependencyPlugin = require('circular-dependency-plugin');
const CaseSensitivePathsPlugin = require('case-sensitive-paths-webpack-plugin');

module.exports = {
  entry: [
    require.resolve('./polyfills'),
    paths.appCSS,
    paths.appIndexJs,
  ],
  module: {
    rules: [
      {
        // Transform all .js files required somewhere with Babel
        test: /\.(js|jsx)$/,
        include: /src/,
        exclude: /node_modules/,
        use: 'babel-loader',
      },
      {
        // Preprocess our own .scss files
        test: /\.(css|scss)$/,
        exclude: /node_modules/,
        use:  ['style-loader', MiniCssExtractPlugin.loader, 'css-loader', 'sass-loader'],
      },
      {
        // Preprocess 3rd party .css files located in node_modules
        test: /\.css$/,
        include: /node_modules/,
        use:  [ 'style-loader', 'css-loader']
      },
      {
        test: /\.(eot|svg|otf|ttf|woff|woff2)$/,
        use: 'file-loader',
      },
      {
        test: /\.html$/,
        use: 'html-loader'
      },
      {
        test: /\.(mp4|webm|png|jpe?g|gif)$/,
        use: {
          loader: 'url-loader',
          options: {
            limit: 10000
          },
        },
      },
    ],
  },
  plugins: [
    new CleanWebpackPlugin(),
    new CaseSensitivePathsPlugin(),
    new CircularDependencyPlugin({
      exclude: /a\.js|node_modules/, // exclude node_modules
      failOnError: false // show a warning when there is a circular dependency
    })
  ],
  resolve: {
    modules: ['node_modules', 'src/client'],
    extensions: [
      '.js',
      '.json',
      '.jsx',
      '.scss',
      '.web.js',
      '.web.jsx',
      '.mjs',
      '.react.js'
    ],
    mainFields: [
      'browser',
      'jsnext:main',
      'main'
    ]
  },
  target: 'web'
};