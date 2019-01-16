"use strict";

const { readFileSync, writeFileSync } = require('fs');
const { execSync } = require('child_process');

const pkgFile = "package.json";

const gitSHA = execSync("git rev-parse HEAD").toString().replace(/\s/g, '');
const pkg = JSON.parse(readFileSync(pkgFile));

pkg["gitSHA"] = gitSHA;
console.log("Git SHA: " + gitSHA);

writeFileSync(pkgFile, JSON.stringify(pkg));
