const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

function getSpecFiles(dir, files = []) {
  fs.readdirSync(dir).forEach(file => {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      getSpecFiles(fullPath, files);
    } else if (file.endsWith('.spec.ts')) {
      files.push(fullPath);
    }
  });
  return files;
}

const specs = getSpecFiles(path.join(__dirname, 'src'));

for (const fp of specs) {
  let content = fs.readFileSync(fp, 'utf8');

  // Check if there are multiple "imports:"
  const importsMatches = content.match(/imports\s*:/g);
  if (importsMatches && importsMatches.length > 1) {
    // If our script added `\n      imports: [HttpClientTestingModule, RouterTestingModule],`, remove it.
    // Ensure we don't remove everything if the second one is something else.
    // Our added string was exactly: `\n      imports: [HttpClientTestingModule, RouterTestingModule],`
    content = content.replace(/\n\s*imports:\s*\[HttpClientTestingModule,\s*RouterTestingModule\],?/, '');
    fs.writeFileSync(fp, content, 'utf8');
    console.log(`Fixed duplicate in ${fp}`);
  }
}
