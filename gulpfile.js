var gulp = require('gulp');
var notify =require('gulp-notify');
var sass = require('gulp-sass');
var sourcemaps = require('gulp-sourcemaps');

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
