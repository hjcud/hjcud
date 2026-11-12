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
  const lock = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M7 10V7a5 5 0 0 1 10 0v3" fill="none" stroke="${p.icon}" stroke-width="2"/><rect x="4" y="10" width="16" height="12" rx="2" fill="${p.icon}"/><path d="M12 14v4" stroke="${p.bg}" stroke-width="2" stroke-linecap="round"/></svg>`;
  fs.writeFileSync(path.join(assets, `project-tech-private-${theme}.svg`),
    `<svg xmlns="http://www.w3.org/2000/svg" width="60" height="18" viewBox="0 0 60 18" role="img" aria-label="Private repository"><title>Private repository</title><rect width="60" height="18" rx="4" fill="${p.bg}"/><image x="5" y="3.5" width="11" height="11" href="data:image/svg+xml;base64,${Buffer.from(lock).toString('base64')}"/><text x="20" y="12.5" fill="${p.text}" font-family="Segoe UI,Arial,sans-serif" font-size="10">Private</text></svg>\n`);
}
