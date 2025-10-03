const path = require('path');

module.exports = function override(config, env) {
  // Add .js extension to resolve.extensions array
  config.resolve.extensions = ['.js', '.jsx', '.json'];
  
  // Add fallback for node modules if needed
  config.resolve.fallback = {
    ...config.resolve.fallback,
    path: require.resolve('path-browserify'),
    os: require.resolve('os-browserify/browser'),
    crypto: require.resolve('crypto-browserify'),
    stream: require.resolve('stream-browserify'),
    buffer: require.resolve('buffer/')
  };
  
  return config;
}
