"use client";

import { useState, useEffect } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { useRouter } from "next/navigation";
import { Building2, Users, Globe, Briefcase, ArrowRight } from "lucide-react";

export default function CompanySetup() {
  const { createCompany, user, company, authLoading } = useAuth();
  const router = useRouter();
  
  // Create company state
  const [companyName, setCompanyName] = useState("");
  const [description, setDescription] = useState("");
  const [address, setAddress] = useState("");
  const [phone, setPhone] = useState("");
  const [companyEmail, setCompanyEmail] = useState("");
  const [website, setWebsite] = useState("");
  
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [companyCreated, setCompanyCreated] = useState(false);

  // Navigate to dashboard when company is created and set
  useEffect(() => {
    if (companyCreated && company) {
      router.push("/dashboard");
    }
  }, [companyCreated, company, router]);

  // Redirect to signin if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/signin");
    }
  }, [authLoading, user, router]);

  if (authLoading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    return <div>Redirecting to signin...</div>;
  }

  const handleCreateCompany = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!companyName) {
      setError("Please enter a company name");
      return;
    }

    setLoading(true);

    try {
      await createCompany(companyName, description, address, phone, companyEmail, website);
      setCompanyCreated(true);
    } catch (err: unknown) {
      const error = err as Error;
      setError(error.message || "Failed to create company");
    } finally {
      setLoading(false);
    }
  };



  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-6 py-12">
      <div className="max-w-2xl w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border-2 border-primary/30 mb-4">
            <Building2 className="h-5 w-5 text-primary" />
            <span className="text-sm font-semibold text-primary">Company Setup</span>
          </div>
          <h1 className="text-4xl font-bold text-foreground mb-3">
            Welcome, {user?.name}!
          </h1>
          <p className="text-lg text-muted-foreground">
            Let&apos;s set up your company to get started with Adlaan
          </p>
        </div>

        {/* Form */}
        <div className="bg-card border-2 border-primary/20 rounded-2xl p-8 shadow-xl">
          <form onSubmit={handleCreateCompany} className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-foreground mb-2">
                  <Building2 className="h-4 w-4 inline-block mr-2" />
                  Company Name *
                </label>
                <input
                  type="text"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  className="w-full px-4 py-3 bg-background border-2 border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all"
                  placeholder="e.g., Smith & Associates Law Firm"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-foreground mb-2">
                  <Briefcase className="h-4 w-4 inline-block mr-2" />
                  Description
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-4 py-3 bg-background border-2 border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all"
                  placeholder="Brief description of your company"
                  rows={3}
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-foreground mb-2">
                  <Globe className="h-4 w-4 inline-block mr-2" />
                  Address
                </label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full px-4 py-3 bg-background border-2 border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all"
                  placeholder="Company address"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-foreground mb-2">
                  <Users className="h-4 w-4 inline-block mr-2" />
                  Phone
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-4 py-3 bg-background border-2 border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all"
                  placeholder="Company phone number"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-foreground mb-2">
                  <Building2 className="h-4 w-4 inline-block mr-2" />
                  Email
                </label>
                <input
                  type="email"
                  value={companyEmail}
                  onChange={(e) => setCompanyEmail(e.target.value)}
                  className="w-full px-4 py-3 bg-background border-2 border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all"
                  placeholder="company@example.com"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-foreground mb-2">
                  <Globe className="h-4 w-4 inline-block mr-2" />
                  Website
                </label>
                <input
                  type="url"
                  value={website}
                  onChange={(e) => setWebsite(e.target.value)}
                  className="w-full px-4 py-3 bg-background border-2 border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all"
                  placeholder="https://www.company.com"
                />
              </div>

              {error && (
                <div className="p-4 bg-destructive/10 border-2 border-destructive/30 rounded-lg text-destructive text-sm">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 bg-gradient-to-r from-primary to-primary/90 text-primary-foreground font-bold rounded-xl hover:from-primary/90 hover:to-primary transition-all duration-300 shadow-lg shadow-primary/30 hover:shadow-xl hover:shadow-primary/40 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? "Creating..." : "Create Company"}
                <ArrowRight className="h-5 w-5" />
              </button>
            </form>
        </div>

        {/* Skip Option */}
        <div className="text-center mt-6">
          <button
            onClick={() => router.push("/")}
            className="text-sm text-muted-foreground hover:text-primary transition-colors"
          >
            Skip for now
          </button>
        </div>
      </div>
    </div>
  );
}
