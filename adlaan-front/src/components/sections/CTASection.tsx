"use client";

import { Button } from "../../components/ui/button";
import { ArrowRight, FileText, MessageSquare, Scale, Shield, CheckCircle2, Clock } from "lucide-react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../contexts/AuthContext";

export function CTASection() {
  const router = useRouter();
  const { isAuthenticated } = useAuth();

  const handleGenerateDocument = () => {
    if (isAuthenticated) {
      router.push("/dashboard/documents/new");
    } else {
      router.push("/signup");
    }
  };

  const handleExploreTemplates = () => {
    if (isAuthenticated) {
      router.push("/dashboard/templates");
    } else {
      router.push("/signup");
    }
  };

  const handleChatWithAI = () => {
    if (isAuthenticated) {
      router.push("/dashboard/legal-chat");
    } else {
      router.push("/signup");
    }
  };

  return (
    <section className="py-24 px-6 relative overflow-hidden bg-gradient-to-br from-background via-card/50 to-background">
      {/* Modern gradient orbs */}
      <div className="absolute top-1/4 -right-48 w-96 h-96 bg-primary/20 rounded-full blur-3xl animate-pulse"></div>
      <div className="absolute -bottom-24 -left-48 w-96 h-96 bg-secondary/20 rounded-full blur-3xl animate-pulse delay-700"></div>
      
      <div className="max-w-6xl mx-auto relative z-10">
        {/* Main CTA Card */}
        <div className="bg-gradient-to-br from-card/90 to-muted/50 backdrop-blur-xl rounded-3xl border-2 border-primary/30 p-12 md:p-16 shadow-2xl shadow-primary/20 relative overflow-hidden">
          {/* Decorative corner accent */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-secondary/20 to-transparent rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-tr from-primary/20 to-transparent rounded-full blur-3xl"></div>
          
          <div className="text-center max-w-4xl mx-auto relative z-10">
            {/* Legal Badge */}
            <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-gradient-to-r from-primary/20 via-secondary/20 to-primary/20 backdrop-blur-sm border-2 border-primary/40 mb-8 shadow-lg">
              <Scale className="h-4 w-4 text-primary animate-pulse" />
              <span className="text-sm font-semibold text-primary tracking-wide">AI-Powered Legal Documents</span>
            </div>
            
            {/* Headline */}
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 text-foreground tracking-tight leading-[1.15]">
              Create ready-to-sign contracts
              <br />
              <span className="bg-gradient-to-r from-primary via-secondary to-primary bg-clip-text text-transparent">
                in minutes
              </span>
            </h2>
            
            {/* Supporting text */}
            <p className="text-lg md:text-xl text-muted-foreground mb-12 max-w-2xl mx-auto leading-relaxed">
              Fully compliant, fully yours. Generate professional legal documents with AI assistance — no legal degree required.
            </p>
            
            {/* Primary & Secondary CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <Button 
                onClick={handleGenerateDocument}
                size="lg" 
                className="px-10 py-7 text-lg bg-gradient-to-r from-primary to-primary/90 text-primary-foreground hover:from-primary/90 hover:to-primary font-bold shadow-2xl shadow-primary/30 hover:shadow-3xl hover:shadow-primary/40 hover:scale-105 transition-all duration-300 rounded-xl group"
              >
                <FileText className="mr-2 h-5 w-5" />
                {isAuthenticated ? "Start Drafting Now" : "Generate a Legal Document"}
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Button>
              <Button 
                onClick={isAuthenticated ? handleChatWithAI : handleExploreTemplates}
                variant="outline" 
                className="px-10 py-7 text-lg border-2 border-primary/40 text-primary hover:bg-primary/10 hover:border-primary/60 font-semibold backdrop-blur-sm rounded-xl transition-all duration-300 group"
              >
                {isAuthenticated ? (
                  <>
                    <MessageSquare className="mr-2 h-5 w-5 group-hover:scale-110 transition-transform" />
                    Chat with Legal AI
                  </>
                ) : (
                  "Explore Templates"
                )}
              </Button>
            </div>

            {/* Additional Action - Only show if NOT logged in */}
            {!isAuthenticated && (
              <button
                onClick={handleChatWithAI}
                className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors text-base group"
              >
                <MessageSquare className="h-5 w-5 group-hover:scale-110 transition-transform" />
                <span>Or chat with our Legal AI assistant</span>
                <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </button>
            )}

            {/* Additional Action - Only show if logged in */}
            {isAuthenticated && (
              <button
                onClick={handleExploreTemplates}
                className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors text-base group"
              >
                <FileText className="h-5 w-5 group-hover:scale-110 transition-transform" />
                <span>Browse document templates</span>
                <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </button>
            )}

            {/* Trust Indicators */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-12 mt-12 border-t border-white/10">
              <div className="flex items-center justify-center gap-3 text-gray-400">
                <CheckCircle2 className="h-5 w-5 text-green-400" />
                <span className="text-sm font-medium">Legally compliant</span>
              </div>
              <div className="flex items-center justify-center gap-3 text-gray-400">
                <Shield className="h-5 w-5 text-blue-400" />
                <span className="text-sm font-medium">Secure & confidential</span>
              </div>
              <div className="flex items-center justify-center gap-3 text-gray-400">
                <Clock className="h-5 w-5 text-purple-400" />
                <span className="text-sm font-medium">Ready in minutes</span>
              </div>
            </div>
          </div>
        </div>

        {/* Document Types Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-12">
          <div className="text-center p-6 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all cursor-pointer group">
            <FileText className="h-8 w-8 text-white mx-auto mb-3 group-hover:scale-110 transition-transform" />
            <div className="text-lg font-bold text-white mb-1">Contracts</div>
            <div className="text-sm text-gray-400">Business agreements</div>
          </div>
          <div className="text-center p-6 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all cursor-pointer group">
            <Scale className="h-8 w-8 text-white mx-auto mb-3 group-hover:scale-110 transition-transform" />
            <div className="text-lg font-bold text-white mb-1">Legal Docs</div>
            <div className="text-sm text-gray-400">Terms & policies</div>
          </div>
          <div className="text-center p-6 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all cursor-pointer group">
            <Shield className="h-8 w-8 text-white mx-auto mb-3 group-hover:scale-110 transition-transform" />
            <div className="text-lg font-bold text-white mb-1">NDAs</div>
            <div className="text-sm text-gray-400">Confidentiality</div>
          </div>
          <div className="text-center p-6 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all cursor-pointer group">
            <MessageSquare className="h-8 w-8 text-white mx-auto mb-3 group-hover:scale-110 transition-transform" />
            <div className="text-lg font-bold text-white mb-1">Custom</div>
            <div className="text-sm text-gray-400">AI-assisted drafting</div>
          </div>
        </div>
      </div>
    </section>
  );
}