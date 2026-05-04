const fs = require('fs');
const path = require('path');
function processDir(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      processDir(fullPath);
    } else if (fullPath.endsWith('.js')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      const original = content;
      // replace from '../../lib/something' to from '../../lib/something.js' etc
      content = content.replace(/from '\.\.\/\.\.\/lib\/([^']+)'/g, (match, p1) => {
        if (!p1.endsWith('.js')) return `from '../../lib/${p1}.js'`;
        return match;
      });
      // also replace from '../lib/something'
      content = content.replace(/from '\.\.\/lib\/([^']+)'/g, (match, p1) => {
        if (!p1.endsWith('.js')) return `from '../lib/${p1}.js'`;
        return match;
      });
      if (content !== original) {
        fs.writeFileSync(fullPath, content);
        console.log('Updated ' + fullPath);
      }
    }
  }
}
processDir('api');
