const path = require('path');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const SvgStorePlugin = require('external-svg-sprite-loader/lib/SvgStorePlugin');

module.exports = {
    entry: {
        main: path.resolve(__dirname, 'src', 'index.jsx'),
    },
    module: {
        loaders: [
            {
                loader: 'babel',
                test: /\.jsx?$/,
            },
            {
                loader: ExtractTextPlugin.extract('css?modules&importLoaders=1&localIdentName=[name]--[local]___[hash:base64:5]'),
                test: /\.css$/,
            },
            {
                loader: 'external-svg-sprite',
                test: /\.svg$/,
            },
        ],
    },
    output: {
        filename: 'js/[name].js',
        path: path.resolve(__dirname, 'public'),
        publicPath: '/',
    },
    plugins: [
        new ExtractTextPlugin('css/[name].css', { allChunks: true }),
        new SvgStorePlugin(),
    ],
};
