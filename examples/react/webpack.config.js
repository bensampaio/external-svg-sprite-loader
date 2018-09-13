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
                    name: process.env.EXAMPLE_NO_HASH ? 'img/complex.svg' : 'img/complex.[hash].svg',
                },
                test: /complex\/\w+\.svg$/,
            },
            {
                loader: require.resolve('../..'),
                options: {
                    name: process.env.EXAMPLE_NO_HASH ? 'img/education.svg' : 'img/education.[hash].svg',
                },
                test: /education\/\w+\.svg$/,
            },
            {
                loader: require.resolve('../..'),
                options: {
                    name: process.env.EXAMPLE_NO_HASH ? 'img/glypho.svg' : 'img/glypho.[hash].svg',
                },
                test: /glypho\/\w+\.svg$/,
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
        publicPath: '/',
    },
    plugins: [
        new MiniCssExtractPlugin({
            filename: 'css/[name].css',
            chunkFilename: 'css/[id].css',
        }),
        new SvgStorePlugin({
            sprite: {
                startX: 20,
                startY: 10,
                deltaX: 20,
                deltaY: 10,
            },
        }),
    ],
};
