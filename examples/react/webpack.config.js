const path = require('path');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const SvgStorePlugin = require('external-svg-sprite-loader/lib/SvgStorePlugin');

module.exports = {
    entry: {
        main: path.resolve(__dirname, 'src', 'index.jsx'),
    },
    module: {
        rules: [
            {
                loader: 'babel-loader',
                test: /\.jsx?$/,
            },
            {
                loader: ExtractTextPlugin.extract({
                    use: {
                        loader: 'css-loader',
                        options: {
                            modules: true,
                            importLoaders: 1,
                            localIdentName: '[name]--[local]__[hash:base64:5]',
                        },
                    },
                }),
                test: /\.css$/,
            },
            {
                loader: 'external-svg-sprite-loader',
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
        new ExtractTextPlugin({
            allChunks: true,
            filename: 'css/[name].css',
        }),
        new SvgStorePlugin(),
    ],
};
