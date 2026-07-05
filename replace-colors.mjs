import fs from 'fs';
import path from 'path';

function walk(dir) {
    let results = [];
    const list = fs.readdirSync(dir);
    list.forEach((file) => {
        file = path.join(dir, file);
        const stat = fs.statSync(file);
        if (stat && stat.isDirectory()) { 
            results = results.concat(walk(file));
        } else { 
            if (file.endsWith('.tsx') || file.endsWith('.ts')) {
                results.push(file);
            }
        }
    });
    return results;
}

const files = walk('./src');

files.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');
    let original = content;

    // Fix hardcoded text colors
    content = content.replace(/text-white/g, 'text-foreground');
    // Fix hardcoded borders
    content = content.replace(/border-white(\/\d+)?/g, 'border-foreground$1');
    content = content.replace(/border-white\/\[([0-9.]+)\]/g, 'border-foreground/[$1]');
    
    // Fix translucent white backgrounds
    content = content.replace(/bg-white(\/\d+)/g, 'bg-foreground$1');
    content = content.replace(/bg-white\/\[([0-9.]+)\]/g, 'bg-foreground/[$1]');
    
    // Fix specific dark background colors
    content = content.replace(/bg-\[\#0d111d\](\/\d+)?/g, 'bg-background$1');
    content = content.replace(/bg-\[\#060916\](\/\d+)?/g, 'bg-background$1');
    
    // Replace solid bg-black with bg-background or bg-foreground appropriately
    content = content.replace(/bg-black(\/\d+)?/g, 'bg-foreground$1');
    
    // Fix text-white/50 etc
    content = content.replace(/text-white(\/\d+)/g, 'text-foreground$1');

    if (content !== original) {
        fs.writeFileSync(file, content, 'utf8');
        console.log(`Updated ${file}`);
    }
});
