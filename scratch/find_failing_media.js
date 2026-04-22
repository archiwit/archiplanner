const fs = require('fs');
const content = fs.readFileSync('frontend/src/index.css', 'utf8');
const lines = content.split('\n');

let currentBlock = [];
let braceCount = 0;
let inMedia = false;
let startLine = -1;

for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    
    if (line.trim().startsWith('@media')) {
        if (inMedia && braceCount !== 0) {
            console.log(`ERROR: Nested media query or unbalanced previous media query at line ${i + 1}`);
        }
        inMedia = true;
        startLine = i + 1;
        braceCount = 0;
    }

    for (const char of line) {
        if (char === '{') braceCount++;
        if (char === '}') braceCount--;
    }

    if (inMedia && braceCount === 0 && line.includes('}')) {
        // Potential end of media query
        // But wait, we need to be sure it's the OUTER }
        // The loop already does this with braceCount
        inMedia = false;
    }
}

console.log('Final brace count:', braceCount);
