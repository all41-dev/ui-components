const pkg = require('./package.json');
const fs = require('fs');
const path = require('path');
const angularJson = require('./angular.json');
const projects = Object.keys(angularJson.projects);
const pkgs = [];

for (const key of projects) {
  if (angularJson.projects[key].projectType === 'library') {
    const p = path.resolve('./dist/' + key + '/package.json');
    if (fs.existsSync(p)) {
      pkgs.push(p)
    } else {
      console.error('package.json not found: ' + path);
      process.exit(1);
    }
  }
}

for (const p of pkgs) {
  const edit = require(p);
  edit.version = pkg.version;
  fs.writeFileSync(p, JSON.stringify(edit, null, 2));
}

console.log('updated the following packages to ' + pkg.version, pkgs)


