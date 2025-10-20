"use client";

import { useState } from 'react';
import { useQuery, useMutation } from '@apollo/client/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Input } from '../ui/input';
import { 
  FileText, 
  ArrowLeft,
  Loader2,
  Download,
  Eye,
  Edit,
  Trash2,
  Search,
  Calendar,
  Filter,
  Star,
  StarOff
} from 'lucide-react';
import { GET_GENERATED_DOCUMENTS_QUERY } from '../../lib/graphql';
import { GeneratedDocument, GeneratedDocumentsQueryResponse } from '../../lib/ai-types';

interface GeneratedDocumentsProps {
  onBack: () => void;
}

export const GeneratedDocuments = ({ onBack }: GeneratedDocumentsProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDocument, setSelectedDocument] = useState<GeneratedDocument | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [sortBy, setSortBy] = useState<'date' | 'name' | 'template'>('date');

  const { data: documentsData, loading: documentsLoading } = useQuery<GeneratedDocumentsQueryResponse>(GET_GENERATED_DOCUMENTS_QUERY);

  const documents: GeneratedDocument[] = documentsData?.generatedDocuments || [];

  const filteredAndSortedDocuments = documents
    .filter(doc => 
      doc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.templateName.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'template':
          return a.templateName.localeCompare(b.templateName);
        case 'date':
        default:
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
    });

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  const handleDownload = (doc: GeneratedDocument) => {
    const blob = new Blob([doc.content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${doc.name}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handlePreview = (doc: GeneratedDocument) => {
    setSelectedDocument(doc);
    setShowPreview(true);
  };

  if (documentsLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <Button variant="ghost" size="sm" onClick={onBack}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Generated Documents</h1>
          <p className="text-muted-foreground">
            Browse and manage AI-generated legal documents
          </p>
        </div>
      </div>

      {/* Controls */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-4 items-center">
            <div className="flex-1 min-w-64">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search documents..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <select
              className="border rounded px-3 py-2"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as 'date' | 'name' | 'template')}
            >
              <option value="date">Sort by Date</option>
              <option value="name">Sort by Name</option>
              <option value="template">Sort by Template</option>
            </select>
            
            <Badge variant="secondary">
              {filteredAndSortedDocuments.length} documents
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Documents Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredAndSortedDocuments.length === 0 ? (
          <Card className="md:col-span-2 lg:col-span-3">
            <CardContent className="flex items-center justify-center py-12">
              <div className="text-center">
                <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">
                  {searchTerm ? 'No documents match your search' : 'No documents generated yet'}
                </p>
              </div>
            </CardContent>
          </Card>
        ) : (
          filteredAndSortedDocuments.map((document) => (
            <Card key={document.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-2">
                    <FileText className="h-5 w-5 text-primary" />
                    <div className="flex-1 min-w-0">
                      <CardTitle className="text-base truncate">
                        {document.name}
                      </CardTitle>
                      <CardDescription className="text-sm">
                        {document.templateName}
                      </CardDescription>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm">
                    <Star className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <div className="text-sm text-muted-foreground">
                  <div className="flex items-center space-x-1 mb-1">
                    <Calendar className="h-3 w-3" />
                    <span>Created {formatDate(document.createdAt)}</span>
                  </div>
                  <div className="text-xs">
                    Updated {formatDate(document.updatedAt)}
                  </div>
                </div>

                {/* Metadata Preview */}
                {document.metadata && Object.keys(document.metadata).length > 0 && (
                  <div className="space-y-1">
                    <div className="text-xs font-medium text-muted-foreground">
                      Document Details:
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {Object.entries(document.metadata).slice(0, 3).map(([key, value]) => (
                        <Badge key={key} variant="outline" className="text-xs">
                          {key}: {String(value).slice(0, 20)}
                          {String(value).length > 20 ? '...' : ''}
                        </Badge>
                      ))}
                      {Object.keys(document.metadata).length > 3 && (
                        <Badge variant="outline" className="text-xs">
                          +{Object.keys(document.metadata).length - 3} more
                        </Badge>
                      )}
                    </div>
                  </div>
                )}

                {/* Content Preview */}
                <div className="space-y-2">
                  <div className="text-xs font-medium text-muted-foreground">
                    Content Preview:
                  </div>
                  <div className="text-xs bg-muted p-2 rounded max-h-20 overflow-hidden">
                    {document.content.slice(0, 150)}
                    {document.content.length > 150 ? '...' : ''}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex space-x-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="flex-1"
                    onClick={() => handlePreview(document)}
                  >
                    <Eye className="h-3 w-3 mr-1" />
                    Preview
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleDownload(document)}
                  >
                    <Download className="h-3 w-3" />
                  </Button>
                  <Button variant="outline" size="sm">
                    <Edit className="h-3 w-3" />
                  </Button>
                  <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700">
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Preview Modal */}
      {showPreview && selectedDocument && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-4xl max-h-[80vh] flex flex-col">
            <CardHeader className="flex-shrink-0">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>{selectedDocument.name}</CardTitle>
                  <CardDescription>
                    Template: {selectedDocument.templateName}
                  </CardDescription>
                </div>
                <div className="flex space-x-2">
                  <Button 
                    variant="outline"
                    onClick={() => handleDownload(selectedDocument)}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Download
                  </Button>
                  <Button variant="outline">
                    <Edit className="h-4 w-4 mr-2" />
                    Edit
                  </Button>
                  <Button onClick={() => setShowPreview(false)}>
                    Close
                  </Button>
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="flex-1 overflow-auto">
              {/* Document Metadata */}
              {selectedDocument.metadata && Object.keys(selectedDocument.metadata).length > 0 && (
                <div className="mb-6 p-4 bg-muted rounded">
                  <h3 className="font-semibold mb-2">Document Information</h3>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    {Object.entries(selectedDocument.metadata).map(([key, value]) => (
                      <div key={key} className="flex justify-between">
                        <span className="font-medium">{key}:</span>
                        <span className="text-right">{String(value)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Document Content */}
              <div className="space-y-4">
                <h3 className="font-semibold">Document Content</h3>
                <div className="whitespace-pre-wrap font-mono text-sm bg-white border rounded p-4 min-h-96">
                  {selectedDocument.content}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};