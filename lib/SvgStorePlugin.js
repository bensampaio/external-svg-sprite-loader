'use strict';

const SvgSprite = require('./SvgSprite');
const SvgStorePluginSpriter = require('./SvgStorePluginSpriter');

/**
 * Default options.
 * - All instances are based on these default options.
 * @const
 * @memberOf SvgStorePlugin
 * @private
 * @static
 * @type { emit: boolean, sprite: object }
 */
const DEFAULT_OPTIONS = {
    emit: true,
    sprite: null,
};

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
    constructor(options) {
        options = Object.assign({}, DEFAULT_OPTIONS, options);

        /** @member {{ emit: boolean, sprite: { startX: number, startY: number, deltaX: number, deltaY: number, iconHeight: number } }} */
        this.options = options;
        /** @member {Map<string, SvgStorePluginSpriter>} */
        this.spriters = new Map();
    }

    /**
     * Gets the sprite instance for the given path or creates one if it doesn't exist.
     * @param {string} resourcePath - the relative path for the sprite based on the output folder.
     * @returns {SvgSprite}
     */
    static getSprite(resourcePath) {
        let sprite = store[resourcePath];

        if (!sprite) {
            sprite = new SvgSprite(resourcePath);
            store[resourcePath] = sprite;
        }

        return sprite;
    }

    /**
     * Ensures that a spriter for each sprite exists.
     */
    ensureSpriters() {
        for (const resourcePath in store) {
            if (!this.spriters.has(resourcePath)) {
                const sprite = store[resourcePath];
                const spriter = new SvgStorePluginSpriter(sprite);

                this.spriters.set(resourcePath, spriter);
            }
        }
    }

    /**
     * Gets the underlying sprites store.
     * Note that the returned object may contain sprites from other plugin instances.
     * @returns {Object.<string, SvgSprite>}
     */
    getStore() {
        return store;
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
        hooks.optimize.tap(this.constructor.name, () => {
            this.ensureSpriters();
            this.spriters.forEach((spriter) => spriter.generateSprite(compilation));
        });

        // Replace the sprites URL with the hashed URL during the chunks optimization phase
        hooks.optimizeChunks.tap(this.constructor.name, (chunks) => {
            this.spriters.forEach((spriter) => spriter.fixSpritePathsInChunks(chunks));
        });

        // Add sprites to the compilation assets
        if (this.options.emit) {
            hooks.additionalAssets.tapAsync(this.constructor.name, (callback) => {
                this.spriters.forEach((spriter) => spriter.registerSpriteInCompilation(compilation));
                callback();
            });
        }
    }

}

module.exports = SvgStorePlugin;
