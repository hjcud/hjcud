const fs = require('node:fs');
const path = require('node:path');
const {createHash} = require('node:crypto');
const root = path.join(__dirname, '..');
const assets = path.join(root, 'assets');
const data = JSON.parse(fs.readFileSync(path.join(root, 'data/project-timeline.json'), 'utf8'));
const items = data.projects;
const esc = value => String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&apos;'}[c]));
if (!Array.isArray(items) || !items.length) throw Error('Timeline needs entries');
for (const item of items) {
  if (!/^\d{4}-\d{2}$/.test(item.start) || !item.name || !item.role || !item.period) throw Error('Incomplete timeline entry');
}
function month(value) {
  if (!/^\d{4}-(0[1-9]|1[0-2])$/.test(value)) throw Error('Invalid timeline month');
  const [year,m] = value.split('-').map(Number);
  return year*12+m-1;
}
const through=month(data.through);
const firstYear=Math.floor(Math.min(...items.map(i=>month(i.start)))/12);
const lastYear=Math.floor(through/12);
const first=firstYear*12, last=(lastYear+1)*12;
const x=value=>220+(value-first)/(last-first)*600;
for (const item of items) {
  const end=item.end===null?through:month(item.end);
  if (end<month(item.start) || end>through) throw Error('Invalid project duration');
}
items.sort((a,b) => b.start.localeCompare(a.start));
const height = 108 + items.length * 36;
const generated = [];
for (const [theme,p] of Object.entries({
  dark:{text:'#edf4fa',muted:'#99a7b5',accent:'#b9e1f4',border:'#30363d',line:'#252e38'},
  light:{text:'#1f2328',muted:'#59636e',accent:'#0969a8',border:'#d1d9e0',line:'#d8dee4'}
})) {
  const t=(x,y,text,size,color,extra='')=>`<text x="${x}" y="${y}" font-size="${size}" fill="${color}" ${extra}>${esc(text)}</text>`;
  const svg=`<svg xmlns="http://www.w3.org/2000/svg" width="840" height="${height}" viewBox="0 0 840 ${height}" role="img" aria-labelledby="title desc">
<title id="title">Project timeline</title><desc id="desc">${esc(items.map(i=>`${i.name}: ${i.period}.`).join(' '))}</desc>
<style>text{font-family:Segoe UI,Arial,Malgun Gothic,Meiryo,sans-serif}</style>
<rect x=".5" y=".5" width="839" height="${height-1}" rx="12" fill="none" stroke="${p.border}"/>
<path d="M20 24v19" stroke="${p.accent}" stroke-width="3" stroke-linecap="round"/>
${t(32,39,'PROJECT TIMELINE',18,p.accent,'font-weight="700"')}
${t(820,39,'→ Ongoing',11,p.muted,'text-anchor="end"')}
<path d="M20 58h800" fill="none" stroke="${p.line}" stroke-width="1.5"/>
${Array.from({length:lastYear-firstYear+1},(_,i)=>t(x((firstYear+i)*12+6),82,firstYear+i,12,p.muted,'text-anchor="middle"')).join('\n')}
${Array.from({length:(last-first)/3+1},(_,i)=>{
  const value=first+i*3;
  return `<path d="M${x(value)} 94V${height-20}" stroke="${value%12===0?p.border:p.line}" stroke-width="1"/>`;
}).join('\n')}
${items.map((item,i)=>{
    const y=113+i*36;
    const start=x(month(item.start)), end=x((item.end===null?through:month(item.end))+1);
    const bar=item.end===null
      ? `<path d="M${start} ${y-7}H${end-6}L${end} ${y}L${end-6} ${y+7}H${start}Z" fill="${p.accent}"/>`
      : `<rect x="${start}" y="${y-7}" width="${end-start}" height="14" rx="3" fill="${p.muted}"/>`;
    return `${t(32,y+4,item.name,12,p.text,'font-weight="600"')}
<path d="M220 ${y+17}h600" stroke="${p.line}"/>
<g><title>${esc(item.name+': '+item.period)}</title>${bar}</g>`;
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
const block=`<!-- project-timeline:start -->\n<p align="center">\n  <picture><source media="(prefers-color-scheme: dark)" srcset="assets/${generated[0]}" /><img src="assets/${generated[1]}" alt="${esc(items.map(i=>`${i.name}: ${i.period}`).join('; '))}" width="100%" /></picture>\n</p>\n<!-- project-timeline:end -->`;
md=md.replace(/<!-- project-timeline:start -->[\s\S]*?<!-- project-timeline:end -->\s*/,'').trimStart();
if (!md.includes('## Projects')) throw Error('Missing Projects section');
md=md.replace('## Projects',block+'\n\n## Projects');
fs.writeFileSync(mdPath,md);
for (const file of new Set(old)) if (!generated.includes(file)) fs.unlinkSync(path.join(assets,file));
console.log(JSON.stringify({files:generated}));
