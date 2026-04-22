const fs = require('fs');
const content = fs.readFileSync('frontend/src/index.css', 'utf8');
const lines = content.split('\n');

let openBraces = 0;
let inMediaQuery = false;
let mediaQueryStartLine = -1;

for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (line.startsWith('@media')) {
        inMediaQuery = true;
        mediaQueryStartLine = i + 1;
    }
    
    // Count braces in this line
    for (const char of line) {
        if (char === '{') openBraces++;
        if (char === '}') openBraces--;
    }
    
    if (inMediaQuery && openBraces === 0) {
        // Media query closed
        inMediaQuery = false;
    }
}

if (inMediaQuery) {
    console.log(`Unclosed media query starting at line ${mediaQueryStartLine}`);
} else {
    console.log('All media queries seem closed based on brace counting.');
}
