// Script de build para o Netlify e para o Render (Static Site).
// Gera frontend-vanilla/js/config.js a partir da variável de ambiente API_URL.
// Uso: API_URL=https://meu-backend.com node build-config.js
const fs = require('fs');
const path = require('path');

const apiUrl = process.env.API_URL || 'http://localhost:5000';
const target = path.join(__dirname, 'frontend-vanilla', 'js', 'config.js');

const content = [
  '// Gerado automaticamente pelo build-config.js (Netlify).',
  '// Em desenvolvimento local, restaure com o valor padrão ou rode sem API_URL.',
  'window.APP_CONFIG = {',
  `  API_BASE_URL: ${JSON.stringify(apiUrl)}`,
  '};',
  ''
].join('\n');

fs.writeFileSync(target, content, 'utf8');
console.log(`config.js gerado com API_BASE_URL = ${apiUrl}`);
