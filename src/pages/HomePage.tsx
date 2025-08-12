import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ArrowRight, Menu, X } from "lucide-react";
import { HeroSection } from "@/components/HeroSection";
import { FeaturesSection } from "@/components/FeaturesSection";
import { TestimonialsSection } from "@/components/TestimonialsSection";
import { FooterSection } from "@/components/FooterSection";
import { LanguageSelector } from "@/components/LanguageSelector";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useTranslation } from "@/utils/translations";

interface HomePageProps {
  language: string;
  onLanguageChange: (language: string) => void;
  onGetStarted: () => void;
}

export function HomePage({ language, onLanguageChange, onGetStarted }: HomePageProps) {
  const { t } = useTranslation(language);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ 
        behavior: 'smooth',
        block: 'start'
      });
    }
    // Close mobile menu if open
    setIsMobileMenuOpen(false);
  };

  return (
    <div className="min-h-screen bg-gradient-subtle">
      {/* Header Navigation */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-primary/10 shadow-warm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <img src="/logo.png" alt="BizSakhi logo" className="h-8 w-8 object-cover rounded" />
              <span className="text-xl font-bold bg-gradient-primary bg-clip-text text-transparent">
                BizSakhi
              </span>
            </div>
            
            {/* Navigation */}
            <nav className="hidden md:flex items-center gap-6">
              <Button 
                variant="ghost" 
                className="hover:text-primary transition-colors"
                onClick={() => scrollToSection('hero')}
              >
                {t('nav.home')}
              </Button>
              <Button 
                variant="ghost" 
                className="hover:text-primary transition-colors"
                onClick={() => scrollToSection('features')}
              >
                {t('homepage.features') || (language === "hi" ? "फीचर्स" : language === "ta" ? "அம்சங்கள்" : language === "ml" ? "സവിശേഷതകൾ" : "Features")}
              </Button>
              <Button 
                variant="ghost" 
                className="hover:text-primary transition-colors"
                onClick={() => scrollToSection('testimonials')}
              >
                {t('homepage.testimonials') || (language === "hi" ? "सफलता की कहानियां" : language === "ta" ? "வெற்றிக் கதைகள்" : language === "ml" ? "വിജയഗാഥകൾ" : "Success Stories")}
              </Button>
              <Button 
                variant="ghost" 
                className="hover:text-primary transition-colors"
                onClick={() => scrollToSection('contact')}
              >
                {t('homepage.contact') || (language === "hi" ? "संपर्क" : language === "ta" ? "தொடர்பு" : language === "ml" ? "ബന്ധപ്പെടുക" : "Contact")}
              </Button>
            </nav>
            
            {/* Actions */}
            <div className="flex items-center gap-3">
              <div className="hidden md:flex items-center gap-3">
                <LanguageSelector
                  selectedLanguage={language}
                  onLanguageSelect={onLanguageChange}
                />
                <ThemeToggle />
                <Button
                  onClick={onGetStarted}
                  className="bg-gradient-primary hover:scale-105 transition-all duration-300 shadow-glow"
                >
                  {t('hero.cta')}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>

              {/* Mobile Menu Button */}
              <Button
                variant="ghost"
                size="sm"
                className="md:hidden"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              >
                {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </Button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden bg-background/95 backdrop-blur-md border-t border-primary/10">
            <div className="container mx-auto px-4 py-4 space-y-4">
              <nav className="flex flex-col space-y-2">
                <Button 
                  variant="ghost" 
                  className="justify-start hover:text-primary transition-colors"
                  onClick={() => scrollToSection('hero')}
                >
                  {t('nav.home')}
                </Button>
                <Button 
                  variant="ghost" 
                  className="justify-start hover:text-primary transition-colors"
                  onClick={() => scrollToSection('features')}
                >
                  {t('homepage.features')}
                </Button>
                <Button 
                  variant="ghost" 
                  className="justify-start hover:text-primary transition-colors"
                  onClick={() => scrollToSection('testimonials')}
                >
                  {t('homepage.testimonials')}
                </Button>
                <Button 
                  variant="ghost" 
                  className="justify-start hover:text-primary transition-colors"
                  onClick={() => scrollToSection('contact')}
                >
                  {t('homepage.contact')}
                </Button>
              </nav>

              <div className="flex items-center gap-3 pt-4 border-t border-primary/10">
                <LanguageSelector
                  selectedLanguage={language}
                  onLanguageSelect={onLanguageChange}
                />
                <ThemeToggle />
              </div>

              <Button
                onClick={() => {
                  onGetStarted();
                  setIsMobileMenuOpen(false);
                }}
                className="w-full bg-gradient-primary hover:scale-105 transition-all duration-300 shadow-glow"
              >
                {t('hero.cta')}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="pt-20">
        <div id="hero">
          <HeroSection language={language} onGetStarted={onGetStarted} />
        </div>
        <div id="features">
          <FeaturesSection language={language} />
        </div>
        <div id="testimonials">
          <TestimonialsSection language={language} />
        </div>
        <div id="contact">
          <FooterSection language={language} />
        </div>
      </main>
    </div>
  );
}