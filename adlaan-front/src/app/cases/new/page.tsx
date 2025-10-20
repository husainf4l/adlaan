"use client";

import { useState, useEffect } from "react";
import { useAuth } from "../../../contexts/AuthContext";
import { useRouter } from "next/navigation";
import { client } from "../../../lib/apollo-client";
import {
  ArrowLeft,
  Save,
  User,
  Building2,
  AlertCircle
} from "lucide-react";
import { Button } from "../../../components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../../components/ui/card";
import { Input } from "../../../components/ui/input";
import { CREATE_CASE_MUTATION } from "../../../lib/graphql";

interface User {
  id: string;
  name: string;
  email: string;
}

export default function NewCasePage() {
  const { user, company, authLoading } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [users, setUsers] = useState<User[]>([]);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    caseNumber: "",
    caseType: "LITIGATION",
    status: "ACTIVE",
    clientId: "",
    assignedUserId: ""
  });

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/signin");
      return;
    }
    if (!authLoading && user && !company) {
      router.push("/company-setup");
      return;
    }
  }, [user, company, authLoading, router]);

  // For now, we'll assume users are available, or we can fetch them
  // Since we don't have a users query, we'll skip assigned user for now

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !company) return;

    setLoading(true);
    setError(null);

    try {
      const input: any = {
        title: formData.title,
        description: formData.description,
        caseNumber: formData.caseNumber,
        caseType: formData.caseType,
        status: formData.status,
        clientId: parseInt(formData.clientId),
        assignedUserId: formData.assignedUserId ? parseInt(formData.assignedUserId) : null
      };

      const { data }: any = await client.mutate({
        mutation: CREATE_CASE_MUTATION,
        variables: { input }
      });

      if (data?.createCase) {
        router.push("/cases");
      }
    } catch (err: any) {
      console.error('Error creating case:', err);
      setError(err.message || 'Failed to create case');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  if (authLoading || !user || !company) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <Building2 className="h-8 w-8 text-primary" />
              <div>
                <h1 className="text-xl font-bold text-foreground">{company.name} - New Case</h1>
                <p className="text-sm text-muted-foreground">Create a new legal case</p>
              </div>
            </div>
            <Button variant="outline" size="sm" onClick={() => router.push("/cases")}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Cases
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="max-w-2xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle>Create New Case</CardTitle>
              <CardDescription>
                Fill in the details below to create a new case.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {error && (
                  <div className="flex items-center gap-2 p-4 bg-red-50 border border-red-200 rounded-md text-red-700">
                    <AlertCircle className="h-4 w-4" />
                    <span>{error}</span>
                  </div>
                )}

                <div className="space-y-2">
                  <label htmlFor="caseNumber" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">Case Number *</label>
                  <Input
                    id="caseNumber"
                    type="text"
                    placeholder="Enter case number"
                    value={formData.caseNumber}
                    onChange={(e) => handleInputChange("caseNumber", e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="title" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">Case Title *</label>
                  <Input
                    id="title"
                    type="text"
                    placeholder="Enter case title"
                    value={formData.title}
                    onChange={(e) => handleInputChange("title", e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="description" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">Description *</label>
                  <textarea
                    id="description"
                    placeholder="Enter case description"
                    value={formData.description}
                    onChange={(e) => handleInputChange("description", e.target.value)}
                    rows={4}
                    className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="caseType" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">Case Type</label>
                  <select
                    id="caseType"
                    value={formData.caseType}
                    onChange={(e) => handleInputChange("caseType", e.target.value)}
                    className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                  >
                    <option value="LITIGATION">Litigation</option>
                    <option value="CORPORATE">Corporate</option>
                    <option value="INTELLECTUAL_PROPERTY">Intellectual Property</option>
                    <option value="REAL_ESTATE">Real Estate</option>
                    <option value="FAMILY_LAW">Family Law</option>
                    <option value="CRIMINAL">Criminal</option>
                    <option value="TAX">Tax</option>
                    <option value="EMPLOYMENT">Employment</option>
                    <option value="IMMIGRATION">Immigration</option>
                    <option value="BANKRUPTCY">Bankruptcy</option>
                    <option value="OTHER">Other</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label htmlFor="status" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">Status</label>
                  <select
                    id="status"
                    value={formData.status}
                    onChange={(e) => handleInputChange("status", e.target.value)}
                    className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                  >
                    <option value="ACTIVE">Active</option>
                    <option value="PENDING">Pending</option>
                    <option value="CLOSED">Closed</option>
                    <option value="ARCHIVED">Archived</option>
                    <option value="ON_HOLD">On Hold</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label htmlFor="clientId" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">Client ID *</label>
                  <Input
                    id="clientId"
                    type="number"
                    placeholder="Enter client ID"
                    value={formData.clientId}
                    onChange={(e) => handleInputChange("clientId", e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="assignedUserId" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">Assigned User ID (Optional)</label>
                  <Input
                    id="assignedUserId"
                    type="text"
                    placeholder="Enter assigned user ID"
                    value={formData.assignedUserId}
                    onChange={(e) => handleInputChange("assignedUserId", e.target.value)}
                  />
                </div>

                <div className="flex gap-4">
                  <Button type="submit" disabled={loading} className="flex-1">
                    {loading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Creating...
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4 mr-2" />
                        Create Case
                      </>
                    )}
                  </Button>
                  <Button type="button" variant="outline" onClick={() => router.push("/cases")} className="flex-1">
                    Cancel
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}