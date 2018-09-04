'use strict';

const Chunk = require('webpack/lib/Chunk');
const escapeRegExp = require('lodash.escaperegexp');
const loaderUtils = require('loader-utils');

const MissingDimensionsException = require('./exceptions/MissingDimensionsException');

/**
 * SVG Store Plugin Spriter
 */
class SvgStorePluginSpriter {

    /**
     * Initializes the spriter.
     * @param {SvgSprite} sprite - the associated SvgSprite.
     * @param {object} options - the options.
     * @param {number} options.startX - sprite start X position.
     * @param {number} options.startY - sprite start Y position.
     * @param {number} options.deltaX - free space between icons by X.
     * @param {number} options.deltaY - free space between icons by Y.
     * @param {number} options.iconHeight - icon height in the sprite.
     */
    constructor(sprite, options) {
        /** @member {?string} */
        this.content = null;
        /** @member {boolean} */
        this.changed = false;
        /** @member {{ startX: number, startY: number, deltaX: number, deltaY: number, iconHeight: number } }} */
        this.options = options;
        /** @member {RegExp} */
        this.originalResourcePathRegExp = new RegExp(escapeRegExp(sprite.resourcePath), 'gm');
        /** @member {?string} */
        this.previousResourcePath = null;
        /** @member {?RegExp} */
        this.previousResourcePathRegExp = null;
        /** @member {?RegExp} */
        this.resourcePath = null;
        /** @member {?RegExp} */
        this.resourcePathRegExp = null;
        /** @member {SvgSprite} */
        this.sprite = sprite;
        /** @member {number} */
        this.revisionNumber = null;
    }

    /**
     * Generates the content for the sprite and updates props that are used in the next compilation hooks.
     * Skips if the sprite revision number hasn't changed.
     * @param {webpack.Compilation} compilation
     */
    generateSprite(compilation) {
        // Check if the sprite changed since the last compilation and skip if it didn't
        this.changed = this.revisionNumber !== this.sprite.revisionNumber;

        if (!this.changed) {
            return;
        }

        // Get the new sprite content
        try {
            this.content = this.sprite.generate(this.options);
        } catch (error) {
            if (error instanceof MissingDimensionsException) {
                compilation.warnings.push(error);
                this.changed = false;
                return;
            }

            throw error;
        }

        // Update the properties that will be used in the next compilation hooks
        this.revisionNumber = this.sprite.revisionNumber;
        this.previousResourcePath = this.resourcePath;
        this.previousResourcePathRegExp = this.resourcePathRegExp;
        this.resourcePath = loaderUtils.interpolateName({}, this.sprite.resourcePath, { content: this.content });
        this.resourcePathRegExp = new RegExp(escapeRegExp(this.resourcePath), 'gm');
    }

    /**
     * Looks for sprite URLs in the modules of the given chunks and replaces them with the URL containing the sprite hash.
     * Skips if the sprite path has no hash or if the sprite contents haven't changed (except for CSS modules).
     * @param {Chunk[]} chunks
     */
    fixSpritePathsInChunks(chunks) {
        // Skip if the sprite has no hash
        if (!this.sprite.hasHash) {
            return;
        }

        chunks.forEach((chunk) => {
            for (const module of chunk.modulesIterable) {
                this.replaceSpritePathsInModuleWithInterpolatedPaths(module);
            }
        });
    }

    /**
     * Registers the sprites so that they are part of the final output.
     * Skips if the sprite contents has not changed.
     * @param compilation
     */
    registerSpriteInCompilation(compilation) {
        // Skip if the sprite didn't change
        if (!this.changed) {
            return;
        }

        const { name } = this.sprite;
        const { content, resourcePath } = this;

        // Add the sprite to the compilation assets
        compilation.assets[resourcePath] = {
            source() {
                return content;
            },
            size() {
                return content.length;
            },
        };

        // Create a chunk for the sprite and add it to the compilation chunks
        // NOTE: This step is only to allow other plugins to detect the existence of this asset
        const chunk = new Chunk(name);
        chunk.ids = [];
        chunk.files.push(resourcePath);
        compilation.chunks.push(chunk);
    }

    /**
     * Replaces the sprite URLs with the hashed URLs in the given module.
     * Skips if sprite contents haven't changed unless for modules of type CSS.
     * @param {Module} module - the module where the URL needs to be replaced.
     */
    replaceSpritePathsInModuleWithInterpolatedPaths(module) {
        switch (module.constructor.name) {
            case 'CssModule':
                // Can't skip CssModule's because `mini-css-extract-plugin` recreates a new instance in every recompilation
                module.content = this.replaceSpritePathsInSourceWithInterpolatedPaths(module.content);

                break;

            case 'NormalModule': {
                // Skip if the sprite didn't change
                if (!this.changed) {
                    return;
                }

                const source = module._source;

                if (typeof source === 'string') {
                    module._source = this.replaceSpritePathsInSourceWithInterpolatedPaths(source);
                } else if (typeof source === 'object') {
                    if (typeof source._name === 'string') {
                        source._name = this.replaceSpritePathsInSourceWithInterpolatedPaths(source._name);
                    }
                    if (typeof source._value === 'string') {
                        source._value = this.replaceSpritePathsInSourceWithInterpolatedPaths(source._value);
                    }
                }

                break;
            }
        }
    }

    /**
     * Replaces sprite URLs with the hashed URLs in the given module source.
     * @param {string} source - the module source.
     * @return {string}
     */
    replaceSpritePathsInSourceWithInterpolatedPaths(source) {
        const { originalResourcePathRegExp, resourcePath, previousResourcePath, previousResourcePathRegExp } = this;

        // Always replace the `originalResourcePath`
        // Moreover, replace the `previousPath` with the new one if they are different
        source = source.replace(originalResourcePathRegExp, resourcePath);

        if (previousResourcePath && previousResourcePath !== resourcePath) {
            source = source.replace(previousResourcePathRegExp, resourcePath);
        }

        return source;
    }

}

module.exports = SvgStorePluginSpriter;
