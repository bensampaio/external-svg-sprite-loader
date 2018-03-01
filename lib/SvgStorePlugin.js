'use strict';

const Chunk = require('webpack/lib/Chunk');

const SvgSprite = require('./SvgSprite');

let ExtractedModule;

try {
    ExtractedModule = require('extract-text-webpack-plugin/dist/lib/ExtractedModule').default;
}
catch (e) {
    ExtractedModule = null;
}

const _emit = Symbol();
const _spriteOptions = Symbol();

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
 * Stores the sprites to be generated and the icons to be included on each one.
 * @memberOf SvgStorePlugin
 * @private
 * @static
 * @type {Object.<string, SvgSprite>}
 */
const store = {};

/**
 * SVG Store Plugin
 * - Manages all sprites data
 * - Generates the sprites during optimization time
 * - Plugin for webpack
 */
class SvgStorePlugin {

    /**
     * Initializes options.
     * @param {Object} options
     * @param {boolean} options.emit         - determines if sprites must be emitted.
     * @param {number} options.spriteOptions.startX     - sprite start X position.
     * @param {number} options.spriteOptions.startY     - sprite start Y position.
     * @param {number} options.spriteOptions.deltaX     - free space between icons by X.
     * @param {number} options.spriteOptions.deltaY     - free space between icons by Y.
     * @param {number} options.spriteOptions.iconHeight - Icon height in the sprite - All icons are resized based on this height.
     */
    constructor({
        emit = true,
        spriteOptions = {
            startX: 0,
            startY: 0,
            deltaX: 0,
            deltaY: 0,
            iconHeight: DEFAULT_ICON_HEIGHT
        }
    } = {}) {
        this[_emit] = emit;
        this[_spriteOptions] = {
            startX: spriteOptions.startX > 0 ? spriteOptions.startX : 0,
            startY: spriteOptions.startY > 0 ? spriteOptions.startY : 0,
            deltaX: spriteOptions.deltaX > 0 ? spriteOptions.deltaX : 0,
            deltaY: spriteOptions.deltaY > 0 ? spriteOptions.deltaY : 0,
            iconHeight: spriteOptions.iconHeight > 0 ? spriteOptions.iconHeight : DEFAULT_ICON_HEIGHT
        };
    }

    /**
     * Gets the sprite instance for the given path or if it doesn't exist creates a new one.
     * @param {string} resourcePath - the relative path for the sprite based on the output folder.
     * @returns {SvgSprite}
     */
    static getSprite(resourcePath) {
        if (!(resourcePath in store)) {
            store[resourcePath] = new SvgSprite(resourcePath);
        }

        return store[resourcePath];
    }

    /**
     * - Generates every registered sprite during optimization phase.
     * - Replaces the sprite URL with the hashed URL during modules optimization phase.
     * - Performs the previous step also for extracted chuncks (ExtractTextPlugin)
     * - Adds the sprites to the compilation assets during the additional assets phase.
     * @param {Compiler} compiler
     */
    apply(compiler) {

        // Get compilation instance
        compiler.plugin('this-compilation', (compilation) => {

            // Generate sprites during the optimization phase
            compilation.plugin('optimize', () => {

                // For every sprite
                for (let spritePath in store) {

                    // Generate sprite content
                    store[spritePath].generate(this[_spriteOptions]);

                }

            });

            // Replace the sprites URL with the hashed URL during the modules optimization phase
            compilation.plugin('optimize-modules', (modules) => {

                // Get sprites with interpolated name
                const spritesWithInterpolatedName = this.getSpritesWithInterpolateName();

                if (spritesWithInterpolatedName.length > 0) {

                    // Find icons modules
                    modules.forEach((module) => {
                        for (let sprite of spritesWithInterpolatedName) {
                            const { icons } = sprite;

                            // If the module corresponds to one of the icons of this sprite
                            if (module.resource in icons) {
                                this.replaceSpritePathInModuleSource(module, sprite);
                            }
                        }
                    });

                }

            });

            // Replace the sprites URL with the hashed URL during the extracted chunks optimization phase
            compilation.plugin('optimize-extracted-chunks', (chunks) => {

                // Get sprites with interpolated name
                const spritesWithInterpolatedName = this.getSpritesWithInterpolateName();

                if (spritesWithInterpolatedName.length > 0) {
                    chunks.forEach((chunk) => {
                        chunk.forEachModule((module) => {
                            for (let sprite of spritesWithInterpolatedName) {
                                if (module instanceof ExtractedModule) {
                                    this.replaceSpritePathInModuleSource(module, sprite);
                                }
                            }
                        });
                    });
                }

            });

            // Add sprites to the compilation assets
            if (this[_emit]) {
                compilation.plugin('additional-assets', (callback) => {

                    // For every sprite
                    for (let spritePath in store) {

                        // Get sprite
                        const { name, resourcePath, content } = store[spritePath];

                        // Create a chunk for the sprite
                        const chunk = new Chunk(name);
                        chunk.ids = [];
                        chunk.files.push(resourcePath);

                        // Add the sprite to the compilation assets
                        compilation.assets[resourcePath] = {
                            source() {
                                return content;
                            },
                            size() {
                                return content.length;
                            },
                        };

                        // Add chunk to the compilation
                        // NOTE: This step is only to allow other plugins to detect the existence of this asset
                        compilation.chunks.push(chunk);

                    }

                    callback();

                });
            }

        });

    }

    /**
     * Gets the underlying sprites store.
     * @returns {Object.<string, SvgSprite>}
     */
    getStore() {
        return store;
    }

    /**
     * Gets sprites which name has an hash.
     * @returns {SvgSprite[]}
     */
    getSpritesWithInterpolateName() {
        const spritesWithInterpolatedName = [];

        for (let spritePath in store) {
            const sprite = store[spritePath];
            const { originalPath, resourcePath } = sprite;

            if (originalPath !== resourcePath) {
                spritesWithInterpolatedName.push(sprite);
            }
        }

        return spritesWithInterpolatedName;
    }

    /**
     * Replaces the given sprite URL with the hashed URL in the given module source.
     * @param {Module} module - the module where the URL needs to be replaced.
     * @param {SvgSprite} sprite - the sprite for the module.
     */
    replaceSpritePathInModuleSource(module, sprite) {
        const { originalPathRegExp, resourcePath } = sprite;

        let source = module._source;

        if (typeof source === 'string') {
            module._source = source.replace(originalPathRegExp, resourcePath);
        }
        else if (typeof source === 'object') {
            if (typeof source._name === 'string') {
                source._name = source._name.replace(originalPathRegExp, resourcePath);
            }
            if (typeof source._value === 'string') {
                source._value = source._value.replace(originalPathRegExp, resourcePath);
            }
        }
    }

}

module.exports = SvgStorePlugin;
