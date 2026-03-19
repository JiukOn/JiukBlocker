const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

// Novo SVG: Círculo vermelho-rosa com borda branca, um 'J' e uma faixa de bloqueio.
const svgString = `
<svg width="128" height="128" viewBox="0 0 128 128" xmlns="http://www.w3.org/2000/svg">
  <circle cx="64" cy="64" r="58" fill="#FF5E5B" stroke="#ffffff" stroke-width="12"/>
  
  <g stroke="#ffffff" stroke-width="14" stroke-linecap="round" stroke-linejoin="round" fill="none">
    <path d="M 78 36 V 82 C 78 100 60 100 60 100 C 42 100 42 82 42 82"/>
    
    <line x1="32" y1="32" x2="96" y2="96"/>
  </g>
</svg>
`;

const sizes = [16, 48, 128];
const outputDir = path.join(__dirname, 'assets');

if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

const baseImage = Buffer.from(svgString);

sizes.forEach(size => {
  sharp(baseImage)
    .resize(size, size)
    .png()
    .toFile(path.join(outputDir, `icon-${size}.png`))
    .then(info => console.log(`icon-${size}.png gerado com sucesso.`))
    .catch(err => console.error(err));
});