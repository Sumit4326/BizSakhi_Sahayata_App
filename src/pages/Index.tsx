import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, Home } from "lucide-react";
import { Navigation } from "@/components/Navigation";
import { LanguageSelector } from "@/components/LanguageSelector";
import { VoiceChatAssistant } from "@/components/VoiceChatAssistant";
import { IncomeExpenseTracker } from "@/components/IncomeExpenseTracker";
import { InventoryManagement } from "@/components/InventoryManagement";
import { DailyTips } from "@/components/DailyTips";
import { LoanHelper } from "@/components/LoanHelper";
import { Settings } from "@/components/Settings";
import { HomePage } from "@/pages/HomePage";
import { useTranslation } from "@/utils/translations";

const Index = () => {
  const [activeTab, setActiveTab] = useState("home");
  const [language, setLanguage] = useState("");
  const [showOnboarding, setShowOnboarding] = useState(true);
  const { t } = useTranslation(language);

  useEffect(() => {
    // Check if user is logged in
    const user = localStorage.getItem("bizsakhi-user");
    if (!user) {
      // Redirect to login page
      window.location.href = "/login";
      return;
    }

    // Check if user has already selected language
    const savedLanguage = localStorage.getItem("bizsakhi-language");
    if (savedLanguage) {
      setLanguage(savedLanguage);
      setShowOnboarding(false);
    }
  }, []);

  const handleLanguageSelect = (selectedLanguage: string) => {
    setLanguage(selectedLanguage);
    localStorage.setItem("bizsakhi-language", selectedLanguage);
    setShowOnboarding(false);
  };

  const handleGetStarted = () => {
    setActiveTab("chat");
  };

  const renderContent = () => {
    switch (activeTab) {
      case "home":
        return (
          <HomePage 
            language={language} 
            onLanguageChange={handleLanguageSelect}
            onGetStarted={handleGetStarted}
          />
        );
      case "chat":
        return <VoiceChatAssistant language={language} />;
      case "income":
        return <IncomeExpenseTracker language={language} />;
      case "inventory":
        return <InventoryManagement language={language} />;
      case "tips":
        return <DailyTips language={language} />;
      case "loans":
        return <LoanHelper language={language} />;
      case "settings":
        return <Settings language={language} onLanguageChange={handleLanguageSelect} />;
      default:
        return (
          <HomePage 
            language={language} 
            onLanguageChange={handleLanguageSelect}
            onGetStarted={handleGetStarted}
          />
        );
    }
  };

  const getPageTitle = () => {
    switch (activeTab) {
      case "home": return language === "hi" ? "होम" : "Home";
      case "chat": return t('nav.chat');
      case "income": return t('nav.income');
      case "inventory": return t('nav.inventory');
      case "tips": return t('nav.tips');
      case "loans": return t('nav.loans');
      case "settings": return t('nav.settings');
      default: return language === "hi" ? "होम" : "Home";
    }
  };

  // Show language selection onboarding
  if (showOnboarding) {
    return (
      <div className="min-h-screen bg-gradient-radial">
        <div className="relative">
          {/* Onboarding Content */}
          <div className="relative z-10">
            <LanguageSelector
              selectedLanguage={language}
              onLanguageSelect={handleLanguageSelect}
              showOnboarding={true}
            />
          </div>
        </div>
      </div>
    );
  }

  // Show full homepage for home tab
  if (activeTab === "home") {
    return renderContent();
  }

  return (
    <div className="min-h-screen bg-gradient-subtle">
      <div className="flex">
        {/* Desktop Navigation Sidebar */}
        <Navigation
          activeTab={activeTab}
          onTabChange={setActiveTab}
          language={language}
          onLanguageChange={handleLanguageSelect}
        />

        {/* Main Content */}
        <div className="flex-1 lg:ml-0">
          {/* Page Header */}
          <div className="bg-gradient-card border-b border-primary/10 shadow-warm p-4 lg:p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setActiveTab("home")}
                  className="hover:bg-primary/10 hover:scale-110 transition-all duration-300"
                >
                  <Home className="h-5 w-5" />
                </Button>
                <div>
                  <h1 className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent">
                    {getPageTitle()}
                  </h1>
                  <p className="text-muted-foreground">
                    {language === "hi" 
                      ? "आपकी व्यापारिक सफलता के लिए यहाँ मैं आपकी मदद करूंगी।"
                      : "I'm here to help you succeed in your business journey."
                    }
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm text-muted-foreground">
                  {new Date().toLocaleDateString(language === "hi" ? "hi-IN" : "en-IN", {
                    weekday: "long",
                    year: "numeric", 
                    month: "long",
                    day: "numeric"
                  })}
                </p>
              </div>
            </div>
          </div>

          {/* Content Area */}
          <div className="p-4 lg:p-6">
            <Card className="shadow-warm min-h-[calc(100vh-200px)] lg:min-h-[calc(100vh-150px)] border-none bg-background/80 backdrop-blur-sm">
              <CardContent className="p-6 h-full">
                {renderContent()}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Mobile Navigation - included in Navigation component */}
    </div>
  );
};

export default Index;
