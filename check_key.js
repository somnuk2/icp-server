import axios from 'axios';

const KEY = 'AIzaSyBWCSonwjG9DuSZAAKYXjbiKnCVNuojuUY';

async function testKey() {
  console.log('--- Checking Gemini API Key Validity ---');
  try {
    const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${KEY}`;
    const res = await axios.get(url);
    console.log('✅ Key is VALID. It can access the following models:');
    console.log(res.data.models.map(m => m.name).slice(0, 5));
    console.log('✅ Key is VALID and ACTIVE.');
    console.log('Response Preview:', JSON.stringify(res.data).substring(0, 100));
  } catch (error) {
    console.error('❌ Key is NOT VALID or has been SUSPENDED.');
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', JSON.stringify(error.response.data));
    } else {
      console.error('Error:', error.message);
    }
  }
}

testKey();
