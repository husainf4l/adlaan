"use client";

import { useAuth } from "../../contexts/AuthContext";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { Building2, Users, Globe, ArrowRight, Settings, FileText, BarChart3, User, Mail, Shield, Calendar, Plus, Upload, Eye, AlertTriangle, TrendingUp, HardDrive, MessageSquare, Crown, Clock, CheckCircle, XCircle, FileCheck, UserPlus, UserMinus, FileSearch } from "lucide-react";
import { Button } from "../../components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/card";
import { Badge } from "../../components/ui/badge";
import { Progress } from "../../components/ui/progress";
import { DashboardLayout } from "../../components/DashboardLayout";
import { Avatar, AvatarImage, AvatarFallback } from "../../components/ui/avatar";

// Mock data for the enhanced dashboard
const mockData = {
  company: {
    name: "Papaya Trading",
    plan: "Business Plan",
    totalDocuments: 184,
    totalEmployees: 12,
    pendingContracts: 7,
    storageUsed: 2.3,
    storageTotal: 10,
    lastLogin: "2 hours ago"
  },
  recentDocuments: [
    { name: "Employment Contract - John Doe", type: "HR", createdBy: "Sarah Wilson", status: "Signed", dateModified: "2024-01-15" },
    { name: "NDA - TechCorp Inc", type: "Legal", createdBy: "Mike Johnson", status: "Pending", dateModified: "2024-01-14" },
    { name: "Sales Agreement - ABC Corp", type: "Sales", createdBy: "Emma Davis", status: "Draft", dateModified: "2024-01-13" },
    { name: "Partnership Agreement", type: "Legal", createdBy: "Alex Chen", status: "Signed", dateModified: "2024-01-12" },
    { name: "Vendor Contract - XYZ Ltd", type: "Procurement", createdBy: "Lisa Brown", status: "Pending", dateModified: "2024-01-11" },
    { name: "Service Agreement - DEF Inc", type: "Legal", createdBy: "Tom Wilson", status: "Draft", dateModified: "2024-01-10" },
    { name: "Consulting Agreement", type: "Legal", createdBy: "Anna Lee", status: "Signed", dateModified: "2024-01-09" }
  ],
  employeeActivity: {
    activeEmployees: 12,
    pendingHRDocuments: 3,
    recentlyHired: 2,
    recentlyExited: 1,
    recentActions: [
      { action: "New employee added", employee: "John Doe", date: "2024-01-15", type: "hire" },
      { action: "Contract renewed", employee: "Sarah Wilson", date: "2024-01-14", type: "renewal" },
      { action: "Employee terminated", employee: "Mike Johnson", date: "2024-01-13", type: "termination" },
      { action: "Promotion recorded", employee: "Emma Davis", date: "2024-01-12", type: "promotion" }
    ]
  },
  storage: {
    totalDocuments: 184,
    usedStorage: 2.3,
    totalStorage: 10,
    mostActiveFolder: "HR / Contracts"
  },
  recentActivity: [
    { user: "Sarah Wilson", action: "created a Sales Agreement", time: "2 hours ago", type: "create" },
    { user: "Mike Johnson", action: "analyzed NDA.pdf — 1 risk detected", time: "4 hours ago", type: "analyze" },
    { user: "Emma Davis", action: "added new employee John Doe", time: "6 hours ago", type: "employee" },
    { user: "Alex Chen", action: "deleted old contract version", time: "1 day ago", type: "delete" },
    { user: "Lisa Brown", action: "uploaded Vendor Contract.pdf", time: "1 day ago", type: "upload" },
    { user: "Tom Wilson", action: "signed Partnership Agreement", time: "2 days ago", type: "sign" }
  ],
  aiAssistantQueries: [
    "Summarize my last 5 HR contracts",
    "Generate a Sales Agreement for a new supplier",
    "Review NDA for potential risks",
    "Create employment contract template"
  ]
};

