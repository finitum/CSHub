const { readFileSync } = require("fs");

process.env.VUE_APP_VERSION = JSON.parse(readFileSync("package.json"))["gitSHA"];
process.env.VUE_APP_BUILDDATE = new Date().toLocaleString();

module.exports = {
    pwa: {
      themeColor: '#00A6D8',
      name: 'CSHub',
      workboxPluginMode: 'GenerateSW',
      appleMobileWebAppCapable: true,
      assetsVersion: Date.now()
    },

    baseUrl: undefined,
    outputDir: undefined,
    assetsDir: undefined,
    runtimeCompiler: undefined,
    productionSourceMap: false,
    parallel: undefined,
    css: undefined
};
