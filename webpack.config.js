const path = require('path');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const HtmlWebpackInlineSourcePlugin = require('html-webpack-inline-source-plugin');
const CleanWebpackPlugin = require('clean-webpack-plugin');
const TerserPlugin = require('terser-webpack-plugin');

const config = env => {
  let devtool = 'inline-source-map';
  let plugins = [];

  plugins.push(new webpack.DefinePlugin({
    'WEBPACK_ENV': JSON.stringify(env.NODE_ENV)
  }));
  plugins.push(new HtmlWebpackPlugin({inlineSource: '.(js|css)$', template: './web/index.html', inject: 'body'}));
  plugins.push(new HtmlWebpackInlineSourcePlugin());

  switch (env.NODE_ENV) {
    case 'developement':
      plugins.push(new webpack.HotModuleReplacementPlugin());
      break;

    case 'production':
      devtool = '';

      plugins.push(new webpack.DefinePlugin({
        'process.env': {
          'NODE_ENV': JSON.stringify('production')
        }
      }));
      plugins.push(new CleanWebpackPlugin(['dist/*.*']));
      plugins.push(new TerserPlugin());
      break;

    default:
  }

  return {
    entry: [
      '@babel/polyfill', './web/index.js'
    ],
    output: {
      path: path.join(__dirname, './dist'),
      filename: '[name].bundle.js'
    },
    devtool: devtool,
    module: {
      rules: [
        {
          test: /\.(jpe?g|png|gif|svg)$/i,
          loaders: [
            {
              loader: 'file-loader',
              options: {
                name(file) {
                  return 'images/[name].[ext]';
                }
              }
            }
          ]
        }, {
          test: /\.css$/,
          use: ['style-loader', 'css-loader']
        }, {
          test: /\.js$/,
          loader: 'babel-loader',
          include: [path.resolve(__dirname, 'web')],
          exclude: /node_modules/,
          query: {
            presets: [
              '@babel/preset-env', '@babel/preset-react'
            ],
            plugins: [
              [
                '@babel/plugin-proposal-decorators', {
                  'legacy': true
                }
              ],
              [
                '@babel/plugin-proposal-class-properties', {
                  'loose': true
                }
              ],
              ['@babel/plugin-syntax-dynamic-import']
            ]
          }
        }
      ]
    },
    resolve: {
      extensions: ['.js', '.jsx', '.css']
    },
    plugins: plugins,
    devServer: {
      contentBase: './dist',
      hot: true,
      overlay: true,
      inline: true,
      historyApiFallback: true,
      open: true
    }
  };
};

module.exports = config;
