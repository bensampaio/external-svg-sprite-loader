# External SVG Sprite

[![npm version](https://badge.fury.io/js/external-svg-sprite-loader.svg)](https://badge.fury.io/js/external-svg-sprite-loader)
[![Build Status](https://travis-ci.org/karify/external-svg-sprite-loader.svg?branch=master)](https://travis-ci.org/karify/external-svg-sprite-loader)

A loader and plugin for webpack that converts all your SVGs into symbols and merges them into a SVG sprite.

**Important**: There is a breaking change when moving from v3 to v4. Check the [release notes](https://github.com/karify/external-svg-sprite-loader/releases/tag/v4.0.0).

## Requirements

You will need NodeJS v6+, npm v3+ and webpack 4.

To make it work in older browsers, like Internet Explorer, you will also need [SVG for Everybody](https://github.com/jonathantneal/svg4everybody) or [svgxuse](https://github.com/Keyamoon/svgxuse).

## Installation

```bash
npm i external-svg-sprite-loader
```

or

```bash
yarn add external-svg-sprite-loader
```

## Options

### Loader options

- `name` - relative path to the sprite file (default: `img/sprite.svg`). The `[hash]` placeholder is supported.
- `iconName` - name for the icon symbol (default: `icon-[name]-[hash:5]`).
- `publicPath` - custom public path to be used instead of webpack `output.publicPath`. This option might be useful when your webpack `output.publicPath` is set to a different scheme/host/port (e.g.: when you use a CDN). This is because currently the SVG sprite cannot be served from another domain ([read more](https://stackoverflow.com/questions/32850536/cross-domain-svg-sprite)).
- `svgoOptions` - custom options to be passed to svgo.

### Plugin options

- `emit` - determines if the sprite is supposed to be emitted (default: true). Useful when generating server rendering bundles where you just need the SVG sprite URLs but not the sprite itself.
- `sprite` - SVG sprite options (default: {startX: 0, startY: 0, deltaX: 0, deltaY: 0, iconHeight: 50, rowWidth: 1000}). StartX and StartY - beginning sprite position, DeltaX and DeltaY - space between icons. IconHeight - Icon height in the sprite (just for the comfort).

## Usage

If you have the following webpack configuration:

```js
// webpack.config.js

import path from 'path';

import SvgStorePlugin from 'external-svg-sprite-loader';

module.exports = {
    mode: 'development',
    module: {
        rules: [
            {
                loader: SvgStorePlugin.loader,
                test: /\.svg$/,
            },
        ],
    },
    output: {
        path: path.join(__dirname, 'public'),
        publicPath: '/',
    },
    plugins: [
        new SvgStorePlugin({
            sprite: {
                startX: 10,
                startY: 10,
                deltaX: 20,
                deltaY: 20,
                iconHeight: 20,
            },
        }),
    ],
};
```

You will be able to import your SVG files in your JavaScript files as shown below.
The imported SVG will always correspond to a JavaScript object with keys `symbol`, `view` and `viewBox`:
- The `symbol` url can be used on a `<use>` tag to display the icon;
- The `view` url is supposed to be used in CSS;
- The `viewBox` value is required by some browsers on the `<svg>` tag;
- The `title` value can be used on the `<svg>` tag for accessibility.

The URLs will have the following format:
- `symbol`: `webpackConfig.output.publicPath`/`loader.name`#`loader.iconName`
- `view`: `webpackConfig.output.publicPath`/`loader.name`#view-`loader.iconName`

```js
/*
 * {
 *  symbol: '/public/img/sprite.svg#icon-logo',
 *  view: '/public/img/sprite.svg#view-icon-logo',
 *  viewBox: '0 0 150 100',
 *  title: 'Logo'
 * }
 */
import logo from './images/logo.svg';

const Logo = () => (
   <svg viewBox={logo.viewBox} title={logo.title} role="img">
       <use xlinkHref={logo.symbol} />
   </svg>
);
```

In CSS files, you can import your SVG files as shown bellow (assuming you are using the [MiniCssExtractPlugin](https://github.com/webpack-contrib/mini-css-extract-plugin)).
The imported value will be converted into the `view` url shown above.

```css
.special-icon {
    /* the url will be replaced with the url to the sprite */
    background-image: url('./icons/special.svg') no-repeat 0;
}
```

When a SVG is added, removed or changed, the sprite will be re-generated and all files referencing it will be updated. When no `[hash]` is used in the `name` option, a cache-busting will be added to the URL so that the browser is forced to re-download the sprite.

## Examples

You can find working examples in the `examples` folder. To test them under the example folder run:

```bash
npm install
npm start:dev
```

And then you can see the result in `http://localhost:3000`.

There's some additional commands that you may try:

- `npm start:dev:hot` to check if sprite updates work with [Hot Module replacement](https://webpack.js.org/guides/hot-module-replacement/).
- `npm start:dev:no-hash` to check if sprite updates work, even if the outputted file is the same.
- `npm start:dev:hot-no-hash` to check if sprite updates work with [Hot Module replacement](https://webpack.js.org/guides/hot-module-replacement/), even if the outputted file is the same.
- `npm run build:prd && npm run start:prd` to test a production build.

## Contributing

First of all, **thank you** for contributing, **you are awesome**.

Here are a few rules to follow in order to ease code reviews, and discussions before maintainers accept and merge your work:

- Make sure your commit messages make sense (don't use `fix tests`, `small improvement`, `fix 2`, among others).
- Before creating a pull request make sure of the following:
    - your code is all documented properly;
    - your code passes the ESLint rules;
    - variable, function and class names are explanatory enough;
    - code is written in ES2015.
- When creating a pull request give it a name and description that are explanatory enough. In the description detail everything you are adding, do not assume we will understand it from the code.

Thank you!

## License

MIT (http://www.opensource.org/licenses/mit-license.php)
