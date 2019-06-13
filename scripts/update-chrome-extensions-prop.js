const fs = require('fs');
let manifest = JSON.parse(fs.readFileSync('build/manifest.json', 'utf8'));
const hashes = JSON.parse(fs.readFileSync('build/asset-manifest.json', 'utf8'));
manifest.background.scripts[0] = hashes.files['background.js'];
manifest.background.scripts[1] = hashes.files['runtime.js'];
if (process.env.PUBLISH_BUILD !== 'true') {
    manifest.content_security_policy = "script-src 'self' 'unsafe-eval'; object-src 'self'";
}
fs.writeFileSync('build/manifest.json', JSON.stringify(manifest, null, 2));