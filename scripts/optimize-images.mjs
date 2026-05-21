import fs from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const assetDir = path.resolve("src/assets");
const targets = [
  { input: "aslenix-logo.png", output: "aslenix-logo.webp", width: 160, quality: 82 },
  { input: "hero-visual.jpg", output: "hero-visual.webp", width: 1200, quality: 78 },
  { input: "project-1.jpg", output: "project-1.webp", width: 960, quality: 76 },
  { input: "project-2.jpg", output: "project-2.webp", width: 960, quality: 76 },
  { input: "project-3.jpg", output: "project-3.webp", width: 960, quality: 76 },
  { input: "project-4.jpg", output: "project-4.webp", width: 960, quality: 76 },
  { input: "project-5.jpg", output: "project-5.webp", width: 960, quality: 76 },
  { input: "project-6.jpg", output: "project-6.webp", width: 960, quality: 76 },
];

await fs.mkdir(assetDir, { recursive: true });

for (const target of targets) {
  const input = path.join(assetDir, target.input);
  const output = path.join(assetDir, target.output);

  await sharp(input)
    .resize({ width: target.width, withoutEnlargement: true })
    .webp({ quality: target.quality, effort: 6 })
    .toFile(output);

  const before = (await fs.stat(input)).size;
  const after = (await fs.stat(output)).size;
  const saved = Math.round((1 - after / before) * 100);
  console.log(`${target.output}: ${before} -> ${after} bytes (${saved}% smaller)`);
}
