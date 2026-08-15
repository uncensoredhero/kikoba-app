const fs=require('fs');
const path='public/index.html';
let html=fs.readFileSync(path,'utf8');
const tags=[
  '<script src="/demo-enhancements.js"></script>',
  '<script src="/phase-b-force.js"></script>'
];
let changed=false;
for(const tag of tags){
  if(!html.includes(tag)){
    html=html.replace('</body>',tag+'\n</body>');
    changed=true;
  }
}
if(changed) fs.writeFileSync(path,html);
console.log('Injected Kikoba demo enhancements and Phase B investment dashboard');
