'use strict';

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
     * @param {string} name - the icon name.
     * @param {string} content - the icon src code.
     */
    constructor(sprite, resourcePath, name, content) {
        this.content = content;
        this.name = name;
        this.sprite = sprite;
        this.resourcePath = resourcePath;
        this.symbolName = name;
        this.viewName = 'view-' + name;
    }

    /**
     * Gets the document.
     * @returns {SvgDocument}
     */
    getDocument() {
        return new SvgDocument(this.content);
    }

    /**
     * Generate relative URL to the icon symbol.
     * @returns {string}
     */
    getUrlToSymbol() {
        return `${this.sprite.resourcePath}#${this.symbolName}`;
    }

    /**
     * Generate relative URL to the icon view.
     * @returns {string}
     */
    getUrlToView() {
        return `${this.sprite.resourcePath}#${this.viewName}`;
    }

}

module.exports = SvgIcon;
