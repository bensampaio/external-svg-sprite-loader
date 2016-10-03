# External SVG Sprite

A loader and plugin for webpack that converts all your SVGs into symbols and merges them into a SVG sprite.

## Requirements

You will need NodeJS v6+, npm v3+ and webpack.

## Installation

```bash
npm i external-svg-sprite-loader
```

## Usage

```js
// webpack.config.js

import SvgStorePlugin from 'external-svg-sprite-loader/lib/SvgStorePlugin';
// or
const SvgStorePlugin = require('external-svg-sprite-loader/lib/SvgStorePlugin');

module.exports = {
    module: {
        loaders: [
            {
                loader: 'external-svg-sprite',
                test: /\.svg$/
            }
        ]
    },
    plugins: [
        new SvgStorePlugin()
    ]
};
```

### Loader options

- `name` - relative path to the sprite file (default: `img/sprite.svg`).
- `prefix` - value to be prefixed to the icons name (default: `icon`).

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
