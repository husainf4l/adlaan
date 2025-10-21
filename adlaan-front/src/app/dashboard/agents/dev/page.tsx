"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../../../components/ui/card';
import { Button } from '../../../../components/ui/button';
import { Badge } from '../../../../components/ui/badge';
import { Input } from '../../../../components/ui/input';
import { 
  Code, 
  Play, 
  Save, 
  Download,
  ArrowLeft,
  Terminal,
  Eye,
  Settings,
  RefreshCw,
  FileText,
  Upload
} from 'lucide-react';
import Link from 'next/link';

interface TestCase {
  id: string;
  name: string;
  input: string;
  expectedOutput: string;
  actualOutput?: string;
  status: 'pending' | 'running' | 'passed' | 'failed';
}

export default function DevPage() {
  const [code, setCode] = useState('');
  const [testCases, setTestCases] = useState<TestCase[]>([]);
  const [activeTab, setActiveTab] = useState<'code' | 'test' | 'docs'>('code');
  const [isRunning, setIsRunning] = useState(false);

  useEffect(() => {
    // Initialize with sample code and test cases
    setCode(`// Adlaan Legal Agent - Document Analysis
async function analyzeDocument(document) {
  try {
    // Extract text content
    const content = await extractText(document);
    
    // Identify document type
    const docType = classifyDocument(content);
    
    // Analyze legal clauses
    const clauses = await analyzeClauses(content);
    
    // Risk assessment
    const risks = assessRisks(clauses);
    
    return {
      type: docType,
      clauses: clauses,
      risks: risks,
      confidence: calculateConfidence(clauses)
    };
  } catch (error) {
    throw new Error(\`Analysis failed: \${error.message}\`);
  }
}

function classifyDocument(content) {
  const patterns = {
    'employment_contract': /employment|employee|employer|salary|wages/gi,
    'nda': /confidential|non-disclosure|proprietary/gi,
    'service_agreement': /services|performance|deliverables/gi
  };
  
  let maxMatches = 0;
  let docType = 'unknown';
  
  for (const [type, pattern] of Object.entries(patterns)) {
    const matches = content.match(pattern);
    if (matches && matches.length > maxMatches) {
      maxMatches = matches.length;
      docType = type;
    }
  }
  
  return docType;
}

async function analyzeClauses(content) {
  // Simulate AI clause analysis
  const clauses = [];
  
  // Look for common legal clauses
  if (content.includes('termination')) {
    clauses.push({
      type: 'termination',
      text: 'Termination clause found',
      risk: 'medium'
    });
  }
  
  if (content.includes('liability')) {
    clauses.push({
      type: 'liability',
      text: 'Liability clause found',
      risk: 'high'
    });
  }
  
  return clauses;
}`);

    setTestCases([
      {
        id: '1',
        name: 'Employment Contract Analysis',
        input: 'Sample employment contract with salary and termination clauses',
        expectedOutput: 'employment_contract',
        status: 'pending'
      },
      {
        id: '2',
        name: 'NDA Classification',
        input: 'Non-disclosure agreement with confidential information',
        expectedOutput: 'nda',
        status: 'pending'
      },
      {
        id: '3',
        name: 'Service Agreement Detection',
        input: 'Service agreement with deliverables and performance metrics',
        expectedOutput: 'service_agreement',
        status: 'pending'
      }
    ]);
  }, []);

  const runTests = async () => {
    setIsRunning(true);
    
    for (let i = 0; i < testCases.length; i++) {
      setTestCases(prev => prev.map((test, index) => 
        index === i ? { ...test, status: 'running' } : test
      ));
      
      // Simulate test execution
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Simulate test results
      const passed = Math.random() > 0.3;
      setTestCases(prev => prev.map((test, index) => 
        index === i ? { 
          ...test, 
          status: passed ? 'passed' : 'failed',
          actualOutput: passed ? test.expectedOutput : 'unknown'
        } : test
      ));
    }
    
    setIsRunning(false);
  };

  const saveCode = () => {
    // Simulate saving code
    console.log('Code saved:', code);
  };

  const downloadCode = () => {
    const blob = new Blob([code], { type: 'text/javascript' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'adlaan-agent.js';
    a.click();
    URL.revokeObjectURL(url);
  };

  const getTestStatusColor = (status: TestCase['status']) => {
    switch (status) {
      case 'passed': return 'bg-green-100 text-green-800';
      case 'failed': return 'bg-red-100 text-red-800';
      case 'running': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
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
              <h1 className="text-2xl font-bold">Development Console</h1>
              <p className="text-muted-foreground">Test and develop AI agent functionality</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Button onClick={saveCode} variant="outline" size="sm">
              <Save className="w-4 h-4 mr-2" />
              Save
            </Button>
            <Button onClick={downloadCode} variant="outline" size="sm">
              <Download className="w-4 h-4 mr-2" />
              Download
            </Button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex space-x-1 mb-6">
          <Button
            variant={activeTab === 'code' ? 'default' : 'ghost'}
            onClick={() => setActiveTab('code')}
            size="sm"
          >
            <Code className="w-4 h-4 mr-2" />
            Code Editor
          </Button>
          <Button
            variant={activeTab === 'test' ? 'default' : 'ghost'}
            onClick={() => setActiveTab('test')}
            size="sm"
          >
            <Terminal className="w-4 h-4 mr-2" />
            Test Suite
          </Button>
          <Button
            variant={activeTab === 'docs' ? 'default' : 'ghost'}
            onClick={() => setActiveTab('docs')}
            size="sm"
          >
            <FileText className="w-4 h-4 mr-2" />
            Documentation
          </Button>
        </div>

        {/* Code Editor Tab */}
        {activeTab === 'code' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>Agent Code</span>
                    <div className="flex space-x-2">
                      <Button onClick={runTests} disabled={isRunning} size="sm">
                        {isRunning ? (
                          <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                        ) : (
                          <Play className="w-4 h-4 mr-2" />
                        )}
                        Run Tests
                      </Button>
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="border rounded-lg">
                    <textarea
                      value={code}
                      onChange={(e) => setCode(e.target.value)}
                      className="w-full h-96 p-4 font-mono text-sm bg-muted/20 border-0 resize-none focus:outline-none"
                      placeholder="Write your agent code here..."
                    />
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="space-y-6">
              {/* Console Output */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Console Output</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="bg-black text-green-400 p-4 rounded-lg font-mono text-sm h-48 overflow-y-auto">
                    <div>$ npm run test</div>
                    <div>Running Adlaan Agent Tests...</div>
                    {isRunning && <div className="animate-pulse">Executing test suite...</div>}
                    {testCases.some(t => t.status === 'passed' || t.status === 'failed') && (
                      <div>
                        {testCases.map(test => (
                          <div key={test.id}>
                            {test.status === 'passed' && `✓ ${test.name}`}
                            {test.status === 'failed' && `✗ ${test.name}`}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Quick Actions */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <Button variant="outline" className="w-full justify-start" size="sm">
                    <Upload className="w-4 h-4 mr-2" />
                    Import Code
                  </Button>
                  <Button variant="outline" className="w-full justify-start" size="sm">
                    <Eye className="w-4 h-4 mr-2" />
                    Preview Output
                  </Button>
                  <Button variant="outline" className="w-full justify-start" size="sm">
                    <Settings className="w-4 h-4 mr-2" />
                    Configuration
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {/* Test Suite Tab */}
        {activeTab === 'test' && (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Test Cases</CardTitle>
                <Button onClick={runTests} disabled={isRunning}>
                  {isRunning ? (
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Play className="w-4 h-4 mr-2" />
                  )}
                  {isRunning ? 'Running...' : 'Run All Tests'}
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {testCases.map((test) => (
                  <div key={test.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-medium">{test.name}</h3>
                      <Badge className={getTestStatusColor(test.status)}>
                        {test.status}
                      </Badge>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="font-medium text-muted-foreground mb-1">Input:</p>
                        <p className="bg-muted p-2 rounded">{test.input}</p>
                      </div>
                      <div>
                        <p className="font-medium text-muted-foreground mb-1">Expected:</p>
                        <p className="bg-muted p-2 rounded">{test.expectedOutput}</p>
                      </div>
                      {test.actualOutput && (
                        <div className="md:col-span-2">
                          <p className="font-medium text-muted-foreground mb-1">Actual Output:</p>
                          <p className={`p-2 rounded ${test.status === 'passed' ? 'bg-green-50' : 'bg-red-50'}`}>
                            {test.actualOutput}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Documentation Tab */}
        {activeTab === 'docs' && (
          <Card>
            <CardHeader>
              <CardTitle>Agent Development Documentation</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-sm max-w-none">
              <h3>Adlaan Legal Agent Development Guide</h3>
              
              <h4>Overview</h4>
              <p>
                The Adlaan Legal Agent framework provides tools for developing AI-powered legal assistants. 
                Agents can analyze documents, generate legal content, and provide legal advice.
              </p>

              <h4>Core Functions</h4>
              <ul>
                <li><strong>analyzeDocument(document)</strong> - Analyze legal documents and extract insights</li>
                <li><strong>classifyDocument(content)</strong> - Classify document types (contracts, NDAs, etc.)</li>
                <li><strong>analyzeClauses(content)</strong> - Extract and analyze legal clauses</li>
                <li><strong>assessRisks(clauses)</strong> - Evaluate legal risks in documents</li>
              </ul>

              <h4>Agent Types</h4>
              <ul>
                <li><strong>Document Generator</strong> - Creates legal documents from templates</li>
                <li><strong>Document Analyzer</strong> - Analyzes existing legal documents</li>
                <li><strong>Legal Assistant</strong> - Provides legal consultation and advice</li>
                <li><strong>Contract Reviewer</strong> - Reviews and validates contracts</li>
              </ul>

              <h4>Best Practices</h4>
              <ul>
                <li>Always validate user input before processing</li>
                <li>Include comprehensive error handling</li>
                <li>Use confidence scores for AI-generated results</li>
                <li>Maintain audit trails for legal compliance</li>
              </ul>

              <h4>Testing</h4>
              <p>
                Use the test suite to validate agent functionality. Create test cases that cover 
                common legal document types and edge cases.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}