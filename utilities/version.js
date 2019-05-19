"use strict";

const { readFileSync, writeFileSync } = require('fs');
const { execSync } = require('child_process');

const pkgFiles = ["cshub-client/package.json", "cshub-server/package.json", "cshub-shared/package.json", "delta2html/package.json"];

const gitSHA = execSync("git rev-parse HEAD").toString().replace(/\s/g, '');
console.log("Git SHA: " + gitSHA);

for (const pkgFile of pkgFiles) {
    const pkg = JSON.parse(readFileSync(pkgFile));
    pkg["gitSHA"] = gitSHA;
    writeFileSync(pkgFile, JSON.stringify(pkg));
}
