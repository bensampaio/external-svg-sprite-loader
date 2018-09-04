const path = require('path');

const SvgStorePlugin = require('../../lib/SvgStorePlugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

module.exports = {
    entry: {
        main: path.join(__dirname, 'src', 'index.jsx'),
    },
    mode: process.env.NODE_ENV || 'development',
    module: {
        rules: [
            {
                loader: 'babel-loader',
                test: /\.jsx?$/,
            },
            {
                use: [
                    MiniCssExtractPlugin.loader,
                    {
                        loader: 'css-loader',
                        options: {
                            modules: true,
                            importLoaders: 1,
                            localIdentName: '[name]--[local]__[hash:base64:5]',
                        },
                    },
                ],
                test: /\.css$/,
            },
            {
                loader: require.resolve('../..'),
                options: {
                    name: process.env.EXAMPLE_NO_HASH ? 'img/sprite.svg' : 'img/sprite.[hash].svg',
                },
                test: /\.svg$/,
            },
        ],
    },
    optimization: {
        splitChunks: {
            cacheGroups: {
                styles: {
                    name: 'main',
                    test: /\.css$/,
                    chunks: 'all',
                    enforce: true,
                },
            },
        },
    },
    output: {
        filename: 'js/[name].js',
        path: path.join(__dirname, 'public', 'build'),
        publicPath: '/build/',
    },
    plugins: [
        new MiniCssExtractPlugin({
            filename: 'css/[name].css',
            chunkFilename: 'css/[id].css',
        }),
        new SvgStorePlugin(),
    ],
};
