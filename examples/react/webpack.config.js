const path = require('path');
const { EnvironmentPlugin } = require('webpack');

const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');

const SvgStorePlugin = require('../..');

const spriteLayout = {
    startX: 20,
    startY: 10,
    deltaX: 20,
    deltaY: 10,
};

const baseConfig = {
    mode: process.env.NODE_ENV,
    module: {
        rules: [
            {
                exclude: /node_modules/,
                loader: 'babel-loader',
                test: /\.jsx?$/,
            },
            {
                exclude: /node_modules/,
                use: [
                    {
                        loader: MiniCssExtractPlugin.loader,
                        options: {
                            esModule: true,
                        },
                    },
                    {
                        loader: 'css-loader',
                        options: {
                            modules: {
                                localIdentName: '[name]--[local]__[hash:base64:5]',
                            },
                            importLoaders: 1,
                        },
                    },
                ],
                test: /\.css$/,
            },
            ...['complex', 'education', 'glypho'].map((value) => ({
                exclude: /node_modules/,
                loader: SvgStorePlugin.loader,
                options: {
                    name: process.env.EXAMPLE_NO_HASH ? `img/${value}.svg` : `img/${value}.[contenthash].svg`,
                },
                test: new RegExp(`${value}/\\w+\\.svg$`),
            })),
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
    plugins: [
        new EnvironmentPlugin({
            EXAMPLE_HMR: false,
            EXAMPLE_NO_HASH: false,
        }),
        new MiniCssExtractPlugin({
            filename: 'css/[name].[contenthash].css',
            chunkFilename: 'css/[id].[contenthash].css',
            ignoreOrder: true,
        }),
    ],
};

const configs = [
    {
        ...baseConfig,
        devServer: {
            contentBase: 'public/',
            historyApiFallback: {
                index: '/build/index.html',
            },
            hot: !!process.env.EXAMPLE_HMR,
            port: 3000,
            publicPath: '/build/',
        },
        entry: {
            main: ['react-hot-loader/patch', path.join(__dirname, 'src', 'index.client.jsx')],
        },
        name: 'client',
        output: {
            filename: 'js/[name].[contenthash].js',
            path: path.join(__dirname, 'public', 'build'),
            publicPath: '/build/',
        },
        plugins: [
            ...baseConfig.plugins,
            new HtmlWebpackPlugin({
                templateContent: `
                    <!DOCTYPE html>
                    <html lang="en">
                        <head>
                            <title>React Example | External SVG Sprite Loader</title>
                        </head>
                        <body>
                            <div id="root"></div>
                        </body>
                    </html>
                `,
            }),
            new SvgStorePlugin({ sprite: spriteLayout }),
        ],
    },
];

if (process.env.NODE_ENV === 'production') {
    configs.push({
        ...baseConfig,
        entry: {
            main: path.join(__dirname, 'src', 'index.server.jsx'),
        },
        externals: /^[a-z\-0-9]+$/,
        name: 'server',
        output: {
            filename: 'js/[name].js',
            libraryTarget: 'commonjs2',
            path: path.join(__dirname, 'server', 'build'),
            publicPath: '/build/',
        },
        plugins: [
            ...baseConfig.plugins,
            new SvgStorePlugin({
                emit: false,
                sprite: spriteLayout,
            }),
        ],
        target: 'node',
    });
}

module.exports = configs;
