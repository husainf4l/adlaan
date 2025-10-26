"use client";

import { useState, useEffect } from "react";
import { useAuth } from "../../../contexts/AuthContext";
import { useRouter } from "next/navigation";
import { Building2, Briefcase, Camera, MapPin, Mail, Phone, Link as LinkIcon } from "lucide-react";
import { DashboardLayout } from "../../../components/DashboardLayout";
import { Avatar, AvatarImage, AvatarFallback } from "../../../components/ui/avatar";
import { Button } from "../../../components/ui/button";

export default function CompanyProfile() {
  const { user, company, updateCompany, authLoading } = useAuth();
  const router = useRouter();

  // Company state initialized with existing company data
  const [companyName, setCompanyName] = useState(company?.name || "");
  const [description, setDescription] = useState(company?.description || "");
  const [address, setAddress] = useState(company?.address || "");
  const [phone, setPhone] = useState(company?.phone || "");
  const [companyEmail, setCompanyEmail] = useState(company?.email || "");
  const [website, setWebsite] = useState(company?.website || "");

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  // Update state when company data changes
  useEffect(() => {
    if (company) {
      setCompanyName(company.name || "");
      setDescription(company.description || "");
      setAddress(company.address || "");
      setPhone(company.phone || "");
      setCompanyEmail(company.email || "");
      setWebsite(company.website || "");
    }
  }, [company]);

  // Redirect to signin if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/signin");
    }
  }, [authLoading, user, router]);

  // Redirect to company setup if no company
  useEffect(() => {
    if (!authLoading && user && !company) {
      router.push("/company-setup");
    }
  }, [authLoading, user, company, router]);

  if (authLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </DashboardLayout>
    );
  }

  if (!user) {
    return null;
  }

  if (!company) {
    return null;
  }

  const handleUpdateCompany = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess(false);

    if (!companyName) {
      setError("Please enter a company name");
      return;
    }

    if (!company.id) {
      setError("Company ID not found");
      return;
    }

    setLoading(true);

    try {
      await updateCompany(company.id, companyName, description, address, phone, companyEmail, website);
      setSuccess(true);
      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: unknown) {
      const error = err as Error;
      setError(error.message || "Failed to update company");
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-2xl mx-auto py-8 px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-foreground">Edit Profile</h1>
          <p className="text-muted-foreground mt-1">Update your company information</p>
        </div>

        <form onSubmit={handleUpdateCompany} className="space-y-6">
          {/* Profile Picture Section */}
          <div className="flex flex-col items-center space-y-4 py-6">
            <div className="relative">
              <Avatar className="w-24 h-24">
                <AvatarImage src="" alt={company.name} />
                <AvatarFallback className="text-2xl bg-primary/10">
                  {company.name.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <button
                type="button"
                className="absolute bottom-0 right-0 bg-primary text-primary-foreground rounded-full p-2 shadow-lg hover:bg-primary/90 transition-colors"
              >
                <Camera className="w-4 h-4" />
              </button>
            </div>
            <button
              type="button"
              className="text-primary font-medium text-sm hover:underline"
            >
              Change profile photo
            </button>
          </div>

          {/* Form Fields */}
          <div className="space-y-4">
            {/* Company Name */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground flex items-center gap-2">
                <Building2 className="w-4 h-4" />
                Company Name
              </label>
              <input
                type="text"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                className="w-full px-3 py-2 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all"
                placeholder="Enter company name"
              />
            </div>

            {/* Description */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground flex items-center gap-2">
                <Briefcase className="w-4 h-4" />
                Description
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-3 py-2 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all resize-none"
                placeholder="Tell people about your company"
                rows={3}
                maxLength={150}
              />
              <div className="text-xs text-muted-foreground text-right">
                {description.length}/150
              </div>
            </div>

            {/* Website */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground flex items-center gap-2">
                <LinkIcon className="w-4 h-4" />
                Website
              </label>
              <input
                type="url"
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
                className="w-full px-3 py-2 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all"
                placeholder="https://www.company.com"
              />
            </div>

            {/* Email */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground flex items-center gap-2">
                <Mail className="w-4 h-4" />
                Email
              </label>
              <input
                type="email"
                value={companyEmail}
                onChange={(e) => setCompanyEmail(e.target.value)}
                className="w-full px-3 py-2 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all"
                placeholder="contact@company.com"
              />
            </div>

            {/* Phone */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground flex items-center gap-2">
                <Phone className="w-4 h-4" />
                Phone
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-3 py-2 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all"
                placeholder="+1 (555) 123-4567"
              />
            </div>

            {/* Address */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                Address
              </label>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full px-3 py-2 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all"
                placeholder="123 Business St, City, State 12345"
              />
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="p-3 bg-destructive/10 border border-destructive/30 rounded-lg text-destructive text-sm">
              {error}
            </div>
          )}

          {/* Success Message */}
          {success && (
            <div className="p-3 bg-green-500/10 border border-green-500/30 rounded-lg text-green-600 text-sm">
              Profile updated successfully!
            </div>
          )}

          {/* Submit Button */}
          <div className="pt-4">
            <Button
              type="submit"
              disabled={loading}
              className="w-full"
            >
              {loading ? "Updating..." : "Update Profile"}
            </Button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
}