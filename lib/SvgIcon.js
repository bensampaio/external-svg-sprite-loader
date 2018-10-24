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
     * @param {string} name - the icon name.
     * @param {string} content - the icon src code.
     */
    constructor(sprite, name, content) {
        /** @member {string} */
        this.content = content;
        /** @member {string} */
        this.name = name;
        /** @member {SvgSprite} */
        this.sprite = sprite;
        /** @member {string} */
        this.symbolName = name;
        /** @member {string} */
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
     * Generate a relative URL to the sprite
     * @param {boolean} addCacheBust - true to add a cache bust to force the re-download of the sprite
     * @returns {string}
     */
    getSpriteUrl(addCacheBust) {
        return this.sprite.resourcePath + (addCacheBust ? '?' + this.symbolName : '');
    }

    /**
     * Generate relative URL to the icon symbol.
     * @param {boolean} addCacheBust - true to add a cache bust to force the re-download of the sprite
     * @returns {string}
     */
    getUrlToSymbol(addCacheBust = false) {
        return this.getSpriteUrl(addCacheBust) + '#' + this.symbolName;
    }

    /**
     * Generate relative URL to the icon view.
     * @param {boolean} addCacheBust - true to add a cache bust to force the re-download of the sprite
     * @returns {string}
     */
    getUrlToView(addCacheBust = false) {
        return this.getSpriteUrl(addCacheBust) + '#' + this.viewName;
    }

}

module.exports = SvgIcon;
