import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LanguageSelector } from "@/components/LanguageSelector";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Flower2, Eye, EyeOff } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useTranslation } from "@/utils/translations";

export default function Login() {
  const [language, setLanguage] = useState("en");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: ""
  });
  const navigate = useNavigate();
  const { signIn, user } = useAuth();
  const { t } = useTranslation(language);

  useEffect(() => {
    // Redirect if already logged in
    if (user) {
      navigate("/");
      return;
    }

    // Load saved language preference
    const savedLanguage = localStorage.getItem("bizsakhi-language");
    if (savedLanguage) {
      setLanguage(savedLanguage);
    }
  }, [user, navigate]);

  const handleLanguageChange = (newLanguage: string) => {
    setLanguage(newLanguage);
    localStorage.setItem("bizsakhi-language", newLanguage);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.email.trim() || !formData.password.trim()) {
      return;
    }

    setIsLoading(true);

    try {
      const { user: signedInUser, error } = await signIn(formData.email, formData.password);

      if (!error && signedInUser) {
        // Navigate to home page
        navigate("/");
      }
    } catch (error) {
      console.error('Login error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-warm relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-20 left-10 w-32 h-32 bg-primary rounded-full animate-float"></div>
        <div className="absolute top-40 right-20 w-24 h-24 bg-secondary rounded-full animate-float" style={{ animationDelay: "1s" }}></div>
        <div className="absolute bottom-20 left-1/4 w-20 h-20 bg-accent rounded-full animate-float" style={{ animationDelay: "2s" }}></div>
        <div className="absolute bottom-40 right-1/3 w-16 h-16 bg-primary-glow rounded-full animate-float" style={{ animationDelay: "0.5s" }}></div>
      </div>

      {/* Header */}
      <div className="relative z-10 flex justify-between items-center p-6">
        <div className="flex items-center gap-2">
          <Flower2 className="h-8 w-8 text-primary animate-glow" />
          <h1 className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent">
            BizSakhi
          </h1>
        </div>
        <div className="flex items-center gap-4">
          <LanguageSelector
            selectedLanguage={language}
            onLanguageSelect={handleLanguageChange}
          />
          <ThemeToggle />
        </div>
      </div>

      {/* Login Form */}
      <div className="relative z-10 flex items-center justify-center min-h-[calc(100vh-120px)] p-4">
        <Card className="w-full max-w-md shadow-warm animate-fade-in bg-card/80 backdrop-blur-sm border-2 border-primary/20">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 p-3 rounded-full bg-gradient-primary w-fit">
              <Flower2 className="h-8 w-8 text-white animate-float" />
            </div>
            <CardTitle className="text-2xl font-bold">
              {t('auth.welcomeBack') || (language === "hi" ? "स्वागत है" : language === "ta" ? "மீண்டும் வரவேற்கிறோம்" : language === "ml" ? "തിരികെ സ്വാഗതം" : "Welcome Back")}
            </CardTitle>
            <p className="text-muted-foreground">
              {t('auth.signInSubtitle') || (language === "hi" ? "अपने BizSakhi खाते में लॉग इन करें" : language === "ta" ? "உங்கள் BizSakhi கணக்கில் உள்நுழையவும்" : language === "ml" ? "നിങ്ങളുടെ BizSakhi അക്കൗണ്ടിലേക്ക് സൈൻ ഇൻ ചെയ്യുക" : "Sign in to your BizSakhi account")}
            </p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">
                  {t('auth.email') || (language === "hi" ? "ईमेल" : language === "ta" ? "மின்னஞ்சல்" : language === "ml" ? "ഇമെയിൽ" : "Email")}
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder={language === "hi" ? "आपका ईमेल दर्ज करें" : language === "ta" ? "உங்கள் மின்னஞ்சலை உள்ளிடவும்" : language === "ml" ? "നിങ്ങളുടെ ഇമെയിൽ നൽകുക" : "Enter your email"}
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="transition-all duration-200 focus:scale-[1.02]"
                  disabled={isLoading}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="password">
                  {t('auth.password') || (language === "hi" ? "पासवर्ड" : language === "ta" ? "கடவுச்சொல்" : language === "ml" ? "പാസ്‌വേഡ്" : "Password")}
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder={language === "hi" ? "अपना पासवर्ड दर्ज करें" : language === "ta" ? "உங்கள் கடவுச்சொல்லை உள்ளிடவும்" : language === "ml" ? "നിങ്ങളുടെ പാസ്‌വേഡ് നൽകുക" : "Enter your password"}
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="pr-10 transition-all duration-200 focus:scale-[1.02]"
                    disabled={isLoading}
                    required
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                    disabled={isLoading}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <Eye className="h-4 w-4 text-muted-foreground" />
                    )}
                  </Button>
                </div>
              </div>

              <Button 
                type="submit" 
                className="w-full bg-gradient-primary hover:scale-105 transition-transform duration-200 shadow-warm"
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    {language === "hi" ? "लॉग इन हो रहा है..." : language === "ta" ? "உள்நுழைகிறது..." : language === "ml" ? "സൈൻ ഇൻ ചെയ്യുന്നു..." : "Signing in..."}
                  </div>
                ) : (
                  t('auth.signIn') || (language === "hi" ? "लॉग इन करें" : language === "ta" ? "உள்நுழையவும்" : language === "ml" ? "സൈൻ ഇൻ ചെയ്യുക" : "Sign In")
                )}
              </Button>
            </form>

            <div className="mt-6 text-center space-y-4">
              <p className="text-sm text-muted-foreground">
                {t('auth.dontHaveAccount') || (language === "hi" ? "खाता नहीं है?" : language === "ta" ? "கணக்கு இல்லையா?" : language === "ml" ? "അക്കൗണ്ട് ഇല്ലേ?" : "Don't have an account?")}{" "}
                <Link
                  to="/signup"
                  className="text-primary hover:underline font-medium"
                >
                  {t('auth.signUp') || (language === "hi" ? "खाता बनाएं" : language === "ta" ? "கணக்கு உருவாக்கவும்" : language === "ml" ? "അക്കൗണ്ട് സൃഷ്ടിക്കുക" : "Sign Up")}
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}