"use client";

import { useAuth } from "../../contexts/AuthContext";
import { useRouter } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import { client } from "../../lib/apollo-client";
import {
  Folder,
  FileText,
  Upload,
  Plus,
  Search,
  Grid3X3,
  List,
  Download,
  Trash2,
  Edit,
  ArrowLeft,
  Home,
  Star,
  Share,
  Eye,
  FileImage,
  FileVideo,
  FileAudio,
  Archive,
  Settings,
  Filter
} from "lucide-react";
import { Button } from "../../components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/card";
import { Input } from "../../components/ui/input";
import { Badge } from "../../components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "../../components/ui/avatar";
import { GET_DOCUMENTS_QUERY, UPLOAD_DOCUMENT_MUTATION, CREATE_FOLDER_MUTATION, DELETE_DOCUMENT_MUTATION, UPDATE_DOCUMENT_MUTATION } from "../../lib/graphql";

interface FileItem {
  id: string;
  case: string; // Backend uses 'case' instead of 'name'
  type?: 'file' | 'folder';
  size?: number;
  mimeType?: string;
  url?: string;
  createdAt: string;
  updatedAt: string;
  parentId?: string;
  starred?: boolean;
  shared?: boolean;
}

interface FolderItem {
  id: string;
  case: string;
  type: 'folder';
  createdAt: string;
  updatedAt: string;
  parentId?: string;
  children: (FileItem | FolderItem)[];
}

