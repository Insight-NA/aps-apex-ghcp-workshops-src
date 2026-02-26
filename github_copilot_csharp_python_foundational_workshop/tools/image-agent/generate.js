const fs = require('fs');
const path = require('path');
const sharp = require('sharp');
require('dotenv').config();

const REPO_ROOT = path.resolve(__dirname, '../../');
const MANIFEST_PATH = path.join(REPO_ROOT, '.github/copilot-agents/image-agent-manifest.json');

async function main() {
  const args = process.argv.slice(2);
  const theme = args.find(a => a.startsWith('--theme='))?.split('=')[1];
  const variant = args.find(a => a.startsWith('--variant='))?.split('=')[1];
  const prompt = args.find(a => a.startsWith('--prompt='))?.split('=')[1];
  
  if (!theme || !variant || !prompt) {
    console.error('Usage: node generate.js --theme=<theme> --variant=<variant> --prompt="<prompt>"');
    process.exit(1);
  }

  console.log(`Generating background for theme: ${theme}, variant: ${variant}`);
  console.log(`Prompt: ${prompt}`);

  // API Key check removed as we are switching to free provider (Pollinations.ai)
  // if (!process.env.GEMINI_API_KEY) { ... }

  try {
    // 1. Generate Image using Pollinations.ai (Free, Unlimited)
    // This replaces the rate-limited Gemini API call with a free alternative
    console.log('Calling Pollinations.ai for image generation...');
    
    // Use Flux model for high quality, 1920x1080 base resolution
    const encodedPrompt = encodeURIComponent(prompt);
    const url = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=1920&height=1080&model=flux`;
    
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Pollinations API failed: ${response.statusText}`);
    }
    
    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // 2. Load Manifest
    const manifest = JSON.parse(fs.readFileSync(MANIFEST_PATH, 'utf8'));
    const bgSizes = manifest.backgrounds;

    // 3. Save and Resize
    const webDir = path.join(REPO_ROOT, 'frontend/public/backgrounds', theme);
    const mobileDir = path.join(REPO_ROOT, 'mobile/assets/backgrounds', theme);
    
    fs.mkdirSync(webDir, { recursive: true });
    fs.mkdirSync(mobileDir, { recursive: true });

    // Process Web sizes
    console.log('Processing Web sizes...');
    for (const size of bgSizes.web) {
      const filename = `${variant}-${size.width}x${size.height}.jpg`;
      const filepath = path.join(webDir, filename);
      
      await sharp(buffer)
        .resize(size.width, size.height, {
          fit: 'cover',
          position: 'center'
        })
        .toFormat('jpeg', { quality: 90 })
        .toFile(filepath);
      
      console.log(`Saved: ${filepath}`);
    }

    // Process Mobile sizes
    console.log('Processing Mobile sizes...');
    for (const size of bgSizes.mobile) {
      const filename = `${variant}-${size.width}x${size.height}.jpg`;
      const filepath = path.join(mobileDir, filename);
      
      await sharp(buffer)
        .resize(size.width, size.height, {
          fit: 'cover',
          position: 'center'
        })
        .toFormat('jpeg', { quality: 90 })
        .toFile(filepath);
        
      console.log(`Saved: ${filepath}`);
    }

    console.log('Generation complete!');

  } catch (error) {
    console.error('Error generating image:', error);
    process.exit(1);
  }
}

main();