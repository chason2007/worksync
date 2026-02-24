import fs from 'node:fs';
import path from 'node:path';

const filePath = path.join(process.cwd(), 'dist/assets/index-DHWMc41U.js');
const outputPath = path.join(process.cwd(), 'debug_results.txt');

// Check if file exists
if (!fs.existsSync(filePath)) {
    fs.writeFileSync(outputPath, `File not found: ${filePath}`);
    process.exit(1);
}

const content = fs.readFileSync(filePath, 'utf8');
let output = `File size: ${content.length} bytes\n`;

// Regex to find 'me' as a whole word
const regex = /\bme\b/g;
let match;
let count = 0;

output += "Searching for 'me' usage...\n";

// Helper to get line number from character index
const getLineNumber = (index) => {
    let line = 1;
    for (let i = 0; i < index; i++) {
        if (content[i] === '\n') line++;
    }
    return line;
}

while ((match = regex.exec(content)) !== null) {
    count++;
    if (count > 20) {
        output += "... too many matches, stopping ...\n";
        break;
    }
    const start = Math.max(0, match.index - 50);
    const end = Math.min(content.length, match.index + 50);
    const snippet = content.substring(start, end);
    const lineNumber = getLineNumber(match.index);
    output += `\nMatch ${count} at ${match.index} (LineMs ${lineNumber}):\n`;
    output += `...${snippet}...\n`;
}

if (count === 0) {
    output += "No matches found for \\bme\\b\n";
}

fs.writeFileSync(outputPath, output, 'utf8');
console.log("Done writing to " + outputPath);
