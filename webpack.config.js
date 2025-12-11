const webpack = require('webpack');
const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const fs = require('fs');
const gitRev = require('git-rev-sync');

const getGitLong = () => {
  try {
    return fs.readFileSync('./REVISION', 'utf8').trim();
  } catch (e) {
    return gitRev.long() || 'error';
  }
};

const PAGE_TITLE = 'React Planner';

/**
 * --env port=<port>
 * --env quiet=true
 */
module.exports = function (env = {}) {
  const mode = process.env.NODE_ENV === 'production' ? 'production' : 'development';
  const isProduction = mode === 'production';
  const isQuiet = Boolean(env.quiet);
  const port = env.port || 8080;

  console.info(`Webpack: ${isProduction ? 'Production' : 'Development'} mode`);

  return {
    mode,
    context: path.resolve(__dirname),
    entry: {
      app: path.join(__dirname, './src/demo/src/renderer.jsx'),
    },
    output: {
      path: path.join(__dirname, 'dist'),
      filename: isProduction ? '[contenthash].[name].js' : '[name].js',
      clean: true,
    },
    performance: {
      hints: isProduction ? 'warning' : false,
    },
    devtool: isProduction ? 'source-map' : 'eval-source-map',
    devServer: {
      port,
      static: {
        directory: path.join(__dirname, './dist'),
      },
      client: {
        overlay: {
          warnings: true,
          errors: true,
        },
      },
      open: true,
    },
    resolve: {
      extensions: ['.js', '.jsx'],
      fallback: {
        path: require.resolve('path-browserify'),
      },
    },
    module: {
      rules: [
        {
          test: /\.(js|jsx)$/,
          exclude: /node_modules/,
          use: {
            loader: 'babel-loader',
            options: {
              cacheDirectory: true,
              presets: [
                ['@babel/preset-env', { targets: 'defaults' }],
                ['@babel/preset-react', { runtime: 'classic' }],
              ],
              plugins: ['@babel/plugin-transform-object-rest-spread'],
            },
          },
        },
        {
          test: /\.(jpe?g|png|gif|mtl|obj)$/i,
          type: 'asset/resource',
          generator: {
            filename: 'assets/[path][name][contenthash][ext]',
          },
        },
      ],
    },
    optimization: {
      splitChunks: {
        chunks: 'all',
      },
      runtimeChunk: 'single',
    },
    plugins: [
      new webpack.DefinePlugin({
        'process.env.NODE_ENV': JSON.stringify(mode),
        defineREV: JSON.stringify(getGitLong()),
        defineVersion: JSON.stringify(require('./package.json').version),
      }),
      new HtmlWebpackPlugin({
        title: PAGE_TITLE,
        template: './src/demo/src/index.html.ejs',
        filename: 'index.html',
        inject: 'body',
      }),
    ],
    infrastructureLogging: { level: isQuiet ? 'error' : 'info' },
    stats: isQuiet ? 'errors-warnings' : 'normal',
  };
};
