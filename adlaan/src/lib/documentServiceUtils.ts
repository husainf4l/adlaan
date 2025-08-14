// Utility to manually set document service tokens
// Use this in browser console if needed

import { documentService } from '@/services/documentService';

// Your fresh tokens from Google auth
const FRESH_TOKENS = {
  accessToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJjbWVhYnNxYjEwMDAwM3NhOGJxZW54MjB3IiwiaWF0IjoxNzU1MTE5ODEzLCJleHAiOjE3NTUyMDYyMTN9.y4W5B0ljaCn8pBFQV5XyO69j_9tBbYAXMPJp_dECUp8',
  refreshToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJjbWVhYnNxYjEwMDAwM3NhOGJxZW54MjB3IiwiaWF0IjoxNzU1MTE5ODEzLCJleHAiOjE3NTU3MjQ2MTN9.35w3atDqrexcgxpzQtnvhbvGr7A0Wj97WDFPybtaKuA'
};

// Function to update document service tokens manually
export function updateDocumentServiceTokens() {
  documentService.setTokens(FRESH_TOKENS.accessToken, FRESH_TOKENS.refreshToken);
  console.log('✅ Document service tokens updated!');
}

// Function to test API connection
export async function testDocumentAPI() {
  try {
    const result = await documentService.testConnection();
    console.log('🧪 API Test Result:', result);
    return result;
  } catch (error) {
    console.error('🚨 API Test Error:', error);
    return { success: false, message: error instanceof Error ? error.message : 'Unknown error' };
  }
}

// Function to get root documents
export async function getRootDocuments() {
  try {
    const items = await documentService.getRootItems();
    console.log('📁 Root documents:', items);
    return items;
  } catch (error) {
    console.error('🚨 Error getting root documents:', error);
    throw error;
  }
}

// Function to debug a specific document
export async function debugDocument(documentId: string) {
  try {
    const result = await documentService.debugGetDocument(documentId);
    console.log('🔍 Debug Document Result:', result);
    return result;
  } catch (error) {
    console.error('🚨 Debug Document Error:', error);
    throw error;
  }
}

// Function to open a document in view page
export function openDocumentView(documentId: string) {
  const url = `/dashboard/documents/view/${documentId}`;
  console.log(`🔗 Opening document view: ${url}`);
  if (typeof window !== 'undefined') {
    window.open(url, '_blank');
  }
}

// Function to test PDF preview with different viewers
export async function testPdfPreview(documentId: string = 'cmeahbrfg00013sm04of3sug9') {
  try {
    console.log('🧪 Testing PDF preview options...');
    const result = await debugDocument(documentId);
    const doc = result.transformed;
    
    if (doc.type === 'file' && doc.mimeType === 'application/pdf') {
      const previewUrl = doc.previewUrl || doc.downloadUrl;
      
      console.log('📄 PDF Preview Options:');
      console.log('1. Direct URL:', previewUrl);
      console.log('2. PDF.js viewer:', `https://mozilla.github.io/pdf.js/web/viewer.html?file=${encodeURIComponent(previewUrl || '')}`);
      console.log('3. Google Docs viewer:', `https://docs.google.com/viewer?url=${encodeURIComponent(previewUrl || '')}&embedded=true`);
      console.log('4. Document view page:', `/dashboard/documents/view/${documentId}`);
      
      // Open the improved view page
      openDocumentView(documentId);
      
      return {
        document: doc,
        previewOptions: {
          direct: previewUrl,
          pdfjs: `https://mozilla.github.io/pdf.js/web/viewer.html?file=${encodeURIComponent(previewUrl || '')}`,
          google: `https://docs.google.com/viewer?url=${encodeURIComponent(previewUrl || '')}&embedded=true`,
          viewPage: `/dashboard/documents/view/${documentId}`
        }
      };
    } else {
      console.warn('⚠️ Document is not a PDF file');
      return null;
    }
  } catch (error) {
    console.error('🚨 PDF Preview Test Error:', error);
    throw error;
  }
}

// Function to test the specific PDF document
export async function testPdfDocument() {
  const pdfId = 'cmeahbrfg00013sm04of3sug9';
  try {
    console.log('🧪 Testing PDF document...');
    const result = await debugDocument(pdfId);
    console.log('📄 PDF Document Details:', result.transformed);
    openDocumentView(pdfId);
    return result;
  } catch (error) {
    console.error('🚨 PDF Test Error:', error);
    throw error;
  }
}

// Function to test drag and drop functionality
export function testDragDrop() {
  console.log('🎯 Drag and Drop Test Instructions:');
  console.log('1. Go to /dashboard/documents');
  console.log('2. Create a test folder if you don\'t have one');
  console.log('3. Try dragging a document onto a folder');
  console.log('4. Look for visual feedback (blue highlighting)');
  console.log('5. Drop the document to move it');
  console.log('✨ Features:');
  console.log('- Drag any file or folder');
  console.log('- Drop on folders to move items');
  console.log('- Visual feedback with blue highlighting');
  console.log('- "إسقاط هنا" (Drop here) indicator');
  if (typeof window !== 'undefined') {
    window.open('/dashboard/documents', '_blank');
  }
}

// Make functions available globally for testing in console
if (typeof window !== 'undefined') {
  (window as any).updateDocumentServiceTokens = updateDocumentServiceTokens;
  (window as any).testDocumentAPI = testDocumentAPI;
  (window as any).getRootDocuments = getRootDocuments;
  (window as any).debugDocument = debugDocument;
  (window as any).openDocumentView = openDocumentView;
  (window as any).testPdfPreview = testPdfPreview;
  (window as any).testPdfDocument = testPdfDocument;
  (window as any).testDragDrop = testDragDrop;
  console.log('🛠️ Document service utilities available:');
  console.log('- updateDocumentServiceTokens()');
  console.log('- testDocumentAPI()');
  console.log('- getRootDocuments()');
  console.log('- debugDocument("cmeahbrfg00013sm04of3sug9")');
  console.log('- openDocumentView("cmeahbrfg00013sm04of3sug9")');
  console.log('- testPdfPreview("cmeahbrfg00013sm04of3sug9")');
  console.log('- testPdfDocument()');
  console.log('- testDragDrop() 🎯');
}
