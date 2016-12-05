const gulp = require('gulp');
const del = require('del');
const replace = require('gulp-replace');
const gutil = require("gulp-util");
const webpack = require("webpack");
const WebpackDevServer = require("webpack-dev-server");

gulp.task('copy', function () {
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
    del(['www/*'], function() {
      done();
    });
});

gulp.task("webpack", function(callback) {
    let config = require('./webpack.config.js');
    webpack(config, function(err, stats) {
        if(err) throw new gutil.PluginError("webpack", err);
        gutil.log("[webpack]", stats.toString({
            // output options
        }));
        callback();
    });
});

gulp.task("serve", function(callback) {
    let config = require('./webpack.config.js');
    // Start a webpack-dev-server
    let compiler = webpack(config);
    new WebpackDevServer(compiler, {
      publicPath: "/",
      stats: {
        colors: true
      }
    }).listen(8080, "localhost", function(err) {
        if(err) throw new gutil.PluginError("webpack-dev-server", err);
        // Server listening
        gutil.log("[webpack-dev-server]", "http://localhost:8080/webpack-dev-server/index.html");

        // keep the server alive or continue?
        // callback();
    });
});

gulp.task('build', ['copy', 'webpack']);

gulp.task('default', ['build']);
