"use client";

import { useState } from 'react';
import { useQuery, useMutation } from '@apollo/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { 
  Tag, 
  ArrowLeft,
  Loader2,
  CheckCircle,
  AlertCircle,
  FileText,
  FolderTree,
  Filter,
  Play
} from 'lucide-react';
import { 
  CLASSIFY_DOCUMENTS_MUTATION,
  GET_TASK_QUERY,
  GET_DOCUMENTS_QUERY
} from '../../lib/graphql';
import { TaskStatus, ClassificationResult } from '../../lib/ai-types';

interface DocumentClassifierProps {
  onBack: () => void;
}

export const DocumentClassifier = ({ onBack }: DocumentClassifierProps) => {
  const [selectedDocuments, setSelectedDocuments] = useState<string[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [currentTaskId, setCurrentTaskId] = useState<string | null>(null);

  const { data: documentsData, loading: documentsLoading } = useQuery(GET_DOCUMENTS_QUERY);
  const [classifyDocuments, { loading: classifying }] = useMutation(CLASSIFY_DOCUMENTS_MUTATION);
  
  const { data: taskData } = useQuery(GET_TASK_QUERY, {
    variables: { id: currentTaskId },
    skip: !currentTaskId,
    pollInterval: 2000,
  });

  const documents = documentsData?.documents || [];
  const task = taskData?.task;
  const classificationResults: ClassificationResult[] = task?.result?.classifications || [];

  const availableCategories = [
    'Contract',
    'Legal Brief',
    'Court Filing',
    'Correspondence',
    'Invoice',
    'Agreement',
    'Memorandum',
    'Research',
    'Evidence',
    'Compliance',
    'Policy',
    'Other'
  ];

  const handleDocumentToggle = (documentId: string) => {
    setSelectedDocuments(prev => 
      prev.includes(documentId)
        ? prev.filter(id => id !== documentId)
        : [...prev, documentId]
    );
  };

  const handleCategoryToggle = (category: string) => {
    setSelectedCategories(prev =>
      prev.includes(category)
        ? prev.filter(cat => cat !== category)
        : [...prev, category]
    );
  };

  const handleSelectAll = () => {
    setSelectedDocuments(documents.map((doc: any) => doc.id));
  };

  const handleDeselectAll = () => {
    setSelectedDocuments([]);
  };

  const handleClassify = async () => {
    if (selectedDocuments.length === 0) return;

    try {
      const result = await classifyDocuments({
        variables: {
          input: {
            documentIds: selectedDocuments,
            categories: selectedCategories.length > 0 ? selectedCategories : undefined
          }
        }
      });

      if (result.data?.classifyDocuments?.taskId) {
        setCurrentTaskId(result.data.classifyDocuments.taskId);
      }
    } catch (error) {
      console.error('Error classifying documents:', error);
    }
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return 'text-green-600 bg-green-100';
    if (confidence >= 0.6) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
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
          <h1 className="text-3xl font-bold tracking-tight">Document Classifier</h1>
          <p className="text-muted-foreground">
            Automatically categorize and organize your documents
          </p>
        </div>
      </div>

      {/* Task Status */}
      {currentTaskId && task && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              {task.status === TaskStatus.PROCESSING && <Loader2 className="h-5 w-5 animate-spin" />}
              {task.status === TaskStatus.COMPLETED && <CheckCircle className="h-5 w-5 text-green-500" />}
              {task.status === TaskStatus.FAILED && <AlertCircle className="h-5 w-5 text-red-500" />}
              <span>Classification {task.status}</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {task.status === TaskStatus.PROCESSING && (
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Progress</span>
                  <span>{task.progress}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
                    style={{ width: `${task.progress}%` }}
                  />
                </div>
              </div>
            )}
            
            {task.status === TaskStatus.COMPLETED && (
              <p className="text-green-600">
                Successfully classified {classificationResults.length} documents!
              </p>
            )}
            
            {task.status === TaskStatus.FAILED && (
              <p className="text-red-600">
                Classification failed: {task.error || 'Unknown error'}
              </p>
            )}
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Document Selection */}
        <div className="lg:col-span-1 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Documents</span>
                <Badge variant="secondary">
                  {selectedDocuments.length} selected
                </Badge>
              </CardTitle>
              <CardDescription>
                Select documents to classify
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleSelectAll}
                >
                  Select All
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleDeselectAll}
                >
                  Deselect All
                </Button>
              </div>

              <div className="space-y-2 max-h-96 overflow-y-auto">
                {documents.map((document: any) => (
                  <Card 
                    key={document.id}
                    className={`cursor-pointer transition-colors ${
                      selectedDocuments.includes(document.id)
                        ? 'ring-2 ring-primary bg-primary/5'
                        : 'hover:bg-muted'
                    }`}
                    onClick={() => handleDocumentToggle(document.id)}
                  >
                    <CardContent className="p-3">
                      <div className="flex items-center space-x-3">
                        <input
                          type="checkbox"
                          checked={selectedDocuments.includes(document.id)}
                          onChange={() => handleDocumentToggle(document.id)}
                          className="rounded"
                          onClick={(e) => e.stopPropagation()}
                        />
                        <FileText className="h-4 w-4 text-primary flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">
                            {document.name}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {document.type}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Category Filter */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Filter className="h-5 w-5" />
                <span>Categories</span>
              </CardTitle>
              <CardDescription>
                Optional: Limit classification to specific categories
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-2">
                {availableCategories.map((category) => (
                  <Badge
                    key={category}
                    variant={selectedCategories.includes(category) ? "default" : "outline"}
                    className="cursor-pointer justify-center"
                    onClick={() => handleCategoryToggle(category)}
                  >
                    {category}
                  </Badge>
                ))}
              </div>
              
              <Button
                className="w-full mt-4"
                onClick={handleClassify}
                disabled={selectedDocuments.length === 0 || classifying}
              >
                {classifying ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Play className="h-4 w-4 mr-2" />
                )}
                Classify {selectedDocuments.length} Documents
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Results */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <FolderTree className="h-5 w-5" />
                <span>Classification Results</span>
              </CardTitle>
              <CardDescription>
                AI-generated document categories and confidence scores
              </CardDescription>
            </CardHeader>
            <CardContent>
              {!currentTaskId ? (
                <div className="flex items-center justify-center h-64">
                  <div className="text-center">
                    <Tag className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">
                      Select documents and click classify to see results
                    </p>
                  </div>
                </div>
              ) : task?.status === TaskStatus.PROCESSING ? (
                <div className="flex items-center justify-center h-64">
                  <div className="text-center">
                    <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
                    <p className="text-muted-foreground">
                      Classifying documents...
                    </p>
                  </div>
                </div>
              ) : task?.status === TaskStatus.COMPLETED && classificationResults.length > 0 ? (
                <div className="space-y-4">
                  {/* Summary */}
                  <div className="grid grid-cols-3 gap-4 mb-6">
                    <Card>
                      <CardContent className="p-4 text-center">
                        <div className="text-2xl font-bold">
                          {classificationResults.length}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          Documents Classified
                        </div>
                      </CardContent>
                    </Card>
                    
                    <Card>
                      <CardContent className="p-4 text-center">
                        <div className="text-2xl font-bold">
                          {new Set(classificationResults.map(r => r.category)).size}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          Categories Found
                        </div>
                      </CardContent>
                    </Card>
                    
                    <Card>
                      <CardContent className="p-4 text-center">
                        <div className="text-2xl font-bold">
                          {Math.round(
                            classificationResults.reduce((sum, r) => sum + r.confidence, 0) / 
                            classificationResults.length * 100
                          )}%
                        </div>
                        <div className="text-sm text-muted-foreground">
                          Avg Confidence
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Detailed Results */}
                  <div className="space-y-3">
                    {classificationResults.map((result, index) => {
                      const document = documents.find((doc: any) => doc.id === result.documentId);
                      return (
                        <Card key={index}>
                          <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-3">
                                <FileText className="h-5 w-5 text-primary" />
                                <div>
                                  <p className="font-medium">
                                    {document?.name || 'Unknown Document'}
                                  </p>
                                  <div className="flex items-center space-x-2 mt-1">
                                    <Badge variant="default">
                                      {result.category}
                                    </Badge>
                                    {result.subcategories.map((sub, subIndex) => (
                                      <Badge key={subIndex} variant="secondary">
                                        {sub}
                                      </Badge>
                                    ))}
                                  </div>
                                </div>
                              </div>
                              
                              <div className="text-right">
                                <div className={`text-sm font-medium px-2 py-1 rounded ${getConfidenceColor(result.confidence)}`}>
                                  {Math.round(result.confidence * 100)}%
                                </div>
                                <div className="text-xs text-muted-foreground mt-1">
                                  Confidence
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                </div>
              ) : task?.status === TaskStatus.FAILED ? (
                <div className="flex items-center justify-center h-64">
                  <div className="text-center">
                    <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
                    <p className="text-red-600">
                      Classification failed: {task.error || 'Unknown error'}
                    </p>
                  </div>
                </div>
              ) : null}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};