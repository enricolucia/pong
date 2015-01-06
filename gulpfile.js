/* jshint -W079 */
var
  gulp = require('gulp'),
  gulpBoilerplate = require('es6-gulp-boilerplate'),
  server = require('./app');


/**
 * Here you can configure the gulp build system with custom folders, different
 * build modules, etc.
 * ------------------------------------------------------------------------- */
gulpBoilerplate.config(gulp, {
  modules: {
    // module to use to preprocess your stylesheets. default: less
    // possible values: less, sass, sassCompass, stylus, myth.
    styles: 'less'
  },
  paths: {
    src: {
      // folder home of your source files (less, js, etc). default: src/
      base: '',

      // styles sources folder. default: styles/
      styles: 'less/',

      // scripts folder. default: scripts/
      scripts: '',

      // templates and partials folder: default: ../views/, partials/
      templates: '',
      partials: ''
    },

    out: {
      // folder destination for built bundles. default: public/
      base: '',

      // production ready styles folder. default: css/
      styles: '',

      // production ready scripts folder. default: js/
      scripts: ''
    }
  },
  // express web server to use while developing.
  // port default: 3000
  // liveReloadPort default: 35729
  server: server,
  port: null,
  liveReloadPort: null
});




/**
 * Here you can hook extra tasks as dependency for predefined tasks (insert
 * a leading '!' to remove dependencies) or add additional sources (insert a
 * leading '!' to the path to delcare sources which should be ignored).
 * ------------------------------------------------------------------------- */
gulpBoilerplate.setupTasks({
  'bundle-js': {
    deps: [],
    src: []
  },
  'bundle-js:dev': {
    deps: [],
    src: []
  },
  'lint': {
    deps: [],
    src: []
  }
});


/**
 * Add extra gulp tasks below
 * ------------------------------------------------------------------------- */
var $ = gulpBoilerplate.getPlugins();

// Check the Meesayen/es6-boilerplate repository on github for a sample usage.

/* Handlebars helpers bundling --------------------------------------------- */
gulp.task('publish-helpers', function() {
  return gulp.src(['handlebars.helpers.js'])
  .pipe($.uglify())
  .pipe(gulp.dest('public/js/'));
});


/**
 * Here you plug additional watchers to gulp.
 * ------------------------------------------------------------------------- */
gulpBoilerplate.setupWatchers(function(gulp) {
  gulp.watch('handlebars.helpers.js', ['publish-helpers']);
});



/**
 * Here you can inject extra tasks into the main tasks. Those will be appendend
 * and concurrently run with other tasks.
 * ------------------------------------------------------------------------- */
gulpBoilerplate.setupMain({
  'development': [
    'publish-helpers'
  ],
  'test': [],
  'production': [
    'publish-helpers'
  ]
});
