# Backend Profile API Implementation Guide

## Overview

This document outlines the backend implementation requirements for the Company Profile and Document Layout management system. The backend should provide RESTful API endpoints for managing company information and document templates.

## Database Schema Requirements

### Company Profile Entity

**Table Name:** `company_profiles`

**Fields:**

- `id` - UUID primary key, auto-generated
- `name` - VARCHAR(255), required - Company name in Arabic
- `nameEn` - VARCHAR(255), optional - Company name in English
- `email` - VARCHAR(255), required, unique - Company email address
- `phone` - VARCHAR(50), required - Company phone number
- `address` - TEXT, required - Company address in Arabic
- `addressEn` - TEXT, optional - Company address in English
- `website` - VARCHAR(255), optional - Company website URL
- `taxNumber` - VARCHAR(50), optional - Tax registration number
- `commercialRegister` - VARCHAR(50), optional - Commercial register number
- `logo` - TEXT, optional - Base64 encoded logo or file path
- `isActive` - BOOLEAN, default true - Soft delete flag
- `createdAt` - TIMESTAMP, auto-generated
- `updatedAt` - TIMESTAMP, auto-updated

**Relationships:**

- One-to-Many with DocumentLayout entity

### Document Layout Entity

**Table Name:** `document_layouts`

**Fields:**

- `id` - UUID primary key, auto-generated
- `name` - VARCHAR(255), required - Layout name
- `headerTemplate` - TEXT, required - HTML template for document header
- `footerTemplate` - TEXT, required - HTML template for document footer
- `margins` - JSONB, required - Object containing top, bottom, left, right margins in pixels
- `fontSize` - INTEGER, default 14 - Font size in pixels
- `fontFamily` - VARCHAR(100), default 'Arial, sans-serif' - Font family CSS value
- `isDefault` - BOOLEAN, default false - Whether this is the default layout
- `isActive` - BOOLEAN, default true - Soft delete flag
- `companyProfileId` - UUID, required - Foreign key to CompanyProfile
- `createdAt` - TIMESTAMP, auto-generated
- `updatedAt` - TIMESTAMP, auto-updated

**Relationships:**

- Many-to-One with CompanyProfile entity

## API Endpoints Specification

### Company Profile Endpoints

**Base URL:** `/api/profile`

#### GET /company

- **Purpose:** Retrieve the active company profile
- **Authentication:** Required (JWT token)
- **Response:** CompanyProfile object with related DocumentLayouts
- **Status Codes:** 200 (success), 404 (not found), 401 (unauthorized)

#### POST /company

- **Purpose:** Create a new company profile
- **Authentication:** Required (JWT token)
- **Request Body:** CreateCompanyProfileDto
- **Response:** Created CompanyProfile object
- **Status Codes:** 201 (created), 400 (validation error), 401 (unauthorized)

#### PUT /company/:id

- **Purpose:** Update existing company profile
- **Authentication:** Required (JWT token)
- **Parameters:** id (UUID) - Company profile ID
- **Request Body:** UpdateCompanyProfileDto
- **Response:** Updated CompanyProfile object
- **Status Codes:** 200 (success), 404 (not found), 400 (validation error)

#### DELETE /company/:id

- **Purpose:** Soft delete company profile (set isActive to false)
- **Authentication:** Required (JWT token)
- **Parameters:** id (UUID) - Company profile ID
- **Response:** Success message
- **Status Codes:** 200 (success), 404 (not found)

### Document Layout Endpoints

#### GET /layouts

- **Purpose:** Retrieve all active document layouts for the user
- **Authentication:** Required (JWT token)
- **Response:** Array of DocumentLayout objects
- **Ordering:** Default layouts first, then by creation date
- **Status Codes:** 200 (success), 401 (unauthorized)

#### POST /layouts

- **Purpose:** Create a new document layout
- **Authentication:** Required (JWT token)
- **Request Body:** CreateDocumentLayoutDto
- **Response:** Created DocumentLayout object
- **Status Codes:** 201 (created), 400 (validation error), 401 (unauthorized)

#### PUT /layouts/:id

- **Purpose:** Update existing document layout
- **Authentication:** Required (JWT token)
- **Parameters:** id (UUID) - Layout ID
- **Request Body:** UpdateDocumentLayoutDto
- **Response:** Updated DocumentLayout object
- **Status Codes:** 200 (success), 404 (not found), 400 (validation error)

#### DELETE /layouts/:id

- **Purpose:** Soft delete document layout (set isActive to false)
- **Authentication:** Required (JWT token)
- **Parameters:** id (UUID) - Layout ID
- **Business Rule:** Cannot delete default layouts
- **Response:** Success message
- **Status Codes:** 200 (success), 404 (not found), 400 (cannot delete default)

#### POST /layouts/:id/set-default

- **Purpose:** Set a layout as the default layout
- **Authentication:** Required (JWT token)
- **Parameters:** id (UUID) - Layout ID
- **Business Logic:** Remove default flag from all other layouts, set this one as default
- **Response:** Updated DocumentLayout object
- **Status Codes:** 200 (success), 404 (not found)

## Data Transfer Objects (DTOs)

### CreateCompanyProfileDto

**Required Fields:**

- `name` - string, not empty - Company name
- `email` - string, valid email format - Company email
- `phone` - string, not empty - Phone number
- `address` - string, not empty - Company address

**Optional Fields:**

- `nameEn` - string - English company name
- `addressEn` - string - English address
- `website` - string, valid URL format - Website URL
- `taxNumber` - string - Tax number
- `commercialRegister` - string - Commercial register number
- `logo` - string - Base64 encoded image or file path

### UpdateCompanyProfileDto

