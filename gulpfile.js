/**
 * TODO: Move build system to Parcel / Webpack
 * @type {Gulp}
 */
const gulp = require('gulp');
const minifycss = require('gulp-minify-css');
const uglify = require('gulp-uglify');
const concat = require('gulp-concat');
const less = require('gulp-less');
const minifyhtml = require('gulp-minify-html');
const rename = require('gulp-rename');
const child = require('child_process');
const del = require('del');
const {series} = require("gulp");
const {task} = require('gulp');

let rmdir = function (directories, callback) {
    if (typeof directories === 'string') {
        directories = [directories];
    }
    let args = directories;
    args.unshift('-rf');
    child.execFile('rm', args, {env: process.env}, function (err, stdout, stderr) {
        callback.apply(this, arguments);
    });
};

/* Delete all files */
task('clean', function (cb) {
    del(['dist']);
    cb();
});

/* Minify html */
task('html', function () {
    let opts = {
        conditionals: true,
        spare: true
    };

    return gulp.src('src/html/*.html')
        .pipe(minifyhtml(opts))
        .pipe(gulp.dest('dist/'))

});

/* Render less-css and minify */
task('styles', function () {
    return gulp.src('src/css/style.less')
        .pipe(less())
        .pipe(minifycss(/*{compatibility: 'ie8'}*/))
        .pipe(gulp.dest('dist/css'))
});

/* Scripts.. and minify */
task('scripts', function () {
    return gulp.src([
        'src/js/*',
    ])
        .pipe(concat('main.js'))
        .pipe(gulp.dest('./dist/js'))
        .pipe(rename({suffix: '.min'}))
        .pipe(uglify())
        .pipe(gulp.dest('./dist/js'))

});

/* Images copy */
task('images', function () {
    return gulp.src('./src/images/*.png')
        .pipe(gulp.dest('./dist/images'))
});

// Fonts
task('fonts', function () {
    return gulp.src([
        './src/fonts/*'])
        .pipe(gulp.dest('./dist/fonts'));
});

/* Delete target */
task('clean', function (cb) {
    rmdir('dist', cb);
});

task('finish',function(cb){
    console.log("\x1b[32m","*****Build is finished. You can open index.html from the 'dist' folder, or type 'npm run serve'.*****")
    cb()
})

const build = series('clean','fonts', 'styles', 'images', 'scripts', 'html','finish');
exports.build = build;
exports.default = build;
