#!/usr/bin/env node

// AI Agents GraphQL Integration Test
console.log('🚀 Testing AI Agents GraphQL Integration\n');

const GRAPHQL_URL = 'http://localhost:3000/api/graphql'; // This will proxy to adlaan.com

// Simple fetch implementation for testing
async function testQuery(query, description) {
  console.log(`Testing: ${description}`);
  try {
    const response = await fetch(GRAPHQL_URL, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'x-apollo-operation-name': 'TestQuery',
        'apollo-require-preflight': 'true'
      },
      body: JSON.stringify({ query })
    });
    
    const data = await response.json();
    
    if (data.errors) {
      console.log('❌ GraphQL Errors:', JSON.stringify(data.errors, null, 2));
    } else {
      console.log('✅ Success:', JSON.stringify(data, null, 2));
    }
  } catch (error) {
    console.log('❌ Network Error:', error.message);
  }
  console.log('');
}

async function runTests() {
  // Test 1: Basic connection
  await testQuery('{ __typename }', 'Basic connection');
  
  // Test 2: Document templates
  await testQuery(`{ 
    documentTemplates { 
      id 
      name 
      description 
      category 
    } 
  }`, 'Document templates query');
  
  // Test 3: Tasks
  await testQuery(`{ 
    tasks { 
      id 
      agentType 
      status 
      progress 
      createdAt 
    } 
  }`, 'Tasks query');
  
  // Test 4: Generated documents
  await testQuery(`{ 
    generatedDocuments { 
      id 
      name 
      templateName 
      createdAt 
    } 
  }`, 'Generated documents query');
  
  console.log('🎉 All tests completed!');
}

// Check if fetch is available (Node 18+) or use a polyfill
if (typeof fetch === 'undefined') {
  console.log('Using node-fetch polyfill...');
  global.fetch = require('node-fetch');
}

runTests().catch(console.error);