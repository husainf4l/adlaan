# File Upload Test Guide

## Testing PDF Upload to AWS S3

Your backend is now configured to handle file uploads and automatically save them to AWS S3. Here's how to test it:

### 1. **Prerequisites**

- Server running on `http://localhost:4007`
- Valid JWT token from login
- A PDF file to upload

### 2. **Get Authentication Token**

First, get a JWT token by logging in:

```bash
# Login to get token
curl -X POST http://localhost:4007/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "your-email@example.com",
    "password": "your-password"
  }'
```

Save the `access_token` from the response.

### 3. **Upload PDF File**

**Using curl:**

```bash
curl -X POST http://localhost:4007/api/documents/upload \
  -H "Authorization: Bearer YOUR_JWT_TOKEN_HERE" \
  -F "file=@/path/to/your/document.pdf"
```

**Using Postman:**

1. Set method to `POST`
2. URL: `http://localhost:4007/api/documents/upload`
3. Headers:
   - `Authorization: Bearer YOUR_JWT_TOKEN_HERE`
4. Body:
   - Select `form-data`
   - Key: `file` (set type to File)
   - Value: Select your PDF file

**Using JavaScript/Fetch:**

```javascript
const formData = new FormData();
formData.append('file', pdfFile); // pdfFile is a File object

fetch('http://localhost:4007/api/documents/upload', {
  method: 'POST',
  headers: {
    Authorization: 'Bearer YOUR_JWT_TOKEN_HERE',
  },
  body: formData,
})
  .then((response) => response.json())
  .then((data) => console.log(data));
```

### 4. **Expected Response**

**Success Response:**

```json
{
  "success": true,
  "data": {
    "id": "clh7x8y9z0000...",
    "name": "document.pdf",
    "type": "FILE",
    "size": 1024000,
    "mimeType": "application/pdf",
    "extension": "pdf",
    "documentType": "OTHER",
    "version": 1,
    "checksum": "sha256:abc123...",
    "downloadUrl": "https://4wk-garage-media.s3.me-central-1.amazonaws.com/...",
    "previewUrl": "https://4wk-garage-media.s3.me-central-1.amazonaws.com/...",
    "path": "/documents/document.pdf",
    "createdAt": "2025-08-14T00:22:00.000Z",
    "updatedAt": "2025-08-14T00:22:00.000Z",
    "createdBy": {
      "id": "user123",
      "email": "user@example.com",
      "name": "John Doe"
    },
    "lastModifiedBy": {
      "id": "user123",
      "email": "user@example.com",
      "name": "John Doe"
    },
    "isStarred": false,
    "isShared": false,
    "tags": [],
    "permissions": [],
    "versions": []
  },
  "message": "File uploaded successfully",
  "timestamp": "2025-08-14T00:22:00.000Z"
}
```

### 5. **File Storage Details**

Your PDF will be stored in AWS S3 with:

- **Bucket:** `4wk-garage-media`
- **Region:** `me-central-1`
- **Path:** `companies/{companyId}/documents/{uniqueFileName}`
- **Access:** Presigned URLs for secure downloads

### 6. **Common Issues & Solutions**

**415 Unsupported Media Type:** ✅ **FIXED**

- Fastify multipart plugin now properly configured

**401 Unauthorized:**

- Check your JWT token is valid and not expired
- Ensure `Authorization: Bearer {token}` header format

**413 Payload Too Large:**

- File size limit is 50MB
- Check file size before upload

**AWS Access Issues:**

- Verify AWS credentials in .env file
- Ensure S3 bucket permissions are correct

### 7. **Next Steps**

After successful upload, you can:

- Search for documents: `GET /api/documents/search`
- Create folders: `POST /api/folders`
- Move files: `POST /api/documents/move`
- Delete files: `DELETE /api/documents/{id}`

The file is now safely stored in AWS S3 and accessible via the provided download URL! 🚀
