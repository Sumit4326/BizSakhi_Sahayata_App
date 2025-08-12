import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LanguageSelector } from "@/components/LanguageSelector";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Flower2, Eye, EyeOff, User, Mail, Phone, MapPin } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useTranslation } from "@/utils/translations";

export default function SignUp() {
  const [language, setLanguage] = useState("en");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    businessType: "",
    location: "",
    password: "",
    confirmPassword: ""
  });
  
  const navigate = useNavigate();
  const { signUp, user } = useAuth();
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
    
    // Validation
    if (!formData.fullName.trim() || !formData.email.trim() || !formData.password.trim()) {
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      return;
    }

    if (formData.password.length < 6) {
      return;
    }

    setIsLoading(true);

    try {
      const userData = {
        full_name: formData.fullName,
        phone: formData.phone,
        business_type: formData.businessType,
        location: formData.location,
      };

      const { user: newUser, error } = await signUp(formData.email, formData.password, userData);
      
      if (!error && newUser) {
        // Redirect to login or verification page
        navigate("/login");
      }
    } catch (error) {
      console.error('Sign up error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-subtle relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary/20 rounded-full blur-3xl animate-float"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-secondary/20 rounded-full blur-3xl animate-float-delayed"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-accent/10 rounded-full blur-3xl animate-pulse-slow"></div>
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

      {/* Sign Up Form */}
      <div className="relative z-10 flex items-center justify-center min-h-[calc(100vh-120px)] p-4">
        <Card className="w-full max-w-lg shadow-warm animate-fade-in bg-card/80 backdrop-blur-sm border-2 border-primary/20">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 p-3 rounded-full bg-gradient-primary w-fit">
              <User className="h-8 w-8 text-white animate-float" />
            </div>
            <CardTitle className="text-2xl font-bold">
              {t('auth.signUp') || (language === "hi" ? "खाता बनाएं" : language === "ta" ? "கணக்கு உருவாக்கவும்" : language === "ml" ? "അക്കൗണ്ട് സൃഷ്ടിക്കുക" : "Create Account")}
            </CardTitle>
            <p className="text-muted-foreground">
              {t('auth.signUpSubtitle') || (language === "hi" ? "अपना BizSakhi खाता बनाएं" : language === "ta" ? "உங்கள் BizSakhi கணக்கை உருவாக்கவும்" : language === "ml" ? "നിങ്ങളുടെ BizSakhi അക്കൗണ്ട് സൃഷ്ടിക്കുക" : "Create your BizSakhi account")}
            </p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="fullName">
                    {t('auth.fullName') || (language === "hi" ? "पूरा नाम" : language === "ta" ? "முழு பெயர்" : language === "ml" ? "പൂർണ്ണ നാമം" : "Full Name")}
                  </Label>
                  <Input
                    id="fullName"
                    type="text"
                    placeholder={language === "hi" ? "अपना नाम दर्ज करें" : language === "ta" ? "உங்கள் பெயரை உள்ளிடவும்" : language === "ml" ? "നിങ്ങളുടെ പേര് നൽകുക" : "Enter your full name"}
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    className="transition-all duration-200 focus:scale-[1.02]"
                    disabled={isLoading}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="email">
                    {t('auth.email') || (language === "hi" ? "ईमेल" : language === "ta" ? "மின்னஞ்சல்" : language === "ml" ? "ഇമെയിൽ" : "Email")}
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder={language === "hi" ? "आपका ईमेल" : language === "ta" ? "உங்கள் மின்னஞ்சல்" : language === "ml" ? "നിങ്ങളുടെ ഇമെയിൽ" : "Your email"}
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="transition-all duration-200 focus:scale-[1.02]"
                    disabled={isLoading}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="phone">
                    {t('auth.phone') || (language === "hi" ? "फोन नंबर" : language === "ta" ? "தொலைபேசி எண்" : language === "ml" ? "ഫോൺ നമ്പർ" : "Phone Number")}
                  </Label>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder={language === "hi" ? "फोन नंबर" : language === "ta" ? "தொலைபேசி எண்" : language === "ml" ? "ഫോൺ നമ്പർ" : "Phone number"}
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="transition-all duration-200 focus:scale-[1.02]"
                    disabled={isLoading}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="businessType">
                    {t('auth.businessType') || (language === "hi" ? "व्यापार प्रकार" : language === "ta" ? "வணிக வகை" : language === "ml" ? "ബിസിനസ്സ് തരം" : "Business Type")}
                  </Label>
                  <Input
                    id="businessType"
                    type="text"
                    placeholder={language === "hi" ? "जैसे: सिलाई, खाना बनाना" : language === "ta" ? "எ.கா: தையல், சமையல்" : language === "ml" ? "ഉദാ: തയ്യൽ, പാചകം" : "e.g: Tailoring, Cooking"}
                    value={formData.businessType}
                    onChange={(e) => setFormData({ ...formData, businessType: e.target.value })}
                    className="transition-all duration-200 focus:scale-[1.02]"
                    disabled={isLoading}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="location">
                  {t('auth.location') || (language === "hi" ? "स्थान" : language === "ta" ? "இடம்" : language === "ml" ? "സ്ഥലം" : "Location")}
                </Label>
                <Input
                  id="location"
                  type="text"
                  placeholder={language === "hi" ? "आपका शहर/गांव" : language === "ta" ? "உங்கள் நகரம்/கிராமம்" : language === "ml" ? "നിങ്ങളുടെ നഗരം/ഗ്രാമം" : "Your city/village"}
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  className="transition-all duration-200 focus:scale-[1.02]"
                  disabled={isLoading}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="password">
                    {t('auth.password') || (language === "hi" ? "पासवर्ड" : language === "ta" ? "கடவுச்சொல்" : language === "ml" ? "പാസ്‌വേഡ്" : "Password")}
                  </Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder={language === "hi" ? "पासवर्ड (कम से कम 6 अक्षर)" : language === "ta" ? "கடவுச்சொல் (குறைந்தது 6 எழுத்துகள்)" : language === "ml" ? "പാസ്‌വേഡ് (കുറഞ്ഞത് 6 അക്ഷരങ്ങൾ)" : "Password (min 6 characters)"}
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      className="pr-10 transition-all duration-200 focus:scale-[1.02]"
                      disabled={isLoading}
                      required
                      minLength={6}
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

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">
                    {t('auth.confirmPassword') || (language === "hi" ? "पासवर्ड की पुष्टि करें" : language === "ta" ? "கடவுச்சொல்லை உறுதிப்படுத்தவும்" : language === "ml" ? "പാസ്‌വേഡ് സ്ഥിരീകരിക്കുക" : "Confirm Password")}
                  </Label>
                  <div className="relative">
                    <Input
                      id="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder={language === "hi" ? "पासवर्ड दोबारा दर्ज करें" : language === "ta" ? "கடவுச்சொல்லை மீண்டும் உள்ளிடவும்" : language === "ml" ? "പാസ്‌വേഡ് വീണ്ടും നൽകുക" : "Re-enter password"}
                      value={formData.confirmPassword}
                      onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                      className="pr-10 transition-all duration-200 focus:scale-[1.02]"
                      disabled={isLoading}
                      required
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      disabled={isLoading}
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="h-4 w-4 text-muted-foreground" />
                      ) : (
                        <Eye className="h-4 w-4 text-muted-foreground" />
                      )}
                    </Button>
                  </div>
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
                    {language === "hi" ? "खाता बनाया जा रहा है..." : language === "ta" ? "கணக்கு உருவாக்கப்படுகிறது..." : language === "ml" ? "അക്കൗണ്ട് സൃഷ്ടിക്കുന്നു..." : "Creating account..."}
                  </div>
                ) : (
                  t('auth.signUp') || (language === "hi" ? "खाता बनाएं" : language === "ta" ? "கணக்கு உருவாக்கவும்" : language === "ml" ? "അക്കൗണ്ട് സൃഷ്ടിക്കുക" : "Create Account")
                )}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-muted-foreground">
                {t('auth.alreadyHaveAccount') || (language === "hi" ? "पहले से खाता है?" : language === "ta" ? "ஏற்கனவே கணக்கு உள்ளதா?" : language === "ml" ? "ഇതിനകം അക്കൗണ്ട് ഉണ്ടോ?" : "Already have an account?")}{" "}
                <Link 
                  to="/login" 
                  className="text-primary hover:underline font-medium"
                >
                  {t('auth.signIn') || (language === "hi" ? "लॉग इन करें" : language === "ta" ? "உள்நுழையவும்" : language === "ml" ? "സൈൻ ഇൻ ചെയ്യുക" : "Sign In")}
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
