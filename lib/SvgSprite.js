'use strict';

const path = require('path');
const loaderUtils = require('loader-utils');

const SvgDocument = require('./SvgDocument');
const SvgIcon = require('./SvgIcon');

/**
 * Default icon height in the sprite.
 * - All icons are resized based on this height.
 * @const
 * @memberOf SvgSprite
 * @private
 * @static
 * @type {number}
 */
const DEFAULT_ICON_HEIGHT = 50;

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
     * @param {string} name - the icon name.
     * @param {string} content - the icon content.
     * @returns {SvgIcon}
     */
    addIcon(resourcePath, name, content) {
        const icons = this.icons;
        const iconId = `${resourcePath}#${name}`;

        if (!(iconId in icons)) {
            icons[iconId] = new SvgIcon(this, resourcePath, name, content);
        }

        return icons[iconId];
    }

    /**
     * Generates the sprite content based on the icons.
     * @param {Object} options
     * @param {number} options.startX - sprite start X position.
     * @param {number} options.startY - sprite start Y position.
     * @param {number} options.deltaX - free space between icons by X.
     * @param {number} options.deltaY - free space between icons by Y.
     * @param {number} options.iconHeight - Icon height in the sprite - All icons are resized based on this height.
     * @return {string}
     */
    generate({
        startX = 0,
        startY = 0,
        deltaX = 0,
        deltaY = 0,
        iconHeight = DEFAULT_ICON_HEIGHT,
    } = {}) {

        // Get sprite properties
        const { icons } = this;
        const iconsSorted = Object.keys(icons).sort();

        // Lists of defs, symbols, uses and views to be included in the sprite.
        const defs = [];
        const symbols = [];
        const uses = [];
        const views = [];

        // Current x and y positions in the sprite
        let x = startX;
        let y = startY;

        // For every icon in the sprite
        for (const iconPath of iconsSorted) {

            // Get the icon metadata
            const icon = icons[iconPath];

            // Create an SVG Document out of the icon contents
            const svg = icon.getDocument();

            // Create the icon <symbol/> and <defs/>
            const { symbol, symbolDefs } = svg.toSymbol(icon.symbolName);

            // Get the icon width and height resized to iconHeight
            const { width, height } = svg.getDimensions(null, iconHeight);

            // Add icon defs to the list of defs
            defs.push(symbolDefs);

            // Add icon symbol to the list of symbols
            symbols.push(symbol);

            // Create the icon <use/> and add it to the list of uses
            uses.push(SvgDocument.createUse(icon.name, icon.symbolName, width, height, x, y));

            // Create the icon <view/> and add it to the list of views
            views.push(SvgDocument.createView(icon.viewName, `${x} ${y} ${width} ${height}`));

            // Calculate the x position for the next icon
            x = x + (iconHeight * Math.ceil(width / iconHeight)) + deltaX;

            // If x exceeds the max row width, then move to the next line and reset the value of x
            if (x + width > startX + MAX_ROW_WIDTH) {
                x = startX;
                y += iconHeight + deltaY;
            }
        }

        // Generate the sprite content with the following format:
        // <svg>
        //   <defs>
        //      ...<defs />
        //      ...<symbol />
        //   </defs>
        //   ...<view />
        //   ...<use />
        // </svg>
        const content = SvgDocument.create(
            SvgDocument.createDefs(...defs, ...symbols),
            ...views,
            ...uses
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
