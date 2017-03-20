module.exports = function(config) {
	config.set({
		frameworks: ['jasmine', 'browserify'],
    files: [
            'test/**/*.js'
    ],
		preprocessors: {
			'src/**/*.js': ['browserify'],
      'test/**/*.js': ['browserify']
		},
    browserify: {
      debug: true,
      transform: [['babelify', { presets: ['es2015']} ]]
    },
    babelify: {
      presets: ['es2015']
    },
		reporters: ["progress"],
		browsers: ["Chrome"],
		singleRun: true
	});
};
