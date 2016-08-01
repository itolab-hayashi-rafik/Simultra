import gulp  from 'gulp';
import loadPlugins from 'gulp-load-plugins';
import del  from 'del';
import glob  from 'glob';
import path  from 'path';
import webpack from 'webpack';
import webpackStream from 'webpack-stream';
import source  from 'vinyl-source-stream';
import { Instrumenter } from 'isparta';

import manifest  from './package.json';

// TODO: Re-implement build process to utilise proper caching
// TODO: Consider bundling three.js within the final build, or at least having
// a different build step for an all-in-one file

// Load all of our Gulp plugins
const $ = loadPlugins();

// Gather the library data from `package.json`
const config = manifest.babelBoilerplateOptions;
const mainFile = manifest.main;
const destinationFolder = path.dirname(mainFile);
const exportFileName = path.basename(mainFile, path.extname(mainFile));

// additional configurations by Masayuki (2016-07-19)
const destinationFolder2 = '../Server/public/vendor';
const destinationFolder3 = '../GoServer/public/vendor';

// Remove a directory
function _clean(dir) {
  return del([dir]);
}

function cleanDist() {
  return _clean(destinationFolder);
}

function cleanTmp() {
  return _clean('tmp');
}

function onError() {
  $.util.beep();
}

// Lint a set of files
function lint(files) {
  return gulp.src(files)
    .pipe($.plumber())
    .pipe($.eslint())
    .pipe($.eslint.format())
    .pipe($.eslint.failOnError())
    .pipe($.jscs())
    .pipe($.jscs.reporter())
    .on('error', onError);
}

function lintSrc() {
  return lint('src/**/*.js');
}

function lintTest() {
  return lint('test/**/*.js');
}

function lintGulpfile() {
  return lint('gulpfile.babel.js');
}

function build() {
  return gulp.src(path.join('src', config.entryFileName + '.js'))
    .pipe($.plumber())
    .pipe(webpackStream({
      output: {
        filename: exportFileName + '.js',
        libraryTarget: 'umd',
        library: config.mainVarName
      },
      externals: {
        // Proxy the global VIZI variable to require('vizi')
        'vizi': 'VIZI',
        // Proxy the global operative variable to require('operative')
        'operative': 'operative'
      },
      module: {
        loaders: [
          { test: /\.js$/, exclude: /node_modules/, loader: 'babel-loader' }
        ]
      },
      devtool: 'source-map'
    }))
    .pipe(gulp.dest(destinationFolder))
    .pipe(gulp.dest(destinationFolder2))
    .pipe(gulp.dest(destinationFolder3))
    .pipe($.filter(['*', '!**/*.js.map']))
    .pipe($.rename(exportFileName + '.min.js'))
    .pipe($.sourcemaps.init({ loadMaps: true }))

    // Don't mangle class names so we can use them in the console
    // jscs:disable
    // .pipe($.uglify({ mangle: { keep_fnames: true }}))
    // jscs:enable

    // Using the mangle option above breaks the sourcemap for some reason
    .pipe($.uglify())

    .pipe($.sourcemaps.write('./'))
    .pipe(gulp.dest(destinationFolder))
    .pipe(gulp.dest(destinationFolder2))
    .pipe(gulp.dest(destinationFolder3))
    .pipe($.livereload());
}

function buildWorker() {
  return gulp.src(path.join('src', config.entryFileName + '-worker.js'))
    .pipe($.plumber())
    .pipe(webpackStream({
      output: {
        filename: exportFileName + '-worker.js',
        libraryTarget: 'umd',
        library: config.mainVarName
      },
      externals: {
        // add external libraries
      },
      module: {
        loaders: [
          { test: /\.js$/, exclude: /node_modules/, loader: 'babel-loader' }
        ]
      },
      devtool: 'source-map'
    }))
    .pipe(gulp.dest(destinationFolder))
    .pipe(gulp.dest(destinationFolder2))
    .pipe(gulp.dest(destinationFolder3));
}

function moveCSS() {
  return gulp.src(path.join('src', config.entryFileName + '.css'))
    .pipe(gulp.dest(destinationFolder))
    .pipe(gulp.dest(destinationFolder2))
    .pipe(gulp.dest(destinationFolder3));
}

function _mocha() {
  return gulp.src(['test/setup/node.js', 'test/unit/**/*.js'], {read: false})
    .pipe($.mocha({
      reporter: 'dot',
      globals: config.mochaGlobals,
      ignoreLeaks: false
    }));
}

function _registerBabel() {
  require('babel-core/register');
}

function test() {
  _registerBabel();
  return _mocha();
}

function coverage(done) {
  _registerBabel();
  gulp.src(['src/**/*.js'])
    .pipe($.istanbul({ instrumenter: Instrumenter }))
    .pipe($.istanbul.hookRequire())
    .on('finish', () => {
        return test()
          .pipe($.istanbul.writeReports())
          .on('end', done);
      });
}

const watchFiles = ['src/**/*', 'test/**/*', 'package.json', '**/.eslintrc', '.jscsrc'];

// Run the headless unit tests as you make changes.
function watch() {
  $.livereload.listen();
  gulp.watch(watchFiles, ['build']);
  // gulp.watch(watchFiles, ['test']);
}

// Remove the built files
gulp.task('clean', cleanDist);

// Remove our temporary files
gulp.task('clean-tmp', cleanTmp);

// Lint our source code
gulp.task('lint-src', lintSrc);

// Lint our test code
gulp.task('lint-test', lintTest);

// Lint this file
gulp.task('lint-gulpfile', lintGulpfile);

// Lint everything
gulp.task('lint', ['lint-src', 'lint-test', 'lint-gulpfile']);

// Move CSS
gulp.task('move-css', ['clean'], moveCSS);

// Build two versions of the library
gulp.task('build', ['lint', 'move-css'], build);

// Build worker library
gulp.task('build-worker', ['lint'], buildWorker);

// Lint and run our tests
gulp.task('test', ['lint'], test);

// Set up coverage and run tests
gulp.task('coverage', ['lint'], coverage);

// Run the headless unit tests as you make changes.
gulp.task('watch', watch);

// An alias of test
gulp.task('default', ['test']);
