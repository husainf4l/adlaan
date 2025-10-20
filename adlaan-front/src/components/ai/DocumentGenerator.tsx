"use client";

import { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@apollo/client/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import { 
  FileText, 
  Wand2, 
  Download, 
  Eye, 
  ArrowLeft,
  Loader2,
  CheckCircle,
  AlertCircle,
  RefreshCw 
} from 'lucide-react';
import { 
  GET_DOCUMENT_TEMPLATES_QUERY, 
  GENERATE_DOCUMENT_MUTATION,
  GET_TASK_QUERY 
} from '../../lib/graphql';
import { DocumentTemplate, TemplateField, TaskStatus, DocumentTemplatesQueryResponse, TaskQueryResponse, GenerateDocumentMutationResponse, AgentType } from '../../lib/ai-types';
import { aiAgentService, agentRealtimeService } from '../../lib/ai-agent-service';
import { useAgentErrorHandling } from '../../lib/use-agent-error-handling';

interface DocumentGeneratorProps {
  onBack: () => void;
}

export const DocumentGenerator = ({ onBack }: DocumentGeneratorProps) => {
  const [selectedTemplate, setSelectedTemplate] = useState<DocumentTemplate | null>(null);
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [currentTaskId, setCurrentTaskId] = useState<string | null>(null);
  const [showPreview, setShowPreview] = useState(false);

  // Enhanced error handling and logging
  const { 
    errorState, 
    loadingState, 
    setError, 
    clearError, 
    setLoading,
    executeWithErrorHandling,
    logger,
    isRetryable,
    getRecommendedAction 
  } = useAgentErrorHandling();

  const { data: templatesData, loading: templatesLoading } = useQuery<DocumentTemplatesQueryResponse>(GET_DOCUMENT_TEMPLATES_QUERY);
  const [generateDocument, { loading: generating }] = useMutation<GenerateDocumentMutationResponse>(GENERATE_DOCUMENT_MUTATION);
  
  const { data: taskData } = useQuery<TaskQueryResponse>(GET_TASK_QUERY, {
    variables: { id: currentTaskId },
    skip: !currentTaskId,
    pollInterval: 2000,
  });

  const templates = templatesData?.documentTemplates || [];
  const task = taskData?.task;

  // Real-time task updates
  useEffect(() => {
    if (!currentTaskId) return;

    const unsubscribe = agentRealtimeService.subscribe('task_update', (data) => {
      if (data.taskId === currentTaskId) {
        logger.log('info', `Task update received: ${data.status}`, 'DocumentGenerator', { taskId: currentTaskId });
      }
    });

    return unsubscribe;
  }, [currentTaskId, logger]);

  const handleTemplateSelect = (template: DocumentTemplate) => {
    setSelectedTemplate(template);
    // Initialize form data with empty values
    const initialData: Record<string, any> = {};
    template.fields.forEach(field => {
      initialData[field.name] = field.type === 'boolean' ? false : '';
    });
    setFormData(initialData);
  };

  const handleFieldChange = (fieldName: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [fieldName]: value
    }));
  };

  const handleGenerate = async () => {
    if (!selectedTemplate) return;

    const result = await executeWithErrorHandling(
      async () => {
        // Use the new AI agent service instead of direct GraphQL
        return await aiAgentService.executeAgentTask(
          AgentType.DOCUMENT_GENERATOR,
          'generate',
          {
            templateId: selectedTemplate.id,
            fields: formData
          }
        );
      },
      {
        operationName: 'Generate Document',
        context: 'DocumentGenerator',
        onSuccess: (result) => {
          setCurrentTaskId(result.taskId);
          logger.log('info', `Document generation started with task ID: ${result.taskId}`, 'DocumentGenerator');
        },
        onError: (error) => {
          logger.log('error', `Document generation failed: ${error.message}`, 'DocumentGenerator');
        }
      }
    );
  };

  const handleRetry = async () => {
    clearError();
    await handleGenerate();
  };

  const renderField = (field: TemplateField) => {
    const value = formData[field.name] || '';

    switch (field.type) {
      case 'text':
        return (
          <Input
            placeholder={`Enter ${field.name}`}
            value={value}
            onChange={(e) => handleFieldChange(field.name, e.target.value)}
            required={field.required}
          />
        );

      case 'textarea':
        return (
          <textarea
            className="w-full min-h-[100px] p-3 border rounded-md resize-y"
            placeholder={`Enter ${field.name}`}
            value={value}
            onChange={(e) => handleFieldChange(field.name, e.target.value)}
            required={field.required}
          />
        );

      case 'select':
        return (
          <select
            className="w-full p-2 border rounded-md"
            value={value}
            onChange={(e) => handleFieldChange(field.name, e.target.value)}
            required={field.required}
          >
            <option value="">Select {field.name}</option>
            {field.options?.map(option => (
              <option key={option} value={option}>{option}</option>
            ))}
          </select>
        );

      case 'date':
        return (
          <Input
            type="date"
            value={value}
            onChange={(e) => handleFieldChange(field.name, e.target.value)}
            required={field.required}
          />
        );

      case 'number':
        return (
          <Input
            type="number"
            placeholder={`Enter ${field.name}`}
            value={value}
            onChange={(e) => handleFieldChange(field.name, parseFloat(e.target.value) || 0)}
            required={field.required}
          />
        );

      case 'boolean':
        return (
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={value}
              onChange={(e) => handleFieldChange(field.name, e.target.checked)}
              className="rounded"
            />
            <span>{field.name}</span>
          </label>
        );

      default:
        return (
          <Input
            placeholder={`Enter ${field.name}`}
            value={value}
            onChange={(e) => handleFieldChange(field.name, e.target.value)}
            required={field.required}
          />
        );
    }
  };

  const isFormValid = () => {
    if (!selectedTemplate) return false;
    
    return selectedTemplate.fields.every(field => {
      if (!field.required) return true;
      const value = formData[field.name];
      return value !== '' && value !== null && value !== undefined;
    });
  };

  if (templatesLoading) {
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
          <h1 className="text-3xl font-bold tracking-tight">Document Generator</h1>
          <p className="text-muted-foreground">
            Create legal documents from AI-powered templates
          </p>
        </div>
      </div>

      {/* Error Handling */}
      {errorState.hasError && (
        <Card className="border-red-200 bg-red-50">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-red-700">
              <AlertCircle className="h-5 w-5" />
              <span>Error Occurred</span>
            </CardTitle>
            <CardDescription className="text-red-600">
              {errorState.error?.message}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <p className="text-sm text-red-600">
                {getRecommendedAction(errorState.error!)}
              </p>
              
              {errorState.retryCount > 0 && (
                <p className="text-xs text-muted-foreground">
                  Retry attempts: {errorState.retryCount}
                  {errorState.lastRetryAt && (
                    <span> (last attempt: {new Date(errorState.lastRetryAt).toLocaleTimeString()})</span>
                  )}
                </p>
              )}
              
              <div className="flex space-x-2">
                {isRetryable && (
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={handleRetry}
                    disabled={loadingState.isLoading}
                  >
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Retry
                  </Button>
                )}
                <Button size="sm" variant="ghost" onClick={clearError}>
                  Dismiss
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Loading State */}
      {loadingState.isLoading && (
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="pt-6">
            <div className="flex items-center space-x-3">
              <Loader2 className="h-5 w-5 animate-spin text-blue-600" />
              <div>
                <p className="font-medium text-blue-700">
                  {loadingState.operation || 'Processing...'}
                </p>
                {loadingState.startedAt && (
                  <p className="text-xs text-blue-600">
                    Started: {new Date(loadingState.startedAt).toLocaleTimeString()}
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Task Status */}
      {currentTaskId && task && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              {task.status === TaskStatus.PROCESSING && <Loader2 className="h-5 w-5 animate-spin" />}
              {task.status === TaskStatus.COMPLETED && <CheckCircle className="h-5 w-5 text-green-500" />}
              {task.status === TaskStatus.FAILED && <AlertCircle className="h-5 w-5 text-red-500" />}
              <span>Document Generation {task.status}</span>
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
            
            {task.status === TaskStatus.COMPLETED && task.result && (
              <div className="space-y-4">
                <p className="text-green-600">Document generated successfully!</p>
                <div className="flex space-x-2">
                  <Button onClick={() => setShowPreview(true)}>
                    <Eye className="h-4 w-4 mr-2" />
                    Preview
                  </Button>
                  <Button variant="outline">
                    <Download className="h-4 w-4 mr-2" />
                    Download
                  </Button>
                </div>
              </div>
            )}
            
            {task.status === TaskStatus.FAILED && (
              <p className="text-red-600">
                Generation failed: {task.error || 'Unknown error'}
              </p>
            )}
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Template Selection */}
        <div className="lg:col-span-1 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Document Templates</CardTitle>
              <CardDescription>
                Choose a template to get started
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              {templates.map((template: DocumentTemplate) => (
                <Card 
                  key={template.id}
                  className={`cursor-pointer transition-colors ${
                    selectedTemplate?.id === template.id 
                      ? 'ring-2 ring-primary' 
                      : 'hover:bg-muted'
                  }`}
                  onClick={() => handleTemplateSelect(template)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start space-x-3">
                      <FileText className="h-5 w-5 mt-0.5 text-primary" />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{template.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {template.description}
                        </p>
                        <Badge variant="secondary" className="mt-2">
                          {template.category}
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Form */}
        <div className="lg:col-span-2">
          {selectedTemplate ? (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Wand2 className="h-5 w-5" />
                  <span>{selectedTemplate.name}</span>
                </CardTitle>
                <CardDescription>
                  {selectedTemplate.description}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {selectedTemplate.fields.map((field) => (
                    <div key={field.name} className="space-y-2">
                      <label className="text-sm font-medium">
                        {field.name}
                        {field.required && <span className="text-red-500 ml-1">*</span>}
                      </label>
                      {renderField(field)}
                    </div>
                  ))}
                </div>

                <div className="flex justify-end space-x-2">
                  <Button
                    onClick={handleGenerate}
                    disabled={!isFormValid() || generating}
                  >
                    {generating ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <Wand2 className="h-4 w-4 mr-2" />
                    )}
                    Generate Document
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="flex items-center justify-center h-64">
                <div className="text-center">
                  <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">
                    Select a template to begin document generation
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Preview Modal */}
      {showPreview && task?.result && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-4xl max-h-[80vh] overflow-auto">
            <CardHeader>
              <CardTitle>Document Preview</CardTitle>
              <div className="flex space-x-2">
                <Button onClick={() => setShowPreview(false)} variant="outline">
                  Close
                </Button>
                <Button>
                  <Download className="h-4 w-4 mr-2" />
                  Download
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="whitespace-pre-wrap font-mono text-sm bg-muted p-4 rounded">
                {task.result.content || 'No content available'}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};