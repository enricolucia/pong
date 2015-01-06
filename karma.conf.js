module.exports = function(config) {
  config.set({
    basePath: 'src/',
    frameworks: ['mocha', 'chai', 'browserify'],
    files: [
      'scripts/vendor/*.js',
      'scripts/mock/server.js',
      'scripts/**/*.test.es6.js',
      '../views/**/*.hbs',
      { pattern: 'scripts/**/*.js',
        included: false }
    ],
    preprocessors: {
      'scripts/mock/server.js': ['browserify'],
      'scripts/**/*.test.es6': ['browserify'],
      '../**/*.hbs': 'handlebars'
    },
    browserify: {
      // debug: true,
      // watch: true,
      transform: ['esnextify'],
      basedir: 'src/'
    },
    handlebarsPreprocessor: {
      templates: 'Handlebars.templates'
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
