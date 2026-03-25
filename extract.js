const fs = require('fs');
const js = fs.readFileSync('vercel_app.js', 'utf8');

// Find all timeline blocks or .to blocks
const matches = js.match(/\.to\([^)]+ease:"power2\.inOut"[^)]+\)/g);
if (matches) {
    console.log("Found matches:");
    matches.slice(0, 10).forEach(m => console.log(m));
} else {
    console.log("No matches found for power2.inOut");
}

const triggerMatches = js.match(/scrollTrigger:\{[^}]+\}/g);
if (triggerMatches) {
    console.log("Found triggers:");
    triggerMatches.slice(0, 5).forEach(m => console.log(m));
} else {
    console.log("No triggers found");
}
