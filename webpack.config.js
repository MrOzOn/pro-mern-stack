const path = require('path');

module.exports = {
    mode: "development",
    entry: {
      app: ['./src/App.jsx'],
      vendor: ['react','react-dom','whatwg-fetch'],
    },
    output: {
        path: path.resolve(__dirname, 'static'),
        filename: '[name].bundle.js'
      },
    optimization: {
      runtimeChunk: 'single',
      splitChunks: {
        cacheGroups: {
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            name: 'vendors',
            chunks: 'all'
          }
        }
      }
    },
    module: {
        rules: [
          {
            test: /\.jsx$/,
            use: {
              loader: 'babel-loader',
              options: {
                presets: ['@babel/react','@babel/env'],
              }
            }
          }
        ]
      },
    devServer: {
      port: 8000,
      static: 'static',
      proxy: {
        '/api/*': {
          target: 'http://localhost:3000'
        } 
      }
    },
    plugins: [
    ],


};