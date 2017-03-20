const webpack = require("webpack");

module.exports = {
	entry: {
		app: './src/app.js',
		vendor: ['vue', 'bootstrap', 'tether', 'jquery']
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
		loaders: [
			{
				test: /\.vue$/,
				loader: 'vue'
			}
		]
	},
	devtool: "source-map",
	plugins: [
		new webpack.optimize.CommonsChunkPlugin( /* chunkName= */ "vendor", /* filename= */
			"vendor.bundle.js"),
		new webpack.ProvidePlugin({
      "window.Tether": 'tether',
			$: "jquery",
			jQuery: "jquery",
			"window.jQuery": "jquery"
		})
	]
}
