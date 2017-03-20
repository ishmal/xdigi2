const webpack = require("webpack");

module.exports = {
	entry: {
		app: './src/app.js',
		vendor: ['vue', 'tether', 'bootstrap', 'jquery']
	},
	output: {
		filename: '[name].bundle.js',
		path: __dirname + '/www'
	},
	resolve: {
		// Add `.ts` and `.tsx` as a resolvable extension.
		extensions: ['.webpack.js', '.web.js', '.js', '.vue'],
	},
	module: {
		loaders: [{
				test: /\.vue$/,
				loader: 'vue-loader',
				exclude: /node_modules/
			},
			{
				test: /.js$/,
				loader: 'babel-loader',
				exclude: /node_modules/,
				options: {
					presets: ['es2015', 'stage-2']
				}
			}
		]
	},
	devtool: "source-map",
	plugins: [
		new webpack.optimize.CommonsChunkPlugin("vendor"),
		new webpack.ProvidePlugin({
			$: "jquery",
			jQuery: "jquery",
			"window.jQuery": "jquery",
			"Tether": 'tether'
		})
	]
}
