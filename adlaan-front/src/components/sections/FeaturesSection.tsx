"use client";

import { BentoGrid, type BentoItem } from "../ui/bento-grid";
import {
  FileText,
  Scale,
  Shield,
  Briefcase,
  MessageSquare,
  Clock,
  CheckCircle,
  BookOpen,
  Gavel,
} from "lucide-react";

export function FeaturesSection() {
  const legalFeatures: BentoItem[] = [
    {
      title: "Contract Drafting & Review",
      meta: "AI-Powered",
      description:
        "Leverage advanced AI to draft, review, and analyze contracts with precision. Identify risks, clauses, and obligations instantly.",
      icon: <FileText className="w-4 h-4 text-blue-500" />,
      status: "Enterprise",
      tags: ["Contracts", "Analysis", "Risk"],
      colSpan: 2,
      hasPersistentHover: true,
      cta: "Start drafting →",
    },
    {
      title: "Legal Research Assistant",
      meta: "Case law & statutes",
      description: "Access comprehensive legal research with AI-powered case law analysis and statute interpretation.",
      icon: <BookOpen className="w-4 h-4 text-emerald-500" />,
      status: "Professional",
      tags: ["Research", "Case Law"],
      cta: "Start research →",
    },
    {
      title: "Regulatory Compliance",
      meta: "Multi-jurisdictional",
      description: "Ensure full regulatory compliance across federal, state, and international jurisdictions with automated verification.",
      icon: <Shield className="w-4 h-4 text-purple-500" />,
      tags: ["Compliance", "Regulation"],
      colSpan: 2,
      cta: "Check compliance →",
    },
    {
      title: "Document Automation",
      meta: "500+ legal forms",
      description: "Generate court-ready legal documents from NDAs to incorporation papers in minutes, not hours.",
      icon: <Gavel className="w-4 h-4 text-red-500" />,
      status: "Popular",
      tags: ["Forms", "Templates"],
      cta: "Browse templates →",
    },
    {
      title: "Due Diligence Support",
      meta: "M&A Ready",
      description: "Streamline due diligence processes with intelligent document organization, analysis, and red-flag detection.",
      icon: <Briefcase className="w-4 h-4 text-amber-500" />,
      status: "Premium",
      tags: ["M&A", "Corporate"],
      cta: "Explore tools →",
    },
    {
      title: "Legal Consultation AI",
      meta: "24/7 Available",
      description: "Get instant legal guidance on contract terms, procedural questions, and preliminary case assessments from our AI assistant.",
      icon: <MessageSquare className="w-4 h-4 text-sky-500" />,
      tags: ["Consultation", "AI Chat"],
      colSpan: 2,
      cta: "Ask a question →",
    },
    {
      title: "Precedent Analysis",
      meta: "Verified sources",
      description: "Access verified legal precedents and benchmark your documents against industry standards and best practices.",
      icon: <CheckCircle className="w-4 h-4 text-green-500" />,
      status: "Trusted",
      tags: ["Precedent", "Standards"],
      cta: "View precedents →",
    },
    {
      title: "Court Filing Ready",
      meta: "E-filing compatible",
      description: "Generate documents that meet court filing requirements with proper formatting, citations, and jurisdictional rules.",
      icon: <Scale className="w-4 h-4 text-indigo-500" />,
      tags: ["Court", "E-Filing"],
      cta: "Prepare filing →",
    },
  ];

  return (
    <section id="features" className="py-24 px-6 bg-black">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 mb-6">
            <Scale className="h-4 w-4 text-white" />
            <span className="text-sm font-medium text-white">Professional Legal Technology</span>
          </div>
          <h2 className="text-5xl md:text-6xl font-bold mb-6 tracking-tight text-white">
            Comprehensive Legal Solutions
          </h2>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto leading-relaxed">
            Built for attorneys, law firms, and corporate legal departments. Streamline your practice with enterprise-grade AI technology.
          </p>
        </div>

        <BentoGrid items={legalFeatures} />
        
        {/* Trust Bar */}
        <div className="mt-16 pt-12 border-t border-white/10">
          <p className="text-center text-gray-500 text-sm mb-6">Trusted by leading law firms and legal departments</p>
          <div className="flex flex-wrap justify-center items-center gap-8 text-gray-600">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-500" />
              <span className="text-sm font-medium text-gray-400">Bar Association Recognized</span>
            </div>
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-blue-500" />
              <span className="text-sm font-medium text-gray-400">SOC 2 Compliant</span>
            </div>
            <div className="flex items-center gap-2">
              <Scale className="h-5 w-5 text-purple-500" />
              <span className="text-sm font-medium text-gray-400">Legal Ethics Approved</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}