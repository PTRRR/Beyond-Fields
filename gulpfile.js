var gulp = require( 'gulp' );
var babel = require( 'gulp-babel' );
var plumber = require( 'gulp-plumber' );
var browserify = require( 'browserify' );
var babelify = require( 'babelify' );
var streamify = require( 'streamify' );
var uglify = require( 'gulp-uglify' );
var webserver = require( 'gulp-webserver' );
var source = require( 'vinyl-source-stream' );
var buffer = require( 'vinyl-buffer' );
var cleanCSS = require( 'gulp-clean-css' );
var htmlmin = require('gulp-html-minifier');

gulp.task( 'default', [ 'update-resources', 'update-libs', 'es6', 'clean-css', 'html-update', 'webserver' ], function(){} );

gulp.task ( 'update-resources', function () {

  return gulp.src ( ['./src/resources/**/*'] ).
    pipe( gulp.dest('./dist/resources/') ); 

} );

gulp.task ( 'update-libs', function () {

  return gulp.src ( ['./src/js/libs/**/*'] ).
    pipe( gulp.dest('./dist/js/libs') ); 

} );

gulp.task( 'es6', function(){

  	var b = browserify();
  	
  	b.transform( 'babelify', {

		  presets: [ 'es2015' ]

	  } )
  	
  	b.add("./src/js/app.js");
  	
  	return b.bundle()
    	.on('error', function(err){
    	  
    	  console.log(err.message);
    	  
    	  this.emit('end');
    	})
    	.pipe(source('app.js'))
    	.pipe(gulp.dest('./dist/js'));

} );

gulp.task( 'clean-css', function(){

	return gulp.src('./src/css/style.css')
		.pipe( cleanCSS() )
		.pipe( gulp.dest('./dist/css') )

} );

gulp.task( 'html-update', function(){

	return gulp.src('./src/index.html')
    .pipe(htmlmin({collapseWhitespace: true}))
		.pipe( gulp.dest('./dist') )

} );


gulp.task( 'watch', function(){

	gulp.watch( './src/js/**/*.js', [ 'es6' ] );
	gulp.watch( './src/css/**/*.css', [ 'clean-css' ] );
	gulp.watch( './src/**/*.html', [ 'html-update' ] );
  gulp.watch( './src/resources/**/*', [ 'update-resources' ] );
  gulp.watch( './src/js/libs/**/*', [ 'update-libs' ] );

} );

gulp.task('webserver',[ 'watch' ], function() {

  	gulp.src('.')
  	  	.pipe(webserver({
  	    	livereload: false,
  	    	directoryListing: true,
  	    	open: true
  	  	}));

});