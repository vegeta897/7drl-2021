const { merge } = require('webpack-merge')
const TerserPlugin = require('terser-webpack-plugin')
const ZipPlugin = require('zip-webpack-plugin')
const common = require('./webpack.common')

module.exports = merge(common, {
	mode: 'production',
	optimization: {
		minimize: true,
		minimizer: [new TerserPlugin()],
	},
	plugins: [
		new ZipPlugin({
			filename: 'app.zip',
			exclude: [/\.js.map$/],
		}),
	],
})
