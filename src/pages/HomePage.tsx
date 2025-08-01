import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { HeroSection } from "@/components/HeroSection";
import { FeaturesSection } from "@/components/FeaturesSection";
import { TestimonialsSection } from "@/components/TestimonialsSection";
import { FooterSection } from "@/components/FooterSection";
import { LanguageSelector } from "@/components/LanguageSelector";
import { ThemeToggle } from "@/components/ThemeToggle";

interface HomePageProps {
  language: string;
  onLanguageChange: (language: string) => void;
  onGetStarted: () => void;
}

export function HomePage({ language, onLanguageChange, onGetStarted }: HomePageProps) {
  return (
    <div className="min-h-screen bg-gradient-subtle">
      {/* Header Navigation */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-primary/10 shadow-warm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 bg-gradient-primary rounded-full flex items-center justify-center shadow-glow">
                <span className="text-white font-bold text-sm">B</span>
              </div>
              <span className="text-xl font-bold bg-gradient-primary bg-clip-text text-transparent">
                BizSakhi
              </span>
            </div>
            
            {/* Navigation */}
            <nav className="hidden md:flex items-center gap-6">
              <Button variant="ghost" className="hover:text-primary transition-colors">
                {language === "hi" ? "होम" : "Home"}
              </Button>
              <Button variant="ghost" className="hover:text-primary transition-colors">
                {language === "hi" ? "फीचर्स" : "Features"}
              </Button>
              <Button variant="ghost" className="hover:text-primary transition-colors">
                {language === "hi" ? "सफलता की कहानियां" : "Success Stories"}
              </Button>
              <Button variant="ghost" className="hover:text-primary transition-colors">
                {language === "hi" ? "संपर्क" : "Contact"}
              </Button>
            </nav>
            
            {/* Actions */}
            <div className="flex items-center gap-3">
              <LanguageSelector 
                selectedLanguage={language}
                onLanguageSelect={onLanguageChange}
              />
              <ThemeToggle />
              <Button 
                onClick={onGetStarted}
                className="bg-gradient-primary hover:scale-105 transition-all duration-300 shadow-glow"
              >
                {language === "hi" ? "शुरू करें" : "Get Started"}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>
      
      {/* Main Content */}
      <main className="pt-20">
        <HeroSection language={language} onGetStarted={onGetStarted} />
        <FeaturesSection language={language} />
        <TestimonialsSection language={language} />
        <FooterSection language={language} />
      </main>
    </div>
  );
}