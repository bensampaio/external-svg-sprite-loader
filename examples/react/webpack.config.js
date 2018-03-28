const path = require('path');

const SvgStorePlugin = require('external-svg-sprite-loader/lib/SvgStorePlugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

module.exports = {
    entry: {
        main: path.join(__dirname, 'src', 'index.jsx'),
    },
    mode: 'development',
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
                loader: 'external-svg-sprite-loader',
                options: {
                    name: 'img/sprite.[hash].svg',
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
        publicPath: '/',
    },
    plugins: [
        new MiniCssExtractPlugin({
            filename: 'css/[name].css',
            chunkFilename: 'css/[id].css',
        }),
        new SvgStorePlugin(),
    ],
};
