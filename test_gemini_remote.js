import axios from 'axios';
import dotenv from 'dotenv';
dotenv.config();

const baseUrl = 'https://icp.sif.or.th/api';
// ใช้ Key จาก .env หรือระบุตรงนี้เพื่อทดสอบชั่วคราว
const TEST_KEY = process.env.GEMINI_API_KEY || ''; 

async function testGemini() {
  console.log('--- Testing Gemini AI on Remote Server ---');
  console.log('Mode: Force Gemini');
  
  if (!TEST_KEY) {
    console.warn('⚠️ Warning: No GEMINI_API_KEY found in .env');
  }

  try {
    const res = await axios.post(`${baseUrl}/chat`, {
      messages: [{ role: 'user', content: 'ช่วยแนะนำอาชีพสำหรับคนชอบเขียนโปรแกรม 1 อาชีพ' }],
      gemini_api_key: TEST_KEY // ส่ง Key ไปทดสอบโดยตรง
    });
    
    console.log('\n✅ AI Response Received:');
    console.log('Provider :', res.data.provider);
    console.log('Reply    :', res.data.reply);
    
    if (res.data.provider === 'gemini') {
      console.log('\n✨ SUCCESS: System is now using Gemini!');
    } else {
      console.log('\nℹ️ INFO: System fell back to Ollama. Please check if your Key is valid.');
    }
  } catch (error) {
    console.error('\n❌ AI Test Failed');
    if (error.response) {
      console.error('Status:', error.response.status, 'Data:', error.response.data);
    } else {
      console.error('Error:', error.message);
    }
  }
}

testGemini();
