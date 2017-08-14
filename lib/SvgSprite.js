'use strict';

const path = require('path');
const loaderUtils = require('loader-utils');

const SvgDocument = require('./SvgDocument');
const SvgIcon = require('./SvgIcon');

/**
 * Icon height in the sprite.
 * - All icons are resized based on this height.
 * @const
 * @memberOf SvgSprite
 * @private
 * @static
 * @type {number}
 */
const ICON_HEIGHT = 50;

/**
 * Max row width in a sprite.
 * - This value is used to determine if an icon can stay in the current row or if it must be placed in the next.
 * @const
 * @memberOf SvgSprite
 * @private
 * @static
 * @type {number}
 */
const MAX_ROW_WIDTH = 1000;

/**
 * SVG Sprite
 */
class SvgSprite {

    /**
     * Initializes all sprite properties.
     * @param {string} resourcePath - the relative path for the sprite based on the output folder.
     */
    constructor(resourcePath) {
        const name = path.basename(resourcePath).match(/(?!\[[^[\]]*)\w+(?![^[\]]*])/)[0];

        const originalPathRegExp = resourcePath
            .replace(new RegExp('\\[', 'g'), '\\[')
            .replace(new RegExp('\\]', 'g'), '\\]');

        this.content = '';
        this.name = name;
        this.originalPath = resourcePath;
        this.originalPathRegExp = new RegExp(originalPathRegExp, 'gm');
        this.resourcePath = resourcePath;
        this.icons = {};
    }

    /**
     * Adds an icon to the sprite.
     * @param {string} resourcePath - the icon absolute path.
     * @param {string} prefix - the prefix to be prepended to the icon names.
     * @param {string} suffix - the suffix to be appended to the icon names.
     * @param {string} content - the icon content.
     * @returns {SvgIcon}
     */
    addIcon(resourcePath, prefix, suffix, content) {
        const icons = this.icons;

        if (!(resourcePath in icons)) {
            icons[resourcePath] = new SvgIcon(this, resourcePath, prefix, suffix, content);
        }

        return icons[resourcePath];
    }

    /**
     * Generates the sprite content based on the icons.
     * @return {string}
     */
    generate() {

        // Get sprite properties
        const { icons } = this;

        // Current x and y positions in the sprite
        let x = 0;
        let y = 0;

        // Lists of symbols to be included in the sprite.
        let symbols = [];
        let defs = [];

        // For every icon in the sprite
        for (let iconPath in icons) {

            // Get the icon metadata
            const icon = icons[iconPath];

            // Create an SVG Document out of the icon contents
            const svg = icon.getDocument();

            // Get the icon width and height resized to ICON_HEIGHT
            const { width, height } = svg.getDimensions(null, ICON_HEIGHT);

            // Create the icon <symbol/> and add it to the list of symbols
            symbols.push(svg.toSymbol(icon.symbolName));

            defs.push(svg.getDefs(icon.symbolName));

            // Calculate the x position for the next icon
            x = x + (ICON_HEIGHT * Math.ceil(width / ICON_HEIGHT));

            // If x exceeds the max row width, then move to the next line and reset the value of x
            if (x + width > MAX_ROW_WIDTH) {
                x = 0;
                y += ICON_HEIGHT;
            }
        }

        // Generate the sprite content with the following format:
        // <svg>
        //   ...<defs />
        //   ...<symbol />
        // </svg>
        const content = SvgDocument.create(
            ...defs,
            ...symbols
        );

        // Generate interpolated name
        const resourcePath = loaderUtils.interpolateName({}, this.originalPath, { content });

        // Assign resource path and content to public values
        this.resourcePath = resourcePath;
        this.content = content;

        return content;

    }

}

module.exports = SvgSprite;
