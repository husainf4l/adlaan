import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

@Injectable()
export class AwsS3Service {
  private s3Client: S3Client;
  private bucketName: string;

  constructor() {
    if (!process.env.AWS_REGION || !process.env.AWS_ACCESS_KEY_ID || !process.env.AWS_SECRET_ACCESS_KEY || !process.env.AWS_BUCKET_NAME) {
      throw new Error('AWS configuration is missing. Please check your environment variables.');
    }

    this.s3Client = new S3Client({
      region: process.env.AWS_REGION,
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      },
    });
    this.bucketName = process.env.AWS_BUCKET_NAME;
  }

  /**
   * Generate a UUID using dynamic import to avoid ES module issues
   * @returns A UUID string
   */
  private async generateUUID(): Promise<string> {
    const { v4: uuidv4 } = await import('uuid');
    return uuidv4();
  }

  /**
   * Upload a legal document to S3
   * @param file - Buffer containing the file data
   * @param originalName - Original filename
   * @param caseId - Optional case ID for organization
   * @param documentType - Type of document (contract, pleading, evidence, etc.)
   * @returns S3 URL of the uploaded file
   */
  async uploadDocument(
    file: Buffer, 
    originalName: string, 
    caseId?: number, 
    documentType?: string
  ): Promise<string> {
    try {
      // Sanitize original filename and generate unique filename
      const sanitizedName = this.sanitizeFilename(originalName);
      const fileExtension = sanitizedName.split('.').pop() || 'pdf';
      const baseFileName = sanitizedName.replace(/\.[^/.]+$/, ''); // Remove extension
      
      // Organize by document type and case
      const folder = documentType ? `documents/${documentType}` : 'documents';
      const caseFolder = caseId ? `/case-${caseId}` : '/general';
      const uuid = await this.generateUUID();
      const fileName = `${folder}${caseFolder}/${uuid}-${baseFileName}.${fileExtension}`;

      console.log('☁️ Uploading document to S3:', fileName);

      const command = new PutObjectCommand({
        Bucket: this.bucketName,
        Key: fileName,
        Body: file,
        ContentType: this.getContentType(fileExtension),
        Metadata: {
          originalName,
          caseId: caseId?.toString() || 'none',
          documentType: documentType || 'general',
          uploadedAt: new Date().toISOString(),
        },
      });

      await this.s3Client.send(command);

      // Return the S3 URL
      const s3Url = `https://${this.bucketName}.s3.${process.env.AWS_REGION}.amazonaws.com/${fileName}`;
      console.log('✅ Document uploaded to S3:', s3Url);

      return s3Url;
    } catch (error) {
      console.error('❌ Failed to upload document to S3:', error);
      throw new InternalServerErrorException('Failed to upload document to S3');
    }
  }

  /**
   * Upload any file to S3 with custom folder
   */
  async uploadFile(file: Buffer, fileName: string, folder: string = 'files'): Promise<string> {
    try {
      // Sanitize filename to remove spaces and special characters
      const sanitizedFileName = this.sanitizeFilename(fileName);
      const uuid = await this.generateUUID();
      const key = `${folder}/${uuid}-${sanitizedFileName}`;

      // Determine content type from file extension
      const fileExtension = sanitizedFileName.split('.').pop()?.toLowerCase() || '';
      const contentType = this.getContentType(fileExtension);

      console.log('☁️ Uploading file to S3:', key);

      const command = new PutObjectCommand({
        Bucket: this.bucketName,
        Key: key,
        Body: file,
        ContentType: contentType,
        Metadata: {
          originalName: fileName,
          uploadedAt: new Date().toISOString(),
        },
      });

      await this.s3Client.send(command);

      // Return the S3 URL
      const s3Url = `https://${this.bucketName}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`;
      console.log('✅ File uploaded to S3:', s3Url);

      return s3Url;
    } catch (error) {
      console.error('❌ Failed to upload file to S3:', error);
      throw new InternalServerErrorException('Failed to upload file to S3');
    }
  }

  /**
   * Download a file from S3 as a Buffer
   */
  async getFileBuffer(s3Url: string): Promise<Buffer> {
    try {
      // Extract key from S3 URL
      const key = this.extractKeyFromUrl(s3Url);

      console.log('📥 Downloading file from S3:', key);

      const command = new GetObjectCommand({
        Bucket: this.bucketName,
        Key: key,
      });

      const response = await this.s3Client.send(command);

      if (!response.Body) {
        throw new Error('Empty response body');
      }

      // Convert stream to buffer
      const chunks: Buffer[] = [];
      const stream = response.Body as any;

      for await (const chunk of stream) {
        chunks.push(chunk);
      }

      const buffer = Buffer.concat(chunks);
      console.log('✅ File downloaded from S3, size:', buffer.length, 'bytes');

      return buffer;
    } catch (error) {
      console.error('❌ Failed to download file from S3:', error);
      throw new InternalServerErrorException(`Failed to download file from S3: ${error.message}`);
    }
  }

  /**
   * Generate a presigned URL for temporary file access
   * @param s3Url - S3 URL of the file
   * @param expiresIn - Expiration time in seconds (default 1 hour)
   * @returns Presigned URL
   */
  async generatePresignedUrl(s3Url: string, expiresIn: number = 3600): Promise<string> {
    try {
      const key = this.extractKeyFromUrl(s3Url);

      const command = new GetObjectCommand({
        Bucket: this.bucketName,
        Key: key,
      });

      const presignedUrl = await getSignedUrl(this.s3Client, command, {
        expiresIn, // Default 1 hour
      });

      console.log('🔗 Generated presigned URL for:', key);
      return presignedUrl;
    } catch (error) {
      console.error('❌ Failed to generate presigned URL:', error);
      throw new InternalServerErrorException('Failed to generate presigned URL');
    }
  }

  /**
   * Delete a file from S3
   */
  async deleteFile(s3Url: string): Promise<void> {
    try {
      const key = this.extractKeyFromUrl(s3Url);

      console.log('🗑️ Deleting file from S3:', key);

      const command = new DeleteObjectCommand({
        Bucket: this.bucketName,
        Key: key,
      });

      await this.s3Client.send(command);
      console.log('✅ File deleted from S3:', key);
    } catch (error) {
      console.error('❌ Failed to delete file from S3:', error);
      throw new InternalServerErrorException('Failed to delete file from S3');
    }
  }

  /**
   * Extract S3 key from full S3 URL
   */
  extractKeyFromUrl(s3Url: string): string {
    // Extract key from S3 URL
    // Format: https://bucket-name.s3.region.amazonaws.com/key
    const url = new URL(s3Url);
    return url.pathname.substring(1); // Remove leading slash
  }

  /**
   * Sanitize filename by removing/replacing spaces and special characters
   * Ensures S3 URLs are valid and don't require URL encoding
   */
  private sanitizeFilename(filename: string): string {
    // Remove leading/trailing spaces
    let sanitized = filename.trim();
    
    // Replace spaces with hyphens
    sanitized = sanitized.replace(/\s+/g, '-');
    
    // Remove special characters except dots, hyphens, and underscores
    sanitized = sanitized.replace(/[^a-zA-Z0-9.-_]/g, '');
    
    // Replace multiple consecutive hyphens with a single hyphen
    sanitized = sanitized.replace(/-+/g, '-');
    
    // Remove leading/trailing hyphens
    sanitized = sanitized.replace(/^-+|-+$/g, '');
    
    // Ensure filename is not empty
    if (!sanitized || sanitized === '.') {
      sanitized = `file-${Date.now()}`;
    }
    
    console.log(`📝 Sanitized filename: "${filename}" → "${sanitized}"`);
    
    return sanitized;
  }

  /**
   * Get MIME content type based on file extension
   */
  private getContentType(fileExtension: string): string {
    const extension = fileExtension?.toLowerCase();
    switch (extension) {
      // Documents
      case 'pdf':
        return 'application/pdf';
      case 'doc':
        return 'application/msword';
      case 'docx':
        return 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
      case 'txt':
        return 'text/plain';
      case 'rtf':
        return 'application/rtf';
      case 'odt':
        return 'application/vnd.oasis.opendocument.text';
      
      // Images
      case 'jpg':
      case 'jpeg':
        return 'image/jpeg';
      case 'png':
        return 'image/png';
      case 'gif':
        return 'image/gif';
      case 'webp':
        return 'image/webp';
      case 'svg':
        return 'image/svg+xml';
      case 'bmp':
        return 'image/bmp';
      
      // Spreadsheets
      case 'xls':
        return 'application/vnd.ms-excel';
      case 'xlsx':
        return 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
      
      // Archives
      case 'zip':
        return 'application/zip';
      case 'rar':
        return 'application/x-rar-compressed';
      
      default:
        return 'application/octet-stream';
    }
  }

  /**
   * Check if a URL is an S3 URL
   */
  isS3Url(url: string): boolean {
    return url.includes('amazonaws.com') || url.includes('s3.');
  }
}
