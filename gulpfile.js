/* global Promise */
'use strict';

// Include gulp
var gulp = require('gulp');
var gulpif = require('gulp-if');

var appName = 'fakeApp',
  staticResourceDir = 'metadata/staticresources';

// Include Our Plugins
var jshint = require('gulp-jshint');
var concat = require('gulp-concat');
var uglify = require('gulp-uglify');
var rename = require('gulp-rename');
var zip = require('gulp-zip');
var shell = require('gulp-shell');
var argv = require('yargs').argv;
var minifyCss = require('gulp-minify-css');
var browserSync = require('browser-sync').create();
// Custom (non-vendor)
var login = require('login');
var execute = require('execute');
var logit = require('logit');
/*
 * Auto Build and Deploy SPA and Salesforce files
 */
gulp.task('auto-deploy-all', ['webpack', 'salesforce']);
/*
 * Auto Build and Deploy SPA
 */
gulp.task('webpack', shell.task('webpack --progress --colors --watch --config webpack.salesforce.deploy.js',
  { 'cwd': 'spa/MyDoxWizard' }));
// figure out why this doesn't work
// var process = require('child_process');
// gulp.task('webpack', function () {
// execute('webpack --progress --colors --watch --config webpack.salesforce.deploy.js', {'cwd':'spa/MyDoxWizard', 'detached': true}).then(logit);
// });
// gulp.task('webpack', function () {
//   process.exec('webpack --progress --colors --watch --config webpack.salesforce.deploy.js', 
//     {'cwd':'spa/MyDoxWizard'}).then(logit);
// });

/*
 * Auto Deploy to Salesforce
 */
gulp.task('salesforce', function () {
  gulp.watch(['./src/**/*.cls', './src/**/*.page'], { interval: 500 }).on('change', function (event) {
    login().then(function () {
      execute('force push -f ' + event.path).then(logit);
      console.log('deploying ' + event.path);
    });
  });
});

/*
 * Automatically lint
 */
gulp.task('auto-lint', function () {
  gulp.watch(['./*.js', './spa/**/*.js'], { interval: 1000 }).on('change', function (event) {
    gulp.src([event.path])
      .pipe(jshint('./config/.jshintrc'))
      .pipe(jshint.reporter('jshint-stylish', { verbose: true }));
  });
});

/*
 * Push Salesforce file(s)
 */
gulp.task('push-this', function () {
  login().then(function () {
    if (argv.file) {
      // Actually Deploy the file
      console.log('deploying ' + argv.file);
      execute('force push -f ' + argv.file).then(logit);
    } else {
      console.log('Please supply a --file parameter');
    }
  });
});

// Lint Task
gulp.task('lint', function () {
  return gulp.src('js/*.js')
    .pipe(jshint())
    .pipe(jshint.reporter('jshint-stylish'));
});

gulp.task('lint-this', function () {
  gulp.src([argv.file])
    .pipe(jshint('./config/.jshintrc'))
    .pipe(jshint.reporter('jshint-stylish', { verbose: true }));
});




// Static server

// Watch scss AND html files, doing different things with each.
gulp.task('serve', function () {
  
  // Serve files from the root of this project
  browserSync.init({
    server: {
      baseDir: "./"
    }
  });

  gulp.watch(["dist/bundle.js"]).on("change", browserSync.reload);
});



// Compile Our Sass
gulp.task('css', function () {
  return gulp.src('**/*.css')
    .pipe(minifyCss({ compatibility: 'ie8' }))
    .pipe(gulp.dest('dist/css'));
});

// Concatenate & Minify JS
gulp.task('scripts', function() {
  gulp.src('./src/**/*.js')
    .pipe(concat('app.js'))
    .pipe(gulpif(argv.prod, rename('app.min.js')))
    .pipe(gulpif(argv.prod, uglify()))
    .pipe(gulp.dest('./dist/'));
});

gulp.task('vendorScripts', function () {
  return gulp.src(['bower_components/*/dist/*.js', '!bower_components/*/dist/*.min.js', 'bower_components/*/*.js', '!bower_components/*/*.min.js'])
    .pipe(concat('vendor.js'))
    .pipe(gulp.dest('dist'))
    .pipe(rename('vendor.min.js'))
    .pipe(uglify())
    .pipe(gulp.dest('dist'));
});

gulp.task('vendorCSS', function () {
  return gulp.src(['bower_components/*/css/*.css', '!bower_components/*/css/*.min.css'])
    .pipe(concat('vendor.css'))
    .pipe(minifyCss({ compatibility: 'ie8' }))
    .pipe(gulp.dest('dist'));
});

gulp.task('vendor', ['vendorScripts', 'vendorCSS']);

gulp.task('zip', function () {
  return gulp.src('dist/*')
    .pipe(zip(appName + '.resource'))
    .pipe(gulp.dest(staticResourceDir));
});

gulp.task('push StaticResource', function () {
  return gulp.src('')
    .pipe(shell(['force push -t StaticResource', 'force push -t ApexPage']))
});

gulp.task('deploy', ['zip', 'push']);

// Watch Files For Changes
gulp.task('watch', function () {
  gulp.watch('js/*.js', ['lint', 'scripts']);
  gulp.watch('scss/*.scss', ['sass']);
});

// Default Task
gulp.task('default', ['lint', 'css', 'scripts', 'watch', 'serve']);