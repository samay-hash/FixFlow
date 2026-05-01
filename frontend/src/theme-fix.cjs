const fs = require('fs');
const path = require('path');

const dirs = [
  path.join(__dirname, 'pages'),
  path.join(__dirname, 'components')
];

const colorMap = {
  '#0A0A0A': 'var(--black)',
  '#EAE4D9': 'var(--cream-2)',
  '#F2EDE4': 'var(--cream)',
  '#C8FF00': 'var(--accent)',
  '#FF8C42': 'var(--accent)',
  '#FF2D78': 'var(--pink)',
  '#0050FF': 'var(--blue)',
  '#FFE500': 'var(--yellow)',
};

function processDirectory(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      processDirectory(fullPath);
    } else if (fullPath.endsWith('.jsx')) {
      // Skip Landing.jsx and Register.jsx since they have custom theme logic
      if (file === 'Landing.jsx' || file === 'Register.jsx') continue;

      let content = fs.readFileSync(fullPath, 'utf8');
      let modified = false;

      // Special case: replace background: 'white' with var(--cream-2) inside cards
      if (content.includes("background: 'white'")) {
        content = content.replace(/background:\s*'white'/g, "background: 'var(--cream-2)'");
        modified = true;
      }
      
      // Special case: color: '#666' or '#888' to 'var(--muted)' -> let's just make it a css variable if we had one.
      // Actually let's just do the primary ones.

      for (const [hex, cssVar] of Object.entries(colorMap)) {
        // Regex to match the hex color string exactly
        const regex = new RegExp(hex, 'gi');
        if (regex.test(content)) {
          content = content.replace(regex, cssVar);
          modified = true;
        }
      }

      if (modified) {
        fs.writeFileSync(fullPath, content, 'utf8');
        console.log(`Updated ${file}`);
      }
    }
  }
}

dirs.forEach(processDirectory);
console.log('Done!');
