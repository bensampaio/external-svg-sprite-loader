'use strict';

const path = require('path');

const SvgDocument = require('./SvgDocument');

/**
 * SVG Icon
 * - Stores an icon metadata and its content.
 */
class SvgIcon {

    /**
     * Generates the icon names based on the given path, prefix and suffix.
     * @constructor
     * @param {SvgSprite} sprite - the sprite where the icon will be placed.
     * @param {string} resourcePath - the absolute path to the icon file.
     * @param {string} prefix - the prefix for symbol and view names.
     * @param {string} suffix - the icon name suffix.
     * @param {string} content - the icon src code.
     */
    constructor(sprite, resourcePath, prefix, suffix, content) {

        // Get the file name
        const filename = path.basename(resourcePath);

        // Get the icon name by removing the extension form the file name
        const name = filename.substring(0, filename.indexOf('.')) + ( suffix && ( '-' + suffix ) );

        // Get the icon symbol name by prepending the prefix to the icon name
        const symbolName = ( prefix && ( prefix + '-' ) ) + name;

        // Get the icon view name by appending the 'view' suffix to the symbol name
        const viewName = 'view-' + symbolName;

        this.content = content;
        this.name = name;
        this.sprite = sprite;
        this.resourcePath = resourcePath;
        this.symbolName = symbolName;
        this.viewName = viewName;

    }

    /**
     * Gets the document.
     * @returns {SvgDocument}
     */
    getDocument() {
        return new SvgDocument(this.content);
    }

    /**
     * Generate URL to the icon symbol.
     * @param {string} [publicPath] - the public path from which the sprite will be served
     * @returns {string}
     */
    getUrlToSymbol(publicPath) {
        publicPath = publicPath ? publicPath.replace(/\/+$/, '') : '';

        return `${publicPath}/${this.sprite.resourcePath}#${this.symbolName}`;
    }

    /**
     * Generate URL to the icon view.
     * @param {string} [publicPath] - the public path from which the sprite will be served
     * @returns {string}
     */
    getUrlToView(publicPath) {
        publicPath = publicPath ? publicPath.replace(/\/+$/, '') : '';

        return `${publicPath}/${this.sprite.resourcePath}#${this.viewName}`;
    }

}

module.exports = SvgIcon;
