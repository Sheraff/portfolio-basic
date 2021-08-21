const path = require('path');

module.exports = {
	mode: 'production',
	watch: false,
	entry: [
		'./index.js',
		'./build-files.js',
	],
	output: {
		filename: 'index.js',
		path: path.resolve(__dirname, '.dist'),
	},
	module: {
		rules: [
			{
				test: /\.(html|css)/,
				exclude: /\.template\.html/,
				loader: 'file-loader',
				options: {
					name: '[path][name].[ext]',
				},
				type: 'javascript/auto'
			}
		]
	}
};