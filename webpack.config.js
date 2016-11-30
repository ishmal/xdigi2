const webpack = require("webpack");

module.exports = {
	entry: {
		app: './src/app.ts',
		vendor: ['vue', 'bootstrap', 'jquery']
	},
	output: {
		filename: 'app.bundle.js',
		path: __dirname + '/www'
	},
	resolve: {
		// Add `.ts` and `.tsx` as a resolvable extension.
		extensions: ['', '.webpack.js', '.web.js', '.ts', '.tsx', '.js', '.vue'],
	},
	module: {
		loaders: [
			// all files with a `.ts` or `.tsx` extension will be handled by `ts-loader`
			{
				test: /\.tsx?$/,
				loader: 'vue-ts'
			}, {
				test: /\.vue$/,
				loader: 'vue'
			}
		]
	},
	vue: {
		// instruct vue-loader to load TypeScript
		loaders: {
			js: 'vue-ts-loader',
		},
		// make TS' generated code cooperate with vue-loader
		esModule: true
	},
	devtool: "source-map",
	plugins: [
		new webpack.optimize.CommonsChunkPlugin( /* chunkName= */ "vendor", /* filename= */
			"vendor.bundle.js"),
		new webpack.ProvidePlugin({
			$: "jquery",
			jQuery: "jquery",
			"window.jQuery": "jquery"
		})
	]
}
