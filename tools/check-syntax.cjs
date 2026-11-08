const fs = require('fs');
const path = require('path');
const jsFiles = fs.readdirSync('js').filter(f => f.endsWith('.js'));
let hasErr = false;

jsFiles.forEach(f => {
  try {
    const code = fs.readFileSync(path.join('js', f), 'utf8');
    // Basic test
    new Function(code.replace(/import\s+[\s\S]*?from\s+['"][^'"]+['"];?/g, '').replace(/export\s+(?:default\s+)?/g, ''));
    console.log('✓ ' + f + ' passed');
  } catch (err) {
    console.error('✗ ' + f + ' syntax error:', err.message);
    hasErr = true;
  }
});

if (hasErr) process.exit(1);
console.log('All JS files syntax verified!');

