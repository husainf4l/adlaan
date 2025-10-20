# Create SUPER_ADMIN User

Use this GraphQL mutation to create the SUPER_ADMIN user:

```graphql
mutation CreateSuperAdmin {
  register(input: {
    name: "husain"
    email: "al-hussein@papayatrading.com"
    password: "tt55oo77"
    role: SUPER_ADMIN
  }) {
    access_token
    user {
      id
      name
      email
      role
    }
  }
}
```

Expected Response:
```json
{
  "data": {
    "register": {
      "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "user": {
        "id": "1",
        "name": "husain",
        "email": "al-hussein@papayatrading.com",
        "role": "SUPER_ADMIN"
      }
    }
  }
}
```

Then you can login with:

```graphql
mutation Login {
  login(input: {
    email: "al-hussein@papayatrading.com"
    password: "tt55oo77"
  }) {
    access_token
    user {
      id
      name
      email
      role
    }
  }
}
```

## Important Notes:

1. The password will be automatically hashed using bcrypt
2. The user will have SUPER_ADMIN role with full access to all endpoints
3. SUPER_ADMIN can access all SMS functions (smsBalance, sendSMS, sendBulkSMS)
4. Save the access_token to use in subsequent requests

## Using the Token in Postman:

1. Copy the `access_token` from the response
2. Go to the "Headers" tab in Postman
3. Add a header:
   - Key: `Authorization`
   - Value: `Bearer YOUR_ACCESS_TOKEN_HERE`

Now you can access all protected endpoints including the JOSMS SMS functions!
