const { ApolloClient, InMemoryCache, createHttpLink } = require('@apollo/client');
const { setContext } = require('@apollo/client/link/context');
const gql = require('graphql-tag');

// Create HTTP link to GraphQL endpoint
const httpLink = createHttpLink({
  uri: 'http://localhost:3001/api/graphql', // Full URL for testing
  fetch: require('node-fetch'), // Add node-fetch for Node.js
});

// Create auth link to add token to requests
const authLink = setContext((_, { headers }) => {
  return {
    headers: {
      ...headers,
    },
  };
});

// Create Apollo Client
const client = new ApolloClient({
  link: authLink.concat(httpLink),
  cache: new InMemoryCache(),
});

const SIGNUP_MUTATION = gql`
  mutation Signup($name: String!, $email: String!, $password: String!) {
    signup(name: $name, email: $email, password: $password) {
      user {
        id
        name
        email
        createdAt
      }
      token
    }
  }
`;

async function testGraphQL() {
  try {
    console.log('Testing GraphQL signup...');
    const { data } = await client.mutate({
      mutation: SIGNUP_MUTATION,
      variables: {
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123'
      }
    });
    console.log('Signup successful:', JSON.stringify(data, null, 2));
  } catch (error) {
    console.error('Signup failed:', error.message);
  }
}

testGraphQL();