module.exports = {
    root: true,
    env: {
        node: true
    },
    extends:  [
        "plugin:@typescript-eslint/recommended",
        "prettier/@typescript-eslint",
        "plugin:prettier/recommended",
    ],
    rules: {
        "no-console": process.env.NODE_ENV === "production" ? "error" : "off",
        "no-debugger": process.env.NODE_ENV === "production" ? "error" : "off",
        "@typescript-eslint/explicit-function-return-type": "off",
        "@typescript-eslint/no-use-before-define": "off",
        "@typescript-eslint/no-explicit-any": "off",
        "@typescript-eslint/no-parameter-properties": "off",
        "@typescript-eslint/explicit-member-accessibility": "off",
        "@typescript-eslint/interface-name-prefix": "off",
        "prettier/prettier": [
            "error",
            {
                semi: true,
                tabWidth: 4,
                printWidth: 120
            }
        ]
    },
    parserOptions: {
        parser: "@typescript-eslint/parser"
    }
};
