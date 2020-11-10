'use strict';

const Chunk = require('webpack/lib/Chunk');
const Compilation = require('webpack/lib/Compilation');

const MissingDimensionsException = require('./exceptions/MissingDimensionsException');
const { DEFAULT_LOADER_OPTIONS } = require('./loader');
const SvgSprite = require('./SvgSprite');

/**
 * @property {boolean} emit - determines if sprites must be emitted.
 * @property {string} filename
 * @property {SvgSpriteLayout} sprite - positioning and sizing options for the symbols in a sprite.
 * @type {Readonly<{emit: boolean, filename: string, sprite: Readonly<{}>}>}
 */
const DEFAULT_PLUGIN_OPTIONS = Object.freeze({
    emit: true,
    sprite: Object.freeze({}),
});

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
     */
    constructor(options) {
        /** @member {Object} */
        this.options = Object.assign({}, DEFAULT_PLUGIN_OPTIONS, options);
        /** @member {SvgSprite[]} */
        this.sprites = [];
    }

    /**
     * Injects a sprite for each loader in the configuration so that they can add icons to a sprite.
     * Attaches the compilation process to the current compilation.
     * @param {webpack.Compiler} compiler
     */
    apply(compiler) {
        const { name } = this.constructor;

        /** @type {{ thisCompilation: Tapable }} */
        const { hooks } = compiler;

        const { rules } = compiler.options.module;

        // Iterates through the given list of rules and injects a sprite for each rule that uses our loader.
        this.injectSpritesIntoRules(rules);

        hooks.thisCompilation.tap(name, this.exec.bind(this));
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
        const { options } = this;

        const { name } = this.constructor;

        /** @type {{ optimize: Tapable, optimizeModules: Tapable, additionalAssets: Tapable }} */
        const { hooks } = compilation;

        // Generate sprites during the optimization phase
        hooks.optimize.tap(name, this.generateSprites.bind(this, compilation));

        // Replace the sprites URL with the hashed URL during the modules optimization phase
        hooks.optimizeModules.tap(name, this.fixSpritePathsInModules.bind(this));

        // Add sprites to the compilation assets
        if (options.emit) {
            hooks.processAssets.tap({ name, stage: Compilation.PROCESS_ASSETS_STAGE_ADDITIONAL }, this.registerSprites.bind(this, compilation));
        }

    }

    /**
     * Looks for sprite URLs in the given modules and replaces them with the URL containing the sprite hash.
     * @param {Module[]} modules
     */
    fixSpritePathsInModules(modules) {
        const spritesWithInterpolatedName = this.getSpritesWithInterpolateName();

        for (const sprite of spritesWithInterpolatedName) {
            for (const module of modules) {
                this.replaceSpritePathsInModuleWithInterpolatedPaths(module, sprite);
            }
        }

    }

    /**
     * Generates the content for every sprite.
     */
    generateSprites(compilation) {
        const { options, sprites } = this;

        for (const sprite of sprites) {
            try {
                sprite.generate(options.sprite);
            } catch (error) {
                if (error instanceof MissingDimensionsException) {
                    compilation.warnings.push(error);
                } else {
                    throw error;
                }
            }
        }
    }

    /**
     * Gets sprites which name have an hash.
     * @returns {SvgSprite[]}
     */
    getSpritesWithInterpolateName() {
        const { sprites } = this;

        const spritesWithInterpolatedName = [];

        for (const sprite of sprites) {
            const { originalResourcePath, resourcePath } = sprite;

            if (originalResourcePath !== resourcePath) {
                spritesWithInterpolatedName.push(sprite);
            }
        }

        return spritesWithInterpolatedName;
    }

    /**
     * Injects a sprite into the given rule options so that the loader can add icons to the sprite.
     * @param {Object} rule
     */
    injectSpriteIntoRule(rule) {
        const { sprites } = this;

        if (typeof rule.options !== 'object') {
            rule.options = {};
        }

        // Get the sprite resource path either from the rule options or the default options
        const resourcePath = rule.options.name || DEFAULT_LOADER_OPTIONS.name;

        // Initialize the sprite
        const sprite = new SvgSprite(resourcePath);

        // Inject sprite into loader options
        rule.options.sprite = sprite;

        // Add sprite to the list of sprites
        sprites.push(sprite);
    }

    /**
     * Iterates through the given list of rules and injects a sprite for each rule that uses our loader.
     * @param {Object[]} rules
     * @see https://webpack.js.org/configuration/module/#rule-loader
     * @see https://webpack.js.org/configuration/module/#rule-oneof
     * @see https://webpack.js.org/configuration/module/#rule-rules
     * @see https://webpack.js.org/configuration/module/#rule-use
     */
    injectSpritesIntoRules(rules) {
        for (const rule of rules) {
            const { oneOf: oneOfRules, rules: subRules, use: ruleUse } = rule;

            const loaders = ruleUse || [rule];

            for (const subRule of loaders) {
                if (subRule.loader === SvgStorePlugin.loader) {
                    this.injectSpriteIntoRule(subRule);
                }
            }

            if (subRules) {
                this.injectSpritesIntoRules(subRules);
            }

            if (oneOfRules) {
                this.injectSpritesIntoRules(oneOfRules);
            }
        }
    }

    /**
     * Replaces the given sprite URL with the hashed URL in the given module.
     * @param {Module} module - the module where the URL needs to be replaced.
     * @param {SvgSprite} sprite - the sprite for the module.
     */
    replaceSpritePathsInModuleWithInterpolatedPaths(module, sprite) {
        switch (module.constructor.name) {
            case 'CssModule': {
                const { content } = module;

                const newContent = sprite.replacePathsWithInterpolatedPaths(content.toString());

                module.content = Buffer.isBuffer(content) ? Buffer.from(newContent) : newContent;
                break;
            }

            case 'NormalModule': {
                // Skip it if it wasn't changed
                if (!sprite.changed) {
                    return;
                }

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
     * @param assets
     */
    registerSprites(compilation, assets) {
        const { sprites } = this;

        for (const sprite of sprites) {
            const { changed, content, name, resourcePath } = sprite;

            // If the sprite wasn't changed since the last compilation
            // then skip this step because the assets were already generated before
            if (!changed) {
                continue;
            }

            // Create a chunk for the sprite
            const chunk = new Chunk(name);

            chunk.ids = [];

            chunk.files.add(resourcePath);

            // Add chunk to the compilation
            // NOTE: This step is only to allow other plugins to detect the existence of this asset
            compilation.chunks.add(chunk);

            // Add the sprite to the compilation assets
            assets[resourcePath] = {
                source() {
                    return content;
                },
                size() {
                    return content.length;
                },
            };
        }
    }

}

SvgStorePlugin.loader = require.resolve('./loader');

module.exports = SvgStorePlugin;
