const { readFileSync } = require("fs");

process.env.VUE_APP_VERSION = JSON.parse(readFileSync("package.json"))["gitSHA"];
process.env.VUE_APP_BUILDDATE = new Date().toLocaleString();

module.exports = {
    pwa: {
        themeColor: "#00A6D6",
        name: "CSHub",
        workboxPluginMode: "GenerateSW",
        appleMobileWebAppCapable: true,
        assetsVersion: Date.now(),
        iconPaths: {
            favicon32: "img/icons/favicon-32x32.png",
            favicon16: "img/icons/favicon-16x16.png",
            appleTouchIcon: "img/icons/apple-touch-icon-152x152.png",
            maskIcon: "img/icons/safari-pinned-tab.svg",
            msTileImage: "img/icons/msapplication-icon-144x144.png"
        }
    },
    baseUrl: undefined,
    outputDir: undefined,
    assetsDir: undefined,
    runtimeCompiler: undefined,
    productionSourceMap: false,
    parallel: undefined,
    css: undefined
};
