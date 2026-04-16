// Karma configuration file, see link for more information
// https://karma-runner.github.io/1.0/config/configuration-file.html

const srcKarmaConf = require("../../src/karma.conf");

module.exports = function (config) {
  config.set(srcKarmaConf(config, "../coverage/ggc-search-location"));
};
