import axios from 'axios';

const KEY = 'AIzaSyBWCSonwjG9DuSZAAKYXjbiKnCVNuojuUY';

async function listModels() {
  console.log('--- Listing Available Models for API Key ---');
  try {
    // Try v1 first
    const url = `https://generativelanguage.googleapis.com/v1/models?key=${KEY}`;
    const res = await axios.get(url);
    
    console.log('✅ Models found (v1):');
    res.data.models.forEach(m => console.log(` - ${m.name}`));
  } catch (error) {
    console.error('❌ Failed to list models with v1, trying v1beta...');
    try {
        const urlBeta = `https://generativelanguage.googleapis.com/v1beta/models?key=${KEY}`;
        const resBeta = await axios.get(urlBeta);
        console.log('✅ Models found (v1beta):');
        resBeta.data.models.forEach(m => console.log(` - ${m.name}`));
    } catch (e) {
        console.error('❌ Failed to list models with v1beta too.');
        if (e.response) {
            console.error('Status:', e.response.status);
            console.error('Data:', JSON.stringify(e.response.data));
        }
    }
  }
}

listModels();
