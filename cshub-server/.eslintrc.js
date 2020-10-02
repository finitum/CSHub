module.exports = {
    extends: ["@robbinbaauw"],
    rules: {
        "@typescript-eslint/explicit-module-boundary-types": [
            "error",
            {
                allowArgumentsExplicitlyTypedAsAny: true,
            },
        ],
    },
};
