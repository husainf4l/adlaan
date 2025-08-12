# Backend Implementation Instructions for Adlaan Document Management System

## Overview

This document provides comprehensive instructions for implementing the backend API to support the Google Drive-like document management system in Adlaan. The frontend is already implemented and expects specific API endpoints.

## Technology Stack Recommendations

### Primary Stack

- **Framework**: Node.js with Express.js or Python with FastAPI
- **Database**: PostgreSQL (recommended) or MongoDB
- **File Storage**: AWS S3, Google Cloud Storage, or Azure Blob Storage
- **Authentication**: JWT tokens with HTTP-only cookies
- **Real-time**: Socket.io for upload progress (optional)

### Alternative Stacks

- **NestJS** (Node.js/TypeScript) - Good for enterprise applications
- **Django REST Framework** (Python) - Rapid development
- **Spring Boot** (Java) - Enterprise-grade applications

## Database Schema

### Users Table

```sql
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    picture TEXT,
    google_id VARCHAR(255) UNIQUE,
    company_name VARCHAR(255),
    company_size VARCHAR(50),
    industry VARCHAR(100),
    role VARCHAR(100),
    phone VARCHAR(20),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Documents Table

```sql
CREATE TABLE documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    type VARCHAR(20) NOT NULL CHECK (type IN ('file', 'folder')),
    parent_id UUID REFERENCES documents(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    file_url TEXT, -- Only for files
    file_size BIGINT DEFAULT 0, -- Only for files
    mime_type VARCHAR(100), -- Only for files
    is_starred BOOLEAN DEFAULT FALSE,
    is_shared BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    -- Indexes for performance
    INDEX idx_documents_user_parent (user_id, parent_id),
    INDEX idx_documents_type (type),
    INDEX idx_documents_starred (user_id, is_starred),
    INDEX idx_documents_shared (is_shared)
);
```

### Document Shares Table (Optional - for sharing functionality)

```sql
CREATE TABLE document_shares (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    document_id UUID REFERENCES documents(id) ON DELETE CASCADE,
    shared_by UUID REFERENCES users(id) ON DELETE CASCADE,
    shared_with VARCHAR(255), -- Email address
    permission VARCHAR(20) DEFAULT 'read' CHECK (permission IN ('read', 'write', 'admin')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    UNIQUE(document_id, shared_with)
);
```

## Required API Endpoints

### Authentication Endpoints

```
POST /auth/google/token
POST /auth/logout
GET /auth/me
POST /auth/refresh
```

### User Profile Endpoints

```
GET /api/users/profile
PUT /api/users/profile
POST /api/users/complete-profile
```

### Document Management Endpoints

```
GET /api/documents                    # Get documents in folder
GET /api/documents/:id                # Get specific document
POST /api/documents/folders           # Create folder
POST /api/documents/upload            # Upload files
PUT /api/documents/:id                # Update document (rename)
DELETE /api/documents/:id             # Delete document
POST /api/documents/:id/star          # Star/unstar document
GET /api/documents/:id/download       # Download file
GET /api/documents/search             # Search documents
POST /api/documents/:id/share         # Share document (optional)
```

## API Endpoint Details

### 1. Authentication

#### POST /auth/google/token

```javascript
// Request
{
  "credential": "google_jwt_token"
}

// Response
{
  "success": true,
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "name": "User Name",
    "picture": "url",
    "isNewUser": false
  }
}
```

#### GET /auth/me

```javascript
// Response
{
  "success": true,
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "name": "User Name",
    "picture": "url",
    "company_name": "Company",
    "company_size": "1-10",
    "industry": "Technology"
  }
}
```

### 2. Document Management

#### GET /api/documents

```javascript
// Query Parameters
?parent_id=uuid&search=term&starred=true

// Response
{
  "success": true,
  "documents": [
    {
      "id": "uuid",
      "name": "Document Name",
      "type": "file", // or "folder"
      "parentId": "uuid",
      "fileUrl": "s3_url", // only for files
      "fileSize": 1024000, // only for files
      "mimeType": "application/pdf", // only for files
      "isStarred": false,
      "isShared": false,
      "createdAt": "2024-01-01T00:00:00Z",
      "updatedAt": "2024-01-01T00:00:00Z"
    }
  ]
}
```

#### POST /api/documents/folders

```javascript
// Request
{
  "name": "Folder Name",
  "parentId": "uuid" // optional, null for root
}

