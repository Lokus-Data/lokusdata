const fs = require('fs');
const md = fs.readFileSync('docs/google-ads-api-design-doc.md', 'utf8');
let rtf = '{\\rtf1\\ansi\\ansicpg1252\\deff0 {\\fonttbl{\\f0\\fnil Calibri;}}\\fs22 ';
for (const ln of md.split('\n')) {
  let l = ln.replace(/\\/g, '\\\\').replace(/\{/g, '\\{').replace(/\}/g, '\\}');
  if (l.startsWith('# ')) rtf += '\\fs32\\b ' + l.slice(2) + '\\b0\\fs22\\par ';
  else if (l.startsWith('## ')) rtf += '\\fs28\\b ' + l.slice(3) + '\\b0\\fs22\\par ';
  else if (l.startsWith('### ')) rtf += '\\fs24\\b ' + l.slice(4) + '\\b0\\fs22\\par ';
  else if (l.trim() === '') rtf += '\\par ';
  else rtf += l + '\\par ';
}
rtf += '}';
fs.writeFileSync('docs/google-ads-api-design-doc.rtf', rtf);
console.log('OK', fs.statSync('docs/google-ads-api-design-doc.rtf').size, 'bytes');
