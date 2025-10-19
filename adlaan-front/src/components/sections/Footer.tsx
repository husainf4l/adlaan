import { Linkedin, Twitter, Facebook, Instagram, Mail, Phone, MapPin } from "lucide-react";
import Image from "next/image";

export function Footer() {
  return (
    <footer className="py-16 px-6 bg-card border-t-2 border-primary/20">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8 mb-12">
          <div className="col-span-2">
            <div className="mb-4">
              <Image 
                src="/logo/adlaan-02.png" 
                alt="Adlaan Logo" 
                width={120} 
                height={32}
                className="h-8 w-auto"
              />
            </div>
            <p className="text-muted-foreground text-sm max-w-xs mb-6">
              Professional AI-powered legal platform empowering teams to achieve more with cutting-edge technology.
            </p>
            
            {/* Contact Information */}
            <div className="space-y-3">
              <a href="mailto:info@adlaan.com" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors">
                <Mail className="h-4 w-4" />
                <span>info@adlaan.com</span>
              </a>
              <a href="tel:+1234567890" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors">
                <Phone className="h-4 w-4" />
                <span>+1 (234) 567-890</span>
              </a>
              <div className="flex items-start gap-2 text-sm text-muted-foreground">
                <MapPin className="h-4 w-4 mt-0.5" />
                <span>123 AI Street, Tech Valley<br />San Francisco, CA 94105</span>
              </div>
            </div>
          </div>
          
          <div>
            <h3 className="font-bold text-foreground mb-3 text-sm">Product</h3>
            <div className="space-y-2">
              <a href="#features" className="block text-sm text-muted-foreground hover:text-primary transition-colors">Features</a>
              <a href="#solutions" className="block text-sm text-muted-foreground hover:text-primary transition-colors">Solutions</a>
              <a href="#" className="block text-sm text-muted-foreground hover:text-primary transition-colors">Pricing</a>
            </div>
          </div>
          
          <div>
            <h3 className="font-bold text-foreground mb-3 text-sm">Company</h3>
            <div className="space-y-2">
              <a href="#" className="block text-sm text-muted-foreground hover:text-primary transition-colors">About</a>
              <a href="#contact" className="block text-sm text-muted-foreground hover:text-primary transition-colors">Contact</a>
              <a href="#" className="block text-sm text-muted-foreground hover:text-primary transition-colors">Careers</a>
            </div>
          </div>
          
          <div>
            <h3 className="font-bold text-foreground mb-3 text-sm">Legal</h3>
            <div className="space-y-2">
              <a href="#" className="block text-sm text-muted-foreground hover:text-primary transition-colors">Privacy</a>
              <a href="#" className="block text-sm text-muted-foreground hover:text-primary transition-colors">Terms</a>
              <a href="#" className="block text-sm text-muted-foreground hover:text-primary transition-colors">Security</a>
            </div>
          </div>
        </div>
        
        <div className="pt-8 border-t border-border flex flex-col md:flex-row justify-between items-center gap-6">
          <p className="text-muted-foreground text-sm">
            © 2025 Adlaan Inc. All rights reserved.
          </p>
          
          {/* Social Media Links */}
          <div className="flex items-center gap-3">
            <a 
              href="https://linkedin.com" 
              target="_blank" 
              rel="noopener noreferrer"
              className="h-9 w-9 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-primary hover:bg-primary/20 hover:border-primary/40 transition-all"
              aria-label="LinkedIn"
            >
              <Linkedin className="h-4 w-4" />
            </a>
            <a 
              href="https://twitter.com" 
              target="_blank" 
              rel="noopener noreferrer"
              className="h-9 w-9 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-primary hover:bg-primary/20 hover:border-primary/40 transition-all"
              aria-label="Twitter"
            >
              <Twitter className="h-4 w-4" />
            </a>
            <a 
              href="https://facebook.com" 
              target="_blank" 
              rel="noopener noreferrer"
              className="h-9 w-9 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-primary hover:bg-primary/20 hover:border-primary/40 transition-all"
              aria-label="Facebook"
            >
              <Facebook className="h-4 w-4" />
            </a>
            <a 
              href="https://instagram.com" 
              target="_blank" 
              rel="noopener noreferrer"
              className="h-9 w-9 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-primary hover:bg-primary/20 hover:border-primary/40 transition-all"
              aria-label="Instagram"
            >
              <Instagram className="h-4 w-4" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}