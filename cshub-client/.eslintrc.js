module.exports = {
    root: true,
    env: {
        node: true
    },
    extends: [
        "plugin:vue/essential",
        "eslint:recommended",
        "@vue/typescript/recommended",
        "@vue/prettier",
        "@vue/prettier/@typescript-eslint",
        "@robbinbaauw",
    ],
    parser: "vue-eslint-parser",
    parserOptions: {
        ecmaVersion: 2020
    },
};
