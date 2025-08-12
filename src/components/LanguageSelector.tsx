import { useState } from "react";
import { Globe, Check, ChevronDown } from "lucide-react";
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

  // Styled native select to match website theme
  return (
    <div className="relative">
      <select
        value={selectedLanguage}
        onChange={(e) => {
          onLanguageSelect(e.target.value);
        }}
        className="
          appearance-none cursor-pointer
          bg-card/80 backdrop-blur-sm
          border-2 border-primary/20 hover:border-primary/40
          rounded-lg px-3 py-2 pr-10
          text-sm font-medium
          text-foreground
          shadow-warm hover:shadow-lg
          transition-all duration-200
          focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary
          hover:scale-[1.02]
          dark:bg-gray-800/80 dark:border-primary/30 dark:hover:border-primary/50
          min-w-[120px]
        "
      >
        {languages.map((lang) => (
          <option
            key={lang.code}
            value={lang.code}
            className="bg-background text-foreground py-2 dark:bg-gray-800 dark:text-white"
          >
            {lang.nativeName}
          </option>
        ))}
      </select>

      {/* Custom dropdown arrow with globe icon */}
      <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
        <Globe className="h-4 w-4 text-primary animate-glow" />
      </div>
    </div>
  );
}