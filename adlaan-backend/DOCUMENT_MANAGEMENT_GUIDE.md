# Document Management System - Complete Guide

## Overview

Adlaan backend now has a comprehensive legal document management system with:
- **Tags** - Categorize and organize documents
- **Versions** - Track changes with version history and rollback
- **Comments** - Collaborate with threaded comments, mentions, and resolution tracking
- **AWS S3 Upload** - Secure cloud storage with presigned URLs
- **SMS Notifications** - JOSMS integration for document updates

## Architecture

```
Document (Core Entity)
├── Tags (Many-to-Many) - Categorization
├── Versions (One-to-Many) - Version history
├── Comments (One-to-Many) - Collaboration
├── Case (Many-to-One) - Legal case association
├── Client (Many-to-One) - Client association
└── Company (Many-to-One) - Multi-tenancy
```

---

## 1. Tags System

### Create Tags

```graphql
mutation CreateTag {
  createTag(input: {
    name: "Urgent"
    color: "#FF0000"
    description: "Requires immediate attention"
  }) {
    id
    name
    color
    description
    createdAt
  }
}
```

### Get All Tags

```graphql
query GetTags {
  tags {
    id
    name
    color
    description
    documents {
      id
      title
    }
  }
}
```

### Get Popular Tags

```graphql
query GetPopularTags {
  popularTags(limit: 10) {
    id
    name
    color
    documentCount
  }
}
```

### Update Tag

```graphql
mutation UpdateTag {
  updateTag(id: 1, input: {
    name: "High Priority"
    color: "#FFA500"
  }) {
    id
    name
    color
  }
}
```

### Delete Tag

```graphql
mutation DeleteTag {
  deleteTag(id: 1)
}
```

### Add Tags to Document

```graphql
mutation CreateDocumentWithTags {
  createDocument(input: {
    title: "Client Agreement"
    documentType: CONTRACT
    tagIds: [1, 2, 3]  # Urgent, Contract, Al-Hussein
  }) {
    id
    title
    tags {
      name
      color
    }
  }
}
```

---

## 2. Document Versions

### Create Version Snapshot

```graphql
mutation CreateVersion {
  createDocumentVersion(
    documentId: 1
    input: {
      changeDescription: "Updated terms and conditions section"
    }
  ) {
    id
    versionNumber
    title
    changeDescription
    createdBy {
      name
    }
    createdAt
  }
}
```

### Get All Versions

```graphql
query GetDocumentVersions {
  documentVersions(documentId: 1) {
    id
    versionNumber
    title
    changeDescription
    createdBy {
      name
      email
    }
    createdAt
  }
}
```

### Compare Two Versions

```graphql
query CompareVersions {
  compareVersions(versionId1: 1, versionId2: 3) {
    version1 {
      versionNumber
      title
      content
      createdAt
    }
    version2 {
      versionNumber
      title
      content
      createdAt
    }
  }
}
```

### Restore Previous Version

```graphql
mutation RestoreVersion {
  restoreDocumentVersion(versionId: 2) {
    id
    title
    version
    content
    updatedAt
  }
}
```

**Note:** Restoring automatically creates a new version snapshot before reverting.

---

## 3. Comments & Collaboration

### Add Comment

```graphql
mutation AddComment {
  createComment(
    documentId: 1
    input: {
      content: "We need to review section 5.2 carefully"
      mentions: ["5", "12"]  # User IDs to notify
      quotedText: "The parties agree to..."
      position: 523  # Character position for inline comment
    }
  ) {
    id
    content
    position
    mentions
    createdBy {
      name
    }
    createdAt
  }
}
```

### Add Reply (Thread)

```graphql
mutation ReplyToComment {
  createComment(
    documentId: 1
    input: {
      content: "I agree, let's schedule a review meeting"
      parentId: 5  # Parent comment ID
    }
  ) {
    id
    content
    parent {
      id
      content
    }
    createdBy {
      name
    }
  }
}
```

### Get All Comments

