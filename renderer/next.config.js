module.exports = {
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.target = 'electron-renderer';
    }
    config.watchOptions = {
      poll: 1000,
      ignored: /node_modules/,
    };
    return config;
  }
};
