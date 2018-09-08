'use strict';

const Chunk = require('webpack/lib/Chunk');

const MissingDimensionsException = require('./exceptions/MissingDimensionsException');
const SvgSprite = require('./SvgSprite');

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
 * - Generates the sprites during optimization phase
 * - Plugin for webpack
 */
class SvgStorePlugin {

    /**
     * Initializes options.
     * @param {Object} options
     * @param {boolean} options.emit - determines if sprites must be emitted.
     * @param {{ startX: number, startY: number, deltaX: number, deltaY: number, iconHeight: number }} options.sprite - positioning and sizing options for the symbols in the sprite.
     */
    constructor({
        emit = true,
        sprite = {},
    } = {}) {
        /** @member {boolean} */
        this.emit = emit;
        /** @member {{ startX: number, startY: number, deltaX: number, deltaY: number, iconHeight: number }} */
        this.sprite = sprite;
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
     * Attaches the compilation process to the current compilation.
     * @param {webpack.Compiler} compiler
     */
    apply(compiler) {
        /** @type {{ thisCompilation: Tapable }} */
        const { hooks } = compiler;

        hooks.thisCompilation.tap(this.constructor.name, this.exec.bind(this));
    }

    /**
     * Attaches the several compilation steps to their respective hook,
     * so that everything is done in the right order.
     * - Generates every registered sprite during optimization phase.
     * - Replaces the sprite URL with the hashed URL during chunks optimization phase.
     * - Adds the sprites to the compilation assets during the additional assets phase.
     * @param {webpack.Compilation} compilation
     */
    exec(compilation) {
        /** @type {{ optimize: Tapable, optimizeModules: Tapable, additionalAssets: Tapable }} */
        const { hooks } = compilation;

        // Generate sprites during the optimization phase
        hooks.optimize.tap(this.constructor.name, this.generateSprites.bind(this, compilation));

        // Replace the sprites URL with the hashed URL during the chunks optimization phase
        hooks.optimizeChunks.tap(this.constructor.name, this.fixSpritePathsInChunks.bind(this));

        // Add sprites to the compilation assets
        if (this.emit) {
            hooks.additionalAssets.tapAsync(this.constructor.name, this.registerSprites.bind(this, compilation));
        }

    }

    /**
     * Looks for sprite URLs in the modules in the given chunks and replaces them with the URL containing the sprite hash.
     * @param {Chunk[]} chunks
     */
    fixSpritePathsInChunks(chunks) {
        const spritesWithInterpolatedName = this.getSpritesWithInterpolateName();

        for (const sprite of spritesWithInterpolatedName) {
            // Skip it if it wasn't updated
            if (!sprite.updated) {
                continue;
            }

            for (const chunk of chunks) {
                for (const module of chunk.modulesIterable) {
                    this.replaceSpritePathsInModuleWithInterpolatedPaths(module, sprite);
                }
            }
        }

    }

    /**
     * Generates the content for every sprite.
     */
    generateSprites(compilation) {
        for (const spritePath in store) {
            try {
                store[spritePath].generate(this.sprite);
            } catch (error) {
                if (error instanceof MissingDimensionsException) {
                    compilation.warnings.push(error);
                }
            }
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
     * Gets sprites which name have an hash.
     * @returns {SvgSprite[]}
     */
    getSpritesWithInterpolateName() {
        const spritesWithInterpolatedName = [];

        for (const spritePath in store) {
            const sprite = store[spritePath];
            const { originalResourcePath, resourcePath } = sprite;

            if (originalResourcePath !== resourcePath) {
                spritesWithInterpolatedName.push(sprite);
            }
        }

        return spritesWithInterpolatedName;
    }

    /**
     * Replaces the given sprite URL with the hashed URL in the given module.
     * @param {Module} module - the module where the URL needs to be replaced.
     * @param {SvgSprite} sprite - the sprite for the module.
     */
    replaceSpritePathsInModuleWithInterpolatedPaths(module, sprite) {
        switch (module.constructor.name) {
            case 'CssModule':
                module.content = sprite.replacePathsWithInterpolatedPaths(module.content);
                break;

            case 'NormalModule': {
                const source = module._source;

                if (typeof source === 'string') {
                    module._source = sprite.replacePathsWithInterpolatedPaths(source);
                } else if (typeof source === 'object') {
                    if (typeof source._name === 'string') {
                        source._name = sprite.replacePathsWithInterpolatedPaths(source._name);
                    }
                    if (typeof source._value === 'string') {
                        source._value = sprite.replacePathsWithInterpolatedPaths(source._value);
                    }
                }
                break;
            }
        }
    }

    /**
     * Registers the sprites so that they are part of the final output.
     * @param compilation
     * @param {Function} callback
     */
    registerSprites(compilation, callback) {
        for (const spritePath in store) {
            const { name, resourcePath, content, updated } = store[spritePath];

            // If the sprite wasn't changed since the last compilation
            // then skip this step because the assets were already generated before
            if (!updated) {
                continue;
            }

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
