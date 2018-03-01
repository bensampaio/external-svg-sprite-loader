'use strict';

const path = require('path');
const loaderUtils = require('loader-utils');

const SvgDocument = require('./SvgDocument');
const SvgIcon = require('./SvgIcon');

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

        if (!(resourcePath in icons)) {
            icons[resourcePath] = new SvgIcon(this, resourcePath, name, content);
        }

        return icons[resourcePath];
    }

    /**
     * Generates the sprite content based on the icons.
     * @return {string}
     */
    generate(spriteOptions) {

        // Get sprite properties
        const { icons } = this;
        const iconsSorted = Object.keys(icons).sort();

        // Lists of defs, symbols, uses and views to be included in the sprite.
        const defs = [];
        const symbols = [];
        const uses = [];
        const views = [];

        // Current x and y positions in the sprite
        let x = spriteOptions.startX;
        let y = spriteOptions.startY;

        // For every icon in the sprite
        for (let iconPath of iconsSorted) {

            // Get the icon metadata
            const icon = icons[iconPath];

            // Create an SVG Document out of the icon contents
            const svg = icon.getDocument();

            // Create the icon <symbol/> and <defs/>
            const { symbol, symbolDefs } = svg.toSymbol(icon.symbolName);

            // Get the icon width and height resized to spriteOptions.iconHeight
            const { width, height } = svg.getDimensions(null, spriteOptions.iconHeight);

            // Add icon defs to the list of defs
            defs.push(symbolDefs);

            // Add icon symbol to the list of symbols
            symbols.push(symbol);

            // Create the icon <use/> and add it to the list of uses
            uses.push(SvgDocument.createUse(icon.name, icon.symbolName, width, height, x, y));

            // Create the icon <view/> and add it to the list of views
            views.push(SvgDocument.createView(icon.viewName, `${x} ${y} ${width} ${height}`));

            // Calculate the x position for the next icon
            x = x + (spriteOptions.iconHeight * Math.ceil(width / spriteOptions.iconHeight)) + spriteOptions.deltaX;

            // If x exceeds the max row width, then move to the next line and reset the value of x
            if (x + width > spriteOptions.startX + MAX_ROW_WIDTH) {
                x = spriteOptions.startX;
                y += spriteOptions.iconHeight + spriteOptions.deltaY;
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
