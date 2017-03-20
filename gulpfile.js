const gulp = require('gulp');
const del = require('del');
const replace = require('gulp-replace');
const gutil = require("gulp-util");

gulp.task('copy', function() {
	gulp.src([
		'./src/index.html',
		'./node_modules/bootstrap/dist/css/bootstrap.min.css',
	]).pipe(gulp.dest('./www/'));
	gulp.src([
		'./node_modules/font-awesome/fonts/**/*'
	]).pipe(gulp.dest('./www/fonts'));
	gulp.src([
		'./node_modules/font-awesome/css/font-awesome.min.css'
	]).pipe(replace('../fonts', 'fonts')).pipe(gulp.dest('./www'));
});

gulp.task('clean', function(done) {
	let files = [
		'www/*'
	];
	del(files, function() {
		done();
	});
});


let KarmaServer = require('karma').Server;

/**
 * Run test once and exit
 */
gulp.task('test', function(done) {
	new KarmaServer({
		configFile: __dirname + '/karma.conf.js',
		singleRun: false
	}, done).start();
});


gulp.task('build', ['copy']);

gulp.task('default', ['build']);
