"use client";

import { useAuth } from "../../contexts/AuthContext";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { Building2, Users, Globe, ArrowRight, Settings, FileText, BarChart3, User, Mail, Shield, Calendar } from "lucide-react";
import { Button } from "../../components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/card";
import { BentoGrid, type BentoItem } from "../../components/ui/bento-grid";
import { Avatar, AvatarImage, AvatarFallback } from "../../components/ui/avatar";
import { Badge } from "../../components/ui/badge";

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

  // Create dashboard items for BentoGrid
  const dashboardItems: BentoItem[] = [
    {
      title: user.name,
      meta: user.role,
      description: `Welcome back! Your account is active with ${user.role} privileges.`,
      icon: <User className="w-4 h-4 text-blue-500" />,
      status: "Active",
      tags: ["Admin", "Verified"],
      colSpan: 2,
      hasPersistentHover: true,
    },
    {
      title: company.name,
      meta: company.description || "Legal Services",
      description: `Company ID: ${company.id} • Established in your workspace`,
      icon: <Building2 className="w-4 h-4 text-emerald-500" />,
      status: "Active",
      tags: ["Company", "Legal"],
    },
    {
      title: "Contact Information",
      meta: company.email || "Not set",
      description: company.phone ? `Phone: ${company.phone}` : "Phone not configured",
      icon: <Mail className="w-4 h-4 text-purple-500" />,
      status: company.email ? "Configured" : "Setup needed",
      tags: ["Contact", "Communication"],
    },
    {
      title: "Company Address",
      meta: company.address || "Not set",
      description: company.website ? `Website: ${company.website}` : "Website not configured",
      icon: <Globe className="w-4 h-4 text-orange-500" />,
      status: company.address ? "Complete" : "Setup needed",
      tags: ["Location", "Address"],
      colSpan: 2,
    },
    {
      title: "Case Management",
      meta: "0 active cases",
      description: "Start managing legal cases with AI-powered assistance",
      icon: <FileText className="w-4 h-4 text-red-500" />,
      status: "Ready",
      tags: ["Cases", "Legal", "AI"],
      cta: "Manage Cases →",
    },
    {
      title: "Team Analytics",
      meta: "1 member",
      description: "Monitor team performance and case outcomes",
      icon: <BarChart3 className="w-4 h-4 text-cyan-500" />,
      status: "Live",
      tags: ["Analytics", "Performance"],
      cta: "View Reports →",
    },
  ];

  return (
    <div className="min-h-screen bg-background">
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
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-2">
            <h2 className="text-3xl font-bold text-foreground">Dashboard</h2>
            <Badge variant="outline" className="text-green-600 border-green-600">
              <div className="w-2 h-2 bg-green-600 rounded-full mr-2"></div>
              Live
            </Badge>
          </div>
          <p className="text-muted-foreground">
            Manage your legal practice with AI-powered tools and insights
          </p>
        </div>

        {/* Bento Grid Dashboard */}
        <BentoGrid items={dashboardItems} />

        {/* Quick Actions Section */}
        <div className="mt-12">
          <h3 className="text-2xl font-bold text-foreground mb-6">Quick Actions</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card className="cursor-pointer hover:shadow-lg transition-all duration-300 hover:scale-105 border-2 hover:border-primary/50" onClick={() => router.push("/cases")}>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center text-lg">
                  <FileText className="h-5 w-5 mr-2 text-primary" />
                  Manage Cases
                </CardTitle>
                <CardDescription>
                  Create and manage legal cases for your firm
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button className="w-full bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70">
                  Open Cases
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </CardContent>
            </Card>

            <Card className="cursor-pointer hover:shadow-lg transition-all duration-300 hover:scale-105 border-2 hover:border-primary/50" onClick={() => router.push("/analytics")}>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center text-lg">
                  <BarChart3 className="h-5 w-5 mr-2 text-primary" />
                  Analytics
                </CardTitle>
                <CardDescription>
                  View reports and insights about your firm&apos;s performance
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button className="w-full bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70">
                  View Analytics
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </CardContent>
            </Card>

            <Card className="cursor-pointer hover:shadow-lg transition-all duration-300 hover:scale-105 border-2 hover:border-primary/50" onClick={() => router.push("/team")}>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center text-lg">
                  <Users className="h-5 w-5 mr-2 text-primary" />
                  Team Management
                </CardTitle>
                <CardDescription>
                  Manage team members and permissions
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button className="w-full bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70">
                  Manage Team
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </CardContent>
            </Card>

            <Card className="cursor-pointer hover:shadow-lg transition-all duration-300 hover:scale-105 border-2 hover:border-primary/50" onClick={() => router.push("/documents")}>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center text-lg">
                  <FileText className="h-5 w-5 mr-2 text-primary" />
                  Documents
                </CardTitle>
                <CardDescription>
                  Store and manage your files and documents
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button className="w-full bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70">
                  Open Drive
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="mt-12">
          <h3 className="text-2xl font-bold text-foreground mb-6">Recent Activity</h3>
          <Card className="border-2">
            <CardHeader className="bg-gradient-to-r from-muted/50 to-muted/10">
              <CardTitle className="flex items-center">
                <Calendar className="h-5 w-5 mr-2 text-primary" />
                Getting Started
              </CardTitle>
              <CardDescription>
                Welcome to your legal AI platform dashboard
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="space-y-4">
                <div className="flex items-center space-x-4 p-3 rounded-lg bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <div>
                    <p className="text-sm font-medium text-green-900 dark:text-green-100">Company setup completed</p>
                    <p className="text-xs text-green-600 dark:text-green-400">Just now</p>
                  </div>
                </div>
                <div className="flex items-center space-x-4 p-3 rounded-lg bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800">
                  <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                  <div>
                    <p className="text-sm font-medium text-blue-900 dark:text-blue-100">Account created successfully</p>
                    <p className="text-xs text-blue-600 dark:text-blue-400">Just now</p>
                  </div>
                </div>
                <div className="flex items-center space-x-4 p-3 rounded-lg bg-purple-50 dark:bg-purple-950/20 border border-purple-200 dark:border-purple-800">
                  <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                  <div>
                    <p className="text-sm font-medium text-purple-900 dark:text-purple-100">ADMIN role assigned</p>
                    <p className="text-xs text-purple-600 dark:text-purple-400">Just now</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}