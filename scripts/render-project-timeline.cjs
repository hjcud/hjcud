const fs = require('node:fs');
const path = require('node:path');
const {createHash} = require('node:crypto');
const root = path.join(__dirname, '..');
const assets = path.join(root, 'assets');
const items = JSON.parse(fs.readFileSync(path.join(root, 'data/project-timeline.json'), 'utf8'));
const esc = value => String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&apos;'}[c]));
if (!Array.isArray(items) || !items.length) throw Error('Timeline needs entries');
for (const item of items) {
  if (!/^\d{4}-\d{2}$/.test(item.start) || !item.name || !item.role || !item.period) throw Error('Incomplete timeline entry');
}
items.sort((a,b) => b.start.localeCompare(a.start));
const height = 92 + items.length * 82;
const generated = [];
for (const [theme,p] of Object.entries({
  dark:{text:'#edf4fa',muted:'#99a7b5',accent:'#b9e1f4',border:'#30363d',line:'#252e38'},
  light:{text:'#1f2328',muted:'#59636e',accent:'#0969a8',border:'#d1d9e0',line:'#d8dee4'}
})) {
  const t=(x,y,text,size,color,extra='')=>`<text x="${x}" y="${y}" font-size="${size}" fill="${color}" ${extra}>${esc(text)}</text>`;
  const svg=`<svg xmlns="http://www.w3.org/2000/svg" width="840" height="${height}" viewBox="0 0 840 ${height}" role="img" aria-labelledby="title desc">
<title id="title">Project timeline</title><desc id="desc">${esc(items.map(i=>`${i.period}: ${i.name}. ${i.role}`).join(' '))}</desc>
<style>text{font-family:Segoe UI,Arial,Malgun Gothic,Meiryo,sans-serif}</style>
<rect x=".5" y=".5" width="839" height="${height-1}" rx="12" fill="none" stroke="${p.border}"/>
<path d="M20 24v19" stroke="${p.accent}" stroke-width="3" stroke-linecap="round"/>
${t(32,39,'PROJECT TIMELINE',18,p.accent,'font-weight="700"')}
${t(820,39,'Selected projects',12,p.muted,'text-anchor="end"')}
<path d="M20 58h800M216 91v${82*(items.length-1)}" fill="none" stroke="${p.line}" stroke-width="1.5"/>
${items.map((item,i)=>{
    const y=92+i*82;
    return `${t(193,y+4,item.period,12,p.muted,'text-anchor="end"')}
<circle cx="216" cy="${y}" r="4" fill="${p.accent}"/>
${t(240,y+5,item.name,16,p.text,'font-weight="600"')}
${t(240,y+29,item.role,12,p.muted)}`;
  }).join('\n')}
</svg>\n`;
  const hash=createHash('sha256').update(svg).digest('hex').slice(0,10);
  const file=`profile-timeline-${theme}-${hash}.svg`;
  fs.writeFileSync(path.join(assets,file),svg);
  generated.push(file);
}
const mdPath=path.join(root,'README.md');
let md=fs.readFileSync(mdPath,'utf8');
const old=[...md.matchAll(/assets\/(profile-timeline-(?:dark|light)-[a-f0-9]+\.svg)/g)].map(m=>m[1]);
const block=`<!-- project-timeline:start -->\n<p align="center">\n  <picture><source media="(prefers-color-scheme: dark)" srcset="assets/${generated[0]}" /><img src="assets/${generated[1]}" alt="${esc(items.map(i=>`${i.period}: ${i.name} — ${i.role}`).join('; '))}" width="100%" /></picture>\n</p>\n<!-- project-timeline:end -->`;
md=md.includes('<!-- project-timeline:start -->') ? md.replace(/<!-- project-timeline:start -->[\s\S]*?<!-- project-timeline:end -->/,block) : block+'\n\n'+md;
fs.writeFileSync(mdPath,md);
for (const file of new Set(old)) if (!generated.includes(file)) fs.unlinkSync(path.join(assets,file));
console.log(JSON.stringify({files:generated}));
