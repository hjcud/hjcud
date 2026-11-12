const fs = require('node:fs');
const path = require('node:path');
const assets = path.join(__dirname, '..', 'assets');
const palettes = {
  dark: {bg: '#202a35', text: '#edf4fa', icon: '#b9e1f4'},
  light: {bg: '#eaeef2', text: '#1f2328', icon: '#0969a8'}
};
for (const [theme, p] of Object.entries(palettes)) {
  for (const [name, label, width, source] of [
    ['kotlin', 'Kotlin', 68, 'kotlin'],
    ['typescript', 'TypeScript', 92, 'typescript'],
    ['shaderlab', 'ShaderLab', 91, 'unity'],
    ['hlsl', 'HLSL', 62, null]
  ]) {
    const icon = source
      ? fs.readFileSync(path.join(assets, 'profile-icons', source + '.svg'), 'utf8')
          .replace(/<svg\b[^>]*>/, `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="${p.icon}">`)
          .replace(/fill="#[a-f0-9]{6}"/gi, `fill="${p.icon}"`)
      : `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="m8 6-6 6 6 6m8-12 6 6-6 6M14 3l-4 18" fill="none" stroke="${p.icon}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
    fs.writeFileSync(path.join(assets, `project-tech-${name}-${theme}.svg`),
      `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="24" viewBox="0 0 ${width} 24" role="img" aria-label="${label}"><title>${label}</title><rect width="${width}" height="24" rx="5" fill="${p.bg}"/><image x="7" y="5" width="14" height="14" href="data:image/svg+xml;base64,${Buffer.from(icon).toString('base64')}"/><text x="27" y="16" fill="${p.text}" font-family="Segoe UI,Arial,sans-serif" font-size="11">${label}</text></svg>\n`);
  }
}
