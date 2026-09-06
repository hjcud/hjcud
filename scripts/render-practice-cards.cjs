// Static records transcribed from the owner's screenshots, 2026-09-07.
const fs = require('node:fs');
const path = require('node:path');
const { createHash } = require('node:crypto');
const readmePath = path.join(__dirname, '../README.md');
let readme = fs.readFileSync(readmePath, 'utf8');
const swea = [22, 31, 58, 21, 5, 2, 0, 0];
const tiers = [['Bronze',46],['Silver',22],['Gold',30],['Platinum',3],['Diamond',0],['Ruby',0]];
const palettes = {
  dark: {text:'#edf4fa',muted:'#99a7b5',accent:'#b9e1f4',bar:'#6b9bb4',border:'#30363d',line:'#252e38',track:'#202a35',faint:'#8795a3',tier:['#d89659','#a2b8cb','#eac35c','#60d8b2','#70c7ec','#ed9ab1']},
  light: {text:'#1f2328',muted:'#59636e',accent:'#0969a8',bar:'#397da3',border:'#d1d9e0',line:'#d8dee4',track:'#eaeef2',faint:'#687480',tier:['#9a560d','#526e85','#896300','#087a59','#096c99','#aa3658']}
};
const text = (x,y,value,size=13,fill='var(--text)',extra='') => `<text x="${x}" y="${y}" font-size="${size}" fill="${fill}" ${extra}>${value}</text>`;
function card(name, description, p, content, footer='') {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="420" height="430" viewBox="0 0 420 430" role="img" aria-labelledby="title desc">
<title id="title">${name} problem solving</title><desc id="desc">${description}</desc>
<style>svg{--text:${p.text};--muted:${p.muted};--accent:${p.accent}}text{font-family:Segoe UI,Arial,sans-serif}</style>
<rect x=".5" y=".5" width="419" height="429" rx="12" fill="none" stroke="${p.border}"/>
<path d="M24 24v19" stroke="${p.accent}" stroke-width="3" stroke-linecap="round"/>
${text(36,39,name,18,p.accent,'font-weight="700"')}
${text(396,38,'Problem solving',12,p.muted,'text-anchor="end"')}
${content}
<path d="M24 390h372" stroke="${p.line}"/>
${text(24,412,footer,10,p.faint)}
${text(396,412,'Snapshot · 2026-09-07',10,p.faint,'text-anchor="end"')}
</svg>\n`;
}
function bars(entries,p) {
  const max = Math.max(...entries.map(([,n])=>n));
  return entries.map(([label,n],i)=>{
    const y = 177+i*18;
    return `${text(24,y+4,label,12,p.muted)}
<rect x="106" y="${y-5}" width="245" height="8" rx="3" fill="${p.track}"/>
${n?`<rect x="106" y="${y-5}" width="${245*n/60}" height="8" rx="3" fill="${n===max?p.accent:p.bar}"/>`:''}
${text(396,y+4,n,13,p.text,'text-anchor="end" font-weight="600"')}`;
  }).join('\n');
}
for (const [theme,p] of Object.entries(palettes)) {
  const divider = `<path d="M24 136h372 M24 321h372" stroke="${p.line}"/>`;
  const graphHeading = `${text(24,155,'Difficulty breakdown',12,p.muted)}${text(396,155,'0–60 problems',10,p.faint,'text-anchor="end"')}`;
  const sw = card('SWEA','Screenshot snapshot: 139 solved problems; 158 submitted problems; 8 Master Problems. D1 22, D2 31, D3 58, D4 21, D5 5, D6 2, D7 0, D8 0. 2 completed courses, 4 joined clubs.',p,
    `${text(24,99,139,38,p.text,'font-weight="650"')}${text(24,120,'Solved problems',12,p.muted)}
${text(184,97,158,28,p.text,'font-weight="600"')}${text(184,120,'Submitted problems',11,p.muted)}
${text(320,97,8,28,p.text,'font-weight="600"')}${text(320,120,'Master Problems',11,p.muted)}
${divider}${graphHeading}${bars(swea.map((n,i)=>['D'+(i+1),n]),p)}
${text(24,348,'Courses completed',12,p.muted)}${text(186,348,2,13,p.text,'text-anchor="end" font-weight="600"')}
${text(218,348,'Clubs joined',12,p.muted)}${text(396,348,4,13,p.text,'text-anchor="end" font-weight="600"')}`);
  const boj = card('BOJ','Screenshot snapshot: 101 solved problems. Bronze 46, Silver 22, Gold 30, Platinum 3, Diamond 0, Ruby 0. Selected overlapping tags: implementation 44, math 38, graph theory 18, dynamic programming 15. Account tier is not provided.',p,
    `${text(24,99,101,38,p.text,'font-weight="650"')}${text(24,120,'Solved problems',12,p.muted)}
${divider}${graphHeading}${bars(tiers,p)}
${text(24,348,'Implementation',12,p.muted)}${text(186,348,44,13,p.text,'text-anchor="end" font-weight="600"')}
${text(218,348,'Math',12,p.muted)}${text(396,348,38,13,p.text,'text-anchor="end" font-weight="600"')}
${text(24,375,'Graph theory',12,p.muted)}${text(186,375,18,13,p.text,'text-anchor="end" font-weight="600"')}
${text(218,375,'Dynamic programming',12,p.muted)}${text(396,375,15,13,p.text,'text-anchor="end" font-weight="600"')}`,'Selected tags overlap');
  for (const [name,svg] of [['swea',sw],['boj',boj]]) {
    const hash = createHash('sha256').update(svg).digest('hex').slice(0,10);
    const file = `${name}-card-bars-${theme}-${hash}.svg`;
    fs.writeFileSync(path.join(__dirname,'../assets',file),svg);
    readme = readme.replace(new RegExp(`assets/${name}-card-[a-z0-9-]*${theme}(?:-[a-f0-9]+)?\\.svg`,'g'),`assets/${file}`);
  }
}
fs.writeFileSync(readmePath,readme);
console.log(`Rendered both themes: SWEA ${swea.reduce((a,b)=>a+b,0)}, BOJ ${tiers.reduce((a,b)=>a+b[1],0)}`);
