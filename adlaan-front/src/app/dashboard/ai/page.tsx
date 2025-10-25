"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { DashboardLayout } from '../../../components/DashboardLayout';
import { AIAgentsOverview } from '../../../components/ai/AIAgentsOverview';
import { DocumentClassifier } from '../../../components/ai/DocumentClassifier';
import { TaskManagement } from '../../../components/ai/TaskManagement';
import { GeneratedDocuments } from '../../../components/ai/GeneratedDocuments';
import { AgentConfiguration } from '../../../components/ai/AgentConfiguration';

type AIView = 
  | 'overview'
  | 'document-classifier'
  | 'tasks'
  | 'generated-documents'
  | 'configuration';

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
      case 'document-classifier':
        return <DocumentClassifier onBack={handleBack} />;
      case 'tasks':
        return <TaskManagement onBack={handleBack} />;
      case 'generated-documents':
        return <GeneratedDocuments onBack={handleBack} />;
      case 'configuration':
        return <AgentConfiguration onBack={handleBack} />;
      case 'overview':
      default:
        return <AIAgentsOverview onNavigate={handleNavigate} />;
    }
  };

  return (
    <DashboardLayout>
      <div className="container mx-auto px-4 py-8">
        {renderCurrentView()}
      </div>
    </DashboardLayout>
  );
}