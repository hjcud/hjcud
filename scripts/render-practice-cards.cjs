// Render manually maintained records from data/practice-stats.json.
const fs = require('node:fs');
const path = require('node:path');
const { createHash } = require('node:crypto');
const difficulties = ['D1','D2','D3','D4','D5','D6','D7','D8'];
const tierNames = ['Bronze','Silver','Gold','Platinum','Diamond','Ruby'];
const tagNames = ['implementation','math','graphTheory','dynamicProgramming'];
function validate(data) {
  function count(value, field) {
    if (!Number.isSafeInteger(value) || value < 0) throw Error(`${field}: expected a nonnegative integer`);
  }
  for (const platform of ['swea','boj']) {
    const date = data?.[platform]?.updatedAt;
    if (typeof date !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(date) ||
        !Number.isFinite(Date.parse(date)) || new Date(date).toISOString().slice(0,10) !== date) {
      throw Error(`${platform}.updatedAt: expected a valid YYYY-MM-DD date`);
    }
  }
  for (const key of difficulties) count(data.swea.solvedByDifficulty?.[key], `swea.solvedByDifficulty.${key}`);
  for (const key of ['submittedProblems','masterProblems','completedCourses','joinedClubs']) count(data.swea[key],`swea.${key}`);
  for (const key of tierNames) count(data.boj.solvedByTier?.[key],`boj.solvedByTier.${key}`);
  for (const key of tagNames) count(data.boj.selectedTags?.[key],`boj.selectedTags.${key}`);
  for (const entries of [Object.values(data.swea.solvedByDifficulty),Object.values(data.boj.solvedByTier)]) {
    count(entries.reduce((a,b)=>a+b,0),'Solved total');
  }
}
function commonScale(counts) {
  const max = Math.max(0,...counts);
  const step = 10 ** Math.max(1,Math.floor(Math.log10(max || 1))-1);
  return Math.max(10,Math.ceil(max/step)*step);
}
const palettes = {
  dark: {text:'#edf4fa',muted:'#99a7b5',accent:'#b9e1f4',bar:'#6b9bb4',border:'#30363d',line:'#252e38',track:'#202a35',faint:'#8795a3',tier:['#d89659','#a2b8cb','#eac35c','#60d8b2','#70c7ec','#ed9ab1']},
  light: {text:'#1f2328',muted:'#59636e',accent:'#0969a8',bar:'#397da3',border:'#d1d9e0',line:'#d8dee4',track:'#eaeef2',faint:'#687480',tier:['#9a560d','#526e85','#896300','#087a59','#096c99','#aa3658']}
};
const text = (x,y,value,size=13,fill='var(--text)',extra='') => `<text x="${x}" y="${y}" font-size="${size}" fill="${fill}" ${extra}>${value}</text>`;
function card(name, description, p, content, footer, date) {
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
${text(396,412,'Snapshot · '+date,10,p.faint,'text-anchor="end"')}
</svg>\n`;
}
function bars(entries,p,scale) {
  const max = Math.max(...entries.map(([,n])=>n));
  return entries.map(([label,n],i)=>{
    const y = 177+i*18;
    return `${text(24,y+4,label,12,p.muted)}
<rect x="106" y="${y-5}" width="245" height="8" rx="3" fill="${p.track}"/>
${n?`<rect x="106" y="${y-5}" width="${245*n/scale}" height="8" rx="3" fill="${n===max?p.accent:p.bar}"/>`:''}
${text(396,y+4,n,13,p.text,'text-anchor="end" font-weight="600"')}`;
  }).join('\n');
}
function renderCards(root=path.join(__dirname,'..')) {
  root=path.resolve(root);
  const data=JSON.parse(fs.readFileSync(path.join(root,'data/practice-stats.json'),'utf8').replace(/^\uFEFF/,''));
  validate(data);
  const readmePath=path.join(root,'README.md');
  let readme=fs.readFileSync(readmePath,'utf8');
  const swea=difficulties.map(k=>data.swea.solvedByDifficulty[k]);
  const tiers=tierNames.map(k=>[k,data.boj.solvedByTier[k]]);
  const swTotal=swea.reduce((a,b)=>a+b,0), bojTotal=tiers.reduce((a,b)=>a+b[1],0);
  const scale=commonScale([...swea,...tiers.map(([,n])=>n)]);
  const swData=data.swea, tags=data.boj.selectedTags;
  const descriptions={
    swea:`SWEA snapshot ${swData.updatedAt}: ${swTotal} solved problems; ${swData.submittedProblems} submitted problems; ${swData.masterProblems} Master Problems. ${difficulties.map((k,i)=>`${k}: ${swea[i]}`).join(', ')}. ${swData.completedCourses} completed courses, ${swData.joinedClubs} joined clubs.`,
    boj:`BOJ snapshot ${data.boj.updatedAt}: ${bojTotal} solved problems. ${tiers.map(([k,n])=>`${k}: ${n}`).join(', ')}. Selected overlapping tags: implementation ${tags.implementation}, math ${tags.math}, graph theory ${tags.graphTheory}, dynamic programming ${tags.dynamicProgramming}.`
  };
  const previous=[...readme.matchAll(/assets\/((?:swea|boj)-card-bars-(?:dark|light)-[a-f0-9]+\.svg)/g)].map(m=>m[1]);
  const output=new Map();
for (const [theme,p] of Object.entries(palettes)) {
  const divider = `<path d="M24 136h372 M24 321h372" stroke="${p.line}"/>`;
  const graphHeading = `${text(24,155,'Difficulty breakdown',12,p.muted)}${text(396,155,`0–${scale} problems`,10,p.faint,'text-anchor="end"')}`;
  const sw = card('SWEA',descriptions.swea,p,
    `${text(24,99,swTotal,38,p.text,'font-weight="650"')}${text(24,120,'Solved problems',12,p.muted)}
${text(184,97,swData.submittedProblems,28,p.text,'font-weight="600"')}${text(184,120,'Submitted problems',11,p.muted)}
${text(320,97,swData.masterProblems,28,p.text,'font-weight="600"')}${text(320,120,'Master Problems',11,p.muted)}
${divider}${graphHeading}${bars(swea.map((n,i)=>['D'+(i+1),n]),p,scale)}
${text(24,348,'Courses completed',12,p.muted)}${text(186,348,swData.completedCourses,13,p.text,'text-anchor="end" font-weight="600"')}
${text(218,348,'Clubs joined',12,p.muted)}${text(396,348,swData.joinedClubs,13,p.text,'text-anchor="end" font-weight="600"')}`,'',swData.updatedAt);
  const boj = card('BOJ',descriptions.boj,p,
    `${text(24,99,bojTotal,38,p.text,'font-weight="650"')}${text(24,120,'Solved problems',12,p.muted)}
${divider}${graphHeading}${bars(tiers,p,scale)}
${text(24,348,'Implementation',12,p.muted)}${text(186,348,tags.implementation,13,p.text,'text-anchor="end" font-weight="600"')}
${text(218,348,'Math',12,p.muted)}${text(396,348,tags.math,13,p.text,'text-anchor="end" font-weight="600"')}
${text(24,375,'Graph theory',12,p.muted)}${text(186,375,tags.graphTheory,13,p.text,'text-anchor="end" font-weight="600"')}
${text(218,375,'Dynamic programming',12,p.muted)}${text(396,375,tags.dynamicProgramming,13,p.text,'text-anchor="end" font-weight="600"')}`,'Selected tags overlap',data.boj.updatedAt);
  for (const [name,svg] of [['swea',sw],['boj',boj]]) {
    const hash = createHash('sha256').update(svg).digest('hex').slice(0,10);
    const file = `${name}-card-bars-${theme}-${hash}.svg`;
    output.set(file,svg);
    const pattern=new RegExp(`assets/${name}-card-[a-z0-9-]*${theme}(?:-[a-f0-9]+)?\\.svg`,'g');
    if(!pattern.test(readme)) throw Error(`Missing ${name} ${theme} image in README`);
    readme=readme.replace(pattern,`assets/${file}`);
  }
}
  for(const name of ['swea','boj']) {
    const pattern=new RegExp(`(<img src="assets/${name}-card-[^"]+" alt=")[^"]*(")`,'g');
    if(!pattern.test(readme)) throw Error(`Missing ${name} accessible description in README`);
    readme=readme.replace(pattern,(_,before,after)=>before+descriptions[name]+after);
  }
  const assets=path.join(root,'assets');
  for(const [file,svg] of output) fs.writeFileSync(path.join(assets,file),svg);
  fs.writeFileSync(readmePath,readme);
  for(const file of new Set(previous)) {
    const target=path.resolve(assets,file);
    if(path.dirname(target)!==assets) throw Error('Unexpected generated asset path');
    if(!output.has(file) && fs.existsSync(target)) fs.unlinkSync(target);
  }
  return {sweaTotal:swTotal,bojTotal,scale,files:[...output.keys()]};
}
module.exports={renderCards,validate,commonScale};
if(require.main===module) {
  try {console.log(JSON.stringify(renderCards()));}
  catch(error) {console.error(error.message);process.exitCode=1;}
}