```graphql
query GetDocumentComments {
  documentComments(documentId: 1) {
    id
    content
    position
    quotedText
    resolved
    mentions
    createdBy {
      name
      email
    }
    replies {
      id
      content
      createdBy {
        name
      }
      createdAt
    }
    createdAt
  }
}
```

### Resolve Comment

```graphql
mutation ResolveComment {
  resolveComment(id: 5) {
    id
    resolved
    resolvedBy {
      name
    }
    resolvedAt
  }
}
```

### Unresolve Comment

```graphql
mutation UnresolveComment {
  unresolveComment(id: 5) {
    id
    resolved
  }
}
```

### Get Unresolved Count

```graphql
query GetUnresolvedCount {
  unresolvedCommentsCount(documentId: 1)
}
```

### Update Comment

```graphql
mutation UpdateComment {
  updateComment(id: 5, input: {
    content: "Updated: We need to review section 5.2 and 5.3"
  }) {
    id
    content
    updatedAt
  }
}
```

### Delete Comment

```graphql
mutation DeleteComment {
  deleteComment(id: 5)
}
```

**Note:** Deleting a comment also deletes all its replies.

---

## 4. Complete Workflow Example

### Step 1: Upload Document with Tags

```graphql
mutation UploadContractWithTags {
  uploadDocument(input: {
    title: "Service Agreement - Al-Hussein Trading"
    description: "Annual service contract renewal"
    fileBase64: "JVBERi0xLjQKJe..."
    fileName: "service-agreement-2024.pdf"
    documentType: CONTRACT
    status: DRAFT
    caseId: 1
    clientId: 5
  }) {
    id
    title
    fileUrl
    status
    version
  }
}

# Then add tags
mutation AddTagsToDocument {
  updateDocument(id: 1, input: {
    tagIds: [1, 2, 3]  # Urgent, Contract, Al-Hussein
  }) {
    id
    tags {
      name
      color
    }
  }
}
```

### Step 2: Team Reviews and Comments

```graphql
# First reviewer
mutation AddReviewComment {
  createComment(documentId: 1, input: {
    content: "Section 3 needs clarification on payment terms"
    position: 1250
    quotedText: "Payment shall be made within..."
    mentions: ["5", "8"]  # Notify finance team
  }) {
    id
    content
  }
}

# Second reviewer replies
mutation ReplyToReview {
  createComment(documentId: 1, input: {
    content: "Agreed. I'll draft updated payment terms."
    parentId: 1
  }) {
    id
    content
  }
}
```

### Step 3: Make Changes & Create Version

```graphql
# Update document
mutation UpdateDocumentContent {
  updateDocument(id: 1, input: {
    content: "Updated contract content..."
  }) {
    id
    version  # Automatically incremented
  }
}

# Create version snapshot
mutation SnapshotVersion {
  createDocumentVersion(
    documentId: 1
    input: {
      changeDescription: "Updated section 3 - payment terms clarified"
    }
  }) {
    versionNumber
  }
}
```

### Step 4: Resolve Comments & Change Status

```graphql
# Resolve comment
mutation ResolveIssue {
  resolveComment(id: 1) {
    id
    resolved
    resolvedBy {
      name
    }
  }
}

# Update status
mutation ApproveDocument {
  updateDocumentStatus(id: 1, status: APPROVED) {
    id
    status
  }
}
```

### Step 5: Get Download URL & Send SMS

```graphql
# Get presigned URL
query GetDownloadLink {
  documentDownloadUrl(id: 1, expiresIn: 86400) {
    url
    expiresIn
  }
}

# Send SMS notification
mutation NotifyClient {
  sendSMS(input: {
    phoneNumber: "0791234567"
    message: "Your service agreement is ready for review. Download: [URL]"
    type: GENERAL
  }) {
    success
    messageId
  }
}
```

---

## 5. Use Cases

### Legal Document Review Workflow

```
1. Upload document → DRAFT status
2. Add tags: "Contract", "Urgent", "Client-Name"
3. Team adds comments with @mentions
4. Make revisions → Auto-increment version
5. Create version snapshot with change description
6. Resolve all comments
7. Change status: DRAFT → REVIEW → APPROVED → SIGNED
8. Send SMS to client with download link
9. Archive: SIGNED → FILED → ARCHIVED
```

