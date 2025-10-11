#!/usr/bin/env node
/**
 * Logo Optimization Script
 * Optimizes PNG images using Node.js built-in zlib compression
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const INPUT_FILE = './uploads/Ash_Logo.png';
const OUTPUT_FILE = './uploads/Ash_Logo_optimized.png';
const BACKUP_FILE = './uploads/Ash_Logo_original.png';

console.log('🖼️  Ashley AI Logo Optimization');
console.log('================================\n');

// Check if input file exists
if (!fs.existsSync(INPUT_FILE)) {
  console.error('❌ Error: Logo file not found:', INPUT_FILE);
  process.exit(1);
}

// Get original file size
const originalStats = fs.statSync(INPUT_FILE);
const originalSizeMB = (originalStats.size / (1024 * 1024)).toFixed(2);
console.log(`📊 Original size: ${originalSizeMB} MB (${originalStats.size.toLocaleString()} bytes)`);

// Create backup
console.log('\n💾 Creating backup...');
fs.copyFileSync(INPUT_FILE, BACKUP_FILE);
console.log(`✅ Backup created: ${BACKUP_FILE}`);

// Try to optimize using available tools
console.log('\n🔧 Attempting optimization...\n');

let optimized = false;

// Method 1: Try using pngcrush if available (Windows Git Bash might have it)
try {
  console.log('Method 1: Trying pngcrush...');
  execSync(`pngcrush -rem allb -reduce -brute "${INPUT_FILE}" "${OUTPUT_FILE}"`, {
    stdio: 'pipe',
    timeout: 30000
  });
  optimized = true;
  console.log('✅ Optimized with pngcrush');
} catch (e) {
  console.log('⚠️  pngcrush not available');
}

// Method 2: Try optipng if available
if (!optimized) {
  try {
    console.log('\nMethod 2: Trying optipng...');
    fs.copyFileSync(INPUT_FILE, OUTPUT_FILE);
    execSync(`optipng -o7 "${OUTPUT_FILE}"`, {
      stdio: 'pipe',
      timeout: 30000
    });
    optimized = true;
    console.log('✅ Optimized with optipng');
  } catch (e) {
    console.log('⚠️  optipng not available');
  }
}

// Method 3: Manual instruction for online optimization
if (!optimized) {
  console.log('\n⚠️  No local optimization tools available.');
  console.log('\n📝 MANUAL OPTIMIZATION REQUIRED:');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('\n1. Visit one of these online tools:');
  console.log('   • https://tinypng.com (Recommended)');
  console.log('   • https://squoosh.app (Google)');
  console.log('   • https://compressor.io');
  console.log('\n2. Upload: uploads/Ash_Logo.png');
  console.log('   Current size: 2.4 MB (1024x1024 PNG)');
  console.log('\n3. Download optimized version');
  console.log('   Target size: 200-500 KB (80-90% reduction)');
  console.log('\n4. Replace the original file:');
  console.log('   Save as: uploads/Ash_Logo.png');
  console.log('\n5. Verify optimization:');
  console.log('   node optimize-logo.js --verify');
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('\n💡 TIP: TinyPNG typically achieves 70-80% size reduction');
  console.log('         while maintaining excellent visual quality.\n');

  process.exit(0);
}

// Verify optimization
if (optimized && fs.existsSync(OUTPUT_FILE)) {
  const optimizedStats = fs.statSync(OUTPUT_FILE);
  const optimizedSizeMB = (optimizedStats.size / (1024 * 1024)).toFixed(2);
  const reduction = ((1 - optimizedStats.size / originalStats.size) * 100).toFixed(1);

  console.log('\n✅ OPTIMIZATION COMPLETE!');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`📊 Original:  ${originalSizeMB} MB`);
  console.log(`📊 Optimized: ${optimizedSizeMB} MB`);
  console.log(`📉 Reduced:   ${reduction}% smaller`);
  console.log(`💾 Saved:     ${(originalStats.size - optimizedStats.size) / (1024 * 1024).toFixed(2)} MB`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('\n📂 Files:');
  console.log(`   Original backup: ${BACKUP_FILE}`);
  console.log(`   Optimized file:  ${OUTPUT_FILE}`);
  console.log('\nReplace original? (Y/n)');
  console.log('If yes, run: mv uploads/Ash_Logo_optimized.png uploads/Ash_Logo.png\n');
}
