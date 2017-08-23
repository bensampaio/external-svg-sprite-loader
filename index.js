'use strict';

const imagemin = require('imagemin');
const imageminSvgo = require('imagemin-svgo');
const loaderUtils = require('loader-utils');

const SvgStorePlugin = require('./lib/SvgStorePlugin');

/**
 * Default values for every param that can be passed in the loader query.
 * @const
 * @type {Object}
 */
const DEFAULT_QUERY_VALUES = {
    name: 'img/sprite.svg',
    iconName: 'icon-[name]-[hash:5]',
    svgoOptions: {
        plugins: [
            { collapseGroups: true },
            { convertPathData: true },
            { convertStyleToAttrs: true },
            { convertTransform: true },
            { removeDesc: true },
            { removeDimensions: true },
        ],
    },
};

/**
 * Applies SVGO on the SVG file.
 * Registers the SVG on the Sprites store.
 * Generates SVG metadata to be passed to JavaScript and CSS files.
 * @param {Buffer} content - the content of the SVG file.
 */
function loader(content) {
    const { addDependency, cacheable, resourcePath } = this;

    // Get callback because the SVG is going to be optimized and that is an async operation
    const callback = this.async();

    // Parse the loader query and apply the default values in case no values are provided
    const query = Object.assign({}, DEFAULT_QUERY_VALUES, loaderUtils.getOptions(this));

    // Add the icon as a dependency
    addDependency(resourcePath);

    // Set the loader as not cacheable
    cacheable(false);

    // Start optimizing the SVG file
    imagemin
        .buffer(content, {
            plugins: [
                imageminSvgo(query.svgoOptions),
            ],
        })
        .then((content) => {

            // Create the icon name with the hash of the optimized content
            const iconName = loaderUtils.interpolateName(this, query.iconName, { content });

            // Register the sprite and icon
            const icon = SvgStorePlugin.getSprite(query.name).addIcon(resourcePath, iconName, content.toString());

            // Export the icon as a metadata object that contains urls to be used on an <img/> in HTML or url() in CSS
            callback(
                null,
                `var publicPath = ${query.publicPath ? `'${query.publicPath}'` : '__webpack_public_path__' };
                module.exports = {
                    symbol: publicPath + '${icon.getUrlToSymbol()}',
                    view: publicPath + '${icon.getUrlToView()}',
                    viewBox: '${icon.getDocument().getViewBox()}',
                    title: '${icon.getDocument().getTitle()}',
                    toString: function () {
                        return JSON.stringify(this.view);
                    }
                };`
            );
        })
        .catch((err) => {
            callback(err);
        });
}

loader.raw = true;

module.exports = loader;
