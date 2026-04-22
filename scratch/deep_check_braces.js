const fs = require('fs');
const path = require('path');

function checkFile(filePath) {
    const content = fs.readFileSync(filePath, 'utf8');
    let braceCount = 0;
    let lines = content.split('\n');
    for (let i = 0; i < lines.length; i++) {
        for (const char of lines[i]) {
            if (char === '{') braceCount++;
            if (char === '}') braceCount--;
        }
        if (braceCount < 0) {
            console.log(`ERROR: Negative brace count at ${filePath}:${i + 1}`);
            braceCount = 0; // Reset to continue searching
        }
    }
    if (braceCount > 0) {
        console.log(`ERROR: Unbalanced open braces (${braceCount}) at end of ${filePath}`);
    }
}

function walkDir(dir) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            if (file !== 'node_modules') walkDir(fullPath);
        } else if (file.endsWith('.css') || file.endsWith('.jsx')) {
            checkFile(fullPath);
        }
    }
}

walkDir('frontend/src');
