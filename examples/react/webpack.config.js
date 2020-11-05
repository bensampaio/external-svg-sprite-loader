const path = require('path');
const { EnvironmentPlugin } = require('webpack');

const MiniCssExtractPlugin = require('mini-css-extract-plugin');

const SvgStorePlugin = require('../..');

const create = ({ emit }) => ({
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
                    name: process.env.EXAMPLE_NO_HASH ? `img/${value}.svg` : `img/${value}.[hash].svg`,
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
            filename: 'css/[name].css',
            chunkFilename: 'css/[id].css',
            ignoreOrder: true,
        }),
        new SvgStorePlugin({
            emit,
            sprite: {
                startX: 20,
                startY: 10,
                deltaX: 20,
                deltaY: 10,
            },
        }),
    ],
});

const configs = [
    Object.assign(create({ emit: true }), {
        entry: {
            main: ['react-hot-loader/patch', path.join(__dirname, 'src', 'index.client.jsx')],
        },
        name: 'client',
        output: {
            filename: 'js/[name].js',
            path: path.join(__dirname, 'public', 'build'),
            publicPath: '/build/',
        },
        devServer: {
            contentBase: 'public/',
            hot: !!process.env.EXAMPLE_HMR,
            port: 3000,
        },
    }),
];

if (process.env.NODE_ENV === 'production') {
    configs.push(
        Object.assign(create({ emit: false }), {
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
            target: 'node',
        })
    );
}

module.exports = configs;