export default function Dashboard() {
  const { user, company, logout, authLoading } = useAuth();
  const router = useRouter();
  const [companyLoading, setCompanyLoading] = useState(true);

  useEffect(() => {
    // Wait for authentication check to complete
    if (authLoading) return;

    if (!user) {
      router.push("/signin");
      return;
    }

    // If user exists but no company, redirect to company setup
    if (user && !company) {
      router.push("/company-setup");
      return;
    }

    // If we have both user and company, stop loading
    if (user && company) {
      setCompanyLoading(false);
    }
  }, [user, company, authLoading, router]);

  if (authLoading || companyLoading || !user || !company) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">
            {authLoading ? "Loading authentication..." : companyLoading ? "Loading company data..." : "Loading dashboard..."}
          </p>
        </div>
      </div>
    );
  }

  const handleLogout = () => {
    logout();
    router.push("/");
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'signed': return 'text-green-600 bg-green-50 border-green-200';
      case 'pending': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'draft': return 'text-blue-600 bg-blue-50 border-blue-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'create': return <Plus className="w-4 h-4 text-green-600" />;
      case 'analyze': return <FileSearch className="w-4 h-4 text-blue-600" />;
      case 'employee': return <UserPlus className="w-4 h-4 text-purple-600" />;
      case 'delete': return <XCircle className="w-4 h-4 text-red-600" />;
      case 'upload': return <Upload className="w-4 h-4 text-orange-600" />;
      case 'sign': return <CheckCircle className="w-4 h-4 text-green-600" />;
      default: return <FileText className="w-4 h-4 text-gray-600" />;
    }
  };

  return (
    <DashboardLayout>
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <Avatar className="h-10 w-10">
                <AvatarImage src="" alt={user.name} />
                <AvatarFallback className="bg-primary text-primary-foreground">
                  {user.name.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div>
                <h1 className="text-xl font-bold text-foreground">{company.name}</h1>
                <p className="text-sm text-muted-foreground">Welcome back, {user.name}!</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20">
                <Shield className="w-3 h-3 mr-1" />
                {user.role}
              </Badge>
              <Button variant="outline" size="sm" onClick={() => router.push("/profile")}>
                <Settings className="h-4 w-4 mr-2" />
                Profile
              </Button>
              <Button variant="outline" size="sm" onClick={handleLogout}>
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto p-6 space-y-8">
        {/* Header Section - Quick Summary */}
        <div className="bg-gradient-to-r from-primary/5 to-primary/10 rounded-lg p-6 border">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div>
              <h2 className="text-2xl font-bold text-foreground mb-2">
                {mockData.company.name} – {mockData.company.plan}
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm">
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">{mockData.company.totalDocuments}</div>
                  <div className="text-muted-foreground">Total Documents</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">{mockData.company.totalEmployees}</div>
                  <div className="text-muted-foreground">Total Employees</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-orange-600">{mockData.company.pendingContracts}</div>
                  <div className="text-muted-foreground">Pending Contracts</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{mockData.company.storageUsed} GB</div>
                  <div className="text-muted-foreground">Storage Used</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">{mockData.company.lastLogin}</div>
                  <div className="text-muted-foreground">Last Login</div>
                </div>
              </div>
            </div>
            <Button size="lg" className="bg-primary hover:bg-primary/90">
              <Plus className="w-4 h-4 mr-2" />
              Create Contract
            </Button>
          </div>
        </div>

        {/* Recent Documents */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="flex items-center">
                <FileText className="w-5 h-5 mr-2" />
                Recent Documents
              </CardTitle>
              <CardDescription>Latest files and contracts in your workspace</CardDescription>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                <Upload className="w-4 h-4 mr-2" />
                Upload File
              </Button>
              <Button variant="outline" size="sm" onClick={() => router.push("/dashboard/documents")}>
                <Eye className="w-4 h-4 mr-2" />
                View All Documents
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-3 font-medium">Document Name</th>
                    <th className="text-left p-3 font-medium">Type</th>
                    <th className="text-left p-3 font-medium">Created By</th>
                    <th className="text-left p-3 font-medium">Status</th>
                    <th className="text-left p-3 font-medium">Date Modified</th>
                  </tr>
                </thead>
                <tbody>
                  {mockData.recentDocuments.map((doc, index) => (
                    <tr key={index} className="border-b hover:bg-muted/50">
                      <td className="p-3">
                        <div className="flex items-center">
                          <FileText className="w-4 h-4 mr-2 text-muted-foreground" />
                          {doc.name}
                        </div>
                      </td>
                      <td className="p-3">
                        <Badge variant="outline">{doc.type}</Badge>
                      </td>
                      <td className="p-3">{doc.createdBy}</td>
                      <td className="p-3">
                        <Badge className={getStatusColor(doc.status)}>{doc.status}</Badge>
                      </td>
                      <td className="p-3 text-muted-foreground">{doc.dateModified}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Employee Activity Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Users className="w-5 h-5 mr-2 text-blue-600" />
                Employee Activity Summary
              </CardTitle>
              <CardDescription>Recent HR actions and workforce metrics</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Metrics */}
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-4 bg-green-50 dark:bg-green-950/20 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">{mockData.employeeActivity.activeEmployees}</div>
                  <div className="text-sm text-muted-foreground">Active Employees</div>
                </div>
                <div className="text-center p-4 bg-yellow-50 dark:bg-yellow-950/20 rounded-lg">
                  <div className="text-2xl font-bold text-yellow-600">{mockData.employeeActivity.pendingHRDocuments}</div>
                  <div className="text-sm text-muted-foreground">Pending HR Documents</div>
                </div>
                <div className="text-center p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">+{mockData.employeeActivity.recentlyHired}</div>
                  <div className="text-sm text-muted-foreground">Recently Hired</div>
                </div>
                <div className="text-center p-4 bg-red-50 dark:bg-red-950/20 rounded-lg">
                  <div className="text-2xl font-bold text-red-600">-{mockData.employeeActivity.recentlyExited}</div>
                  <div className="text-sm text-muted-foreground">Recently Exited</div>
                </div>
              </div>

              {/* Recent Actions */}
              <div>
                <h4 className="font-medium mb-3">Recent Actions</h4>
                <div className="space-y-3">
                  {mockData.employeeActivity.recentActions.map((action, index) => (
                    <div key={index} className="flex items-center space-x-3 p-3 rounded-lg bg-muted/30">
                      {action.type === 'hire' && <UserPlus className="w-4 h-4 text-green-600" />}
                      {action.type === 'renewal' && <FileCheck className="w-4 h-4 text-blue-600" />}
                      {action.type === 'termination' && <UserMinus className="w-4 h-4 text-red-600" />}
                      {action.type === 'promotion' && <TrendingUp className="w-4 h-4 text-purple-600" />}
                      <div>
                        <p className="text-sm font-medium">{action.action}</p>
                        <p className="text-xs text-muted-foreground">{action.employee} • {action.date}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Storage & Organization Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <HardDrive className="w-5 h-5 mr-2 text-cyan-600" />
                Storage & Organization
              </CardTitle>
              <CardDescription>Document storage usage and organization insights</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span>Storage Used</span>
                    <span>{mockData.storage.usedStorage} GB / {mockData.storage.totalStorage} GB</span>
                  </div>
                  <Progress value={(mockData.storage.usedStorage / mockData.storage.totalStorage) * 100} className="h-2" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-4 bg-muted/30 rounded-lg">
                    <div className="text-2xl font-bold">{mockData.storage.totalDocuments}</div>
                    <div className="text-sm text-muted-foreground">Total Documents</div>
                  </div>
                  <div className="text-center p-4 bg-muted/30 rounded-lg">
                    <div className="text-lg font-medium">{mockData.storage.mostActiveFolder}</div>
                    <div className="text-sm text-muted-foreground">Most Active Folder</div>
                  </div>
                </div>
              </div>
              <Button variant="outline" className="w-full">
                <HardDrive className="w-4 h-4 mr-2" />
                View Cloud Storage
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity Log */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Clock className="w-5 h-5 mr-2 text-orange-600" />
              Recent Activity Log
            </CardTitle>
            <CardDescription>Chronological feed of recent system actions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {mockData.recentActivity.map((activity, index) => (
                <div key={index} className="flex items-start space-x-4 p-4 rounded-lg bg-muted/30 border-l-4 border-l-primary/20">
                  <div className="mt-1">
                    {getActivityIcon(activity.type)}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm">
                      <span className="font-medium">{activity.user}</span> {activity.action}
                    </p>
                    <p className="text-xs text-muted-foreground">{activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* AI Assistant Shortcut */}
        <Card className="bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-950/20 dark:to-blue-950/20 border-purple-200 dark:border-purple-800">
          <CardHeader>
            <CardTitle className="flex items-center">
              <MessageSquare className="w-5 h-5 mr-2 text-purple-600" />
              AI Assistant
            </CardTitle>
            <CardDescription>Ask Adlaan AI for help with your legal documents and processes</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              {mockData.aiAssistantQueries.map((query, index) => (
                <Button
                  key={index}
                  variant="outline"
                  className="justify-start h-auto p-4 text-left"
                  onClick={() => router.push("/dashboard/ai")}
                >
                  <MessageSquare className="w-4 h-4 mr-3 text-purple-600" />
                  <span className="text-sm">{query}</span>
                </Button>
              ))}
            </div>
            <Button className="w-full bg-purple-600 hover:bg-purple-700">
              <MessageSquare className="w-4 h-4 mr-2" />
              Open AI Assistant
            </Button>
          </CardContent>
        </Card>

        {/* Subscription/Plan Reminder */}
        <Card className="bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-950/20 dark:to-red-950/20 border-orange-200 dark:border-orange-800">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Crown className="w-6 h-6 text-orange-600" />
                <div>
                  <h3 className="font-medium">Storage Usage Alert</h3>
                  <p className="text-sm text-muted-foreground">
                    You&apos;re at 85% of your document limit — Consider upgrading your plan
                  </p>
                </div>
              </div>
              <Button variant="outline" className="border-orange-300 text-orange-700 hover:bg-orange-50">
                Upgrade Plan
              </Button>
            </div>
          </CardContent>
        </Card>
      </main>
    </DashboardLayout>
  );
}