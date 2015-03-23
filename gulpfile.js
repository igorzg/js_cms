"use strict";
var gulp = require('gulp');
var istanbul = require('gulp-istanbul');
var jasmine = require("gulp-jasmine");
var exit = require('gulp-exit');
var less = require('gulp-less');
var sourcemaps = require('gulp-sourcemaps');
var clean = require('del');
var nodemon = require('gulp-nodemon');
var LessPluginCleanCSS = require('less-plugin-clean-css'),
    cleancss = new LessPluginCleanCSS({advanced: true});
// coverage task
gulp.task('coverage', function (cb) {
    gulp.src(['./app/**/*.js'])
        .pipe(istanbul({includeUntested: true}))
        .pipe(istanbul.hookRequire())
        .on('finish', cb);
});

// test with coverage
gulp.task('test-with-coverage', ['coverage'], function () {
    gulp.src(['./tests/**/*-spec.js'])
        .pipe(jasmine({
            verbose: true,
            timeout: 5000,
            includeStackTrace: true
        }))
        .pipe(istanbul.writeReports({
            reporters: ['json', 'clover', 'html']
        }))
        .pipe(exit());
});

// test task
gulp.task('test', function () {
    gulp.src(['./tests/**/*-spec.js'])
        .pipe(jasmine({
            verbose: true,
            timeout: 5000,
            includeStackTrace: true
        }))
        .pipe(exit());
});

//clean less
gulp.task('clean-less', function (cb) {
    clean([
        './storage/css/**/*'
    ], cb);
});
// copy less files for source maps
gulp.task('copy-less', function (cb) {
    gulp.src('./less/**/*.less')
        .pipe(gulp.dest('./storage/css'))
        .on('finish', cb);
});

// compile less files dev env
gulp.task('less-dev', ['copy-less'], function () {
    var lessStream = less({});
    lessStream.on('error',function(e){
        console.log(e);
        lessStream.end();
    });
    gulp.src('./less/public/*.less')
        .pipe(sourcemaps.init({loadMaps: true}))
        .pipe(lessStream)
        .pipe(sourcemaps.write('./maps', {
            includeContent: true,
            sourceRoot: './storage/css',
            debug: true
        }))
        .pipe(gulp.dest('./storage/css'));
});

// compile less files production env
gulp.task('less-watch', function () {
    gulp.watch('./less/**/*.less', ['less-dev'])
        .on('error', function (error) {
            console.error(error);
        });
});

// compile less files production env
gulp.task('less-prod', ['clean-less'], function () {
    gulp.src('./less/public/*.less')
        .pipe(less({
            plugins: [cleancss]
        }))
        .pipe(gulp.dest('./storage/css'));
});

// gulp dev
gulp.task('dev', ['less-watch'], function () {

    nodemon({
        script: 'index.js',
        env: {
            'NODE_ENV': 'dev'
        },
        nodeArgs: ['--debug'],
        ext: 'js'
    })
        .on('restart', function () {
            console.log('restarted!');
        });
});