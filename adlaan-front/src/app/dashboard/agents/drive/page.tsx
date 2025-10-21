"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../../../components/ui/card';
import { Button } from '../../../../components/ui/button';
import { Badge } from '../../../../components/ui/badge';
import { Input } from '../../../../components/ui/input';
import { 
  Folder, 
  FileText, 
  Upload, 
  Download, 
  Search, 
  ArrowLeft,
  Plus,
  Grid,
  List,
  Share,
  MoreHorizontal,
  Star,
  Clock,
  Filter,
  FolderOpen,
  File,
  Image,
  FileSpreadsheet
} from 'lucide-react';
import Link from 'next/link';

interface DriveItem {
  id: string;
  name: string;
  type: 'folder' | 'document' | 'image' | 'spreadsheet' | 'other';
  size?: string;
  modified: Date;
  classification?: string;
  parentFolder?: string;
  isStarred: boolean;
  sharedWith?: string[];
}

interface FolderStructure {
  [key: string]: {
    name: string;
    description: string;
    color: string;
    icon: any;
  };
}

export default function DrivePage() {
  const [items, setItems] = useState<DriveItem[]>([]);
  const [currentFolder, setCurrentFolder] = useState<string>('root');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchTerm, setSearchTerm] = useState('');
  const [breadcrumbs, setBreadcrumbs] = useState<string[]>(['Drive']);

  const folderStructure: FolderStructure = {
    contracts: {
      name: 'Contracts',
      description: 'Employment, service, and partnership contracts',
      color: 'bg-blue-100 text-blue-800',
      icon: FileText
    },
    agreements: {
      name: 'Agreements',
      description: 'NDAs, licensing, and collaboration agreements',
      color: 'bg-green-100 text-green-800',
      icon: FileText
    },
    legal_documents: {
      name: 'Legal Documents',
      description: 'Court filings, legal briefs, and official documents',
      color: 'bg-purple-100 text-purple-800',
      icon: FileText
    },
    research: {
      name: 'Legal Research',
      description: 'Case studies, legal precedents, and research materials',
      color: 'bg-orange-100 text-orange-800',
      icon: Search
    },
    policies: {
      name: 'Policies & Procedures',
      description: 'Company policies, procedures, and guidelines',
      color: 'bg-red-100 text-red-800',
      icon: FileText
    },
    templates: {
      name: 'Document Templates',
      description: 'Reusable templates for common legal documents',
      color: 'bg-yellow-100 text-yellow-800',
      icon: FileText
    },
    archived: {
      name: 'Archived Documents',
      description: 'Completed cases and historical documents',
      color: 'bg-gray-100 text-gray-800',
      icon: FolderOpen
    }
  };

  useEffect(() => {
    // Initialize with sample data
    const sampleItems: DriveItem[] = [
      // Root folders (auto-created by classifier)
      {
        id: 'contracts',
        name: 'Contracts',
        type: 'folder',
        modified: new Date(),
        isStarred: true,
        classification: 'auto'
      },
      {
        id: 'agreements',
        name: 'Agreements', 
        type: 'folder',
        modified: new Date(),
        isStarred: false,
        classification: 'auto'
      },
      {
        id: 'legal_documents',
        name: 'Legal Documents',
        type: 'folder',
        modified: new Date(),
        isStarred: false,
        classification: 'auto'
      },
      {
        id: 'research',
        name: 'Legal Research',
        type: 'folder',
        modified: new Date(),
        isStarred: true,
        classification: 'auto'
      },
      {
        id: 'policies',
        name: 'Policies & Procedures',
        type: 'folder',
        modified: new Date(),
        isStarred: false,
        classification: 'auto'
      },
      {
        id: 'templates',
        name: 'Document Templates',
        type: 'folder',
        modified: new Date(),
        isStarred: true,
        classification: 'auto'
      },
      {
        id: 'archived',
        name: 'Archived Documents',
        type: 'folder',
        modified: new Date(),
        isStarred: false,
        classification: 'auto'
      },
      // Sample documents in root
      {
        id: 'doc1',
        name: 'Employment Agreement - Tech Corp.pdf',
        type: 'document',
        size: '2.4 MB',
        modified: new Date(Date.now() - 1000 * 60 * 30),
        isStarred: false,
        classification: 'contract',
        parentFolder: 'contracts'
      },
      {
        id: 'doc2',
        name: 'NDA Template - Standard.docx',
        type: 'document',
        size: '156 KB',
        modified: new Date(Date.now() - 1000 * 60 * 60 * 2),
        isStarred: true,
        classification: 'agreement',
        parentFolder: 'agreements'
      },
      {
        id: 'doc3',
        name: 'Legal Research - IP Rights.pdf',
        type: 'document',
        size: '1.8 MB',
        modified: new Date(Date.now() - 1000 * 60 * 45),
        isStarred: false,
        classification: 'research',
        parentFolder: 'research'
      }
    ];
    setItems(sampleItems);
  }, []);

  const filteredItems = items.filter(item => {
    const inCurrentFolder = currentFolder === 'root' ? 
      !item.parentFolder || item.type === 'folder' : 
      item.parentFolder === currentFolder;
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase());
    return inCurrentFolder && matchesSearch;
  });

  const getFileIcon = (type: DriveItem['type']) => {
    switch (type) {
      case 'folder': return Folder;
      case 'document': return FileText;
      case 'image': return Image;
      case 'spreadsheet': return FileSpreadsheet;
      default: return File;
    }
  };

  const handleFolderClick = (folderId: string, folderName: string) => {
    if (folderId in folderStructure || items.find(i => i.id === folderId && i.type === 'folder')) {
      setCurrentFolder(folderId);
      setBreadcrumbs([...breadcrumbs, folderName]);
    }
  };

  const navigateBack = () => {
    if (breadcrumbs.length > 1) {
      const newBreadcrumbs = breadcrumbs.slice(0, -1);
      setBreadcrumbs(newBreadcrumbs);
      
      if (newBreadcrumbs.length === 1) {
        setCurrentFolder('root');
      } else {
        // Navigate to parent folder logic
        setCurrentFolder('root'); // Simplified for now
      }
    }
  };

  const toggleStar = (itemId: string) => {
    setItems(prev => prev.map(item => 
      item.id === itemId ? { ...item, isStarred: !item.isStarred } : item
    ));
  };

  const handleFileUpload = () => {
    // Simulate file upload that will be processed by doc classifier
    const newFile: DriveItem = {
      id: Date.now().toString(),
      name: 'New Document.pdf',
      type: 'document',
      size: '1.2 MB',
      modified: new Date(),
      isStarred: false,
      classification: 'pending' // Will be classified by AI
    };
    setItems(prev => [newFile, ...prev]);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <Link href="/dashboard/agents">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Agents
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-bold">Document Drive</h1>
              <p className="text-muted-foreground">AI-organized legal document storage</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Button onClick={handleFileUpload} className="bg-blue-600 hover:bg-blue-700">
              <Upload className="w-4 h-4 mr-2" />
              Upload
            </Button>
            <Button variant="outline">
              <Plus className="w-4 h-4 mr-2" />
              New Folder
            </Button>
          </div>
        </div>

        {/* Breadcrumbs */}
        <div className="flex items-center space-x-2 mb-4 text-sm text-muted-foreground">
          {breadcrumbs.map((crumb, index) => (
            <div key={index} className="flex items-center">
              {index > 0 && <span className="mx-2">/</span>}
              <button 
                onClick={() => index === 0 ? setCurrentFolder('root') : navigateBack()}
                className="hover:text-foreground"
              >
                {crumb}
              </button>
            </div>
          ))}
        </div>

        {/* Search and View Controls */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search in Drive"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-80"
              />
            </div>
            <Button variant="outline" size="sm">
              <Filter className="w-4 h-4 mr-2" />
              Filter
            </Button>
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant={viewMode === 'grid' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('grid')}
            >
              <Grid className="w-4 h-4" />
            </Button>
            <Button
              variant={viewMode === 'list' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('list')}
            >
              <List className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Classification Info */}
        <Card className="mb-6 border-blue-200 bg-blue-50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium text-blue-900">AI Document Classification Active</h3>
                <p className="text-sm text-blue-700">
                  Documents are automatically organized into folders by our Document Classifier agent
                </p>
              </div>
              <Badge className="bg-blue-100 text-blue-800">
                Auto-Organizing
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Grid View */}
        {viewMode === 'grid' && (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {filteredItems.map((item) => {
              const IconComponent = getFileIcon(item.type);
              const folderInfo = item.type === 'folder' ? folderStructure[item.id] : null;
              
              return (
                <Card 
                  key={item.id} 
                  className="hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => item.type === 'folder' ? handleFolderClick(item.id, item.name) : null}
                >
                  <CardContent className="p-4">
                    <div className="flex flex-col items-center text-center space-y-2">
                      <div className={`p-3 rounded-lg ${folderInfo?.color || 'bg-gray-100'}`}>
                        <IconComponent className="w-8 h-8" />
                      </div>
                      <div className="w-full">
                        <p className="font-medium text-sm truncate">{item.name}</p>
                        {item.size && (
                          <p className="text-xs text-muted-foreground">{item.size}</p>
                        )}
                        {folderInfo?.description && (
                          <p className="text-xs text-muted-foreground mt-1">
                            {folderInfo.description}
                          </p>
                        )}
                      </div>
                      <div className="flex items-center justify-between w-full">
                        <div className="flex items-center space-x-1">
                          {item.classification === 'auto' && (
                            <Badge variant="outline" className="text-xs">AI</Badge>
                          )}
                          {item.isStarred && (
                            <Star className="w-3 h-3 text-yellow-500 fill-current" />
                          )}
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0"
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleStar(item.id);
                          }}
                        >
                          <MoreHorizontal className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        {/* List View */}
        {viewMode === 'list' && (
          <Card>
            <CardContent className="p-0">
              <div className="space-y-0">
                {filteredItems.map((item) => {
                  const IconComponent = getFileIcon(item.type);
                  const folderInfo = item.type === 'folder' ? folderStructure[item.id] : null;
                  
                  return (
                    <div 
                      key={item.id}
                      className="flex items-center justify-between p-4 hover:bg-muted/50 cursor-pointer border-b last:border-b-0"
                      onClick={() => item.type === 'folder' ? handleFolderClick(item.id, item.name) : null}
                    >
                      <div className="flex items-center space-x-4 flex-1">
                        <div className={`p-2 rounded ${folderInfo?.color || 'bg-gray-100'}`}>
                          <IconComponent className="w-5 h-5" />
                        </div>
                        <div className="flex-1">
                          <p className="font-medium">{item.name}</p>
                          {folderInfo?.description && (
                            <p className="text-sm text-muted-foreground">{folderInfo.description}</p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center space-x-4">
                        {item.classification === 'auto' && (
                          <Badge variant="outline" className="text-xs">AI Classified</Badge>
                        )}
                        {item.size && (
                          <span className="text-sm text-muted-foreground">{item.size}</span>
                        )}
                        <span className="text-sm text-muted-foreground">
                          {item.modified.toLocaleDateString()}
                        </span>
                        <div className="flex items-center space-x-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0"
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleStar(item.id);
                            }}
                          >
                            <Star className={`w-4 h-4 ${item.isStarred ? 'text-yellow-500 fill-current' : 'text-gray-400'}`} />
                          </Button>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                            <Share className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        )}

        {filteredItems.length === 0 && (
          <div className="text-center py-12">
            <Folder className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">
              {searchTerm ? 'No files found' : 'This folder is empty'}
            </h3>
            <p className="text-muted-foreground mb-4">
              {searchTerm ? 'Try adjusting your search terms' : 'Upload documents to get started with AI classification'}
            </p>
            <Button onClick={handleFileUpload}>
              <Upload className="w-4 h-4 mr-2" />
              Upload Documents
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}