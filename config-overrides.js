const paths = require('react-scripts/config/paths');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const webpack = require('webpack');

paths.backgroundJs = paths.appSrc + '/background.js';
paths.devConfig = paths.appSrc + '/config/config.dev.json';
paths.prodConfig = paths.appSrc + '/config/config.prod.json';
paths.globalMocker = paths.appSrc + '/globalMocker.js';

const replacePlugin = (plugins, nameMatcher, newPlugin) => {
	const pluginIndex = plugins.findIndex((plugin) => {
		return plugin.constructor && plugin.constructor.name && nameMatcher(plugin.constructor.name);
	});

	if (-1 === pluginIndex) {
		return plugins;
	}

	const nextPlugins = plugins.slice(0, pluginIndex).concat(newPlugin).concat(plugins.slice(pluginIndex + 1));

	return nextPlugins;
};

module.exports = {
	webpack: (config, env) => {
		const isEnvDevelopment = 'development' === env;
		const isEnvProduction = 'production' === env;

		if (process.env.PUBLISH_BUILD !== 'true') {
			config.devtool = config.devtool != 'source-map' ? config.devtool : 'eval-source-map';
		}
		
		config.entry = {
			main: [
				isEnvDevelopment && paths.globalMocker,
				...config.entry
			].filter(Boolean),
			background: paths.backgroundJs,
		};
		config.optimization.splitChunks = {
			chunks: (chunk) => chunk.name !== 'background',
			name: false,
		};
		config.optimization.runtimeChunk = {
			name: 'runtime',
		};

		const htmlWebpackPlugin = new HtmlWebpackPlugin(
			Object.assign({}, {
					inject: true,
					chunks: ['main'],
					template: paths.appHtml,
				},
				isEnvProduction ?
				{
					minify: {
						removeComments: true,
						collapseWhitespace: true,
						removeRedundantAttributes: true,
						useShortDoctype: true,
						removeEmptyAttributes: true,
						removeStyleLinkTypeAttributes: true,
						keepClosingSlash: true,
						minifyJS: true,
						minifyCSS: true,
						minifyURLs: true,
					},
				} :
				undefined
			)
		);
		config.plugins = replacePlugin(config.plugins, (name) => /HtmlWebpackPlugin/i.test(name), htmlWebpackPlugin);

		if (!isEnvProduction) {
			config.plugins.push(new webpack.ProvidePlugin({
				'chrome': 'sinon-chrome'
			}));
		}

		config.externals = {
			'Config': JSON.stringify(process.env.PUBLISH_BUILD === 'true' ? require(paths.prodConfig) : require(paths.devConfig)),
		};

		return config;
	}
};
