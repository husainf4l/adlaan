import { gql } from '@apollo/client';

export const REGISTER_MUTATION = gql`
  mutation Register($input: RegisterInput!) {
    register(input: $input) {
      user {
        id
        name
        email
        role
        company {
          id
          name
        }
      }
      access_token
    }
  }
`;

export const LOGIN_MUTATION = gql`
  mutation Login($input: LoginInput!) {
    login(input: $input) {
      user {
        id
        name
        email
        role
        company {
          id
          name
        }
      }
      access_token
    }
  }
`;

export const CREATE_COMPANY_MUTATION = gql`
  mutation CreateCompany($input: CreateCompanyInput!) {
    createCompany(input: $input) {
      id
      name
      description
      address
      phone
      email
      website
    }
  }
`;

export const ME_QUERY = gql`
  query Me {
    me {
      id
      name
      email
      role
      company {
        id
        name
        description
      }
    }
  }
`;

export const COMPANIES_QUERY = gql`
  query Companies {
    companies {
      id
      name
      description
      address
      phone
      email
      website
    }
  }
`;

export const CASES_QUERY = gql`
  query Cases {
    cases {
      id
      title
      description
      status
      priority
      createdAt
      updatedAt
      client {
        id
        name
        email
      }
      assignedTo {
        id
        name
        email
      }
    }
  }
`;

export const CREATE_CASE_MUTATION = gql`
  mutation CreateCase($input: CreateCaseInput!) {
    createCase(input: $input) {
      id
      title
      description
      status
      priority
      createdAt
      client {
        id
        name
        email
      }
      assignedTo {
        id
        name
        email
      }
    }
  }
`;

export const UPDATE_CASE_MUTATION = gql`
  mutation UpdateCase($id: ID!, $input: UpdateCaseInput!) {
    updateCase(id: $id, input: $input) {
      id
      title
      description
      status
      priority
      updatedAt
    }
  }
`;