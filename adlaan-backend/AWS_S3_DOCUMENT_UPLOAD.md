# AWS S3 Document Upload - GraphQL Examples

## Overview

The Adlaan backend now supports document uploads to AWS S3 with automatic file management. Documents can be uploaded as base64-encoded files and are automatically organized by company and case.

## AWS Configuration

Environment variables in `.env`:
```env
AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key
AWS_REGION=me-central-1
AWS_BUCKET_NAME=your-bucket-name
```

## File Organization

Documents are automatically organized in S3:
```
documents/
  ├── {companyId}/
  │   ├── case-{caseId}/
  │   │   └── {uuid}-filename.pdf
  │   └── general/
  │       └── {uuid}-filename.pdf
```

## Authentication

All document operations require authentication. Add to HTTP Headers:
```json
{
  "Authorization": "Bearer YOUR_ACCESS_TOKEN"
}
```

## 1. Upload Document to S3

Upload a document with automatic S3 storage:

```graphql
mutation UploadDocument {
  uploadDocument(input: {
    title: "Client Agreement - Al-Hussein Trading"
    description: "Service agreement for legal consultation"
    fileBase64: "JVBERi0xLjQKJeLjz9MKMyAwIG9iaiA8PAovVHlwZSAvUGFnZQov..."
    fileName: "client-agreement-2024.pdf"
    documentType: CONTRACT
    status: DRAFT
    caseId: 1
    clientId: 5
  }) {
    id
    title
    fileUrl
    documentType
    status
    version
    createdAt
    createdBy {
      name
      email
    }
  }
}
```

### How to Convert File to Base64

**JavaScript/Node.js:**
```javascript
const fs = require('fs');
const fileBuffer = fs.readFileSync('document.pdf');
const base64 = fileBuffer.toString('base64');
```

**Python:**
```python
import base64
with open('document.pdf', 'rb') as file:
    base64_string = base64.b64encode(file.read()).decode('utf-8')
```

**Browser (JavaScript):**
```javascript
function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const base64 = reader.result.split(',')[1]; // Remove data:...;base64, prefix
      resolve(base64);
    };
    reader.onerror = error => reject(error);
  });
}

// Usage
const file = document.querySelector('input[type="file"]').files[0];
const base64 = await fileToBase64(file);
```

## 2. Get All Documents

```graphql
query GetAllDocuments {
  documents {
    id
    title
    description
    fileUrl
    documentType
    status
    version
    case {
      caseNumber
      title
    }
    client {
      name
    }
    createdBy {
      name
    }
    createdAt
  }
}
```

## 3. Get Document by ID

```graphql
query GetDocument {
  document(id: 1) {
    id
    title
    description
    fileUrl
    documentType
    status
    version
    content
    case {
      id
      caseNumber
      title
    }
    client {
      id
      name
      email
    }
    createdBy {
      name
      email
    }
    createdAt
    updatedAt
  }
}
```

## 4. Get Documents by Case

```graphql
query GetCaseDocuments {
  documentsByCase(caseId: 1) {
    id
    title
    fileUrl
    documentType
    status
    createdAt
  }
}
```

## 5. Get Documents by Client

```graphql
query GetClientDocuments {
  documentsByClient(clientId: 5) {
    id
    title
    fileUrl
    documentType
    status
    case {
      caseNumber
    }
    createdAt
  }
}
```

## 6. Get Presigned Download URL

Get a temporary secure URL to download the document (valid for 1 hour by default):

```graphql
query GetDocumentDownloadUrl {
  documentDownloadUrl(id: 1, expiresIn: 3600) {
    url
    expiresIn
  }
}
```

**Response:**
```json
{
  "data": {
    "documentDownloadUrl": {
      "url": "https://your-bucket.s3.me-central-1.amazonaws.com/documents/1/case-1/abc123-client-agreement.pdf?X-Amz-Algorithm=AWS4-HMAC-SHA256&...",
      "expiresIn": 3600
    }
  }
}
```

You can then use this URL directly in a browser or download programmatically:

```javascript
// Download in browser
window.open(url, '_blank');

// Or fetch and save
fetch(url)
  .then(res => res.blob())
  .then(blob => {
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'document.pdf';
    link.click();
  });
```

## 7. Update Document Status

Change document status (DRAFT → REVIEW → APPROVED → SIGNED → FILED):

```graphql
mutation UpdateStatus {
  updateDocumentStatus(id: 1, status: APPROVED) {
    id
    title
    status
    updatedAt
  }
}
```

**Document Statuses:**
- `DRAFT` - Initial draft
- `REVIEW` - Under review
- `APPROVED` - Approved for use
- `SIGNED` - Signed by parties
- `FILED` - Filed with court/authorities
- `ARCHIVED` - Archived for records

## 8. Update Document Metadata

Update document title, description, or content without changing the file:

```graphql
mutation UpdateDocument {
  updateDocument(id: 1, input: {
    title: "Updated Contract Title"
    description: "Updated description"
    status: REVIEW
  }) {
    id
    title
    description
    status
    version
    updatedAt
  }
}
```

## 9. Delete Document

Delete document and its S3 file (Admin/SuperAdmin only):

```graphql
mutation DeleteDocument {
  deleteDocument(id: 1)
}
```

