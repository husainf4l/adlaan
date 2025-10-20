import { ApolloClient, InMemoryCache, createHttpLink } from '@apollo/client';
import { setContext } from '@apollo/client/link/context';

// Create HTTP link to GraphQL endpoint
const httpLink = createHttpLink({
  uri: '/api/graphql', // Use local proxy to avoid CORS issues
});

// Create auth link to add token to requests
const authLink = setContext((_, { headers }) => {
  // Get token from localStorage
  const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;

  return {
    headers: {
      ...headers,
      authorization: token ? `Bearer ${token}` : '',
      'x-apollo-operation-name': 'ClientRequest',
      'apollo-require-preflight': 'true',
    },
  };
});

// Create Apollo Client factory for SSR
export const makeClient = () => {
  return new ApolloClient({
    link: authLink.concat(httpLink),
    cache: new InMemoryCache(),
  });
};

// Default client for client-side usage
export const client = makeClient();