import { useState } from "react";
import { MessageSquare, TrendingUp, Package, Lightbulb, HelpCircle, Settings, Menu, X, Flower2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { LanguageSelector } from "./LanguageSelector";
import { ThemeToggle } from "./ThemeToggle";
import { useTranslation } from "@/utils/translations";

interface NavigationProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  language: string;
  onLanguageChange: (language: string) => void;
}

const tabs = [
  { id: "home", icon: Flower2, translationKey: "nav.home" },
  { id: "chat", icon: MessageSquare, translationKey: "nav.chat" },
  { id: "income", icon: TrendingUp, translationKey: "nav.income" },
  { id: "inventory", icon: Package, translationKey: "nav.inventory" },
  { id: "tips", icon: Lightbulb, translationKey: "nav.tips" },
  { id: "loans", icon: HelpCircle, translationKey: "nav.loans" },
  { id: "settings", icon: Settings, translationKey: "nav.settings" },
];

export function Navigation({ activeTab, onTabChange, language, onLanguageChange }: NavigationProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { t } = useTranslation(language);

  const getTabName = (tab: typeof tabs[0]) => {
    return t(tab.translationKey as any);
  };

  return (
    <>
      {/* Mobile Header */}
      <div className="lg:hidden bg-gradient-card border-b border-primary/10 shadow-warm p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src="/logo.png" alt="BizSakhi logo" className="h-8 w-8 rounded object-cover shadow-glow" />
            <h1 className="text-xl font-bold bg-gradient-primary bg-clip-text text-transparent">
              BizSakhi
            </h1>
          </div>
          
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <LanguageSelector 
              selectedLanguage={language}
              onLanguageSelect={onLanguageChange}
            />
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="hover:scale-110 transition-transform duration-200"
            >
              {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-50 bg-gradient-subtle backdrop-blur-md animate-fade-in">
          <div className="p-4">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-semibold bg-gradient-primary bg-clip-text text-transparent">
                {language === "hi" ? "मेन्यू" : "Menu"}
              </h2>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsMobileMenuOpen(false)}
                className="hover:scale-110 transition-transform duration-200"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
            
            <div className="space-y-3">
              {tabs.map((tab, index) => {
                const Icon = tab.icon;
                return (
                  <Button
                    key={tab.id}
                    variant={activeTab === tab.id ? "default" : "ghost"}
                    className="w-full justify-start h-12 hover:scale-105 transition-all duration-200 animate-fade-in"
                    style={{ animationDelay: `${index * 100}ms` }}
                    onClick={() => {
                      onTabChange(tab.id);
                      setIsMobileMenuOpen(false);
                    }}
                  >
                    <Icon className="h-5 w-5 mr-3" />
                    {getTabName(tab)}
                  </Button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Desktop Sidebar */}
      <div className="hidden lg:flex flex-col w-64 bg-gradient-card border-r border-primary/10 shadow-warm">
        {/* Logo Header */}
        <div className="p-6 border-b border-primary/10">
          <div className="flex items-center gap-3 mb-4">
            <img src="/logo.png" alt="BizSakhi logo" className="h-10 w-10 rounded object-cover animate-glow shadow-glow" />
            <h1 className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent">
              BizSakhi
            </h1>
          </div>
          <p className="text-sm text-muted-foreground">
            {language === "hi" 
              ? "आपकी स्मार्ट व्यापारिक सहायक" 
              : "Your Smart Business Assistant"
            }
          </p>
        </div>

        {/* Navigation Items */}
        <div className="flex-1 p-4">
          <div className="space-y-2">
            {tabs.map((tab, index) => {
              const Icon = tab.icon;
              return (
                <Button
                  key={tab.id}
                  variant={activeTab === tab.id ? "default" : "ghost"}
                  className={`w-full justify-start h-12 hover:scale-105 transition-all duration-200 ${
                    activeTab === tab.id ? 'shadow-glow' : ''
                  }`}
                  onClick={() => onTabChange(tab.id)}
                >
                  <Icon className="h-5 w-5 mr-3" />
                  {getTabName(tab)}
                </Button>
              );
            })}
          </div>
        </div>

        {/* Controls */}
        <div className="p-4 border-t border-primary/10">
          <div className="flex items-center justify-between gap-2 mb-3">
            <LanguageSelector 
              selectedLanguage={language}
              onLanguageSelect={onLanguageChange}
            />
            <ThemeToggle />
          </div>
        </div>
      </div>

      {/* Bottom Navigation (Mobile) */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-gradient-card border-t border-primary/10 shadow-warm z-40 backdrop-blur-md">
        <div className="flex">
          {tabs.slice(0, 5).map((tab) => {
            const Icon = tab.icon;
            return (
              <Button
                key={tab.id}
                variant={activeTab === tab.id ? "default" : "ghost"}
                className={`flex-1 h-16 flex-col gap-1 rounded-none transition-all duration-200 ${
                  activeTab === tab.id ? 'shadow-glow transform scale-105' : 'hover:scale-105'
                }`}
                onClick={() => onTabChange(tab.id)}
              >
                <Icon className="h-5 w-5" />
                <span className="text-xs">{getTabName(tab).split(' ')[0]}</span>
              </Button>
            );
          })}
        </div>
      </div>
    </>
  );
}