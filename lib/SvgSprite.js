'use strict';

const path = require('path');
const escapeRegExp = require('lodash.escaperegexp');
const loaderUtils = require('loader-utils');

const MissingDimensionsException = require('./exceptions/MissingDimensionsException');
const SvgDocument = require('./SvgDocument');
const SvgIcon = require('./SvgIcon');

/**
 * SVG Sprite
 */
class SvgSprite {

    /**
     * Initializes all sprite properties.
     * @param {string} resourcePath - the relative path for the sprite based on the output folder.
     */
    constructor(resourcePath) {
        const name = path.basename(resourcePath).match(/(?!\[[^[\]]*)[\w-]+(?![^[\]]*])/)[0];
        const resourcePathRegExp = new RegExp(escapeRegExp(resourcePath), 'gm');

        /** @member {string} */
        this.content = '';
        /** @member {string} */
        this.name = name;
        /** @member {string} the resource path given in the configuration */
        this.originalResourcePath = resourcePath;
        /** @member {RegExp} */
        this.originalResourcePathRegExp = resourcePathRegExp;
        /** @member {?string} the interpolated resource path for the previous compilation */
        this.previousResourcePath = null;
        /** @member {?RegExp} */
        this.previousResourcePathRegExp = null;
        /** @member {string} the interpolated resource path for the current compilation */
        this.resourcePath = resourcePath;
        /** @member {RegExp} */
        this.resourcePathRegExp = resourcePathRegExp;
        /** @member {Object.<string, SvgIcon>} */
        this.icons = {};
        /** @member {boolean} */
        this.changed = false;
        /** @member {boolean} */
        this.dirty = false;
    }

    /**
     * Adds an icon to the sprite and sets the sprite to dirty so that new changes can be detected.
     * @param {string} id - the icon absolute path including query.
     * @param {string} name - the interpolated icon name.
     * @param {string} content - the icon content.
     * @returns {SvgIcon}
     */
    addIcon(id, name, content) {
        const { icons } = this;
        const icon = icons[id] = new SvgIcon(this, name, content);

        this.dirty = true;

        return icon;
    }

    /**
     * Generates the sprite content based on the icons (if changes were made).
     * @param {Object} options
     * @param {number} options.startX - sprite start X position.
     * @param {number} options.startY - sprite start Y position.
     * @param {number} options.deltaX - free space between icons by X.
     * @param {number} options.deltaY - free space between icons by Y.
     * @param {number} options.iconHeight - height to which icons will be resized to.
     * @param {number} options.rowWidth - used to determine if an icon can stay in the current row or if it must be placed in the next.
     * @return {string}
     */
    generate({
        startX = 0,
        startY = 0,
        deltaX = 0,
        deltaY = 0,
        iconHeight = 50,
        rowWidth = 1000,
    }) {
        if (!this.dirty) {
            this.changed = false;

            return this.content;
        }

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
        for (const id of iconsSorted) {

            // Get the icon metadata
            /** @type {SvgIcon} */
            const icon = icons[id];

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
            if (x + width > startX + rowWidth) {
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
        const resourcePath = loaderUtils.interpolateName({}, this.originalResourcePath, { content });

        // Assign resource path and content to public values
        this.previousResourcePath = this.resourcePath;
        this.previousResourcePathRegExp = this.resourcePathRegExp;
        this.resourcePath = resourcePath;
        this.resourcePathRegExp = new RegExp(escapeRegExp(resourcePath), 'gm');
        this.content = content;

        // Mark the sprite as changed and not dirty since all changes were now applied
        this.changed = true;
        this.dirty = false;

        return content;
    }

    /**
     * Replaces the given sprite URL with the hashed URL in the given module source.
     * @param {String} source - the module source.
     * @return {string}
     */
    replacePathsWithInterpolatedPaths(source) {
        const { resourcePath, previousResourcePath, originalResourcePathRegExp, previousResourcePathRegExp } = this;

        // Always replace the `originalResourcePath`
        source = source.replace(originalResourcePathRegExp, resourcePath);

        // Moreover, replace the `previousResourcePath` with the new one if they are different
        if (resourcePath !== previousResourcePath) {
            source = source.replace(previousResourcePathRegExp, resourcePath);
        }

        return source;
    }

}

module.exports = SvgSprite;
