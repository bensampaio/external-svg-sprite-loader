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
const _sprite = Symbol();

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
     * @param {boolean} options.emit - determines if sprites must be emitted.
     * @param {Object} options.sprite - svg sprite options { startX, startY, deltaX, deltaY, iconHeight }
     */
    constructor({
        emit = true,
        sprite = {},
    } = {}) {
        this[_emit] = emit;
        this[_sprite] = sprite;
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
     * @param {webpack.Compiler} compiler
     */
    apply(compiler) {
        compiler.hooks.thisCompilation.tap(SvgStorePlugin.name, this.exec.bind(this));
    }

    /**
     * Attaches the several compilation steps to their respective hook,
     * so that everything is done in the right order.
     * @param compilation
     */
    exec(compilation) {

        // Generate sprites during the optimization phase
        compilation.hooks.optimize.tap(SvgStorePlugin.name, this.generateSprites.bind(this));

        // Replace the sprites URL with the hashed URL during the modules optimization phase
        compilation.hooks.optimizeModules.tap(SvgStorePlugin.name, this.fixSpritePathsInModules.bind(this));

        // Replace the sprites URL with the hashed URL during the extracted chunks optimization phase
        if (compilation.hooks.optimizeExtractedChunks) {
            compilation.hooks.optimizeExtractedChunks.tap(SvgStorePlugin.name, this.fixSpritePathsInChunks.bind(this));
        }

        // Add sprites to the compilation assets
        if (this[_emit]) {
            compilation.hooks.additionalAssets.tapAsync(SvgStorePlugin.name, this.registerSprites.bind(this, compilation));
        }

    }

    /**
     * Fixes the sprites URL when their filename contains an hash.
     * @param chunks
     */
    fixSpritePathsInChunks(chunks) {

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

    }

    /**
     * Fixes the sprites URL when their filename contains an hash.
     * @param modules
     */
    fixSpritePathsInModules(modules) {

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

    }

    /**
     * Generates the content for every sprite.
     */
    generateSprites() {
        for (let spritePath in store) {
            store[spritePath].generate(this[_sprite]);
        }
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

    /**
     * Registers the sprites so that they are part of the final output.
     * @param compilation
     * @param callback
     */
    registerSprites(compilation, callback) {

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

    }

}

module.exports = SvgStorePlugin;
