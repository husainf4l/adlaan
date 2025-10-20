# GraphQL API Documentation

## Overview
This is a NestJS GraphQL API with TypeORM and PostgreSQL for managing Users and Companies with a one-to-many relationship.

## Relationship Structure
- **Company** can have **many Users**
- **User** belongs to **one Company**

## GraphQL Endpoint
```
http://localhost:3000/api/graphql
```

## Entities

### User
- `id`: Unique identifier (ID)
- `name`: User full name (String)
- `email`: User email address (String)
- `password`: User password (String, hashed recommended)
- `companyId`: Associated company ID (Int, nullable)
- `company`: Associated company object (Company, nullable)

### Company
- `id`: Unique identifier (ID)
- `name`: Company name (String)
- `description`: Company description (String, nullable)
- `address`: Company address (String, nullable)
- `phone`: Company phone number (String, nullable)
- `email`: Company email address (String, nullable)
- `website`: Company website URL (String, nullable)
- `users`: Array of users belonging to this company ([User], nullable)

## Queries

### Get All Companies
```graphql
query {
  companies {
    id
    name
    description
    address
    phone
    email
    website
    users {
      id
      name
      email
    }
  }
}
```

### Get Company by ID
```graphql
query {
  company(id: 1) {
    id
    name
    description
    users {
      id
      name
      email
    }
  }
}
```

### Get All Users
```graphql
query {
  users {
    id
    name
    email
    companyId
    company {
      id
      name
    }
  }
}
```

### Get User by ID
```graphql
query {
  user(id: 1) {
    id
    name
    email
    company {
      id
      name
    }
  }
}
```

## Mutations

### Create Company
```graphql
mutation {
  createCompany(input: {
    name: "Acme Corporation"
    description: "Leading technology company"
    address: "123 Main St, City"
    phone: "+1234567890"
    email: "contact@acme.com"
    website: "https://acme.com"
  }) {
    id
    name
    description
  }
}
```

### Update Company
```graphql
mutation {
  updateCompany(
    id: 1
    input: {
      name: "Acme Corporation Updated"
      description: "Updated description"
    }
  ) {
    id
    name
    description
  }
}
```

### Delete Company
```graphql
mutation {
  deleteCompany(id: 1)
}
```

### Create User
```graphql
mutation {
  createUser(input: {
    name: "John Doe"
    email: "john@example.com"
    password: "securePassword123"
    companyId: 1
  }) {
    id
    name
    email
    company {
      id
      name
    }
  }
}
```

### Update User
```graphql
mutation {
  updateUser(
    id: 1
    input: {
      name: "John Doe Updated"
      email: "john.updated@example.com"
      companyId: 2
    }
  ) {
    id
    name
    email
    company {
      id
      name
    }
  }
}
```

### Delete User
```graphql
mutation {
  deleteUser(id: 1)
}
```

### User Login
```graphql
mutation {
  login(
    email: "john@example.com"
    password: "securePassword123"
  ) {
    id
    name
    email
    company {
      id
      name
    }
  }
}
```

## GraphQL Best Practices Implemented

### 1. **Descriptive Names and Documentation**
- All fields, queries, and mutations have descriptions
- Clear naming conventions following GraphQL standards
- Self-documenting schema

### 2. **Proper Type Definitions**
- Explicit type definitions with `@ObjectType()` for entities
- Separate `@InputType()` for mutations
- Use of `PartialType` for update inputs (DRY principle)

### 3. **Nullable Fields**
- Proper use of `nullable: true` for optional fields
- Clear indication of required vs optional data

### 4. **Field Resolvers**
- Implemented `@ResolveField()` for lazy loading relationships
- Optimizes query performance by loading relations on demand

### 5. **Separation of Concerns**
- Separate DTOs for Create and Update operations
- Clear distinction between Input Types and Object Types

### 6. **Explicit Type Annotations**
- Using `Int`, `ID`, and other scalar types explicitly
- Proper type safety throughout the schema

### 7. **Relationship Handling**
- Proper bi-directional relationships
- Eager loading support with `relations` array in services
- Circular dependency handling with lazy imports

### 8. **Query Optimization**
- Relations loaded efficiently
- Selective field loading in resolvers

## Development Tips

### GraphQL Playground
When running in development mode, access the GraphQL Playground at:
```
http://localhost:3000/api/graphql
```

### Introspection
The schema supports full introspection, allowing you to explore all available types, queries, and mutations in the playground.

### Error Handling
- Null returns for not-found queries
- Boolean returns for delete operations
- Proper error propagation from services to resolvers

## Next Steps (Recommendations)

1. **Authentication & Authorization**
   - Implement JWT authentication
   - Add GraphQL guards for protected routes
   - Hash passwords with bcrypt

2. **Validation**
   - Add class-validator decorators to input DTOs
   - Implement custom validation pipes

3. **Pagination**
   - Implement cursor-based or offset pagination
   - Add filtering and sorting capabilities

4. **Error Handling**
   - Create custom GraphQL error classes
   - Implement proper error formatting

5. **Testing**
   - Write unit tests for resolvers and services
   - Integration tests for GraphQL queries/mutations

6. **Performance**
   - Implement DataLoader for N+1 query prevention
   - Add query complexity limits
   - Implement caching strategies
