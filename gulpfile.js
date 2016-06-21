var gulp = require('gulp');
var notify =require('gulp-notify');
var sass = require('gulp-sass');
var sourcemaps = require('gulp-sourcemaps');
var browserSync = require('browser-sync');
var inject = require('gulp-inject');
var jshint = require('gulp-inject');
var wiredep = require('wiredep');
var useref = require('gulp-useref');
var gulpIf      = require('gulp-if');
var minifyCss   = require('gulp-minify-css');
var uglify      = require('gulp-uglify');
var revision = require('gulp-rev');
var clean = require('gulp-clean');
var plumber = require('gulp-plumber');
var imagemin = require('gulp-imagemin');

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
    src: basePaths.root+'*.html',
    dest: basePaths.root,
    build: basePaths.build
  },
  sass:{
    src: basePaths.src +'sass/**/*.scss',
    dest: basePaths.root
  },
  css:{
    src: basePaths.src +'css/*.css',
    dest: basePaths.dest + 'css',
    build: basePaths.build+'css'
  },
  js:{
    src: basePaths.src + 'js/*.js',
    dest: basePaths.dest + 'js',
    build: basePaths.build + 'js'
  },
  images: {
    src: basePaths.src +'images/**/*.{png,jpg,gif}',
    dest: basePaths.dest + 'images',
    build: basePaths.build + 'images'
  },
  fonts: {
    src: [basePaths.src +'fonts/**/*', basePaths.bower+'**/fonts/*'],
    dest: basePaths.dest + 'fonts',
    build: basePaths.build + 'fonts'
  },
  build:{
    src: basePaths.build
  },
  bower:{
    src: basePaths.bower
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
    .pipe(notify({ message: 'Compiled Successfully' }));
});

gulp.task('concat', function(){
  return gulp.src(paths.html.src)
    .pipe(useref())
    .pipe(gulpIf('*.js', uglify()))
    .pipe(gulpIf('*.css', minifyCss()))
    .pipe(gulp.dest(paths.build.src));
});

// gulp.task('revision', function () {
// 	return gulp.src(['build/css/*.css', 'build/js/*.js'])
// 		.pipe(revision())
// 		.pipe(gulp.dest(paths.build));
// });

gulp.task('inject', function(){
  return gulp.src(paths.html.src)
    .pipe(inject(gulp.src([paths.css.src , paths.js.src], {read:false}),{relative:true}))
    .pipe(gulp.dest(paths.html.dest));
});

gulp.task('bower', function(){
  return gulp.src(paths.html.src)
  .pipe(wiredep.stream())
  .pipe(gulp.dest(paths.html.dest));
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
  gulp.watch([paths.html.src, paths.css.src, paths.js.src],function(event){
    browserSync.reload();
    console.log('css and html');
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

// Task for build
gulp.task('image-min', function(){
  return gulp.src(paths.images.src)
    .pipe(plumber())
    .pipe(imagemin({optimizationLevel : 5}))
    .pipe(gulp.dest(paths.images.build));
});

gulp.task('copy-fonts', function() {
  return gulp.src(paths.fonts.src)
  .pipe(gulp.dest(paths.fonts.build));
})

gulp.task('copy-html', function() {
  return gulp.src(paths.html.src)
  .pipe(gulp.dest(paths.html.build));
});

gulp.task('clean', function () {
	return gulp.src(paths.build, {read: false})
		.pipe(clean());
});


gulp.task('build',['clean', 'image-min', 'copy-fonts', 'copy-html', 'concat']);

gulp.task('serve', ['sass', 'inject', 'bower', 'watch'], function(){
  browserSync.init({
    server : {
      baseDir : '.',
      routes : {
        "/bower_components" : "bower_components"
      },
      port : 9090,
      ghostMode : false
    }
  })
})
