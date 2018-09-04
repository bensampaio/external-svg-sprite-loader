'use strict';

const path = require('path');

const MissingDimensionsException = require('./exceptions/MissingDimensionsException');
const SvgDocument = require('./SvgDocument');
const SvgIcon = require('./SvgIcon');
const loaderUtils = require('loader-utils');

/**
 * Default generate options.
 * - All instances are based on these default options.
 * @const
 * @memberOf SvgSprite
 * @private
 * @static
 * @type { startX: number, startY: number, deltaX: number, deltaY: number, iconHeight: number }
 */
const DEFAULT_GENERATE_OPTIONS = {
    startX: 0,
    startY: 0,
    deltaX: 0,
    deltaY: 0,
    iconHeight: 50,
};

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
        const hasHash = resourcePath !== loaderUtils.interpolateName({}, resourcePath, { content: 'foo' });
        const name = path.basename(resourcePath).match(/(?!\[[^[\]]*)\w+(?![^[\]]*])/)[0];

        /** @member {boolean} */
        this.hasHash = hasHash;
        /** @member {Object.<string, SvgIcon>} */
        this.icons = {};
        /** @member {string} */
        this.name = name;
        /** @member {string} */
        this.resourcePath = resourcePath;
        /** @member {number} */
        this.revisionNumber = 0;
    }

    /**
     * Adds an icon to the sprite.
     * Increments the `revisionNumber` property which can be used to track changes.
     * @param {string} resourcePath - the icon absolute path.
     * @param {string} name - the icon name.
     * @param {string} content - the icon content.
     * @returns {SvgIcon}
     */
    addIcon(resourcePath, name, content) {
        const icon = new SvgIcon(this, name, content);

        this.icons[resourcePath] = icon;
        this.revisionNumber += 1;

        return icon;
    }

    /**
     * Generates the sprite content based on the icons.
     * @param {Object} options
     * @param {number} options.startX - sprite start X position.
     * @param {number} options.startY - sprite start Y position.
     * @param {number} options.deltaX - free space between icons by X.
     * @param {number} options.deltaY - free space between icons by Y.
     * @param {number} options.iconHeight - icon height in the sprite.
     * @return {string}
     */
    generate(options) {
        options = Object.assign({}, DEFAULT_GENERATE_OPTIONS, options);

        // Get sprite properties
        const { icons } = this;
        const { startX, startY, deltaX, deltaY, iconHeight } = options;
        const sortedIconNames = Object.keys(icons).sort();

        // Lists of defs, symbols, uses and views to be included in the sprite.
        const defs = [];
        const symbols = [];
        const uses = [];
        const views = [];

        // Current x and y positions in the sprite
        let x = startX;
        let y = startY;

        // For every icon in the sprite
        sortedIconNames.forEach((iconName) => {
            // Get the icon metadata
            /** @type {SvgIcon} */
            const icon = icons[iconName];

            // Create an SVG Document out of the icon contents
            const svg = icon.getDocument();

            // Create the icon <symbol/> and <defs/>
            const { symbol, symbolDefs } = svg.toSymbol(icon.symbolName);

            // Get the icon width and height resized to iconHeight
            const { width, height } = svg.getDimensions(null, iconHeight);

            // If the width and height cannot be determined then skip the rest of the steps and show a warning
            if (Number.isNaN(width) || Number.isNaN(height)) {
                throw new MissingDimensionsException(this.name, icon.name);
            }

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
        });

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

        return content;
    }

}

module.exports = SvgSprite;
