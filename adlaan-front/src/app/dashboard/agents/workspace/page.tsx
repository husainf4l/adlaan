"use client";

import { useState, useEffect } from 'react';
import { DashboardLayout } from '../../../../components/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '../../../../components/ui/card';
import { Button } from '../../../../components/ui/button';
import { Badge } from '../../../../components/ui/badge';
import { Input } from '../../../../components/ui/input';
import { 
  FileText, 
  Upload, 
  Download, 
  Search, 
  Filter,
  ArrowLeft,
  Eye,
  Trash2,
  Plus,
  Bot,
  Clock,
  CheckCircle
} from 'lucide-react';
import Link from 'next/link';

interface WorkspaceItem {
  id: string;
  name: string;
  type: 'document' | 'template' | 'analysis' | 'generated';
  size: string;
  modified: Date;
  status: 'completed' | 'processing' | 'pending' | 'error';
  agent?: string;
}

export default function WorkspacePage() {
  const [items, setItems] = useState<WorkspaceItem[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');

  useEffect(() => {
    // Initialize with sample workspace items
    const sampleItems: WorkspaceItem[] = [
      {
        id: '1',
        name: 'Employment Contract - Tech Startup.pdf',
        type: 'document',
        size: '2.4 MB',
        modified: new Date(Date.now() - 1000 * 60 * 30),
        status: 'completed',
        agent: 'documentAnalyzer'
      },
      {
        id: '2',
        name: 'NDA Template - Standard.docx',
        type: 'template',
        size: '156 KB',
        modified: new Date(Date.now() - 1000 * 60 * 60 * 2),
        status: 'completed',
        agent: 'documentGenerator'
      },
      {
        id: '3',
        name: 'Legal Risk Analysis Report.pdf',
        type: 'analysis',
        size: '1.8 MB',
        modified: new Date(Date.now() - 1000 * 60 * 45),
        status: 'completed',
        agent: 'legalAssistant'
      },
      {
        id: '4',
        name: 'Service Agreement - Draft.pdf',
        type: 'generated',
        size: '890 KB',
        modified: new Date(Date.now() - 1000 * 60 * 15),
        status: 'processing',
        agent: 'documentGenerator'
      },
      {
        id: '5',
        name: 'Contract Review Summary.md',
        type: 'analysis',
        size: '45 KB',
        modified: new Date(Date.now() - 1000 * 60 * 60),
        status: 'completed',
        agent: 'contractReviewer'
      }
    ];
    setItems(sampleItems);
  }, []);

  const filteredItems = items.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterType === 'all' || item.type === filterType;
    return matchesSearch && matchesFilter;
  });

  const getTypeIcon = (type: WorkspaceItem['type']) => {
    switch (type) {
      case 'document': return <FileText className="w-4 h-4 text-blue-500" />;
      case 'template': return <FileText className="w-4 h-4 text-green-500" />;
      case 'analysis': return <Search className="w-4 h-4 text-purple-500" />;
      case 'generated': return <Bot className="w-4 h-4 text-orange-500" />;
      default: return <FileText className="w-4 h-4" />;
    }
  };

  const getStatusIcon = (status: WorkspaceItem['status']) => {
    switch (status) {
      case 'completed': return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'processing': return <Clock className="w-4 h-4 text-yellow-500" />;
      case 'pending': return <Clock className="w-4 h-4 text-gray-500" />;
      case 'error': return <Clock className="w-4 h-4 text-red-500" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  const getStatusColor = (status: WorkspaceItem['status']) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'processing': return 'bg-yellow-100 text-yellow-800';
      case 'pending': return 'bg-gray-100 text-gray-800';
      case 'error': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatFileType = (type: WorkspaceItem['type']) => {
    switch (type) {
      case 'document': return 'Document';
      case 'template': return 'Template';
      case 'analysis': return 'Analysis';
      case 'generated': return 'Generated';
      default: return type;
    }
  };

  const handleFileUpload = () => {
    // Simulate file upload
    const newItem: WorkspaceItem = {
      id: Date.now().toString(),
      name: 'New Document.pdf',
      type: 'document',
      size: '1.2 MB',
      modified: new Date(),
      status: 'pending'
    };
    setItems(prev => [newItem, ...prev]);
  };

  return (
    <DashboardLayout>
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
              <h1 className="text-2xl font-bold">Agent Workspace</h1>
              <p className="text-muted-foreground">Manage documents and AI-generated content</p>
            </div>
          </div>
          <Button onClick={handleFileUpload}>
            <Upload className="w-4 h-4 mr-2" />
            Upload Document
          </Button>
        </div>

        {/* Filters and Search */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <Input
                  placeholder="Search documents..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full"
                />
              </div>
              <div className="flex gap-2">
                <Button
                  variant={filterType === 'all' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setFilterType('all')}
                >
                  All
                </Button>
                <Button
                  variant={filterType === 'document' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setFilterType('document')}
                >
                  Documents
                </Button>
                <Button
                  variant={filterType === 'template' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setFilterType('template')}
                >
                  Templates
                </Button>
                <Button
                  variant={filterType === 'analysis' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setFilterType('analysis')}
                >
                  Analysis
                </Button>
                <Button
                  variant={filterType === 'generated' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setFilterType('generated')}
                >
                  Generated
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Documents</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{items.length}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Processing</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{items.filter(i => i.status === 'processing').length}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Generated</CardTitle>
              <Bot className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{items.filter(i => i.type === 'generated').length}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Size</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">8.2 MB</div>
            </CardContent>
          </Card>
        </div>

        {/* Document List */}
        <Card>
          <CardHeader>
            <CardTitle>Documents</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {filteredItems.map((item) => (
                <div key={item.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                  <div className="flex items-center space-x-4">
                    {getTypeIcon(item.type)}
                    <div className="flex-1">
                      <h3 className="font-medium">{item.name}</h3>
                      <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                        <span>{formatFileType(item.type)}</span>
                        <span>{item.size}</span>
                        <span>Modified {item.modified.toLocaleDateString()}</span>
                        {item.agent && (
                          <Badge variant="outline" className="text-xs">
                            {item.agent}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <div className="flex items-center space-x-1">
                      {getStatusIcon(item.status)}
                      <Badge variant="outline" className={getStatusColor(item.status)}>
                        {item.status}
                      </Badge>
                    </div>
                    <div className="flex space-x-1">
                      <Button variant="ghost" size="sm">
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Download className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
              
              {filteredItems.length === 0 && (
                <div className="text-center py-12">
                  <FileText className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium mb-2">No documents found</h3>
                  <p className="text-muted-foreground">
                    {searchTerm ? 'Try adjusting your search terms' : 'Upload your first document to get started'}
                  </p>
                  {!searchTerm && (
                    <Button onClick={handleFileUpload} className="mt-4">
                      <Plus className="w-4 h-4 mr-2" />
                      Upload Document
                    </Button>
                  )}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
