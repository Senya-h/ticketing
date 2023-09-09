
// is used proactively to have changes reflected in our browser, since may not always work?
module.exports = {
  webpack: (config) => {
    config.watchOptions.poll = 300;
    return config;
  },
};