"use client";

import { TestimonialCard, type TestimonialAuthor } from "../ui/testimonial-card";
import { Scale, Star } from "lucide-react";

interface TestimonialItem {
  author: TestimonialAuthor;
  text: string;
  href?: string;
}

export function TestimonialsSection() {
  const testimonials: TestimonialItem[] = [
    {
      author: {
        name: "Sarah Mitchell",
        handle: "General Counsel, Tech Corp",
        avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop&crop=face"
      },
      text: "Adlaan has revolutionized our legal workflow. Contract review that used to take days now takes hours. The AI accuracy is exceptional.",
    },
    {
      author: {
        name: "David Park",
        handle: "Managing Partner, Park & Associates",
        avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face"
      },
      text: "The best legal tech investment we've made. Our firm's efficiency has increased by 60% since implementation.",
    },
    {
      author: {
        name: "Jennifer Wilson",
        handle: "Corporate Attorney, GlobalLaw",
        avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&h=150&fit=crop&crop=face"
      },
      text: "Finally, AI that understands legal nuance. The compliance checking alone has saved us from costly mistakes.",
    },
    {
      author: {
        name: "Michael Rodriguez",
        handle: "Legal Operations, Fortune 500",
        avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face"
      },
      text: "Exceptional platform with outstanding support. The document automation features are industry-leading.",
    },
    {
      author: {
        name: "Emily Thompson",
        handle: "Senior Associate, Smith LLP",
        avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face"
      },
      text: "Adlaan's AI legal assistant feels like having a research team at your fingertips 24/7. Incredibly powerful.",
    },
    {
      author: {
        name: "Robert Chen",
        handle: "Chief Legal Officer",
        avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face"
      },
      text: "The multi-jurisdictional compliance features are unmatched. Critical for our global operations.",
    },
  ];

  return (
    <section id="testimonials" className="py-24 px-6 bg-zinc-950">
      <div className="mx-auto flex max-w-7xl flex-col items-center gap-16">
        {/* Header */}
        <div className="flex flex-col items-center gap-6 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10">
            <Scale className="h-4 w-4 text-white" />
            <span className="text-sm font-medium text-white">Trusted by Legal Professionals</span>
          </div>
          <h2 className="max-w-[720px] text-5xl md:text-6xl font-bold tracking-tight text-white leading-tight">
            Loved by Thousands
          </h2>
          <p className="text-xl max-w-[600px] text-gray-400 leading-relaxed">
            See what attorneys, law firms, and corporate legal teams are saying about Adlaan
          </p>
        </div>

        {/* Marquee */}
        <div className="relative flex w-full flex-col items-center justify-center overflow-hidden">
          <div className="group flex overflow-hidden p-2 [--gap:1rem] [gap:var(--gap)] flex-row [--duration:40s]">
            <div className="flex shrink-0 justify-around [gap:var(--gap)] animate-marquee flex-row group-hover:[animation-play-state:paused]">
              {[...Array(4)].map((_, setIndex) => (
                testimonials.map((testimonial, i) => (
                  <TestimonialCard 
                    key={`${setIndex}-${i}`}
                    {...testimonial}
                    className="border-white/10 bg-gradient-to-b from-zinc-900/80 to-zinc-950/80 hover:from-zinc-900 hover:to-zinc-950 text-white [&_h3]:text-white [&_p]:text-gray-400"
                  />
                ))
              ))}
            </div>
          </div>

          {/* Gradient overlays */}
          <div className="pointer-events-none absolute inset-y-0 left-0 hidden w-1/3 bg-gradient-to-r from-zinc-950 sm:block" />
          <div className="pointer-events-none absolute inset-y-0 right-0 hidden w-1/3 bg-gradient-to-l from-zinc-950 sm:block" />
        </div>

        {/* Trust Bar */}
        <div className="flex flex-wrap justify-center items-center gap-8 pt-8 border-t border-white/10">
          <div className="flex items-center gap-2">
            <Star className="h-5 w-5 text-yellow-400 fill-current" />
            <span className="text-sm font-medium text-gray-400">4.9/5 Average Rating</span>
          </div>
          <div className="flex items-center gap-2">
            <Scale className="h-5 w-5 text-white" />
            <span className="text-sm font-medium text-gray-400">10,000+ Legal Professionals</span>
          </div>
        </div>
      </div>
    </section>
  );
}
