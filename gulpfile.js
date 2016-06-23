var gulp         = require('gulp');
var notify       = require('gulp-notify');
var sass         = require('gulp-sass');
var sourcemaps   = require('gulp-sourcemaps');
var browserSync  = require('browser-sync');
var inject       = require('gulp-inject');
var jshint       = require('gulp-jshint');
var wiredep      = require('wiredep');
var useref       = require('gulp-useref');
var autoprefixer = require('gulp-autoprefixer');
var gulpIf       = require('gulp-if');
var minifyCss    = require('gulp-minify-css');
var uncss = require('gulp-uncss')
var uglify       = require('gulp-uglify');
var rev          = require('gulp-rev');
var clean        = require('gulp-clean');
var htmlmin      = require('gulp-htmlmin');
var plumber      = require('gulp-plumber');
var imagemin     = require('gulp-imagemin');
var flatten      = require('gulp-flatten');
var fileInclude  = require('gulp-file-include');
var sequence     = require('gulp-sequence');


// var $ = require('gulp-load-plugins')({
//   pattern: ['gulp-*', 'wiredep','browser-sync']
// });

//Example: glob may be:

// js/app.js
// Matches the exact file

// js/*.js
// Matches all files ending in .js in the js directory only

// js/**/*.js
// Matches all files ending in .js in the js directory and all child directories

// !js/app.js
// Excludes js/app.js from the match, which is useful if you want to match all files in a directory except for a particular file

// *.+(js|css)
// Matches all files in the root directory ending in .js or .css

//['js/app.js', 'js/*.js', '*.js']
//Matches multiple files

// gulp.watch('templates/*.tmpl.html', function (event) {
//    console.log('Event type: ' + event.type); // added, changed, or deleted
//    console.log('Event path: ' + event.path); // The path of the modified file
// });

// Started from here

gulp.task('glob:variable', function(){
  console.log('---Gulp loaded successfully.---');
});

var basePaths = {
  root: './',
  src: 'assets/',
  dest: 'assets/',
  build: 'build/',
  bower: 'bower_components/',
  tmp: '.tmp/'
};

var paths = {

  html:{
    src: 'src/*.html',
    dest: basePaths.tmp,
    build: basePaths.build
  },
  html_partials:{
    src: 'src/partials/*.html'
  },
  sass:{
    src: basePaths.src +'sass/**/*.scss',
    dest: basePaths.tmp+'css/',
    build: basePaths.build + 'css/'
  },
  css:{
    src: basePaths.src +'css/*.css',
    dest: basePaths.tmp+'css/',
    build: basePaths.build+'css/'
  },
  js:{
    src: basePaths.src + 'js/*.js',
    dest: basePaths.tmp + 'js/',
    build: basePaths.build + 'js/'
  },
  images: {
    src: basePaths.src +'images/**/*.{png,jpg,gif}',
    dest: basePaths.dest + 'images/',
    build: basePaths.build + 'images/'
  },
  fonts: {
    src: [basePaths.src +'fonts/**/*.{eot,svg,ttf,woff}', basePaths.bower+'**/fonts/**/*.{eot,svg,ttf,woff}'],
    dest: basePaths.dest + 'fonts/',
    build: basePaths.build + 'fonts/'
  },
  build:{
    src: basePaths.build
  },
  bower:{
    src: basePaths.bower
  },
  tmp:{
    src: basePaths.tmp + '*.html',
    dest: basePaths.tmp,
    css: {
      src : basePaths.tmp + 'css/*.css'
    }
  }


};

gulp.task('show-paths', function(){
  console.log(paths);
});

gulp.task('sass', function(){
  return gulp.src(paths.sass.src)
    .pipe(sourcemaps.init())
    .pipe(sass())
    .on("error", notify.onError(function (error) {
      return error.message;
    }))
    .pipe(sourcemaps.write())
    .pipe(gulp.dest(paths.sass.dest))
    // .pipe(notify({ message: 'Compiled Successfully' }));
});



gulp.task('revision', function () {
	return gulp.src(['build/css/*.css', 'build/js/*.js'])
		.pipe(rev())
		.pipe(gulp.dest(paths.build));
});

gulp.task('inject', function(){
  return gulp.src(paths.tmp.src)
    .pipe(inject(gulp.src([paths.css.src , paths.js.src], {read:false}),{relative:true}))
    .pipe(gulp.dest(paths.tmp.dest));
});

