// Quick test script for API connection
const BASE_URL = 'http://localhost:4007/api';
const ACCESS_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJjbWVhYnNxYjEwMDAwM3NhOGJxZW54MjB3IiwiaWF0IjoxNzU1MTE5ODEzLCJleHAiOjE3NTUyMDYyMTN9.y4W5B0ljaCn8pBFQV5XyO69j_9tBbYAXMPJp_dECUp8';

async function testAPI() {
  try {
    console.log('🧪 Testing API connection...');
    console.log('🌐 URL:', `${BASE_URL}/documents/folders/root/contents`);
    console.log('🔑 Token (first 20 chars):', ACCESS_TOKEN.substring(0, 20) + '...');

    const response = await fetch(`${BASE_URL}/documents/folders/root/contents`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${ACCESS_TOKEN}`,
        'Content-Type': 'application/json'
      }
    });

    console.log(`📡 Response status: ${response.status} ${response.statusText}`);
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ API call successful!');
      console.log('📄 Response data:', JSON.stringify(data, null, 2));
    } else {
      const errorData = await response.text();
      console.error('❌ API call failed');
      console.error('Error response:', errorData);
    }
  } catch (error) {
    console.error('🔥 Network error:', error);
  }
}

// Run the test
testAPI();
