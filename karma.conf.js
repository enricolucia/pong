module.exports = function(config) {
  config.set({
    basePath: 'src/',
    frameworks: ['mocha', 'chai', 'browserify'],
    files: [
      'scripts/vendor/*.js',
      'scripts/mock/server.js',
      'scripts/**/*.test.es6.js',
      { pattern: 'scripts/**/*.js',
        included: false },
      { pattern: 'scripts/**/*.es6.js',
        included: false }
    ],
    preprocessors: {
      'scripts/mock/server.js': ['browserify'],
      'scripts/**/*.test.es6.js': ['browserify']
    },
    browserify: {
      transform: [
        [{fileExt: '.es6.js'}, 'esnextify']
      ],
      basedir: 'src/'
    },
    colors: true,
    reporters: ['mocha'],
    port: 9876,
    logLevel: config.LOG_INFO,
    // browsers: ['Chrome'],
    browsers: ['PhantomJS'],
    singleRun: true,
    autoWatch: true
  });
};
