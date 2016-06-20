var gulp = require('gulp');
var notify =require('gulp-notify');
var sass = require('gulp-sass');
var sourcemaps = require('gulp-sourcemaps');
var browserSync = require('browser-sync');
var inject = require('gulp-inject');
var jshint = require('gulp-inject');
var wiredep = require('wiredep');
var useref = require('gulp-useref');

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

gulp.task('sass', function(){
  return gulp.src('main.scss')
    .pipe(sourcemaps.init())
    .pipe(sass({
      style: 'compressed',
      errLogToConsole: true,
      onError:function(err){
        return notify(err);
      }
    }))
    .pipe(sourcemaps.write())
    .pipe(gulp.dest('.'))
    .pipe(notify({ message: 'Styles task complete' }));
});

gulp.task('concat', function(){
  return gulp.src('*.html')
    .pipe(useref())
    .pipe(gulpIf('*.js', uglify()))
    .pipe(gulpIf('*.css', minifyCss()))
    .pipe(gulp.dest('build'))
});

gulp.task('inject', function(){
  return gulp.src('*.html')
    .pipe(inject(gulp.src(['assets/css/*.css', 'assets/js/*.js'], {read:false}),{relative:true}))
    .pipe(gulp.dest('.'));
});

gulp.task('bower', function(){
  return gulp.src('*.html')
  .pipe(wiredep.stream({
    fileTypes:{
      html:{
        replace:{
          js:function(filePath){
            console.log(filePath);
            return '<script src="' + filePath + '"></script>';
          },
          css: function(filePath) {
              // return '<link rel="stylesheet" href="' + filePath + '"/>';
              console.log(filePath);
          }
        }
      }
    }
  }))
  .pipe(gulp.dest('.'));
});


gulp.task('jshint', function(){
  return gulp.src('assets/js/*.js')
    .pipe(jshint())
    .pipe(jshint.reporter('jshint-stylish'))
    .pipe(jshint.reporter('fail'));
});

gulp.task('watch', function(){
  gulp.watch('assets/sass/**/*.scss', ['sass']);
  gulp.watch(['bower_components/**/*.css', 'bower_components/**/*.js'], ['bower']);
  gulp.watch(['*.html', 'assets/css/*.css', 'assets/js/*.js'],function(event){
    browserSync.reload();
    console.log('css and html');
  });
  gulp.watch(['assets/js/*.js'],function(event){
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

gulp.task('serve', function(){
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