// Response
{
  "success": true,
  "document": {
    "id": "uuid",
    "name": "Folder Name",
    "type": "folder",
    "parentId": "uuid",
    "isStarred": false,
    "isShared": false,
    "createdAt": "2024-01-01T00:00:00Z",
    "updatedAt": "2024-01-01T00:00:00Z"
  }
}
```

#### POST /api/documents/upload

```javascript
// Request: multipart/form-data
// - files: File[]
// - parentId: string (optional)

// Response
{
  "success": true,
  "documents": [
    {
      "id": "uuid",
      "name": "file.pdf",
      "type": "file",
      "parentId": "uuid",
      "fileUrl": "s3_url",
      "fileSize": 1024000,
      "mimeType": "application/pdf",
      "isStarred": false,
      "isShared": false,
      "createdAt": "2024-01-01T00:00:00Z",
      "updatedAt": "2024-01-01T00:00:00Z"
    }
  ]
}
```

#### GET /api/documents/:id/download

```javascript
// Response: File stream with appropriate headers
Content-Type: application/octet-stream
Content-Disposition: attachment; filename="document.pdf"
```

## Implementation Steps

### Phase 1: Basic Setup (Week 1)

1. **Project Setup**

   ```bash
   # Node.js/Express
   npm init -y
   npm install express cors helmet morgan compression
   npm install jsonwebtoken bcryptjs google-auth-library
   npm install multer aws-sdk uuid
   npm install pg sequelize # or mongoose for MongoDB
   npm install --save-dev @types/node typescript ts-node
   ```

2. **Environment Configuration**

   ```bash
   # .env
   PORT=4007
   DATABASE_URL=postgresql://user:pass@localhost:5432/adlaan
   JWT_SECRET=your-secret-key
   GOOGLE_CLIENT_ID=your-google-client-id
   AWS_ACCESS_KEY_ID=your-aws-key
   AWS_SECRET_ACCESS_KEY=your-aws-secret
   AWS_S3_BUCKET=adlaan-documents
   AWS_REGION=us-east-1
   ```

3. **Database Setup**
   - Create PostgreSQL database
   - Run migration scripts
   - Set up connection pooling

### Phase 2: Authentication (Week 1-2)

1. **Google OAuth Integration**

   ```javascript
   const { OAuth2Client } = require("google-auth-library");
   const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

   async function verifyGoogleToken(token) {
     const ticket = await client.verifyIdToken({
       idToken: token,
       audience: process.env.GOOGLE_CLIENT_ID,
     });
     return ticket.getPayload();
   }
   ```

2. **JWT Token Management**

   ```javascript
   function generateTokens(user) {
     const accessToken = jwt.sign(
       { userId: user.id, email: user.email },
       process.env.JWT_SECRET,
       { expiresIn: "15m" }
     );

     const refreshToken = jwt.sign(
       { userId: user.id },
       process.env.JWT_SECRET,
       { expiresIn: "7d" }
     );

     return { accessToken, refreshToken };
   }
   ```

3. **HTTP-only Cookie Setup**

   ```javascript
   app.use(cookieParser());

   // Set tokens as HTTP-only cookies
   res.cookie("accessToken", accessToken, {
     httpOnly: true,
     secure: process.env.NODE_ENV === "production",
     sameSite: "strict",
     maxAge: 15 * 60 * 1000, // 15 minutes
   });
   ```

### Phase 3: File Storage (Week 2)

1. **AWS S3 Configuration**

   ```javascript
   const AWS = require("aws-sdk");

   const s3 = new AWS.S3({
     accessKeyId: process.env.AWS_ACCESS_KEY_ID,
     secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
     region: process.env.AWS_REGION,
   });

   async function uploadFile(file, key) {
     const params = {
       Bucket: process.env.AWS_S3_BUCKET,
       Key: key,
       Body: file.buffer,
       ContentType: file.mimetype,
     };

     return s3.upload(params).promise();
   }
   ```

2. **File Upload Middleware**
   ```javascript
   const multer = require("multer");
   const upload = multer({
     storage: multer.memoryStorage(),
     limits: {
       fileSize: 100 * 1024 * 1024, // 100MB
     },
   });
   ```

### Phase 4: Document API (Week 2-3)

1. **Document Model**

   ```javascript
   const Document = sequelize.define("Document", {
     id: {
       type: DataTypes.UUID,
       defaultValue: DataTypes.UUIDV4,
       primaryKey: true,
     },
     name: {
       type: DataTypes.STRING,
       allowNull: false,
     },
     type: {
       type: DataTypes.ENUM("file", "folder"),
       allowNull: false,
     },
     parentId: {
       type: DataTypes.UUID,
       references: {
         model: "Documents",
         key: "id",
       },
     },
     userId: {
       type: DataTypes.UUID,
       allowNull: false,
     },
     fileUrl: DataTypes.TEXT,
     fileSize: DataTypes.BIGINT,
     mimeType: DataTypes.STRING,
     isStarred: {
       type: DataTypes.BOOLEAN,
       defaultValue: false,
     },
   });
   ```

2. **Document Controllers**
   ```javascript
   const DocumentController = {
     async getDocuments(req, res) {
       const { parent_id, search, starred } = req.query;
       const { userId } = req.user;

       const where = { userId };
       if (parent_id) where.parentId = parent_id;
       if (starred === "true") where.isStarred = true;
       if (search) where.name = { [Op.iLike]: `%${search}%` };

       const documents = await Document.findAll({ where });
       res.json({ success: true, documents });
     },

     async createFolder(req, res) {
       const { name, parentId } = req.body;
       const { userId } = req.user;

       const folder = await Document.create({
         name,
         type: "folder",
         parentId,
         userId,
       });

       res.json({ success: true, document: folder });
     },
   };
   ```

### Phase 5: Security & Performance (Week 3-4)

1. **Security Middleware**

   ```javascript
   const helmet = require("helmet");
   const rateLimit = require("express-rate-limit");

   app.use(helmet());
   app.use(
     rateLimit({
       windowMs: 15 * 60 * 1000, // 15 minutes
       max: 100, // limit each IP to 100 requests per windowMs
     })
   );
   ```

2. **File Validation**

   ```javascript
   const allowedMimeTypes = [
     "application/pdf",
     "application/msword",
     "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
     "image/jpeg",
     "image/png",
     "text/plain",
   ];

   function validateFile(file) {
     return allowedMimeTypes.includes(file.mimetype);
   }
   ```

3. **Database Optimization**
   ```javascript
   // Add indexes for performance
   await queryInterface.addIndex("Documents", ["userId", "parentId"]);
   await queryInterface.addIndex("Documents", ["type"]);
   await queryInterface.addIndex("Documents", ["userId", "isStarred"]);
   ```

## Testing Strategy

1. **Unit Tests**: Test individual functions
2. **Integration Tests**: Test API endpoints
3. **Load Tests**: Test file upload performance
4. **Security Tests**: Test authentication and authorization

## Deployment Instructions

1. **Production Environment**

   ```bash
   # Docker Deployment
   docker build -t adlaan-backend .
   docker run -p 4007:4007 adlaan-backend
   ```

2. **Environment Variables**

   ```bash
   NODE_ENV=production
   DATABASE_URL=postgresql://prod-user:prod-pass@prod-host:5432/adlaan
   JWT_SECRET=production-secret-key
   AWS_S3_BUCKET=adlaan-documents-prod
   ```

3. **SSL Certificate**
   - Configure HTTPS for production
   - Update CORS settings for frontend domain

## Next Steps After Backend Implementation

1. **Connect Frontend**: Update API URLs in frontend
2. **Testing**: Test all document operations
3. **Performance**: Monitor and optimize queries
4. **Backup**: Set up database and file backups
5. **Monitoring**: Add logging and monitoring tools

This comprehensive backend implementation will support all the document management features already built in your frontend. The system is designed to be scalable, secure, and maintainable.
