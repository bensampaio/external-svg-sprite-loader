'use strict';

const cheerio = require('cheerio');

/**
 * SVG Document
 * - Generates SVG content.
 * - Parses the content of a SVG document.
 */
class SvgDocument {

    /**
     * Parses the given content.
     * @param {string} content - the content of a SVG file.
     */
    constructor(content) {
        const $ = this.load(content);

        /** @member {CheerioStatic} */
        this.$ = $;
        /** @member {CheerioStatic} */
        this.$svg = $('svg');
    }

    /**
     * Creates an SVG document with the given contents.
     * @param {...string} contents - contents to be included in the document.
     * @returns {string}
     */
    static create(...contents) {
        return `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">${contents.join('')}</svg>`;
    }

    /**
     * Creates a <defs/> element with the given contents.
     * @param {...string} contents - contents to be included in the element.
     * @returns {string}
     */
    static createDefs(...contents) {
        return `<defs>${contents.join('')}</defs>`;
    }

    /**
     * Creates a <symbol/> element with the given contents.
     * @param {string[]} attrs - attributes to be included in the element.
     * @param {..string} contents - contents to be included in the element.
     * @returns {string}
     */
    static createSymbol(attrs = [], ...contents) {
        return `<symbol ${attrs.join(' ')}>${contents.join('')}</symbol>`;
    }

    /**
     * Creates a <use/> element with the given attributes.
     * @param {string} id - value for the id attribute.
     * @param {string} href - value for the xlink:href attribute.
     * @param {number} width - value for the width attribute.
     * @param {number} height - value for the height attribute.
     * @param {number} x - value for the x attribute.
     * @param {number} y - value for the y attribute.
     * @returns {string}
     */
    static createUse(id, href, width, height, x, y) {
        return `<use id="${id}" xlink:href="#${href}" width="${width}" height="${height}" x="${x}" y="${y}"></use>`;
    }

    /**
     * Creates a <view/> element with the given attributes.
     * @param {string} id - value for the id attribute.
     * @param {string} viewBox - value for the viewBox attribute.
     * @returns {string}
     */
    static createView(id, viewBox) {
        return `<view id="${id}" viewBox="${viewBox}"></view>`;
    }

    /**
     * Gets the value of the attribute with the given name.
     * @param {string} name - the name of the attribute.
     * @returns {string}
     */
    getAttribute(name) {
        const $svg = this.$svg;
        return $svg.attr(name) || $svg.attr(name.toLowerCase());
    }

    /**
     * Gets document dimensions from the viewBox attribute and scales them based on the given width/height scale.
     * @param {number} scaleWidth - resize the element height based on this width.
     * @param {number} scaleHeight - resize the element width based on this height.
     * @returns {{height: number, width: number}}
     */
    getDimensions(scaleWidth, scaleHeight) {
        const viewBox = this.getViewBox();

        let width = this.getAttribute('width');
        let height = this.getAttribute('height');

        // If the height or width are not valid then get them from the viewbox attribute if present
        if ((typeof height !== 'string' || typeof width !== 'string') && typeof viewBox === 'string') {
            const parts = viewBox.split(' ');
            width = parts[2];
            height = parts[3];
        }

        // Convert both values to a number
        width = Number(width);
        height = Number(height);

        if (scaleHeight) {
            width = Math.round(((width * scaleHeight) / height) * 100) / 100;
            height = scaleHeight;
        }

        if (scaleWidth) {
            height = Math.round(((height * scaleWidth) / width) * 100) / 100;
            width = scaleWidth;
        }

        return { height, width };
    }

    /**
     * Gets the value of the viewBox attribute.
     * @returns {string}
     */
    getViewBox() {
        return this.getAttribute('viewBox');
    }

    /**
     * Gets the title.
     * @returns {string}
     */
    getTitle() {
        return this.$svg.find('title').text();
    }

    /**
     * Loads the given XML content.
     * @param {string} content
     * @returns {CheerioStatic}
     */
    load(content) {
        return cheerio.load(content, { normalizeWhitespace: true, xmlMode: true });
    }

    /**
     * Converts a SVG document into a <symbol/> element.
     * @param {string} id - the symbol id.
     * @returns {string}
     */
    toSymbol(id) {
        const $svg = this.$svg;
        const attrs = [`id="${id}"`];

        // Get the SVG content and prepend the symbol id to all ids used on inner elements
        const content = $svg.html().replace(/(\s+id="|="url\(#|xlink:href="#)/g, `$1${id}`);

        // Load the contents of the svg now with the altered ids
        const $content = this.load(content);

        // Remove the defs from the SVG content
        const defs = $content('defs').remove().html();

        // Get the symbol contents (without defs)
        const paths = $content.html();

        // Create the symbol attributes
        ['class', 'preserveAspectRatio', 'viewBox'].forEach((name) => {
            const value = this.getAttribute(name);

            if (value) {
                attrs.push(`${name}="${value}"`);
            }
        });

        return {
            symbolDefs: defs,
            symbol: SvgDocument.createSymbol(attrs, paths),
        };
    }
}

module.exports = SvgDocument;
