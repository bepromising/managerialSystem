/* const ExtractTextPlugin = require('extract-text-webpack-plugin'); */
module.exports = {
	baseUrl: process.env.NODE_ENV === 'production' ? '' : '/',
	runtimeCompiler: true,
	productionSourceMap: false,
	devServer: {
		port: 3000
	},
	//lintOnSave: false,
	assetsDir: process.env.VUE_APP_ASSETS,
	css: {
		modules: false,
		loaderOptions: {
			// pass options to sass-loader
			sass: {
				// @/ is an alias to src/
				// so this assumes you have a file named `src/variables.scss`
				data: `@import "@/style/_setting.scss";`
			},
			less: {
				javascriptEnabled: true
			}
		}
	},
	chainWebpack: config => {
		config.plugins.delete('prefetch');
		config.when(process.env.NODE_ENV === 'production', item => {
			item
				.plugin('extract-css')
				.tap(([options, ...args]) => [
					Object.assign({}, options, {
						filename: 'static/css/[name].[hash].css',
						chunkFilename: 'static/css/[name].[hash].css',
					}),
					...args
				]);

			item.plugin('html').tap(args => {
				args[0].minify.removeAttributeQuotes = false;
				return args;
			});
		});

		config.output
			.filename(process.env.NODE_ENV === 'production' ? 'static/js/[name].[hash].js' : 'static/js/[name].js')
			.chunkFilename(process.env.NODE_ENV === 'production' ? 'static/js/[name].[hash].js' : 'static/js/[name].js');
	}
};