This will:
1. ✅ Delete the file from S3
2. ✅ Remove the database record
3. ✅ Return `true` on success

## Document Types

Available document types:
- `CONTRACT` - Legal contracts
- `NDA` - Non-disclosure agreements
- `MOTION` - Court motions
- `BRIEF` - Legal briefs
- `LEASE` - Lease agreements
- `MEMO` - Legal memorandums
- `LETTER` - Legal letters
- `AGREEMENT` - General agreements
- `POWER_OF_ATTORNEY` - Power of attorney documents
- `WILL` - Last will and testament
- `COMPLAINT` - Legal complaints
- `ANSWER` - Answers to complaints
- `DISCOVERY` - Discovery documents
- `AFFIDAVIT` - Sworn statements
- `SUMMONS` - Court summons
- `ORDER` - Court orders
- `JUDGMENT` - Court judgments
- `OTHER` - Other document types

## Supported File Formats

The service supports all common file formats:

**Documents:**
- PDF (`.pdf`) - Recommended
- Word (`.doc`, `.docx`)
- Text (`.txt`)

**Images:**
- JPEG (`.jpg`, `.jpeg`)
- PNG (`.png`)
- GIF (`.gif`)
- WebP (`.webp`)
- SVG (`.svg`)

## File Size Limits

- **Maximum file size:** Limited by GraphQL payload size and S3 bucket settings
- **Recommended:** Keep files under 10MB for optimal performance
- **For larger files:** Consider implementing multipart upload or direct S3 upload with presigned POST

## Security Features

1. **Authentication Required** - All operations require valid JWT token
2. **Company Isolation** - Users can only access their company's documents
3. **Role-Based Access:**
   - `USER` - Can upload, view, and update own documents
   - `ADMIN` - Can manage all company documents and change status
   - `SUPER_ADMIN` - Full access including deletion
4. **Presigned URLs** - Temporary secure access (1 hour - 7 days)
5. **Automatic Cleanup** - S3 files deleted when document is removed

## Error Handling

Common errors and solutions:

### Invalid Base64
```json
{
  "errors": [{
    "message": "Failed to upload document: Invalid base64 string"
  }]
}
```
**Solution:** Ensure file is properly encoded to base64

### Document Not Found
```json
{
  "errors": [{
    "message": "Document #123 not found"
  }]
}
```
**Solution:** Verify document ID and company access

### No File Attached
```json
{
  "errors": [{
    "message": "Document has no file attached"
  }]
}
```
**Solution:** Document was created without upload - use `uploadDocument` mutation

### AWS Configuration Missing
```json
{
  "errors": [{
    "message": "AWS configuration is missing. Please check your environment variables."
  }]
}
```
**Solution:** Verify all AWS environment variables are set correctly

## Best Practices

1. **File Naming:** Use descriptive filenames with dates
   ```
   ✅ client-agreement-2024-10-18.pdf
   ❌ document.pdf
   ```

2. **Document Types:** Always specify the correct document type for better organization

3. **Case/Client Association:** Link documents to cases and clients when applicable

4. **Status Workflow:** Follow the status progression
   ```
   DRAFT → REVIEW → APPROVED → SIGNED → FILED → ARCHIVED
   ```

5. **Presigned URLs:** Use appropriate expiration times
   ```
   - Quick preview: 300 (5 minutes)
   - Email links: 3600 (1 hour)
   - Client portals: 86400 (24 hours)
   - Max: 604800 (7 days)
   ```

6. **File Cleanup:** Always delete documents through the API to ensure S3 cleanup

## Integration Example: Upload Document from React

```typescript
import { useMutation } from '@apollo/client';
import { gql } from '@apollo/client';

const UPLOAD_DOCUMENT = gql`
  mutation UploadDocument($input: UploadDocumentInput!) {
    uploadDocument(input: $input) {
      id
      title
      fileUrl
      status
    }
  }
`;

function DocumentUpload({ caseId }) {
  const [uploadDocument] = useMutation(UPLOAD_DOCUMENT);

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    
    // Convert to base64
    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64 = reader.result.split(',')[1];
      
      try {
        const { data } = await uploadDocument({
          variables: {
            input: {
              title: file.name,
              description: `Uploaded on ${new Date().toLocaleDateString()}`,
              fileBase64: base64,
              fileName: file.name,
              documentType: 'CONTRACT',
              status: 'DRAFT',
              caseId: caseId,
            }
          }
        });
        
        console.log('Document uploaded:', data.uploadDocument);
        alert('Document uploaded successfully!');
      } catch (error) {
        console.error('Upload error:', error);
        alert('Failed to upload document');
      }
    };
    
    reader.readAsDataURL(file);
  };

  return (
    <input 
      type="file" 
      accept=".pdf,.doc,.docx"
      onChange={handleFileUpload}
    />
  );
}
```

## Next Steps

1. ✅ Test document upload with small PDF
2. ✅ Verify file appears in S3 bucket
3. ✅ Test presigned URL generation and download
4. ✅ Test document deletion (verify S3 cleanup)
5. ✅ Implement frontend upload component
6. ✅ Add document preview functionality
7. ✅ Set up S3 bucket lifecycle policies for old files

## Support

- AWS S3 Docs: https://docs.aws.amazon.com/s3/
- GraphQL Playground: http://localhost:4001/api/graphql
- Check logs for detailed error messages
