"use client";

import { Button } from "../../components/ui/button";
import { ArrowRight, Sparkles } from "lucide-react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../contexts/AuthContext";

export function HeroSection() {
  const router = useRouter();
  const { isAuthenticated } = useAuth();

  const handleGetStarted = () => {
    if (isAuthenticated) {
      // If user is already signed in, redirect to dashboard or main app
      router.push("/dashboard");
    } else {
      // If not signed in, redirect to signup
      router.push("/signup");
    }
  };

  const handleWatchDemo = () => {
    // Scroll to features or open demo video
    const featuresSection = document.getElementById("features");
    if (featuresSection) {
      featuresSection.scrollIntoView({ behavior: "smooth" });
    }
  };
  return (
    <section className="min-h-screen flex items-center justify-center px-6 bg-background relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/30 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-secondary/30 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
      </div>
      
      <div className="container mx-auto text-center max-w-6xl relative z-10">
        <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-gradient-to-r from-primary/10 via-secondary/10 to-primary/10 border-2 border-primary/30 mb-8 backdrop-blur-sm shadow-lg">
          <Sparkles className="h-4 w-4 text-primary" />
          <span className="text-sm font-semibold text-primary">
            AI-Powered Legal Excellence
          </span>
        </div>
        
        <h1 className="text-6xl md:text-8xl font-bold mb-6 leading-tight tracking-tight">
          <span className="text-foreground">
            Professional Legal AI
          </span>
          <br />
          <span className="bg-gradient-to-r from-primary via-secondary to-primary bg-clip-text text-transparent">
            for Modern Teams
          </span>
        </h1>
        
        <p className="text-xl md:text-2xl text-muted-foreground mb-12 max-w-3xl mx-auto leading-relaxed">
          Transform your legal workflow with cutting-edge artificial intelligence. 
          Built for legal professionals who demand excellence in 2025.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-6">
          <Button 
            onClick={handleGetStarted}
            size="lg" 
            className="px-8 py-6 text-base font-semibold bg-gradient-to-r from-primary to-primary/90 text-primary-foreground hover:from-primary/90 hover:to-primary shadow-2xl shadow-primary/30 hover:shadow-3xl hover:shadow-primary/40 transition-all duration-300 hover:scale-105"
          >
            Get Started Free
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
          <Button 
            onClick={() => router.push("/agents-demo")}
            variant="outline" 
            size="lg" 
            className="px-8 py-6 text-base font-medium border-2 border-blue-500/30 text-blue-600 hover:bg-blue-500/10 hover:border-blue-500/60 transition-all duration-300"
          >
            Try AI Agents Demo
          </Button>
          <Button 
            onClick={handleWatchDemo}
            variant="ghost" 
            size="lg" 
            className="px-8 py-6 text-base font-medium text-muted-foreground hover:text-foreground transition-all duration-300"
          >
            Watch Demo
          </Button>
        </div>
        
        <div className="flex items-center justify-center gap-8 mt-12 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-secondary animate-pulse"></div>
            <span>Free 14-day trial</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-primary"></div>
            <span>No credit card required</span>
          </div>
        </div>
      </div>
    </section>
  );
}