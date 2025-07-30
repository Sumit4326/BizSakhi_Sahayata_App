import { useState } from "react";
import { Globe, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

interface Language {
  code: string;
  name: string;
  nativeName: string;
}

const languages: Language[] = [
  { code: "hi", name: "Hindi", nativeName: "हिन्दी" },
  { code: "en", name: "English", nativeName: "English" },
  { code: "ml", name: "Malayalam", nativeName: "മലയാളം" },
  { code: "ta", name: "Tamil", nativeName: "தமிழ்" },
  { code: "te", name: "Telugu", nativeName: "తెలుగు" },
  { code: "mr", name: "Marathi", nativeName: "मराठी" },
  { code: "kn", name: "Kannada", nativeName: "ಕನ್ನಡ" },
  { code: "gu", name: "Gujarati", nativeName: "ગુજરાતી" },
  { code: "bn", name: "Bengali", nativeName: "বাংলা" },
];

interface LanguageSelectorProps {
  selectedLanguage: string;
  onLanguageSelect: (language: string) => void;
  showOnboarding?: boolean;
}

export function LanguageSelector({ selectedLanguage, onLanguageSelect, showOnboarding = false }: LanguageSelectorProps) {
  const [isOpen, setIsOpen] = useState(showOnboarding);

  if (showOnboarding) {
    return (
      <div className="min-h-screen bg-gradient-warm flex items-center justify-center p-4">
        <Card className="w-full max-w-md shadow-warm animate-fade-in">
          <CardContent className="p-6">
            <div className="text-center mb-6">
              <Globe className="h-12 w-12 text-primary mx-auto mb-4 animate-float" />
              <h2 className="text-2xl font-bold text-foreground mb-2">
                Choose Your Language
              </h2>
              <p className="text-muted-foreground">
                अपनी भाषा चुनें / Select your preferred language
              </p>
            </div>
            
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {languages.map((lang) => (
                <Button
                  key={lang.code}
                  variant={selectedLanguage === lang.code ? "default" : "outline"}
                  className="w-full justify-start h-auto p-3"
                  onClick={() => onLanguageSelect(lang.code)}
                >
                  <div className="text-left">
                    <div className="font-medium">{lang.nativeName}</div>
                    <div className="text-sm opacity-70">{lang.name}</div>
                  </div>
                  {selectedLanguage === lang.code && (
                    <Check className="h-4 w-4 ml-auto" />
                  )}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="relative">
      <Button
        variant="outline"
        size="sm"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2"
      >
        <Globe className="h-4 w-4" />
        {languages.find(l => l.code === selectedLanguage)?.nativeName || "Language"}
      </Button>
      
      {isOpen && (
        <Card className="absolute top-full left-0 mt-2 w-64 z-50 shadow-warm">
          <CardContent className="p-2">
            <div className="space-y-1 max-h-48 overflow-y-auto">
              {languages.map((lang) => (
                <Button
                  key={lang.code}
                  variant={selectedLanguage === lang.code ? "default" : "ghost"}
                  className="w-full justify-start h-auto p-2"
                  onClick={() => {
                    onLanguageSelect(lang.code);
                    setIsOpen(false);
                  }}
                >
                  <div className="text-left">
                    <div className="font-medium text-sm">{lang.nativeName}</div>
                    <div className="text-xs opacity-70">{lang.name}</div>
                  </div>
                  {selectedLanguage === lang.code && (
                    <Check className="h-3 w-3 ml-auto" />
                  )}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}