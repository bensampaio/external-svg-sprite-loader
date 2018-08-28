/**
 * @extends Error
 */
class MissingDimensionsException extends Error {

    /**
     * @param {string} spriteName
     * @param {string} iconName
     */
    constructor(spriteName, iconName) {
        super(`the icon "${iconName}" in the sprite "${spriteName}": dimension information is missing. Either specify the viewbox attribute or the height and width attributes.`);
    }

}

module.exports = MissingDimensionsException;
