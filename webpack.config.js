const path = require('path')

module.exports = {
  entry: path.resolve(__dirname, 'index.js'), // Replace with the path to your entry file
  output: {
    library: {
      name: 'AsyncApiValidator',
      type: 'const'
    },
    libraryTarget: 'umd', // make the bundle export
    filename: 'bundle.js', // Output bundle file name
    path: path.resolve(__dirname, 'dist') // Output folder
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env']
          }
        }
      }
    ]
  },
  resolve: {
    fallback: {
    }
  },
  target: 'node',
  node: {
    global: true
  },
  optimization: {
    minimize: false
  }
}
