const fs = require('fs');
const path = require('path');

const target = process.argv[2];

if (!target || !['demo', 'prod'].includes(target)) {
  console.error('Usage: node scripts/prepare-env.cjs <demo|prod>');
  process.exit(1);
}

const sourceFile = target === 'demo' ? '.env.demo' : '.env.prod';
const sourcePath = path.join(process.cwd(), sourceFile);
const targetPath = path.join(process.cwd(), '.env.production');

if (!fs.existsSync(sourcePath)) {
  console.error(`Missing env file: ${sourceFile}`);
  process.exit(1);
}

fs.copyFileSync(sourcePath, targetPath);
console.log(`Prepared .env.production from ${sourceFile}`);
