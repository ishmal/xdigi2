const webpack = require("webpack");

module.exports = {
	entry: {
		app: './src/app.js',
		vendor: ['vue', 'tether', 'bootstrap', 'jquery']
	},
	output: {
		filename: 'app.bundle.js',
		path: __dirname + '/www'
	},
	resolve: {
		// Add `.ts` and `.tsx` as a resolvable extension.
		extensions: ['', '.webpack.js', '.web.js', '.js', '.vue'],
	},
	module: {
		loaders: [{
				test: /\.vue$/,
				loader: 'vue'
			},
			{
				test: /.js$/,
				loader: 'babel-loader',
				query: {
					presets: ['es2015']
				}
			}
		]
	},
	vue: {
		loaders: {
			js: 'babel?presets[]=es2015'
		}
	},
	devtool: "source-map",
	plugins: [
		new webpack.optimize.CommonsChunkPlugin( /* chunkName= */ "vendor", /* filename= */
			"vendor.bundle.js"),
		new webpack.ProvidePlugin({
			$: "jquery",
			jQuery: "jquery",
			"window.jQuery": "jquery",
			"Tether": 'tether'
		})
	]
}
