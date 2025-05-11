// Simple script to test the Next.js configuration
const fs = require('fs');
const path = require('path');

// Read the Next.js configuration file
const configPath = path.join(__dirname, 'next.config.ts');
const configContent = fs.readFileSync(configPath, 'utf8');

// Check if unoptimized: true is present in the images configuration
if (configContent.includes('unoptimized: true')) {
  console.log('✅ Configuration is correct: unoptimized: true is present in the images configuration');
} else {
  console.log('❌ Configuration is incorrect: unoptimized: true is NOT present in the images configuration');
}

// Print the relevant part of the configuration
const imagesConfigMatch = configContent.match(/images:\s*{[\s\S]*?},/);
if (imagesConfigMatch) {
  console.log('\nImages configuration:');
  console.log(imagesConfigMatch[0]);
}

console.log('\nThis change should fix the error:');
console.log('Error: Image Optimization using the default loader is not compatible with `{ output: \'export\' }`.');
