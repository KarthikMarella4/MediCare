import fs from 'fs';

const envContent = fs.readFileSync('.env.local', 'utf-8');
const keyMatch = envContent.match(/VITE_GEMINI_API_KEY=(.*)/);
const key = keyMatch ? keyMatch[1].trim() : '';

if (!key) {
  console.log("No VITE_GEMINI_API_KEY found in .env.local");
  process.exit(1);
}

async function checkModels() {
  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${key}`);
    const data = await response.json();
    fs.writeFileSync('models.json', JSON.stringify(data, null, 2));
    console.log("Wrote to models.json");
  } catch (err: any) {
    console.error("Failed to list models:", err.message);
  }
}

checkModels();
