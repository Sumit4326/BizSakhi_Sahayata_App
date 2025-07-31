import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Navigation } from "@/components/Navigation";
import { LanguageSelector } from "@/components/LanguageSelector";
import { VoiceChatAssistant } from "@/components/VoiceChatAssistant";
import { IncomeExpenseTracker } from "@/components/IncomeExpenseTracker";
import { InventoryManagement } from "@/components/InventoryManagement";
import { DailyTips } from "@/components/DailyTips";
import { LoanHelper } from "@/components/LoanHelper";
import { Settings } from "@/components/Settings";
import businessHero from "@/assets/business-hero.jpg";

const Index = () => {
  const [activeTab, setActiveTab] = useState("chat");
  const [language, setLanguage] = useState("");
  const [showOnboarding, setShowOnboarding] = useState(true);

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

  const renderContent = () => {
    switch (activeTab) {
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
        return <VoiceChatAssistant language={language} />;
    }
  };

  // Show language selection onboarding
  if (showOnboarding) {
    return (
      <div className="min-h-screen bg-gradient-warm">
        <div className="relative">
          {/* Hero Background */}
          <div className="absolute inset-0 z-0">
            <img 
              src={businessHero} 
              alt="Indian women entrepreneurs" 
              className="w-full h-full object-cover opacity-20"
            />
            <div className="absolute inset-0 bg-gradient-warm/80"></div>
          </div>
          
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

  return (
    <div className="min-h-screen bg-gradient-warm">
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
          {/* Welcome Header (Desktop Only) */}
          <div className="hidden lg:block bg-background border-b shadow-card p-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold">
                  {language === "hi" ? "नमस्ते! BizSakhi में आपका स्वागत है" : "Hello! Welcome to BizSakhi"}
                </h1>
                <p className="text-muted-foreground">
                  {language === "hi" 
                    ? "आपकी व्यापारिक सफलता के लिए यहाँ मैं आपकी मदद करूंगी।"
                    : "I'm here to help you succeed in your business journey."
                  }
                </p>
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
            <Card className="shadow-warm min-h-[calc(100vh-200px)] lg:min-h-[calc(100vh-150px)]">
              <CardContent className="p-0 h-full">
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
