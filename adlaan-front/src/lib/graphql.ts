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
      createdAt
      updatedAt
      client {
        id
        name
        email
      }
      assignedUsers {
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
      createdAt
      client {
        id
        name
        email
      }
      assignedUsers {
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
      updatedAt
    }
  }
`;

export const GET_USERS_QUERY = gql`
  query GetUsers {
    users {
      id
      name
      email
      role
      company {
        id
        name
      }
      createdAt
    }
  }
`;

export const CREATE_USER_MUTATION = gql`
  mutation CreateUser($input: CreateUserInput!) {
    createUser(input: $input) {
      id
      name
      email
      role
      company {
        id
        name
      }
      createdAt
    }
  }
`;

export const UPDATE_USER_MUTATION = gql`
  mutation UpdateUser($id: Int!, $input: UpdateUserInput!) {
    updateUser(id: $id, input: $input) {
      id
      name
      email
      role
      company {
        id
        name
      }
    }
  }
`;

export const DELETE_USER_MUTATION = gql`
  mutation DeleteUser($id: Int!) {
    deleteUser(id: $id)
  }
`;

// Document Management Queries
export const GET_DOCUMENTS_QUERY = gql`
  query GetDocuments {
    documents {
      id
      case
      createdAt
      updatedAt
    }
  }
`;

export const UPLOAD_DOCUMENT_MUTATION = gql`
  mutation UploadDocument($input: UploadDocumentInput!) {
    uploadDocument(input: $input) {
      id
      case
      createdAt
      updatedAt
    }
  }
`;

export const CREATE_FOLDER_MUTATION = gql`
  mutation CreateFolder($name: String!, $parentId: String) {
    createFolder(name: $name, parentId: $parentId) {
      id
      name
      type
      parentId
      createdAt
      updatedAt
    }
  }
`;

export const DELETE_DOCUMENT_MUTATION = gql`
  mutation DeleteDocument($id: String!) {
    deleteDocument(id: $id)
  }
`;

export const UPDATE_DOCUMENT_MUTATION = gql`
  mutation UpdateDocument($id: String!, $name: String, $starred: Boolean) {
    updateDocument(id: $id, name: $name, starred: $starred) {
      id
      name
      starred
      updatedAt
    }
  }
`;