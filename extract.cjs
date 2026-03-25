const fs = require('fs');
const js = fs.readFileSync('vercel_app.js', 'utf8');

// The Vercel app uses GSAP. Let's find exactly the parameters it passes to tl.to.
// Looking for .to(
const matches = js.match(/\.to\([^)]+ease:"power[^\)]+\)/g);
if (matches) {
    console.log("Found matches:");
    matches.slice(0, 20).forEach(m => console.log(m));
} else {
    // maybe minified as ease:"none" or similar?
    const altMatches = js.match(/\.to\([^)]+x:[^)]+\)/g);
    if (altMatches) {
        console.log("Found alt matches:");
        altMatches.slice(0, 20).forEach(m => console.log(m));
    } else {
        console.log("No matches found for .to");
    }
}

const triggerMatches = js.match(/scrollTrigger:\{[^}]+\}/g);
if (triggerMatches) {
    console.log("Found triggers:");
    triggerMatches.slice(0, 5).forEach(m => console.log(m));
} else {
    console.log("No triggers found");
}
