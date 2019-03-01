const fs = require('fs');
let manifest = JSON.parse(fs.readFileSync('build/manifest.json', 'utf8'));
const hashes = JSON.parse(fs.readFileSync('build/asset-manifest.json', 'utf8'));
manifest.background.scripts[0] = hashes['background.js'];
manifest.background.scripts[1] = hashes['runtime.js'];
fs.writeFileSync('build/manifest.json', JSON.stringify(manifest, null, 2));