### Document Comparison

```graphql
# Compare current vs previous version
query CompareChanges {
  compareVersions(versionId1: 2, versionId2: 5) {
    version1 {
      versionNumber
      content
      changeDescription
    }
    version2 {
      versionNumber
      content
      changeDescription
    }
  }
}
```

### Audit Trail

```graphql
# Get complete history
query DocumentAuditTrail {
  document(id: 1) {
    title
    version
    status
    tags {
      name
    }
    createdBy {
      name
    }
    createdAt
    updatedAt
  }
  
  documentVersions(documentId: 1) {
    versionNumber
    changeDescription
    createdBy {
      name
    }
    createdAt
  }
  
  documentComments(documentId: 1) {
    content
    resolved
    createdBy {
      name
    }
    createdAt
  }
}
```

---

## 6. Best Practices

### Tagging Strategy

```graphql
# Create standard tags
Standard Tags:
- Urgent (#FF0000)
- Contract (#4CAF50)
- NDA (#9C27B0)
- Draft (#FFC107)
- Approved (#2196F3)
- Client-[Name] (#FF9800)
- Case-[Number] (#795548)
```

### Version Control

```
✅ DO:
- Create version before major changes
- Add descriptive change descriptions
- Use versions for milestone tracking

❌ DON'T:
- Create versions for minor typos
- Leave empty change descriptions
- Delete old versions (use restore instead)
```

### Comment Etiquette

```
✅ DO:
- Use @mentions to notify relevant users
- Quote specific text for context
- Mark as resolved when addressed
- Use threads (replies) for discussions

❌ DON'T:
- Leave vague comments without context
- Forget to resolve outdated comments
- Use comments for non-document discussions
```

### Status Progression

```
DRAFT → REVIEW → APPROVED → SIGNED → FILED → ARCHIVED

DRAFT: Initial creation, open for editing
REVIEW: Under review by team/client
APPROVED: Approved by all parties
SIGNED: Digitally signed
FILED: Filed with court/authorities
ARCHIVED: Closed and archived
```

---

## 7. Permission Matrix

| Action | USER | ADMIN | SUPER_ADMIN |
|--------|------|-------|-------------|
| View documents | ✅ | ✅ | ✅ |
| Create documents | ✅ | ✅ | ✅ |
| Upload files | ✅ | ✅ | ✅ |
| Add tags | ✅ | ✅ | ✅ |
| Create versions | ✅ | ✅ | ✅ |
| Add comments | ✅ | ✅ | ✅ |
| Resolve comments | ✅ | ✅ | ✅ |
| Update status | ❌ | ✅ | ✅ |
| Restore versions | ❌ | ✅ | ✅ |
| Delete documents | ❌ | ✅ | ✅ |
| Edit tags | ❌ | ✅ | ✅ |
| Delete others' comments | ❌ | ✅ | ✅ |

---

## 8. GraphQL Schema Summary

### Entities
- Document
- Tag
- DocumentVersion
- Comment

### Mutations
- **Documents:** upload, create, update, updateStatus, delete
- **Tags:** create, update, delete
- **Versions:** create, restore
- **Comments:** create, update, resolve, unresolve, delete

### Queries
- **Documents:** documents, document, documentsByCase, documentsByClient, documentDownloadUrl
- **Tags:** tags, tag, popularTags
- **Versions:** documentVersions, documentVersion, compareVersions
- **Comments:** documentComments, comment, commentReplies, unresolvedCommentsCount

---

## Next Features (Coming Soon)

1. **Templates** - Document templates with variables
2. **AI Integration** - AI-powered document drafting
3. **Clauses Library** - Reusable legal clauses
4. **Document Signing** - Digital signature integration
5. **OCR** - Extract text from scanned documents

## Support

- GraphQL Playground: http://localhost:4001/api/graphql
- Documentation: See individual feature MD files
- Issues: Create in repository
