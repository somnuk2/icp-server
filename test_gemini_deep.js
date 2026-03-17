import axios from 'axios';

const KEY = 'AIzaSyBWCSonwjG9DuSZAAKYXjbiKnCVNuojuUY';
const MODEL = 'gemini-2.5-flash-lite';

async function testKeyDeep() {
  console.log(`--- Deep Testing Gemini API Key with Model: ${MODEL} ---`);
  try {
    const url = `https://generativelanguage.googleapis.com/v1/models/${MODEL}:generateContent?key=${KEY}`;
    const res = await axios.post(url, {
      contents: [{ parts: [{ text: 'ช่วยตอบเป็นภาษาไทยสั้นๆ ว่าคุณคือใคร' }] }]
    });
    
    console.log('✅ Success! Model is working.');
    console.log('Response:', res.data.candidates[0].content.parts[0].text);
  } catch (error) {
    console.error('❌ Failed to generate content.');
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', JSON.stringify(error.response.data));
    } else {
      console.error('Error:', error.message);
    }
  }
}

testKeyDeep();
