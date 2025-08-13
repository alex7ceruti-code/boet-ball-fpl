const fetch = require('node-fetch');

async function testRegistrationFlow() {
  const baseUrl = 'https://boet-ball-fha7cl99x-alessandros-projects-4965ae41.vercel.app';
  
  // Test data
  const testUser = {
    name: 'Test User',
    email: 'test@example.com',
    password: 'TestPassword123!',
    marketingOptIn: true,
    promoCode: 'LAUNCH50'
  };

  console.log('Testing registration API...');
  console.log('URL:', `${baseUrl}/api/auth/register`);
  console.log('Test data:', JSON.stringify(testUser, null, 2));

  try {
    const response = await fetch(`${baseUrl}/api/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testUser),
    });

    const responseText = await response.text();
    console.log('\n--- Response Status ---');
    console.log('Status:', response.status);
    console.log('Status Text:', response.statusText);
    
    console.log('\n--- Response Headers ---');
    for (const [key, value] of response.headers.entries()) {
      console.log(`${key}: ${value}`);
    }

    console.log('\n--- Response Body ---');
    console.log('Raw response:', responseText);
    
    try {
      const data = JSON.parse(responseText);
      console.log('Parsed JSON:', JSON.stringify(data, null, 2));
      
      if (data.user && data.user.emailVerificationToken) {
        console.log('\n--- Verification Link ---');
        const verificationUrl = `${baseUrl}/auth/verify-email?token=${data.user.emailVerificationToken}`;
        console.log('Verification URL:', verificationUrl);
      }
    } catch (parseError) {
      console.log('Could not parse as JSON:', parseError.message);
    }

  } catch (error) {
    console.error('Request failed:', error.message);
  }
}

testRegistrationFlow();
