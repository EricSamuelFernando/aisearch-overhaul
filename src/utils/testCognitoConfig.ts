/**
 * Test function to validate Cognito configuration
 * Call this from browser console to test your credentials
 */
export function testCognitoConfig() {
  const results = {
    clientId: {
      value: process.env.NEXT_PUBLIC_COGNITO_CLIENT_ID || process.env.NEXT_PUBLIC_GOOGLE_COGNITO_CLIENT_ID,
      isValid: false,
      error: '',
    },
    domain: {
      value: process.env.NEXT_PUBLIC_COGNITO_DOMAIN,
      isValid: false,
      error: '',
    },
    overall: {
      isValid: false,
      message: '',
    },
  };

  // Test Client ID
  const clientId = results.clientId.value;
  if (!clientId) {
    results.clientId.error = '❌ NEXT_PUBLIC_COGNITO_CLIENT_ID is not set';
  } else if (clientId.includes('googleusercontent.com')) {
    results.clientId.error = '❌ Client ID is a Google OAuth Client ID, not Cognito App Client ID';
  } else if (clientId.includes('cognito-idp')) {
    results.clientId.error = '❌ Client ID contains "cognito-idp" - this looks wrong';
  } else if (clientId.length < 10) {
    results.clientId.error = '❌ Client ID seems too short';
  } else {
    results.clientId.isValid = true;
    results.clientId.error = '✅ Client ID format looks correct';
  }

  // Test Domain
  const domain = results.domain.value;
  if (!domain) {
    results.domain.error = '❌ NEXT_PUBLIC_COGNITO_DOMAIN is not set';
  } else {
    const domainLower = domain.toLowerCase();
    
    // Check for wrong formats
    if (domainLower.includes('cognito-idp.') && domainLower.includes('.amazonaws.com')) {
      results.domain.error = '❌ Domain is using API endpoint (cognito-idp.us-east-1.amazonaws.com). Use Hosted UI domain instead.';
    } else if (domainLower.includes('cognito-idp.auth')) {
      results.domain.error = '❌ Domain contains "cognito-idp.auth" - this is incorrect. Should be "your-domain.auth.us-east-1.amazoncognito.com"';
    } else if (!domainLower.includes('.auth.')) {
      results.domain.error = '❌ Domain missing ".auth." - should be in format: your-domain.auth.region.amazoncognito.com';
    } else if (!domainLower.includes('.amazoncognito.com')) {
      results.domain.error = '❌ Domain missing ".amazoncognito.com" - should be in format: your-domain.auth.region.amazoncognito.com';
    } else {
      results.domain.isValid = true;
      results.domain.error = '✅ Domain format looks correct';
    }
  }

  // Overall validation
  results.overall.isValid = results.clientId.isValid && results.domain.isValid;
  results.overall.message = results.overall.isValid 
    ? '✅ All Cognito credentials are valid!'
    : '❌ Some credentials are invalid. Check errors above.';

  // Print results
  console.log('=== Cognito Configuration Test ===');
  console.log('\n📋 Client ID:');
  console.log(`   Value: ${clientId || 'NOT SET'}`);
  console.log(`   Status: ${results.clientId.error}`);
  
  console.log('\n🌐 Domain:');
  console.log(`   Value: ${domain || 'NOT SET'}`);
  console.log(`   Status: ${results.domain.error}`);
  
  console.log('\n' + results.overall.message);
  console.log('\n=== Test Complete ===\n');

  // Test URL construction
  if (results.overall.isValid && clientId && domain) {
    let formattedDomain = domain.trim();
    if (!formattedDomain.startsWith('http://') && !formattedDomain.startsWith('https://')) {
      formattedDomain = `https://${formattedDomain}`;
    }
    formattedDomain = formattedDomain.replace(/\/$/, '');
    
    const redirectUri = `${window.location.origin}/auth/cognito/callback`;
    const testUrl = `${formattedDomain}/oauth2/authorize?` +
      `client_id=${encodeURIComponent(clientId)}&` +
      `response_type=code&` +
      `scope=openid+email+profile&` +
      `redirect_uri=${encodeURIComponent(redirectUri)}&` +
      `identity_provider=Google`;
    
    console.log('🔗 Test URL (first 100 chars):');
    console.log(testUrl.substring(0, 100) + '...');
    console.log('\n💡 To test: Open this URL in a new tab to see if it loads correctly.');
  }

  return results;
}

// Make it available globally for browser console
if (typeof window !== 'undefined') {
  (window as any).testCognitoConfig = testCognitoConfig;
}




