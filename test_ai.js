import axios from 'axios';

const baseUrl = 'https://icp.sif.or.th/api';

async function testAI() {
  console.log('--- Testing AI Chat Service ---');
  try {
    const res = await axios.post(`${baseUrl}/chat`, {
      messages: [{ role: 'user', content: 'สวัสดี' }]
    });
    console.log('Response:', res.data);
  } catch (error) {
    if (error.response) {
      console.error('Status:', error.response.status, 'Data:', error.response.data);
    } else {
      console.error('Error:', error.message);
    }
  }
}

testAI();
