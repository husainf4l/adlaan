# Document Management API Reference

## Base URL

`http://localhost:4007/api`

## Authentication

All endpoints require JWT authenticatio "extension": "pdf",
"documentType": "CONTRACT",
"version": 1,
"checksum": "sha256:abc123...",
"downloadUrl": "https://s3.amazonaws.com/presigned-download-url",
"previewUrl": "https://4wk-garage-media.s3.me-central-1.amazonaws.com/companies/comp123/documents/file.pdf",
// ... other properties
},
"message": "File uploaded successfully",
"timestamp": "2025-08-13T21:52:00.000Z"
} the token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

## File Storage

Files are automatically uploaded to AWS S3 with the following structure:

```
companies/{companyId}/documents/{uniqueFileName}
```

Files are stored in the **4wk-garage-media** bucket in the **me-central-1** region.

## Endpoints

### Folders

#### Create Folder

- **POST** `/folders`
- **POST** `/documents/folders`

**Request Body:**

```json
{
  "name": "My Folder",
  "parentId": "optional-parent-folder-id",
  "color": "#3B82F6",
  "description": "Optional description",
  "tags": ["tag1", "tag2"]
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "id": "folder_123",
    "name": "My Folder",
    "type": "FOLDER",
    "parentId": null,
    "path": "/documents/My Folder",
    "createdAt": "2025-08-13T21:52:00.000Z",
    "updatedAt": "2025-08-13T21:52:00.000Z",
    "createdBy": {
      "id": "user_123",
      "email": "user@example.com",
      "name": "John Doe"
    },
    "lastModifiedBy": {
      "id": "user_123",
      "email": "user@example.com",
      "name": "John Doe"
    },
    "isStarred": false,
    "isShared": false,
    "tags": ["tag1", "tag2"],
    "permissions": [],
    "childrenCount": 0,
    "color": "#3B82F6",
    "description": "Optional description"
  },
  "message": "Folder created successfully",
  "timestamp": "2025-08-13T21:52:00.000Z"
}
```

#### Get Folder Contents

- **GET** `/documents/folders/{id}/contents`
- Use `root` as the ID to get root-level items

**Response:**

```json
{
  "success": true,
  "data": [
    {
      "id": "folder_456",
      "name": "Contracts",
      "type": "FOLDER"
      // ... folder properties
    },
    {
      "id": "file_789",
      "name": "Document.pdf",
      "type": "FILE",
      "size": 1024000,
      "mimeType": "application/pdf",
      "extension": "pdf",
      "documentType": "CONTRACT",
      "version": 1,
      "downloadUrl": "/api/documents/file_789/download"
      // ... file properties
    }
  ],
  "timestamp": "2025-08-13T21:52:00.000Z"
}
```

### Files

#### Upload File

- **POST** `/documents/upload`

**Request:** Multipart form data

- `file`: The file to upload
- `parentId`: Optional parent folder ID
- `documentType`: Optional document type (CONTRACT, INVOICE, etc.)
- `tags`: Optional JSON array of tags
- `description`: Optional description

**Response:**

```json
{
  "success": true,
  "data": {
    "id": "file_123",
    "name": "document.pdf",
    "type": "FILE",
    "size": 1024000,
    "mimeType": "application/pdf",
    "extension": "pdf",
    "documentType": "CONTRACT",
    "version": 1,
    "checksum": "sha256:abc123...",
    "downloadUrl": "/api/documents/file_123/download"
    // ... other properties
  },
  "message": "File uploaded successfully",
  "timestamp": "2025-08-13T21:52:00.000Z"
}
```

### Search & Browse

#### Search Documents

- **GET** `/documents/search`

**Query Parameters:**

- `query`: Search term
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 20, max: 50)
- `sortBy`: Sort field (default: updatedAt)
- `sortOrder`: Sort order - asc/desc (default: desc)
- `parentId`: Filter by parent folder
- `type`: Filter by type (FILE/FOLDER)
- `documentType`: Filter by document type
- `tags`: Comma-separated list of tags
- `starred`: Filter starred items (true/false)

**Example:** `/documents/search?page=1&limit=50&sortBy=updatedAt&sortOrder=desc`

**Response:**

```json
{
  "success": true,
  "data": {
    "items": [
      // Array of document items
    ],
    "pagination": {
      "page": 1,
      "limit": 50,
      "total": 100,
      "totalPages": 2,
      "hasNext": true,
      "hasPrev": false
    }
  },
  "timestamp": "2025-08-13T21:52:00.000Z"
}
```

### Item Management

#### Update Item

- **PUT** `/documents/{id}`

**Request Body:**

```json
{
  "name": "New Name",
  "parentId": "new-parent-id",
  "tags": ["new", "tags"],
  "isStarred": true,
  "color": "#FF0000",
  "description": "Updated description",
  "documentType": "INVOICE"
}
```

#### Delete Item

- **DELETE** `/documents/{id}`

**Response:**

```json
{
  "success": true,
  "data": null,
  "message": "Item deleted successfully",
  "timestamp": "2025-08-13T21:52:00.000Z"
}
```

#### Move Items

- **POST** `/documents/move`

**Request Body:**

```json
{
  "itemIds": ["item1", "item2", "item3"],
  "targetParentId": "folder_123"
}
```

#### Get Single Item

#### Get Single Item

- **GET** `/documents/{id}`

## Advanced Features

#### Generate Presigned Upload URL

- **POST** `/documents/presigned-upload-url`

This endpoint generates a presigned URL that allows direct upload to S3 from the frontend, bypassing the server for large files.

**Request Body:**

```json
{
  "fileName": "document.pdf",
  "contentType": "application/pdf"
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "uploadUrl": "https://4wk-garage-media.s3.me-central-1.amazonaws.com/...",
    "key": "companies/comp123/documents/1692835200000-document.pdf",
    "fileName": "document.pdf",
    "contentType": "application/pdf",
    "expiresIn": 3600
  },
  "message": "Presigned upload URL generated successfully",
  "timestamp": "2025-08-13T21:52:00.000Z"
}
```

**Usage:**

1. Call this endpoint to get a presigned URL
2. Use the returned `uploadUrl` to upload the file directly to S3 via PUT request
3. Create a document record using the returned `key` after successful upload

## Document Types

- `CONTRACT`
- `INVOICE`
- `PROPOSAL`
- `REPORT`
- `PRESENTATION`
- `SPREADSHEET`
- `IMAGE`
- `PDF`
- `OTHER`

## Error Responses

All endpoints return error responses in this format:

```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable error message",
    "details": {}
  },
  "timestamp": "2025-08-13T21:52:00.000Z"
}
```

## Notes

- All endpoints require authentication
- File uploads support common formats (PDF, DOC, DOCX, images, etc.)
- Files are automatically scanned for type and generate checksums
- Folder hierarchy is maintained with path tracking
- Full-text search is available across file names and tags
- Pagination is supported on search endpoints
- All responses include timestamps and success indicators
