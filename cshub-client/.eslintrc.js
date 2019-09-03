module.exports = {
    root: true,
    env: {
        node: true
    },
    extends: ["plugin:vue/recommended", "@vue/prettier", "@vue/typescript"],
    rules: {
        "no-console": process.env.NODE_ENV === "production" ? "error" : "off",
        "no-debugger": process.env.NODE_ENV === "production" ? "error" : "off",
        "@typescript-eslint/explicit-function-return-type": "off",
        "@typescript-eslint/no-use-before-define": "off",
        "@typescript-eslint/interface-name-prefix": "off",
        "prettier/prettier": [
            "error",
            {
                semi: true,
                tabWidth: 4,
                printWidth: 120
            }
        ],
        "no-dupe-class-members": "off"
    },
    parserOptions: {
        parser: "@typescript-eslint/parser"
    }
};
