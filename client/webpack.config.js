const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

const isDev = process.argv.includes('--mode') && process.argv[process.argv.indexOf('--mode') + 1] === 'development';

module.exports = {
  entry: './src/main.jsx',
  output: {
    path: path.resolve(__dirname, '..', 'server', 'public'),
    filename: isDev ? 'assets/[name].js' : 'assets/[name].[contenthash:8].js',
    chunkFilename: isDev ? 'assets/[name].js' : 'assets/[name].[contenthash:8].chunk.js',
    publicPath: '/',
    clean: { keep: /(images|uploads)\// },
  },
  resolve: {
    extensions: ['.js', '.jsx'],
  },
  module: {
    rules: [
      {
        test: /\.jsx?$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: [
              ['@babel/preset-env', { targets: 'defaults' }],
              ['@babel/preset-react', { runtime: 'automatic' }],
            ],
          },
        },
      },
      {
        test: /\.css$/,
        use: [
          isDev ? 'style-loader' : MiniCssExtractPlugin.loader,
          'css-loader',
          'postcss-loader',
        ],
      },
      {
        test: /\.(png|jpe?g|gif|svg|webp)$/,
        type: 'asset/resource',
        generator: { filename: 'assets/[name][ext]' },
      },
    ],
  },
  optimization: {
    splitChunks: {
      chunks: 'async',
      cacheGroups: {
        vendor: {
          test: /[\\/]node_modules[\\/]/,
          priority: 10,
          reuseExistingChunk: true,
        },
      },
    },
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: './public/index.html',
      inject: true,
    }),
    ...(isDev ? [] : [new MiniCssExtractPlugin({
      filename: 'assets/[name].[contenthash:8].css',
    })]),
  ],
  devServer: {
    port: 5173,
    hot: true,
    liveReload: true,
    watchFiles: ['src/**/*'],
    historyApiFallback: true,
    static: {
      directory: path.resolve(__dirname, '..', 'server', 'public'),
      watch: false,
    },
    proxy: [
      {
        context: ['/api'],
        target: 'http://localhost:3001',
        changeOrigin: true,
      },
    ],
  },
};
