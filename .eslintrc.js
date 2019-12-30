module.exports = {
    "env": {
        "commonjs": true,
        "es6": true,
        "node": true,
    },
    "extends": [
        "eslint:recommended",
        "plugin:react/recommended",
    ],
    "globals": {
        "document": true,
    },
    "parserOptions": {
        "ecmaFeatures": {},
        "ecmaVersion": 2019,
        "sourceType": "module"
    },
    "plugins": [
        "react"
    ],
    "rules": {
        "accessor-pairs": "error",
        "array-bracket-spacing": "error",
        "arrow-parens": "error",
        "arrow-spacing": "error",
        "block-spacing": [
            "error",
            "always"
        ],
        "brace-style": "error",
        "comma-dangle": [
            'error',
            {
                arrays: 'always-multiline',
                exports: 'always-multiline',
                functions: 'only-multiline',
                imports: 'always-multiline',
                objects: 'always-multiline',
            },
        ],
        "comma-spacing": [
            "error",
            {
                "before": false,
                "after": true
            }
        ],
        "comma-style": "error",
        "computed-property-spacing": "error",
        "curly": [
            "error",
            "all"
        ],
        "dot-location": [
            "error",
            "property"
        ],
        "dot-notation": "error",
        "eqeqeq": [
            "error",
            "always"
        ],
        "generator-star-spacing": [
            "error",
            {
                "before": false,
                "after": true
            }
        ],
        "indent": [
            "error",
            4,
            {
                "SwitchCase": 1
            }
        ],
        "key-spacing": "error",
        "keyword-spacing": "error",
        "linebreak-style": [
            "error",
            "unix"
        ],
        "max-depth": "error",
        "max-nested-callbacks": [
            "error",
            {
                "max": 4
            }
        ],
        "new-cap": [
            "error",
            {
                "newIsCap": true,
                "capIsNew": false
            }
        ],
        "new-parens": "error",
        "no-alert": "error",
        "no-array-constructor": "error",
        "no-console": "warn",
        "no-debugger": "warn",
        "no-dupe-args": "error",
        "no-dupe-keys": "error",
        "no-duplicate-case": "error",
        "no-empty-character-class": "error",
        "no-eval": "error",
        "no-multi-spaces": "error",
        "no-multiple-empty-lines": "error",
        "no-new-object": "error",
        "no-spaced-func": "error",
        "no-trailing-spaces": "warn",
        "no-undef-init": "error",
        "no-unneeded-ternary": "error",
        "no-useless-constructor": "error",
        "no-var": "error",
        "no-with": "error",
        "object-curly-spacing": [
            "error",
            "always"
        ],
        "object-shorthand": "error",
        "prefer-arrow-callback": "error",
        "prefer-rest-params": "error",
        "prefer-spread": "error",
        "quote-props": [
            "error",
            "as-needed"
        ],
        "quotes": [
            "error",
            "single"
        ],
        "require-jsdoc": [
            "warn",
            {
                "require": {
                    "FunctionDeclaration": true,
                    "MethodDefinition": true,
                    "ClassDeclaration": true
                }
            }
        ],
        "semi": [
            "error",
            "always"
        ],
        "space-before-blocks": "error",
        "space-before-function-paren": [
            "error",
            "never"
        ],
        "space-infix-ops": "error",
        "space-unary-ops": "error",
        "spaced-comment": "error",
        "yield-star-spacing": "error"
    },
    "settings": {
        "react": {
            "version": "detect",
        },
    },
};
