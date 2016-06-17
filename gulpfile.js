var gulp = require('gulp');

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

gulp.task('glob:variable', function(){
  console.log('---Gulp loaded successfully.---');
})
