const fs = require('fs');
const path = 'public/index.html';
let html = fs.readFileSync(path, 'utf8');
const tags = ['<script src="/session-fix.js"></script>','<script src="/phase-b-force.js"></script>'];
const marker = '<script>\nconst API=';
if (!html.includes(marker)) throw new Error('Kikoba session injection marker not found');
for (const tag of tags) {
  if (!html.includes(tag)) html = html.replace(marker, `${tag}\n${marker}`);
}
fs.writeFileSync(path, html);
console.log('Injected Kikoba runtime fixes');
