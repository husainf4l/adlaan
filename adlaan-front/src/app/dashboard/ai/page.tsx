"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { AIAgentsOverview } from '../../components/ai/AIAgentsOverview';
import { DocumentGenerator } from '../../components/ai/DocumentGenerator';
import { DocumentAnalyzer } from '../../components/ai/DocumentAnalyzer';
import { DocumentClassifier } from '../../components/ai/DocumentClassifier';
import { TaskManagement } from '../../components/ai/TaskManagement';
import { GeneratedDocuments } from '../../components/ai/GeneratedDocuments';

type AIView = 
  | 'overview'
  | 'document-generator'
  | 'document-analyzer'
  | 'document-classifier'
  | 'tasks'
  | 'generated-documents';

export default function AIAgentsPage() {
  const [currentView, setCurrentView] = useState<AIView>('overview');
  const router = useRouter();

  const handleNavigate = (route: string) => {
    // Extract the view from the route
    const view = route.split('/').pop() as AIView;
    setCurrentView(view || 'overview');
  };

  const handleBack = () => {
    setCurrentView('overview');
  };

  const renderCurrentView = () => {
    switch (currentView) {
      case 'document-generator':
        return <DocumentGenerator onBack={handleBack} />;
      case 'document-analyzer':
        return <DocumentAnalyzer onBack={handleBack} />;
      case 'document-classifier':
        return <DocumentClassifier onBack={handleBack} />;
      case 'tasks':
        return <TaskManagement onBack={handleBack} />;
      case 'generated-documents':
        return <GeneratedDocuments onBack={handleBack} />;
      case 'overview':
      default:
        return <AIAgentsOverview onNavigate={handleNavigate} />;
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {renderCurrentView()}
    </div>
  );
}