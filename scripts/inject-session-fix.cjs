const fs = require('fs');
const path = 'public/index.html';
let html = fs.readFileSync(path, 'utf8');
const tag = '<script src="/session-fix.js"></script>';
if (!html.includes(tag)) {
  const marker = '<script>\nconst API=';
  if (!html.includes(marker)) throw new Error('Kikoba session injection marker not found');
  html = html.replace(marker, `${tag}\n${marker}`);
  fs.writeFileSync(path, html);
  console.log('Injected Kikoba canonical session recovery');
} else {
  console.log('Kikoba canonical session recovery already present');
}
