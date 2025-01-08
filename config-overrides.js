const webpack = require('webpack');

module.exports = function override(config, env) {
  // Add .mjs to the list of resolved extensions
  config.resolve.extensions = [...config.resolve.extensions, '.mjs'];

  // Update the rules to handle .mjs files
  config.module.rules.push({
    test: /\.mjs$/,
    include: /node_modules/,
    type: 'javascript/auto'
  });

  // Add Node.js polyfills
  config.resolve.fallback = {
    ...config.resolve.fallback,
    "crypto": require.resolve("crypto-browserify"),
    "stream": require.resolve("stream-browserify"),
    "http": require.resolve("stream-http"),
    "https": require.resolve("https-browserify"),
    "util": require.resolve("util/"),
    "zlib": require.resolve("browserify-zlib"),
    "url": require.resolve("url/"),
    "assert": require.resolve("assert/"),
    "buffer": require.resolve("buffer/"),
    "querystring": require.resolve("querystring-es3"),
    "path": require.resolve("path-browserify"),
    "os": require.resolve("os-browserify/browser"),
    "process": require.resolve("process/browser"),
    "fs": false,
    "net": false,
    "tls": false,
    "child_process": false
  };

  // Add buffer and process to plugins
  config.plugins = [
    ...config.plugins,
    new webpack.ProvidePlugin({
      Buffer: ['buffer', 'Buffer'],
      process: 'process/browser'
    }),
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV)
    })
  ];

  return config;
} 