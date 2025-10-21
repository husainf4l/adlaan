"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../../../components/ui/card';
import { Button } from '../../../../components/ui/button';
import { Badge } from '../../../../components/ui/badge';
import { Progress } from '../../../../components/ui/progress';
import { 
  Upload, 
  Bot, 
  FolderOpen, 
  FileText, 
  ArrowRight,
  CheckCircle,
  Clock,
  Zap,
  ArrowLeft
} from 'lucide-react';
import Link from 'next/link';

interface ClassificationJob {
  id: string;
  fileName: string;
  status: 'uploading' | 'analyzing' | 'classifying' | 'organizing' | 'completed';
  progress: number;
  classification?: string;
  confidence?: number;
  targetFolder?: string;
}

export default function ClassifierPage() {
  const [jobs, setJobs] = useState<ClassificationJob[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    // Initialize with sample classification jobs
    const sampleJobs: ClassificationJob[] = [
      {
        id: '1',
        fileName: 'Service Agreement - Web Development.pdf',
        status: 'completed',
        progress: 100,
        classification: 'Service Agreement',
        confidence: 94,
        targetFolder: 'agreements'
      },
      {
        id: '2',
        fileName: 'Employment Contract - Senior Developer.docx',
        status: 'completed',
        progress: 100,
        classification: 'Employment Contract',
        confidence: 97,
        targetFolder: 'contracts'
      },
      {
        id: '3',
        fileName: 'Legal Research - IP Rights in Tech.pdf',
        status: 'organizing',
        progress: 75,
        classification: 'Legal Research',
        confidence: 89,
        targetFolder: 'research'
      }
    ];
    setJobs(sampleJobs);
  }, []);

  const simulateUpload = () => {
    const newJob: ClassificationJob = {
      id: Date.now().toString(),
      fileName: 'New Document.pdf',
      status: 'uploading',
      progress: 0
    };

    setJobs(prev => [newJob, ...prev]);
    setIsProcessing(true);

    // Simulate the classification process
    let progress = 0;
    const stages = ['uploading', 'analyzing', 'classifying', 'organizing', 'completed'] as const;
    let currentStage = 0;

    const interval = setInterval(() => {
      progress += Math.random() * 15;
      
      if (progress >= 100) {
        progress = 100;
        currentStage = stages.length - 1;
      } else if (progress >= 75) {
        currentStage = 3;
      } else if (progress >= 50) {
        currentStage = 2;
      } else if (progress >= 25) {
        currentStage = 1;
      }

      setJobs(prev => prev.map(job => 
        job.id === newJob.id ? {
          ...job,
          status: stages[currentStage],
          progress: Math.round(progress),
          ...(progress >= 50 && !job.classification ? {
            classification: 'Non-Disclosure Agreement',
            confidence: 92,
            targetFolder: 'agreements'
          } : {})
        } : job
      ));

      if (progress >= 100) {
        clearInterval(interval);
        setIsProcessing(false);
      }
    }, 500);
  };

  const getStatusIcon = (status: ClassificationJob['status']) => {
    switch (status) {
      case 'uploading': return <Upload className="w-4 h-4 text-blue-500" />;
      case 'analyzing': return <Bot className="w-4 h-4 text-purple-500" />;
      case 'classifying': return <Zap className="w-4 h-4 text-yellow-500" />;
      case 'organizing': return <FolderOpen className="w-4 h-4 text-orange-500" />;
      case 'completed': return <CheckCircle className="w-4 h-4 text-green-500" />;
      default: return <Clock className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusText = (status: ClassificationJob['status']) => {
    switch (status) {
      case 'uploading': return 'Uploading document...';
      case 'analyzing': return 'Analyzing content...';
      case 'classifying': return 'Classifying document type...';
      case 'organizing': return 'Organizing into folder...';
      case 'completed': return 'Successfully organized';
      default: return 'Processing...';
    }
  };

  const getTargetFolderName = (folder: string) => {
    const folderNames: { [key: string]: string } = {
      'contracts': 'Contracts',
      'agreements': 'Agreements',
      'legal_documents': 'Legal Documents',
      'research': 'Legal Research',
      'policies': 'Policies & Procedures',
      'templates': 'Document Templates'
    };
    return folderNames[folder] || folder;
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto p-6">
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
              <h1 className="text-2xl font-bold">Document Classifier</h1>
              <p className="text-muted-foreground">AI-powered document organization</p>
            </div>
          </div>
          <Button onClick={simulateUpload} disabled={isProcessing}>
            <Upload className="w-4 h-4 mr-2" />
            Upload & Classify
          </Button>
        </div>

        {/* How It Works */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>How Document Classification Works</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              <div className="text-center">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2">
                  <Upload className="w-6 h-6 text-blue-600" />
                </div>
                <h3 className="font-medium text-sm">Upload</h3>
                <p className="text-xs text-muted-foreground">Document uploaded to system</p>
              </div>
              <ArrowRight className="w-4 h-4 text-muted-foreground self-center mx-auto" />
              <div className="text-center">
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-2">
                  <Bot className="w-6 h-6 text-purple-600" />
                </div>
                <h3 className="font-medium text-sm">Analyze</h3>
                <p className="text-xs text-muted-foreground">AI analyzes content and structure</p>
              </div>
              <ArrowRight className="w-4 h-4 text-muted-foreground self-center mx-auto" />
              <div className="text-center">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
                  <FolderOpen className="w-6 h-6 text-green-600" />
                </div>
                <h3 className="font-medium text-sm">Organize</h3>
                <p className="text-xs text-muted-foreground">Auto-sorted into correct folder</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Classification Queue */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Classification Queue</span>
              <Badge variant="outline">{jobs.length} documents</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {jobs.map((job) => (
                <div key={job.id} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <FileText className="w-5 h-5 text-muted-foreground" />
                      <div>
                        <p className="font-medium">{job.fileName}</p>
                        <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                          {getStatusIcon(job.status)}
                          <span>{getStatusText(job.status)}</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      {job.classification && (
                        <Badge variant="outline" className="mb-1">
                          {job.classification}
                        </Badge>
                      )}
                      {job.confidence && (
                        <p className="text-xs text-muted-foreground">
                          {job.confidence}% confidence
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="mb-3">
                    <div className="flex justify-between text-sm mb-1">
                      <span>Progress</span>
                      <span>{job.progress}%</span>
                    </div>
                    <Progress value={job.progress} className="h-2" />
                  </div>

                  {/* Target Folder */}
                  {job.targetFolder && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Target folder:</span>
                      <div className="flex items-center space-x-1">
                        <FolderOpen className="w-4 h-4 text-blue-500" />
                        <span className="font-medium">{getTargetFolderName(job.targetFolder)}</span>
                        {job.status === 'completed' && (
                          <Link href="/dashboard/agents/drive">
                            <Button variant="outline" size="sm" className="ml-2">
                              View in Drive
                            </Button>
                          </Link>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ))}

              {jobs.length === 0 && (
                <div className="text-center py-8">
                  <Bot className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium mb-2">No documents in queue</h3>
                  <p className="text-muted-foreground mb-4">
                    Upload documents to see AI classification in action
                  </p>
                  <Button onClick={simulateUpload}>
                    <Upload className="w-4 h-4 mr-2" />
                    Upload Test Document
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Classification Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Documents Classified</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">1,247</div>
              <p className="text-xs text-muted-foreground">+12% from last month</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Average Accuracy</CardTitle>
              <Zap className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">94.2%</div>
              <p className="text-xs text-muted-foreground">AI classification accuracy</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Processing Time</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">2.3s</div>
              <p className="text-xs text-muted-foreground">Average per document</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}