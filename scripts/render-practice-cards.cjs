// Static records transcribed from the owner's screenshots, 2026-09-07.
const fs = require('node:fs');
const path = require('node:path');
const swea = [22, 31, 58, 21, 5, 2, 0, 0];
const tiers = [['Bronze',46],['Silver',22],['Gold',30],['Platinum',3],['Diamond',0],['Ruby',0]];
const palettes = {
  dark: {text:'#edf4fa',muted:'#99a7b5',accent:'#b9e1f4',bar:'#6b9bb4',border:'#30363d',line:'#252e38',track:'#202a35',faint:'#8795a3',tier:['#d89659','#a2b8cb','#eac35c','#60d8b2','#70c7ec','#ed9ab1']},
  light: {text:'#1f2328',muted:'#59636e',accent:'#0969a8',bar:'#397da3',border:'#d1d9e0',line:'#d8dee4',track:'#eaeef2',faint:'#687480',tier:['#9a560d','#526e85','#896300','#087a59','#096c99','#aa3658']}
};
const text = (x,y,value,size=13,fill='var(--text)',extra='') => `<text x="${x}" y="${y}" font-size="${size}" fill="${fill}" ${extra}>${value}</text>`;
function card(name, description, p, content, footer='') {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="420" height="400" viewBox="0 0 420 400" role="img" aria-labelledby="title desc">
<title id="title">${name} problem solving</title><desc id="desc">${description}</desc>
<style>svg{--text:${p.text};--muted:${p.muted};--accent:${p.accent}}text{font-family:Segoe UI,Arial,sans-serif}</style>
<rect x=".5" y=".5" width="419" height="399" rx="12" fill="none" stroke="${p.border}"/>
<path d="M24 24v19" stroke="${p.accent}" stroke-width="3" stroke-linecap="round"/>
${text(36,39,name,18,p.accent,'font-weight="700"')}
${text(396,38,'Problem solving',12,p.muted,'text-anchor="end"')}
${content}
<path d="M24 360h372" stroke="${p.line}"/>
${text(24,382,footer,10,p.faint)}
${text(396,382,'Snapshot · 2026-09-07',10,p.faint,'text-anchor="end"')}
</svg>\n`;
}
for (const [theme,p] of Object.entries(palettes)) {
  const divider = `<path d="M24 136h372 M24 291h372" stroke="${p.line}"/>`;
  const swBars = swea.map((n,i) => {
    const x = 26 + i*47, h = n/58*70;
    return `${text(x+17,248-h-9,n,13,n?p.text:p.faint,'text-anchor="middle" font-weight="600"')}
<rect x="${x}" y="${248-h}" width="34" height="${Math.max(h,2)}" rx="2" fill="${n ? (i===2?p.accent:p.bar) : p.track}"/>
${text(x+17,273,'D'+(i+1),12,p.muted,'text-anchor="middle"')}`;
  }).join('\n');
  const sw = card('SWEA','Screenshot snapshot: 139 solved problems; 158 submitted problems; 8 Master Problems. D1 22, D2 31, D3 58, D4 21, D5 5, D6 2, D7 0, D8 0. 2 completed courses, 4 joined clubs.',p,
    `${text(24,99,139,38,p.text,'font-weight="650"')}${text(24,120,'Solved problems',12,p.muted)}
${text(184,97,158,28,p.text,'font-weight="600"')}${text(184,120,'Submitted problems',11,p.muted)}
${text(320,97,8,28,p.text,'font-weight="600"')}${text(320,120,'Master Problems',11,p.muted)}
${divider}${text(24,157,'Solved by difficulty',12,p.muted)}${swBars}
${text(24,318,'Courses completed',12,p.muted)}${text(178,318,2,16,p.text,'font-weight="600"')}
${text(224,318,'Clubs joined',12,p.muted)}${text(380,318,4,16,p.text,'text-anchor="end" font-weight="600"')}`);
  const rows = tiers.map(([name,n],i) => {
    const y=164+i*22;
    return `${text(24,y+4,name,12,p.muted)}<rect x="106" y="${y-6}" width="245" height="9" rx="3" fill="${p.track}"/>
${n?`<rect x="106" y="${y-6}" width="${245*n/46}" height="9" rx="3" fill="${p.tier[i]}"/>`:''}
${text(396,y+4,n,13,p.text,'text-anchor="end" font-weight="600"')}`;
  }).join('\n');
  const boj = card('BOJ','Screenshot snapshot: 101 solved problems. Bronze 46, Silver 22, Gold 30, Platinum 3, Diamond 0, Ruby 0. Selected overlapping tags: implementation 44, math 38, graph theory 18, dynamic programming 15. Account tier is not provided.',p,
    `${text(24,99,101,38,p.text,'font-weight="650"')}${text(24,120,'Solved problems',12,p.muted)}
${text(396,97,'Bronze–Ruby',13,p.muted,'text-anchor="end"')}${text(396,120,'Difficulty distribution',11,p.muted,'text-anchor="end"')}
${divider}${rows}
${text(24,313,'Implementation',12,p.muted)}${text(186,313,44,13,p.text,'text-anchor="end" font-weight="600"')}
${text(218,313,'Math',12,p.muted)}${text(396,313,38,13,p.text,'text-anchor="end" font-weight="600"')}
${text(24,340,'Graph theory',12,p.muted)}${text(186,340,18,13,p.text,'text-anchor="end" font-weight="600"')}
${text(218,340,'Dynamic programming',12,p.muted)}${text(396,340,15,13,p.text,'text-anchor="end" font-weight="600"')}`,'Selected tags overlap');
  const suffix=theme==='dark'?'':'-light';
  for (const [name,svg] of [['swea',sw],['boj',boj]]) fs.writeFileSync(path.join(__dirname,`../assets/${name}-card${suffix}.svg`),svg);
}
console.log(`Rendered both themes: SWEA ${swea.reduce((a,b)=>a+b,0)}, BOJ ${tiers.reduce((a,b)=>a+b[1],0)}`);
