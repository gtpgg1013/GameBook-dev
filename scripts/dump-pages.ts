import { storyPages } from "../src/story/pages";
import * as fs from "fs";

const args = process.argv.slice(2);
const start = args[0] ? parseInt(args[0]) : 0;
const end = args[1] ? parseInt(args[1]) : start + 20;

const pages = storyPages.filter(p => p.kind === "story").slice(start, end);
let output = "";

for (const p of pages) {
  output += `=== Page ${p.number}: ${p.title} ===\n`;
  output += p.body + "\n";
  output += "Choices:\n";
  for (const c of p.choices) {
    output += `  - ${c.label} → ${c.targetId} (${c.tone})\n`;
  }
  output += "\n";
}

const outFile = `/tmp/gamebook-pages-${start}-${end}.txt`;
fs.writeFileSync(outFile, output);
console.log(`Dumped pages ${start}-${end} to ${outFile}`);