**Extends:** CreateCompanyProfileDto
**Note:** All fields are optional for updates, allowing partial updates

### CreateDocumentLayoutDto

**Required Fields:**

- `name` - string, not empty - Layout name
- `headerTemplate` - string, not empty - HTML header template
- `footerTemplate` - string, not empty - HTML footer template
- `margins` - MarginsDto object - Page margins
- `fontSize` - number, positive integer - Font size in pixels
- `fontFamily` - string - CSS font family
- `companyProfileId` - string, valid UUID - Related company profile

**Optional Fields:**

- `isDefault` - boolean - Whether this is the default layout

### UpdateDocumentLayoutDto

**Extends:** CreateDocumentLayoutDto
**Note:** All fields are optional for updates

### MarginsDto

**Required Fields:**

- `top` - number, non-negative - Top margin in pixels
- `bottom` - number, non-negative - Bottom margin in pixels
- `left` - number, non-negative - Left margin in pixels
- `right` - number, non-negative - Right margin in pixels

## Validation Rules

### Company Profile Validation

- Email must be valid email format and unique across the system
- Phone number should follow international format
- Website must be valid URL format if provided
- Logo should be validated for file size and format if uploaded
- Name fields must not contain special characters except spaces and hyphens

### Document Layout Validation

- Template fields must contain valid HTML
- Font size must be between 8 and 72 pixels
- Margins must be non-negative numbers
- Font family should be CSS-valid font family strings
- Only one layout can be set as default per company profile

## Template Variable System

### Supported Variables

The header and footer templates support the following placeholder variables:

**Company Information:**

- `{{COMPANY_NAME}}` - Company name (Arabic)
- `{{COMPANY_NAME_EN}}` - Company name (English)
- `{{COMPANY_EMAIL}}` - Company email address
- `{{COMPANY_PHONE}}` - Company phone number
- `{{COMPANY_ADDRESS}}` - Company address (Arabic)
- `{{COMPANY_ADDRESS_EN}}` - Company address (English)
- `{{COMPANY_WEBSITE}}` - Company website URL
- `{{COMPANY_LOGO}}` - Company logo image tag
- `{{TAX_NUMBER}}` - Tax registration number
- `{{COMMERCIAL_REGISTER}}` - Commercial register number

**Document Information:**

- `{{DOCUMENT_DATE}}` - Current date
- `{{DOCUMENT_NUMBER}}` - Document reference number
- `{{PAGE_NUMBER}}` - Current page number
- `{{TOTAL_PAGES}}` - Total number of pages

### Template Processing

- Variables should be replaced with actual values when generating documents
- Missing variables should be replaced with empty strings
- Logo variable should generate proper HTML img tag with base64 data or file path
- Date variables should be formatted according to locale (Arabic/English)

## Security Considerations

### Authentication & Authorization

- All endpoints require valid JWT authentication
- Users can only access their own company profiles and layouts
- Admin users may need additional permissions for system-wide operations

### Data Protection

- Logo uploads should be validated for file type and size
- HTML templates should be sanitized to prevent XSS attacks
- File uploads should be scanned for malicious content
- Sensitive data should be encrypted at rest

### Rate Limiting

- Implement rate limiting for file upload endpoints
- Protect against abuse of template creation endpoints
- Monitor for suspicious activity patterns

## Performance Optimization

### Database Optimization

- Index on companyProfileId in document_layouts table
- Index on email field in company_profiles table
- Index on isActive and isDefault fields for faster queries
- Consider pagination for layouts if users create many templates

### Caching Strategy

- Cache company profiles for faster document generation
- Cache default layouts to reduce database queries
- Implement Redis or similar for session management
- Consider CDN for logo image serving

## Error Handling

### HTTP Status Codes

- 200: Successful operation
- 201: Resource created successfully
- 400: Bad request (validation errors)
- 401: Unauthorized (invalid or missing token)
- 403: Forbidden (insufficient permissions)
- 404: Resource not found
- 409: Conflict (duplicate email, etc.)
- 500: Internal server error

### Error Response Format

All error responses should follow consistent JSON format:

- `error` - boolean, always true for errors
- `message` - string, user-friendly error message
- `code` - string, error code for client handling
- `details` - object, additional error information (validation errors, etc.)

## Integration Notes

### Frontend Integration

- Frontend should handle token refresh automatically
- Implement proper loading states for all API calls
- Cache profile data locally with proper invalidation
- Provide offline fallback for critical operations

### Document Generation Integration

- Profile data should be available to contract generation system
- Template variables should be processed during PDF generation
- Default layout should be automatically selected if none specified
- Company logo should be properly embedded in generated documents

## Migration Strategy

### Data Migration

- Provide migration scripts for existing localStorage data
- Implement data validation during migration
- Create backup procedures for profile data
- Plan for rollback scenarios

### API Versioning

- Implement API versioning from the start
- Plan for backward compatibility
- Document breaking changes clearly
- Provide migration guides for API updates

## Monitoring & Logging

### Application Monitoring

- Log all profile creation and updates
- Monitor API response times and error rates
- Track file upload success/failure rates
- Alert on unusual activity patterns

### Audit Trail

- Keep audit logs for profile changes
- Track who made what changes when
- Maintain history of template modifications
- Implement data retention policies

## Testing Requirements

### Unit Tests

- Test all DTO validations
- Test business logic in services
- Mock database operations
- Test error handling scenarios

### Integration Tests

- Test complete API workflows
- Test database transactions
- Test authentication and authorization
- Test file upload functionality

### End-to-End Tests

- Test profile creation workflow
- Test layout management workflow
- Test document generation with profiles
- Test error scenarios and recovery
