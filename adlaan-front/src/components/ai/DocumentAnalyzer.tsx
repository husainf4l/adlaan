"use client";

import { useState, useRef } from 'react';
import { useMutation, useQuery } from '@apollo/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { 
  Upload, 
  FileText, 
  ArrowLeft,
  Loader2,
  CheckCircle,
  AlertCircle,
  Eye,
  TrendingUp,
  TrendingDown,
  Users,
  Calendar,
  DollarSign
} from 'lucide-react';
import { 
  ANALYZE_DOCUMENT_MUTATION,
  GET_TASK_QUERY 
} from '../../lib/graphql';
import { TaskStatus, AnalysisResult } from '../../lib/ai-types';

interface DocumentAnalyzerProps {
  onBack: () => void;
}

export const DocumentAnalyzer = ({ onBack }: DocumentAnalyzerProps) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [analysisType, setAnalysisType] = useState<string>('general');
  const [currentTaskId, setCurrentTaskId] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [analyzeDocument, { loading: analyzing }] = useMutation(ANALYZE_DOCUMENT_MUTATION);
  
  const { data: taskData } = useQuery(GET_TASK_QUERY, {
    variables: { id: currentTaskId },
    skip: !currentTaskId,
    pollInterval: 2000,
  });

  const task = taskData?.task;
  const analysisResult: AnalysisResult | null = task?.result || null;

  const handleFileSelect = (file: File) => {
    setSelectedFile(file);
    setCurrentTaskId(null);
  };

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
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const handleAnalyze = async () => {
    if (!selectedFile) return;

    try {
      const result = await analyzeDocument({
        variables: {
          input: {
            file: selectedFile,
            analysisType
          }
        }
      });

      if (result.data?.analyzeDocument?.taskId) {
        setCurrentTaskId(result.data.analyzeDocument.taskId);
      }
    } catch (error) {
      console.error('Error analyzing document:', error);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <Button variant="ghost" size="sm" onClick={onBack}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Document Analyzer</h1>
          <p className="text-muted-foreground">
            Upload and analyze documents for insights and risks
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upload Section */}
        <Card>
          <CardHeader>
            <CardTitle>Upload Document</CardTitle>
            <CardDescription>
              Upload a document to analyze for legal insights
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* File Upload Area */}
            <div
              className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                dragOver 
                  ? 'border-primary bg-primary/5' 
                  : 'border-muted-foreground/25 hover:border-primary/50'
              }`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.doc,.docx,.txt"
                onChange={handleFileInputChange}
                className="hidden"
              />
              
              <Upload className="h-10 w-10 text-muted-foreground mx-auto mb-4" />
              <p className="text-lg font-medium">Drop your document here</p>
              <p className="text-sm text-muted-foreground">
                or click to browse files
              </p>
              <p className="text-xs text-muted-foreground mt-2">
                Supports PDF, DOC, DOCX, TXT files up to 10MB
              </p>
            </div>

            {/* Selected File */}
            {selectedFile && (
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center space-x-3">
                    <FileText className="h-8 w-8 text-primary" />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{selectedFile.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {formatFileSize(selectedFile.size)}
                      </p>
                    </div>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => setSelectedFile(null)}
                    >
                      Remove
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Analysis Type */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Analysis Type</label>
              <select
                className="w-full p-2 border rounded-md"
                value={analysisType}
                onChange={(e) => setAnalysisType(e.target.value)}
              >
                <option value="general">General Analysis</option>
                <option value="legal">Legal Review</option>
                <option value="contract">Contract Analysis</option>
                <option value="compliance">Compliance Check</option>
              </select>
            </div>

            {/* Analyze Button */}
            <Button
              className="w-full"
              onClick={handleAnalyze}
              disabled={!selectedFile || analyzing}
            >
              {analyzing ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Eye className="h-4 w-4 mr-2" />
              )}
              Analyze Document
            </Button>
          </CardContent>
        </Card>

        {/* Results Section */}
        <Card>
          <CardHeader>
            <CardTitle>Analysis Results</CardTitle>
            <CardDescription>
              AI-powered insights and recommendations
            </CardDescription>
          </CardHeader>
          <CardContent>
            {!currentTaskId ? (
              <div className="flex items-center justify-center h-64">
                <div className="text-center">
                  <Eye className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">
                    Upload a document to see analysis results
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Task Status */}
                <div className="flex items-center space-x-2">
                  {task?.status === TaskStatus.PROCESSING && <Loader2 className="h-5 w-5 animate-spin" />}
                  {task?.status === TaskStatus.COMPLETED && <CheckCircle className="h-5 w-5 text-green-500" />}
                  {task?.status === TaskStatus.FAILED && <AlertCircle className="h-5 w-5 text-red-500" />}
                  <span className="font-medium">
                    Analysis {task?.status || 'Starting...'}
                  </span>
                </div>

                {/* Progress Bar */}
                {task?.status === TaskStatus.PROCESSING && (
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

                {/* Analysis Results */}
                {task?.status === TaskStatus.COMPLETED && analysisResult && (
                  <div className="space-y-6">
                    {/* Summary */}
                    <div>
                      <h3 className="font-semibold mb-2">Summary</h3>
                      <p className="text-sm text-muted-foreground">
                        {analysisResult.summary}
                      </p>
                    </div>

                    {/* Confidence Score */}
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <h3 className="font-semibold">Confidence Score</h3>
                        <Badge variant={analysisResult.confidence > 0.8 ? "default" : "secondary"}>
                          {Math.round(analysisResult.confidence * 100)}%
                        </Badge>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-green-600 h-2 rounded-full" 
                          style={{ width: `${analysisResult.confidence * 100}%` }}
                        />
                      </div>
                    </div>

                    {/* Key Points */}
                    {analysisResult.keyPoints && analysisResult.keyPoints.length > 0 && (
                      <div>
                        <h3 className="font-semibold mb-2">Key Points</h3>
                        <ul className="space-y-1">
                          {analysisResult.keyPoints.map((point, index) => (
                            <li key={index} className="flex items-start space-x-2">
                              <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                              <span className="text-sm">{point}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Risks */}
                    {analysisResult.risks && analysisResult.risks.length > 0 && (
                      <div>
                        <h3 className="font-semibold mb-2 flex items-center">
                          <AlertCircle className="h-4 w-4 text-red-500 mr-2" />
                          Risks Identified
                        </h3>
                        <ul className="space-y-1">
                          {analysisResult.risks.map((risk, index) => (
                            <li key={index} className="flex items-start space-x-2">
                              <TrendingDown className="h-4 w-4 text-red-500 mt-0.5 flex-shrink-0" />
                              <span className="text-sm">{risk}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Recommendations */}
                    {analysisResult.recommendations && analysisResult.recommendations.length > 0 && (
                      <div>
                        <h3 className="font-semibold mb-2 flex items-center">
                          <TrendingUp className="h-4 w-4 text-blue-500 mr-2" />
                          Recommendations
                        </h3>
                        <ul className="space-y-1">
                          {analysisResult.recommendations.map((rec, index) => (
                            <li key={index} className="flex items-start space-x-2">
                              <TrendingUp className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
                              <span className="text-sm">{rec}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Entities */}
                    {analysisResult.entities && (
                      <div className="grid grid-cols-2 gap-4">
                        {analysisResult.entities.people && analysisResult.entities.people.length > 0 && (
                          <div>
                            <h4 className="font-medium text-sm mb-2 flex items-center">
                              <Users className="h-4 w-4 mr-1" />
                              People
                            </h4>
                            <div className="space-y-1">
                              {analysisResult.entities.people.map((person, index) => (
                                <Badge key={index} variant="outline" className="text-xs">
                                  {person}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}

                        {analysisResult.entities.dates && analysisResult.entities.dates.length > 0 && (
                          <div>
                            <h4 className="font-medium text-sm mb-2 flex items-center">
                              <Calendar className="h-4 w-4 mr-1" />
                              Dates
                            </h4>
                            <div className="space-y-1">
                              {analysisResult.entities.dates.map((date, index) => (
                                <Badge key={index} variant="outline" className="text-xs">
                                  {date}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}

                        {analysisResult.entities.amounts && analysisResult.entities.amounts.length > 0 && (
                          <div>
                            <h4 className="font-medium text-sm mb-2 flex items-center">
                              <DollarSign className="h-4 w-4 mr-1" />
                              Amounts
                            </h4>
                            <div className="space-y-1">
                              {analysisResult.entities.amounts.map((amount, index) => (
                                <Badge key={index} variant="outline" className="text-xs">
                                  {amount}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}

                        {analysisResult.entities.organizations && analysisResult.entities.organizations.length > 0 && (
                          <div>
                            <h4 className="font-medium text-sm mb-2">Organizations</h4>
                            <div className="space-y-1">
                              {analysisResult.entities.organizations.map((org, index) => (
                                <Badge key={index} variant="outline" className="text-xs">
                                  {org}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {/* Error State */}
                {task?.status === TaskStatus.FAILED && (
                  <div className="text-center">
                    <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
                    <p className="text-red-600">
                      Analysis failed: {task.error || 'Unknown error'}
                    </p>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};