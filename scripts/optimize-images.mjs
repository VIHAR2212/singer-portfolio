import fs from 'fs';
import path from 'path';
import sharp from 'sharp';

const publicDir = path.resolve(process.cwd(), 'public');
const files = fs.readdirSync(publicDir);

console.log(`Scanning ${publicDir}...`);

for (const file of files) {
  const ext = path.extname(file).toLowerCase();
  if (['.png', '.jpg', '.jpeg'].includes(ext)) {
    const filePath = path.join(publicDir, file);
    const baseName = path.basename(file, ext);
    const webpPath = path.join(publicDir, `${baseName}.webp`);

    const stats = fs.statSync(filePath);
    const origSizeKB = Math.round(stats.size / 1024);

    try {
      await sharp(filePath)
        .webp({ quality: 82, effort: 6 })
        .toFile(webpPath);
      
      const newStats = fs.statSync(webpPath);
      const newSizeKB = Math.round(newStats.size / 1024);
      const savings = Math.round((1 - newSizeKB / origSizeKB) * 100);
      console.log(`Converted ${file} (${origSizeKB} KB) -> ${baseName}.webp (${newSizeKB} KB) [${savings}% smaller]`);
    } catch (err) {
      console.error(`Error converting ${file}:`, err.message);
    }
  }
}
