import { useState } from "react";
import { MessageSquare, TrendingUp, Package, Lightbulb, HelpCircle, Settings, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { LanguageSelector } from "./LanguageSelector";

interface NavigationProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  language: string;
  onLanguageChange: (language: string) => void;
}

const tabs = [
  { id: "chat", icon: MessageSquare, nameEn: "Sakhi Chat", nameHi: "सखी चैट" },
  { id: "income", icon: TrendingUp, nameEn: "Income/Expense", nameHi: "आय/व्यय" },
  { id: "inventory", icon: Package, nameEn: "Inventory", nameHi: "स्टॉक" },
  { id: "tips", icon: Lightbulb, nameEn: "Daily Tips", nameHi: "दैनिक सुझाव" },
  { id: "loans", icon: HelpCircle, nameEn: "Loan Help", nameHi: "लोन सहायता" },
  { id: "settings", icon: Settings, nameEn: "Settings", nameHi: "सेटिंग्स" },
];

export function Navigation({ activeTab, onTabChange, language, onLanguageChange }: NavigationProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const getTabName = (tab: typeof tabs[0]) => {
    return language === "hi" ? tab.nameHi : tab.nameEn;
  };

  return (
    <>
      {/* Mobile Header */}
      <div className="lg:hidden bg-background border-b shadow-card p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 bg-gradient-primary rounded-full flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-sm">B</span>
            </div>
            <h1 className="text-xl font-bold bg-gradient-primary bg-clip-text text-transparent">
              BizSakhi
            </h1>
          </div>
          
          <div className="flex items-center gap-2">
            <LanguageSelector 
              selectedLanguage={language}
              onLanguageSelect={onLanguageChange}
            />
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-50 bg-background/95 backdrop-blur-sm">
          <div className="p-4">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-semibold">
                {language === "hi" ? "मेन्यू" : "Menu"}
              </h2>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
            
            <div className="space-y-2">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <Button
                    key={tab.id}
                    variant={activeTab === tab.id ? "default" : "ghost"}
                    className="w-full justify-start h-12"
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
      <div className="hidden lg:flex flex-col w-64 bg-background border-r shadow-card">
        {/* Logo Header */}
        <div className="p-6 border-b">
          <div className="flex items-center gap-3 mb-4">
            <div className="h-10 w-10 bg-gradient-primary rounded-full flex items-center justify-center animate-glow">
              <span className="text-primary-foreground font-bold">B</span>
            </div>
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
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <Button
                  key={tab.id}
                  variant={activeTab === tab.id ? "default" : "ghost"}
                  className="w-full justify-start h-12"
                  onClick={() => onTabChange(tab.id)}
                >
                  <Icon className="h-5 w-5 mr-3" />
                  {getTabName(tab)}
                </Button>
              );
            })}
          </div>
        </div>

        {/* Language Selector */}
        <div className="p-4 border-t">
          <LanguageSelector 
            selectedLanguage={language}
            onLanguageSelect={onLanguageChange}
          />
        </div>
      </div>

      {/* Bottom Navigation (Mobile) */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-background border-t shadow-warm z-40">
        <div className="flex">
          {tabs.slice(0, 5).map((tab) => {
            const Icon = tab.icon;
            return (
              <Button
                key={tab.id}
                variant={activeTab === tab.id ? "default" : "ghost"}
                className="flex-1 h-16 flex-col gap-1 rounded-none"
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