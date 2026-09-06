const fs=require('node:fs');
const path=require('node:path');
const {createHash}=require('node:crypto');
const root=path.join(__dirname,'..'), assets=path.join(root,'assets');
const readmePath=path.join(root,'README.md');
let readme=fs.readFileSync(readmePath,'utf8');
const previous=[...readme.matchAll(/assets\/(profile-(?:about|workspace)-(?:dark|light)(?:-[a-f0-9]+)?\.svg)/g)].map(m=>m[1]);
const png=fs.readFileSync(path.join(assets,'mypc.png')).toString('base64');
const palettes={
  dark:{text:'#edf4fa',muted:'#99a7b5',accent:'#b9e1f4',border:'#30363d',line:'#252e38',chip:'#202a35'},
  light:{text:'#1f2328',muted:'#59636e',accent:'#0969a8',border:'#d1d9e0',line:'#d8dee4',chip:'#eaeef2'}
};
function text(x,y,value,size,color,extra='') {
  return `<text x="${x}" y="${y}" font-size="${size}" fill="${color}" ${extra}>${value}</text>`;
}
function icon(name,x,y,color) {
  const svg=fs.readFileSync(path.join(assets,'profile-icons',name+'.svg'),'utf8').replace(/#B9E1F4/gi,color).replace(/fill="white"/g,`fill="${color}"`);
  return `<image x="${x}" y="${y}" width="16" height="16" href="data:image/svg+xml;base64,${Buffer.from(svg).toString('base64')}"/>`;
}
function chip(label,x,y,width,p,logo) {
  return `<rect x="${x}" y="${y}" width="${width}" height="26" rx="5" fill="${p.chip}"/>
${logo?icon(logo,x+8,y+5,p.accent):''}
${text(x+(logo?30:10),y+18,label,12,p.text)}`;
}
function frame(width,title,p,content,description) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="400" viewBox="0 0 ${width} 400" role="img" aria-labelledby="title desc">
<title id="title">${title}</title><desc id="desc">${description}</desc>
<style>text{font-family:Segoe UI,Arial,Malgun Gothic,Meiryo,sans-serif}</style>
<rect x=".5" y=".5" width="${width-1}" height="399" rx="12" fill="none" stroke="${p.border}"/>
<path d="M20 24v19" stroke="${p.accent}" stroke-width="3" stroke-linecap="round"/>
${text(32,39,title,18,p.accent,'font-weight="700"')}
<path d="M20 58h${width-40}" stroke="${p.line}"/>
${content}
</svg>\n`;
}
const output=new Map();
for(const [theme,p] of Object.entries(palettes)) {
  const about=frame(210,'ABOUT',p,
    `${text(20,86,'I code in',13,p.muted,'font-weight="600"')}
${chip('C#',20,98,55,p,'csharp')}${chip('Java',81,98,65,p,'java')}
${text(20,157,'I speak',13,p.muted,'font-weight="600"')}
${chip('한국어',20,169,62,p)}${chip('日本語',88,169,62,p)}${chip('English',20,201,66,p)}
${text(20,261,'I create with',13,p.muted,'font-weight="600"')}
${chip('Unity',20,273,64,p,'unity')}${chip('Blender',90,273,82,p,'blender')}
${text(20,335,'I play on',13,p.muted,'font-weight="600"')}
${chip('Steam',20,347,83,p,'steam')}${text(116,365,'↗',15,p.accent)}`,
    'I code in C# and Java. I speak Korean, Japanese and English. I create with Unity and Blender. I play on Steam.');
  // Embed the owner's PNG without changing its pixels; SVGs cannot load sibling images on GitHub.
  const workspace=frame(630,'WORKSPACE',p,
    `<image x="16" y="66" width="598" height="296" preserveAspectRatio="xMidYMid meet" href="data:image/png;base64,${png}"/>
${text(315,382,'My workspace, modeled in Blender',12,p.muted,'text-anchor="middle"')}`,
    'My workspace, modeled in Blender.');
  for(const [name,svg] of [['about',about],['workspace',workspace]]) {
    const hash=createHash('sha256').update(svg).digest('hex').slice(0,10);
    const file=`profile-${name}-${theme}-${hash}.svg`;
    const pattern=new RegExp(`assets/profile-${name}-${theme}(?:-[a-f0-9]+)?\\.svg`,'g');
    if(!pattern.test(readme)) throw Error(`Missing ${name} ${theme} reference`);
    readme=readme.replace(pattern,`assets/${file}`);
    output.set(file,svg);
  }
}
for(const [name,svg] of output) fs.writeFileSync(path.join(assets,name),svg);
fs.writeFileSync(readmePath,readme);
for(const name of new Set(previous)) {
  const target=path.resolve(assets,name);
  if(path.dirname(target)!==path.resolve(assets)) throw Error('Invalid generated asset path');
  if(!output.has(name) && fs.existsSync(target)) fs.unlinkSync(target);
}
console.log(JSON.stringify({files:[...output.keys()]}));