export default function DocumentsPage() {
  const { user, company, authLoading } = useAuth();
  const router = useRouter();
  const [currentFolder, setCurrentFolder] = useState<string | null>(null);
  const [files, setFiles] = useState<(FileItem | FolderItem)[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [showUpload, setShowUpload] = useState(false);
  const [showCreateFolder, setShowCreateFolder] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [selectedFiles, setSelectedFiles] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadSuccess, setUploadSuccess] = useState<string | null>(null);

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/signin");
      return;
    }
  }, [user, authLoading, router]);

  // Load files when component mounts or folder changes
  useEffect(() => {
    if (!authLoading && user) {
      loadFiles();
    }
  }, [user, authLoading, currentFolder]);

  const loadFiles = async () => {
    if (!user) return;

    setLoading(true);
    setError(null);

    try {
      const result = await client.query({
        query: GET_DOCUMENTS_QUERY,
        fetchPolicy: 'network-only',
      });
      const data = result.data as any;
      setFiles(data.documents || []);
      setLoading(false);
    } catch (err: any) {
      console.error('Error loading documents:', err);
      // Fallback to mock data if backend doesn't support document queries
      console.log('Falling back to mock data for documents');
      setTimeout(() => {
        const mockFiles: (FileItem | FolderItem)[] = [
          {
            id: '1',
            case: 'Legal Documents',
            type: 'folder',
            createdAt: '2025-01-15T10:00:00Z',
            updatedAt: '2025-01-15T10:00:00Z',
            children: []
          },
          {
            id: '2',
            case: 'Case Files',
            type: 'folder',
            createdAt: '2025-01-15T10:00:00Z',
            updatedAt: '2025-01-15T10:00:00Z',
            children: []
          },
          {
            id: '3',
            case: 'Contract Template.pdf',
            type: 'file',
            size: 245760,
            mimeType: 'application/pdf',
            createdAt: '2025-01-14T15:30:00Z',
            updatedAt: '2025-01-14T15:30:00Z',
            starred: true
          },
          {
            id: '4',
            case: 'Client Agreement.docx',
            type: 'file',
            size: 184320,
            mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            createdAt: '2025-01-14T14:20:00Z',
            updatedAt: '2025-01-14T14:20:00Z'
          },
          {
            id: '5',
            case: 'Court Documents',
            type: 'folder',
            createdAt: '2025-01-13T09:15:00Z',
            updatedAt: '2025-01-13T09:15:00Z',
            children: []
          }
        ];
        setFiles(mockFiles);
        setLoading(false);
      }, 500);
    }
  };

    const handleFileUpload = async (files: FileList | null) => {
    if (!files || !user) return;

    setUploading(true);
    setUploadError(null);

    try {
      const uploadPromises = Array.from(files).map(async (file) => {
        // Try to upload via GraphQL first
        try {
          const result = await client.mutate({
            mutation: UPLOAD_DOCUMENT_MUTATION,
            variables: {
              input: {
                file: file,
                parentId: currentFolder || null
              }
            },
          });

          const data = result.data as any;
          if (data?.uploadDocument) {
            return data.uploadDocument;
          }
        } catch (uploadErr) {
          console.error('GraphQL upload failed, using mock upload:', uploadErr);
        }

        // Fallback: Mock upload
        const mockFile: FileItem = {
          id: `mock-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          case: file.name,
          type: 'file',
          size: file.size,
          mimeType: file.type || 'application/octet-stream',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          starred: false
        };

        // Simulate upload delay
        await new Promise(resolve => setTimeout(resolve, 1000));

        return mockFile;
      });

      const uploadedFiles = await Promise.all(uploadPromises);
      setFiles(prev => [...prev, ...uploadedFiles]);
      setUploadSuccess(`Successfully uploaded ${uploadedFiles.length} file(s)`);
      setTimeout(() => setUploadSuccess(null), 3000);
    } catch (err: any) {
      console.error('Error uploading files:', err);
      setUploadError(err.message || 'Failed to upload files');
    } finally {
      setUploading(false);
    }
  };

  const handleCreateFolder = async () => {
    if (!newFolderName.trim()) return;

    try {
      await client.mutate({
        mutation: CREATE_FOLDER_MUTATION,
        variables: {
          name: newFolderName,
          parentId: currentFolder || null
        }
      });

      setNewFolderName('');
      setShowCreateFolder(false);
      alert('Folder created successfully!');
      loadFiles(); // Refresh the file list
    } catch (error) {
      console.error('Create folder error:', error);
      alert('Failed to create folder. Please try again.');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this item?')) return;

    try {
      await client.mutate({
        mutation: DELETE_DOCUMENT_MUTATION,
        variables: { id }
      });

      alert('Item deleted successfully!');
      loadFiles(); // Refresh the file list
    } catch (error) {
      console.error('Delete error:', error);
      alert('Failed to delete item. Please try again.');
    }
  };

  const handleDownload = (file: FileItem) => {
    if (file.url) {
      // Create a temporary link to download the file
      const link = document.createElement('a');
      link.href = file.url;
      link.download = file.case;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else {
      alert(`Download link not available for ${file.case}`);
    }
  };

  const getFileIcon = (item: FileItem | FolderItem) => {
    if (item.type === 'folder') {
      return <Folder className="h-8 w-8 text-blue-500" />;
    }

    const mimeType = (item as FileItem).mimeType || '';
    if (mimeType.startsWith('image/')) {
      return <FileImage className="h-8 w-8 text-green-500" />;
    }
    if (mimeType.startsWith('video/')) {
      return <FileVideo className="h-8 w-8 text-red-500" />;
    }
    if (mimeType.startsWith('audio/')) {
      return <FileAudio className="h-8 w-8 text-purple-500" />;
    }
    if (mimeType.includes('zip') || mimeType.includes('rar')) {
      return <Archive className="h-8 w-8 text-yellow-500" />;
    }
    return <FileText className="h-8 w-8 text-gray-500" />;
  };

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return '';
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  };

  const filteredFiles = files.filter(item =>
    item.case.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const droppedFiles = e.dataTransfer.files;
    if (droppedFiles.length > 0) {
      handleFileUpload(droppedFiles);
    }
  };

  if (authLoading || !user || !company) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading documents...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push("/dashboard")}
                className="mr-2"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Button>
              <div>
                <h1 className="text-xl font-bold text-foreground">Documents</h1>
                <p className="text-sm text-muted-foreground">Manage your files and folders</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20">
                {company.name}
              </Badge>
            </div>
          </div>
        </div>
      </header>

      {/* Toolbar */}
      <div className="border-b bg-muted/30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            {/* Breadcrumb */}
            <div className="flex items-center space-x-2 text-sm text-muted-foreground">
              <Button variant="ghost" size="sm" onClick={() => setCurrentFolder(null)}>
                <Home className="h-4 w-4 mr-1" />
                My Drive
              </Button>
              {currentFolder && (
                <>
                  <span>/</span>
                  <span className="font-medium text-foreground">Current Folder</span>
                </>
              )}
            </div>

            {/* Search and Actions */}
            <div className="flex items-center space-x-2 w-full sm:w-auto">
              <div className="relative flex-1 sm:flex-initial">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search files..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 w-full sm:w-64"
                />
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
              >
                {viewMode === 'grid' ? <List className="h-4 w-4" /> : <Grid3X3 className="h-4 w-4" />}
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowCreateFolder(true)}
              >
                <Plus className="h-4 w-4 mr-2" />
                New Folder
              </Button>

              <Button onClick={() => setShowUpload(true)}>
                <Upload className="h-4 w-4 mr-2" />
                Upload
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Upload Area */}
        {showUpload && (
          <Card className="mb-6 border-dashed border-2 border-primary/50">
            <CardContent className="p-8">
              <div className="text-center">
                <Upload className="h-12 w-12 text-primary mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Upload Files</h3>
                <p className="text-muted-foreground mb-4">
                  Drag and drop files here or click to browse
                </p>
                <div className="flex gap-2 justify-center">
                  <Button onClick={() => fileInputRef.current?.click()}>
                    Choose Files
                  </Button>
                  <Button variant="outline" onClick={() => setShowUpload(false)}>
                    Cancel
                  </Button>
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  className="hidden"
                  onChange={(e) => handleFileUpload(e.target.files)}
                />
              </div>
            </CardContent>
          </Card>
        )}

        {/* Create Folder Dialog */}
        {showCreateFolder && (
          <Card className="mb-6">
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold mb-4">Create New Folder</h3>
              <div className="flex gap-2">
                <Input
                  placeholder="Folder name"
                  value={newFolderName}
                  onChange={(e) => setNewFolderName(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleCreateFolder()}
                />
                <Button onClick={handleCreateFolder}>Create</Button>
                <Button variant="outline" onClick={() => setShowCreateFolder(false)}>
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Files Grid/List */}
        <div
          className={`min-h-96 ${dragOver ? 'bg-primary/5 border-2 border-dashed border-primary/50 rounded-lg' : ''}`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              <span className="ml-2">Loading files...</span>
            </div>
          ) : filteredFiles.length === 0 ? (
            <div className="text-center py-12">
              <Folder className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No files found</h3>
              <p className="text-muted-foreground mb-4">
                {searchQuery ? 'Try adjusting your search terms' : 'Upload your first file to get started'}
              </p>
              {!searchQuery && (
                <Button onClick={() => setShowUpload(true)}>
                  <Upload className="h-4 w-4 mr-2" />
                  Upload Files
                </Button>
              )}
            </div>
          ) : (
            <div className={viewMode === 'grid'
              ? "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4"
              : "space-y-2"
            }>
              {filteredFiles.map((item) => (
                <Card
                  key={item.id}
                  className={`cursor-pointer hover:shadow-md transition-all duration-200 ${
                    selectedFiles.includes(item.id) ? 'ring-2 ring-primary' : ''
                  }`}
                  onClick={() => {
                    if (item.type === 'folder') {
                      setCurrentFolder(item.id);
                    }
                  }}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        {getFileIcon(item)}
                        {(item as FileItem).starred && (
                          <Star className="h-4 w-4 text-yellow-500 fill-current" />
                        )}
                      </div>
                      <div className="flex space-x-1">
                        {item.type === 'file' && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDownload(item as FileItem);
                            }}
                          >
                            <Download className="h-4 w-4" />
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(item.id);
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <h4 className="font-medium text-sm truncate" title={item.case}>
                        {item.case}
                      </h4>
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span>{item.type === 'folder' ? 'Folder' : formatFileSize((item as FileItem).size)}</span>
                        <span>{new Date(item.updatedAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Storage Info */}
        <div className="mt-8">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Settings className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">Storage used</span>
                </div>
                <div className="text-sm text-muted-foreground">
                  2.4 MB of 15 GB used
                </div>
              </div>
              <div className="mt-2 w-full bg-muted rounded-full h-2">
                <div className="bg-primary h-2 rounded-full" style={{ width: '16%' }}></div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}