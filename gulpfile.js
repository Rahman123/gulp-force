// Include gulp
var gulp = require('gulp'); 

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

// Static server

// Watch scss AND html files, doing different things with each.
gulp.task('serve', function () {

    // Serve files from the root of this project
    browserSync.init({
        server: {
            baseDir: "./"
        }
    });

    gulp.watch(["*.html","dist/app.js"]).on("change", browserSync.reload);
});


// Lint Task
gulp.task('lint', function() {
    return gulp.src('js/*.js')
        .pipe(jshint())
        .pipe(jshint.reporter('default'));
});

// Compile Our Sass
gulp.task('css', function() {
    return gulp.src('css/*.css')
        .pipe(minifyCss({compatibility: 'ie8'}))
        .pipe(gulp.dest('css'));
});

// Concatenate & Minify JS
gulp.task('scripts', function() {
    return gulp.src('js/*.js')
        .pipe(concat('app.js'))
        //.pipe(uglify())
        .pipe(gulp.dest('dist'))
        .pipe(rename('app.min.js'))
        .pipe(uglify())
        .pipe(gulp.dest('dist'));
});

gulp.task('vendorScripts', function() {
    return gulp.src(['bower_components/*/dist/*.js','!bower_components/*/dist/*.min.js','bower_components/*/*.js','!bower_components/*/*.min.js'])
        .pipe(concat('vendor.js'))
        .pipe(gulp.dest('dist'))
        .pipe(rename('vendor.min.js'))
        .pipe(uglify())
        .pipe(gulp.dest('dist'));
});

gulp.task('vendorCSS', function() {
    return gulp.src(['bower_components/*/css/*.css','!bower_components/*/css/*.min.css'])
        .pipe(concat('vendor.css'))
        .pipe(minifyCss({compatibility: 'ie8'}))
        .pipe(gulp.dest('dist'));
});

gulp.task('vendor', ['vendorScripts', 'vendorCSS']);

gulp.task('zip', function(){
    return gulp.src('dist/*')
        .pipe(zip(appName + '.resource'))
        .pipe(gulp.dest(staticResourceDir));
});

gulp.task('push',function(){
    return gulp.src('')
        .pipe(shell(['force push -t StaticResource','force push -t ApexPage']))
});

gulp.task('deploy', ['zip', 'push']);

// Watch Files For Changes
gulp.task('watch', function() {
    gulp.watch('js/*.js', ['lint', 'scripts']);
    gulp.watch('scss/*.scss', ['sass']);
});

// Default Task
gulp.task('default', ['lint', 'css', 'scripts', 'watch', 'serve']);