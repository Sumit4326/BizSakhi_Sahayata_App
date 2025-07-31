import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LanguageSelector } from "@/components/LanguageSelector";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Flower2, Eye, EyeOff } from "lucide-react";
import { toast } from "@/hooks/use-toast";

export default function Login() {
  const [language, setLanguage] = useState("hi");
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    username: "",
    password: ""
  });
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Mock validation
    if (formData.username && formData.password) {
      localStorage.setItem("bizsakhi-user", formData.username);
      toast({
        title: language === "hi" ? "स्वागत है!" : "Welcome!",
        description: language === "hi" ? "सफलतापूर्वक लॉग इन हो गए" : "Successfully logged in",
      });
      navigate("/");
    } else {
      toast({
        title: language === "hi" ? "त्रुटि" : "Error",
        description: language === "hi" ? "कृपया सभी फील्ड भरें" : "Please fill all fields",
        variant: "destructive",
      });
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
            onLanguageSelect={setLanguage}
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
              {language === "hi" ? "स्वागत है" : "Welcome Back"}
            </CardTitle>
            <p className="text-muted-foreground">
              {language === "hi" 
                ? "अपने BizSakhi खाते में लॉग इन करें"
                : "Sign in to your BizSakhi account"
              }
            </p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="username">
                  {language === "hi" ? "उपयोगकर्ता नाम" : "Username"}
                </Label>
                <Input
                  id="username"
                  type="text"
                  placeholder={language === "hi" ? "अपना नाम दर्ज करें" : "Enter your username"}
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  className="transition-all duration-200 focus:scale-[1.02]"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="password">
                  {language === "hi" ? "पासवर्ड" : "Password"}
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder={language === "hi" ? "अपना पासवर्ड दर्ज करें" : "Enter your password"}
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="pr-10 transition-all duration-200 focus:scale-[1.02]"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
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
              >
                {language === "hi" ? "लॉग इन करें" : "Sign In"}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-muted-foreground">
                {language === "hi" ? "डेमो के लिए कोई भी यूजरनेम और पासवर्ड डालें" : "Enter any username and password for demo"}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}