'use strict'

var babelify = require('babelify');
var browserSync = require('browser-sync');
var browserify = require('browserify');
var buffer = require('vinyl-buffer');
var changed = require('gulp-changed');
var copy = require('gulp-copy');
var csso = require('gulp-csso');
var del = require('del');
var electron = require('gulp-electron');
var gulp = require('gulp');
var notify = require('gulp-notify');
var packageJson = require('./package.json');
var sass = require('gulp-sass');
var shell = require('gulp-shell');
var source = require('vinyl-source-stream');
var uglify = require('gulp-uglify');

var o = {
  jsx: 'app/scripts/app.jsx',
  scss: 'app/styles/main.scss',
  bundle: 'app.js',
  distJs: 'dist/app/js',
  distCss: 'dist/app/css'
};

gulp.task('clean', function (cb) {
  del(['dist', 'release'], cb);
});

gulp.task('copy', function () {
  return gulp.src([ 'app/index.html', 'app/index.js', 'package.json', 'terminal.html', 'node_modules/terminal.js/dist/terminal.js', 'node_modules/socket.io-stream/socket.io-stream.js', 'node_modules/socket.io/node_modules/socket.io-client/socket.io.js', 'node_modules/electron-rebuild/node_modules/npm/html/favicon.ico'  ] )
    .pipe(gulp.dest('dist/app'));
});


gulp.task('copy2', function () {
  return gulp.src( [ 'bower_components/**/*' ] )
    .pipe(gulp.dest('dist/app/bower_components'));
}); 

gulp.task('browserify', function () {
  return browserify(o.jsx)
    .transform(babelify)
    .bundle()
    .pipe(source(o.bundle))
    .pipe(buffer())
    .pipe(uglify())
    .pipe(gulp.dest(o.distJs));
});

gulp.task('browserifyDev', function () {
  return browserify(o.jsx)
    .transform(babelify)
    .bundle()
    .pipe(source(o.bundle))
    .pipe(gulp.dest(o.distJs));
});

gulp.task('styles', function () {
  return gulp.src(o.scss)
    .pipe(changed(o.distCss))
    .pipe(sass({errLogToConsole: true}))
    .on('error', notify.onError())
    .pipe(csso())
    .pipe(gulp.dest(o.distCss));
});

gulp.task('browserSync', function () {
  var bs = browserSync.create();
  bs.watch('app/**/*').on('change', function () {
    gulp.start(['browserifyDev', 'copy', 'styles']);
  });
});

gulp.task('electron', ['browserifyDev'], function () {
  var cmd = '';
  switch (process.platform) {
    case 'darwin':
      cmd = './node_modules/electron-prebuilt/dist/Electron.app/Contents/MacOS/Electron dist/app';
      break;
    case 'win32':
      cmd = 'node_modules\\electron-prebuilt\\dist\\electron.exe dist\\app';
      break;
    case 'linux':
      cmd = './node_modules/electron-prebuilt/dist/electron dist/app';
      break;
    default:
      console.log(process.platform + ' is not supported.');
      return;
  }

  return gulp.src('', {read: false})
    .pipe(shell(cmd));
});

gulp.task('release', ['browserify'], function () {
  gulp.src('')
    .pipe(electron({
      src: './dist/app',
      packageJson: packageJson,
      release: './release',
      cache: './cache',
      version: 'v0.25.3',
      rebuild: false,
      platforms: ['win32-ia32', 'darwin-x64']
    }))
    .pipe(gulp.dest(''));
});

gulp.task('watch', ['clean'], function () {
  gulp.start(['browserifyDev', 'copy', 'copy2', 'styles', 'browserSync', 'electron']);
});

gulp.task('build', ['clean'], function () {
  process.env.NODE_ENV = 'production';
  gulp.start(['browserify', 'copy', 'styles', 'release']);
});

gulp.task('default', function () {
  console.log('Run `gulp watch` or `gulp build`');
});


/*
var plugins = require("gulp-load-plugins")({
	pattern: ['gulp-*', 'gulp.*', 'main-bower-files'],
	replaceString: /\bgulp[\-.]/
});
 // Define default destination folder
var dest = 'dest/app/';

gulp.task('js', function() {
 	var jsFiles = ['app/*.js'];
 	gulp.src(plugins.mainBowerFiles().concat(jsFiles))
		.pipe(plugins.filter('*.js'))
		.pipe(plugins.concat('main.js'))
		.pipe(plugins.uglify())
		.pipe(gulp.dest(dest + 'js'));
});
*/
