"use client";

import { Brain, FileText, Shield, PenTool, ArrowRight, CheckCircle2, Sparkles } from "lucide-react";

export function SolutionsSection() {
  const solutions = [
    {
      icon: Brain,
      title: "AI Legal Assistant",
      description: "Understands your case or business need through natural conversation.",
      features: [
        "Identifies the right legal template automatically",
        "Adapts to your jurisdiction and local regulations",
        "Learns from your business context and requirements"
      ],
      gradient: "from-primary/20 via-primary/10 to-transparent"
    },
    {
      icon: FileText,
      title: "Dynamic Document Generator",
      description: "Combines Jinja2 + WeasyPrint to produce professional, compliant documents.",
      features: [
        "Generates PDF or Word format instantly",
        "Dynamically fills templates with your inputs",
        "Professional formatting with legal standards"
      ],
      gradient: "from-secondary/20 via-secondary/10 to-transparent"
    },
    {
      icon: Shield,
      title: "Accuracy & Compliance Layer",
      description: "Validates clauses and ensures correct legal terminology.",
      features: [
        "Aligns with local regulations automatically",
        "Ensures international standards compliance",
        "Validates legal terminology and structure"
      ],
      gradient: "from-accent/20 via-accent/10 to-transparent"
    },
    {
      icon: PenTool,
      title: "Instant Review & Signing",
      description: "Preview, edit, and download your document instantly.",
      features: [
        "Real-time document preview and editing",
        "One-click download in multiple formats",
        "E-signature integration ready"
      ],
      gradient: "from-chart-3/20 via-chart-3/10 to-transparent"
    }
  ];

  const processSteps = [
    { label: "User Input", icon: "💬", color: "primary" },
    { label: "AI Understanding", icon: "🧠", color: "secondary" },
    { label: "Template Engine", icon: "🧾", color: "accent" },
    { label: "Compliance Check", icon: "⚖️", color: "chart-3" },
    { label: "PDF Output", icon: "📄", color: "primary" }
  ];

  return (
    <section id="solutions" className="relative py-24 bg-gradient-to-b from-background via-card/30 to-background overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-secondary/20 rounded-full blur-3xl" />
      </div>
      
      <div className="relative max-w-7xl mx-auto px-6">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-gradient-to-r from-primary/10 via-secondary/10 to-primary/10 border-2 border-primary/30 mb-6 shadow-lg">
            <Sparkles className="h-4 w-4 text-primary" />
            <span className="text-sm font-semibold text-primary">How It Works</span>
          </div>
          
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 text-foreground leading-tight">
            The Smarter Way to Create<br />
            <span className="bg-gradient-to-r from-primary via-secondary to-primary bg-clip-text text-transparent">
              Legal Documents
            </span>
          </h2>
          
          <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed font-light">
            Adlaan uses advanced AI to understand your needs, draft accurate legal contracts, 
            and generate ready-to-sign PDFs — all in <span className="font-semibold text-primary">minutes, not hours</span>.
          </p>
        </div>

        {/* Process Flow Diagram */}
        <div className="mb-20">
          <div className="flex items-center justify-center gap-3 md:gap-6 flex-wrap px-4">
            {processSteps.map((step, index) => (
              <div key={index} className="flex items-center gap-3 md:gap-6">
                <div className="flex flex-col items-center gap-3 group">
                  <div className="relative">
                    <div className="absolute inset-0 bg-gradient-to-br from-primary to-secondary rounded-2xl blur-xl opacity-30 group-hover:opacity-50 transition-opacity" />
                    <div className="relative w-20 h-20 rounded-2xl bg-gradient-to-br from-card to-muted border-2 border-primary/30 flex items-center justify-center text-4xl backdrop-blur-sm shadow-xl group-hover:scale-110 group-hover:border-secondary/50 transition-all duration-300">
                      {step.icon}
                    </div>
                  </div>
                  <span className="text-xs font-semibold text-foreground text-center max-w-[90px] leading-tight">
                    {step.label}
                  </span>
                </div>
                {index < processSteps.length - 1 && (
                  <ArrowRight className="h-6 w-6 text-secondary hidden md:block flex-shrink-0" />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Solution Pillars */}
        <div className="grid md:grid-cols-2 gap-6 mb-16">
          {solutions.map((solution, index) => (
            <div
              key={index}
              className="group relative"
            >
              {/* Card Container */}
              <div className="relative h-full p-8 rounded-3xl bg-card border-2 border-border hover:border-primary/60 transition-all duration-500 hover:shadow-2xl hover:shadow-primary/10 overflow-hidden">
                {/* Gradient overlay */}
                <div className={`absolute inset-0 bg-gradient-to-br ${solution.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
                
                {/* Decorative corner */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-secondary/20 to-transparent rounded-bl-[100px] opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                
                <div className="relative z-10">
                  {/* Icon */}
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center mb-6 shadow-lg shadow-primary/30 group-hover:scale-110 group-hover:rotate-3 transition-all duration-500">
                    <solution.icon className="h-8 w-8 text-primary-foreground" />
                  </div>

                  {/* Title & Description */}
                  <h3 className="text-2xl font-bold mb-4 text-foreground group-hover:text-primary transition-colors duration-300">
                    {solution.title}
                  </h3>
                  <p className="text-muted-foreground mb-6 leading-relaxed">
                    {solution.description}
                  </p>

                  {/* Features List */}
                  <ul className="space-y-3">
                    {solution.features.map((feature, idx) => (
                      <li key={idx} className="flex items-start gap-3 group/item">
                        <div className="flex-shrink-0 w-5 h-5 rounded-full bg-secondary/20 flex items-center justify-center mt-0.5">
                          <CheckCircle2 className="h-3.5 w-3.5 text-secondary group-hover/item:scale-125 transition-transform duration-300" />
                        </div>
                        <span className="text-sm text-card-foreground/80 group-hover/item:text-card-foreground transition-colors">
                          {feature}
                        </span>
                      </li>
                    ))}
                  </ul>

                  {/* Hover indicator */}
                  <div className="mt-6 flex items-center gap-2 text-primary opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0">
                    <span className="text-sm font-semibold">Learn more</span>
                    <ArrowRight className="h-4 w-4" />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom Description */}
        <div className="relative overflow-hidden">
          {/* Decorative background */}
          <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-secondary/5 to-primary/5 rounded-3xl" />
          <div className="absolute inset-0 bg-gradient-to-br from-transparent via-card/50 to-transparent rounded-3xl" />
          
          <div className="relative p-8 md:p-12 rounded-3xl border-2 border-primary/30 backdrop-blur-sm shadow-xl">
            {/* Decorative elements */}
            <div className="absolute top-0 left-0 w-24 h-24 bg-gradient-to-br from-secondary/30 to-transparent rounded-br-[100px]" />
            <div className="absolute bottom-0 right-0 w-24 h-24 bg-gradient-to-tl from-primary/30 to-transparent rounded-tl-[100px]" />
            
            <div className="relative">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center shadow-lg">
                  <Shield className="h-6 w-6 text-primary-foreground" />
                </div>
                <h3 className="text-2xl md:text-3xl font-bold text-foreground">
                  Legal Documentation, Reimagined
                </h3>
              </div>
              
              <p className="text-muted-foreground leading-relaxed text-base md:text-lg max-w-5xl">
                Adlaan eliminates the complexity of legal documentation by merging AI understanding with smart automation. 
                Through its conversational interface, users simply describe their situation, and Adlaan identifies the 
                relevant legal framework, generates a compliant draft, and formats it into a ready-to-sign PDF. Every 
                document passes through an{" "}
                <span className="relative inline-block">
                  <span className="relative z-10 font-bold text-primary">accuracy and compliance layer</span>
                  <span className="absolute bottom-0 left-0 w-full h-2 bg-secondary/30 -rotate-1"></span>
                </span>
                , ensuring consistency with jurisdictional standards. What once took hours of manual editing now happens in 
                seconds —{" "}
                <span className="relative inline-block">
                  <span className="relative z-10 font-bold text-primary">safely, accurately, and effortlessly</span>
                  <span className="absolute bottom-0 left-0 w-full h-2 bg-secondary/30 rotate-1"></span>
                </span>.
              </p>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="text-center mt-16">
          <a 
            href="#cta" 
            className="group inline-flex items-center gap-3 px-10 py-5 rounded-full bg-gradient-to-r from-primary to-primary/90 text-primary-foreground font-bold text-lg hover:from-primary/90 hover:to-primary transition-all duration-300 shadow-2xl shadow-primary/30 hover:shadow-3xl hover:shadow-primary/40 hover:scale-105"
          >
            Start Creating Documents
            <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
          </a>
          <p className="mt-4 text-sm text-muted-foreground">
            No credit card required • Free templates included
          </p>
        </div>
      </div>
    </section>
  );
}
