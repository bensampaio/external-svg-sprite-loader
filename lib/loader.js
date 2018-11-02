'use strict';

const imagemin = require('imagemin');
const imageminSvgo = require('imagemin-svgo');
const loaderUtils = require('loader-utils');

/**
 * Default values for every param that can be passed in the loader options.
 * @const
 * @type {Object}
 */
const DEFAULT_LOADER_OPTIONS = Object.freeze({
    name: 'img/sprite.svg',
    iconName: 'icon-[name]-[hash:5]',
    svgoOptions: Object.freeze({
        plugins: [
            { collapseGroups: true },
            { convertPathData: true },
            { convertStyleToAttrs: true },
            { convertTransform: true },
            { removeDesc: true },
            { removeViewBox: false },
            { removeDimensions: true },
        ],
    }),
});

/**
 * Applies SVGO on the SVG file in order to optimize its contents and remove unnecessary attributes for the sprite.
 * Adds the SVG to the given sprite which will then be processed by the plugin.
 * Generates SVG metadata to be passed to JavaScript and CSS files so that the symbols can be rendered.
 * @param {Buffer} content - the content of the SVG file.
 */
function loader(content) {
    const { addDependency, resource, resourcePath } = this;

    // Get callback because the SVG is going to be optimized and that is an async operation
    const callback = this.async();

    // Parse the loader query and apply the default values in case no values are provided
    const { iconName, publicPath, sprite, svgoOptions } = Object.assign({}, DEFAULT_LOADER_OPTIONS, loaderUtils.getOptions(this));

    // Add the icon as a dependency
    addDependency(resourcePath);

    // Start optimizing the SVG file
    imagemin
        .buffer(content, {
            plugins: [
                imageminSvgo(svgoOptions),
            ],
        })
        .then((content) => {

            // Create the icon name with the hash of the optimized content
            const name = loaderUtils.interpolateName(this, iconName, { content });

            // Register the icon using its resource path with query as id
            // so that tools like: `svg-transform-loader` can be used in combination with this loader.
            const icon = sprite.addIcon(resource, name, content.toString());

            // Export the icon as a metadata object that contains urls to be used on an <img/> in HTML or url() in CSS
            // If the outputted file is not hashed and to support hot module reload, we must force the browser
            // to re-download the sprite on subsequent compilations
            // We do this by adding a cache busting on the URL, with the following pattern: img/sprite.svg?icon-abcd#icon-abcd
            // It's important that the cache busting is not included initially so that it plays well with server-side rendering,
            // otherwise many view libraries will complain about mismatches during rehydration (such as React)
            const hasSamePath = sprite.originalResourcePath === sprite.resourcePath;

            setImmediate(() => {
                callback(
                    null,
                    `var publicPath = ${publicPath ? `'${publicPath}'` : '__webpack_public_path__'};
                    var symbolUrl = '${icon.getUrlToSymbol()}';
                    var viewUrl = '${icon.getUrlToView()}';

                    ${process.env.NODE_ENV !== 'production' && hasSamePath ? `
                        var addCacheBust = typeof document !== 'undefined' && document.readyState === 'complete';
    
                        if (addCacheBust) {
                            symbolUrl = '${icon.getUrlToSymbol(true)}';
                            viewUrl = '${icon.getUrlToView(true)}';
                        }
                    ` : '' }

                    module.exports = {
                        symbol: publicPath + symbolUrl,
                        view: publicPath + viewUrl,
                        viewBox: '${icon.getDocument().getViewBox()}',
                        title: '${icon.getDocument().getTitle()}',
                        toString: function () {
                            return JSON.stringify(this.view);
                        }
                    };`
                );
            });
        })
        .catch((err) => {
            setImmediate(() => callback(err));
        });
}

module.exports = {
    default: loader,
    DEFAULT_LOADER_OPTIONS,
    raw: true,
};
