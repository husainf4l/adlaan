const testGraphQL = async () => {
  try {
    console.log('Testing GraphQL endpoint...');

    // Test 1: Simple query
    console.log('\n1. Testing simple query...');
    const response1 = await fetch('http://localhost:3000/api/graphql', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query: `
          query {
            __typename
          }
        `
      })
    });

    const data1 = await response1.json();
    console.log('Response status:', response1.status);
    console.log('Response data:', JSON.stringify(data1, null, 2));

    // Test 2: Register mutation
    console.log('\n2. Testing register mutation...');
    const response2 = await fetch('http://localhost:3000/api/graphql', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query: `
          mutation Register($input: RegisterInput!) {
            register(input: $input) {
              user {
                id
                name
                email
                role
              }
              access_token
            }
          }
        `,
        variables: {
          input: {
            name: "Test User",
            email: "test@example.com",
            password: "password123",
            role: "ADMIN"
          }
        }
      })
    });

    const data2 = await response2.json();
    console.log('Response status:', response2.status);
    console.log('Response data:', JSON.stringify(data2, null, 2));

  } catch (error) {
    console.error('Error:', error);
  }
};

testGraphQL();