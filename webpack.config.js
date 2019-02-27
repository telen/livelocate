const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyPlugin = require('copy-webpack-plugin');
const CleanWebpackPlugin = require('clean-webpack-plugin');

module.exports = {
  mode: 'production',
  entry: './index2.js',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'index.js',
  },
  devServer: {
    contentBase: path.join(__dirname, 'dist'),
    port: 9000,
  },
  module: {
    rules: [
      {
        test: /\.m?js$/,
        exclude: /(node_modules|bower_components)/, // 过滤node_modules目录
        // include: path.resolve(process.cwd(), './src') // 只匹配src目录
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env'],
          },
        },
      },
      {
        test: /\.(css)$/,
        use: ['style-loader/url', 'file-loader'],
      },
      {
        test: /\.json$/i,
        use: {
          loader: 'json-loader',
          options: {},
        },
      },
    ],
  },
  externals: {
    jquery: 'jQuery',
    $: 'jQuery',
  },
  plugins: [
    new CleanWebpackPlugin(['dist/*']),
    new HtmlWebpackPlugin({
      title: 'Live Locate',
      template: path.join(path.resolve(__dirname, 'view'), 'temp.html'), // 使用模版，模版中带有变量 htmlWebpackPlugin
    }),
    new CopyPlugin([
      { from: 'mock', to: 'mock' },
      { from: 'geomapdata', to: 'geomapdata' },
    ]),
  ],
};
