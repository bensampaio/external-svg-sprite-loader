module.exports = {
    presets: [
        ['@babel/preset-env', {
            targets: {
                browsers: ['last 2 versions', 'not dead'],
            },
        }],
        '@babel/preset-react',
    ],
    plugins: ['react-hot-loader/babel'],
};
