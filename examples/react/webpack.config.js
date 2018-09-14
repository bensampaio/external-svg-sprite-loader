const path = require('path');

const MiniCssExtractPlugin = require('mini-css-extract-plugin');

const SvgStorePlugin = require('../../lib/SvgStorePlugin');

const create = () => ({
    mode: process.env.NODE_ENV,
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
            ...['complex', 'education', 'glypho'].map((value) => ({
                loader: require.resolve('../..'),
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
});

const configs = [
    Object.assign(create(), {
        entry: {
            main: path.join(__dirname, 'src', 'index.client.jsx'),
        },
        name: 'client',
        output: {
            filename: 'js/[name].js',
            path: path.join(__dirname, 'public', 'build'),
            publicPath: '/build/',
        },
    }),
];

if (process.env.NODE_ENV === 'production') {
    configs.push(
        Object.assign(create(), {
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