gulp.task('bower', function(){
  return gulp.src(paths.tmp.src)
  .pipe(wiredep.stream())
  .pipe(gulp.dest(paths.tmp.dest));
});


gulp.task('jshint', function(){
  return gulp.src(paths.js.src)
    .pipe(jshint())
    .pipe(jshint.reporter('jshint-stylish'))
    .pipe(jshint.reporter('fail'));
});



gulp.task('watch', function(){
  gulp.watch(paths.sass.src, ['sass']);
  gulp.watch(paths.bower+'/**/*.{css,js}', ['bower']);
  gulp.watch([paths.html.src, paths.html_partials.src, paths.css.src, paths.js.src, paths.tmp.css.src],function(event){
    gulp.start('html-inject');
    browserSync.reload();
  });
  gulp.watch([paths.js.src],function(event){
    console.log('js only');
    if(isOnlyChange(event)){
      browserSync.reload();
      gulp.start('jshint');
    }else{
      gulp.start('inject');
    }

  });

});


function isOnlyChange(event) {
  console.log(event);
  return event.type === 'changed';
}



gulp.task('html-inject', ['sass'], function(){
    return gulp.src(paths.html.src)
    .pipe(fileInclude({
      prefix: '@@',
      basepath: 'src/partials/'
    }))
    .pipe(inject(gulp.src([paths.css.src , paths.js.src, paths.tmp.css.src]), {relative:true}))
    .pipe(wiredep.stream())
    .pipe(gulp.dest(paths.tmp.dest))
});


// Task for build
gulp.task('concat', function(){
  return gulp.src(paths.tmp.src)
    .pipe(useref())
    .pipe(gulpIf('*.js', uglify()))
    .pipe(gulpIf('*.css', minifyCss()))
    // .pipe(autoprefixer('last 2 version', 'safari 5', 'ie 8', 'ie 9'))
    .pipe(gulp.dest(paths.build.src));
});

gulp.task('image-min', function(){
  return gulp.src(paths.images.src)
    .pipe(plumber())
    .pipe(imagemin({optimizationLevel : 5}))
    .pipe(gulp.dest(paths.images.build));
});

gulp.task('copy-fonts', function() {
  return gulp.src(paths.fonts.src)
    .pipe(flatten())
    .pipe(gulp.dest(paths.fonts.build));
})

gulp.task('copy-html', function() {
  return gulp.src(paths.tmp.src)
    .pipe(htmlmin({collapseWhitespace: true}))
    .pipe(gulp.dest(paths.html.build));
});

gulp.task('html-minify', function(){
  return gulp.src(paths.build.src+'*.html')
    .pipe(htmlmin({collapseWhitespace: true}))
    .pipe(gulp.dest(paths.html.build));
});

gulp.task('clean', function () {
	return gulp.src(paths.build.src, {read: false})
		.pipe(clean());
});

gulp.task('clean-all', function () {
	return gulp.src([paths.build.src, basePaths.tmp], {read: false})
		.pipe(clean());
});

gulp.task('build:watch', function(){
  gulp.watch(paths.sass.src, ['sass','concat']);
  gulp.watch(paths.bower+'/**/*.{css,js}', ['bower','concat']);
  gulp.watch([paths.html.src, paths.html_partials.src, paths.css.src, paths.js.src, paths.tmp.css.src],function(event){
    gulp.start('html-inject');
    gulp.start('concat');
    browserSync.reload();
  });
  gulp.watch([paths.js.src],function(event){
    console.log('js only');
    if(isOnlyChange(event)){
      browserSync.reload();
      gulp.start('jshint');
    }else{
      gulp.start('inject');
    }

  });
});

gulp.task('build', sequence('clean', 'image-min', 'copy-fonts', 'concat','html-minify'));


gulp.task('serve', ['clean-all', 'html-inject', 'watch'], function(){
  browserSync.init({
    server : {
      baseDir : '.tmp',
      routes : {
        "/bower_components" : "bower_components",
        "/assets": "assets",
        "/.tmp": ".tmp"
      }
    },
    ghostMode : false,
    scrollProportionally: false,
    port : 9091,
  })
});

gulp.task('serve:build', ['clean-all', 'build','build:watch'], function(){
  browserSync.init({
    server : {
      baseDir : 'build',
      routes : {

      }
    },
    ghostMode : false,
    scrollProportionally: false,
    port : 6090,
  })
});
