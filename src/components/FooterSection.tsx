import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Flower2, Mail, Phone, MapPin, Facebook, Twitter, Instagram, Youtube, Heart } from "lucide-react";

interface FooterSectionProps {
  language: string;
}

export function FooterSection({ language }: FooterSectionProps) {
  return (
    <footer className="bg-gradient-card border-t border-primary/10">
      <div className="container mx-auto px-4 py-16">
        {/* Newsletter Section */}
        <Card className="mb-12 bg-gradient-primary/5 border-primary/20 shadow-warm">
          <CardContent className="p-8 text-center">
            <h3 className="text-2xl font-bold mb-4">
              {language === "hi" ? 
                "व्यापारिक सुझावों के लिए सदस्यता लें" : 
                "Subscribe for Business Tips"
              }
            </h3>
            <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
              {language === "hi" ? 
                "हर सप्ताह नए व्यापारिक सुझाव, सफलता की कहानियां और अपडेट्स पाएं" :
                "Get weekly business tips, success stories and updates"
              }
            </p>
            <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
              <Input
                type="email"
                placeholder={language === "hi" ? "अपना ईमेल डालें" : "Enter your email"}
                className="flex-1"
              />
              <Button className="bg-gradient-primary hover:scale-105 transition-transform">
                <Mail className="h-4 w-4 mr-2" />
                {language === "hi" ? "सदस्यता लें" : "Subscribe"}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
          {/* Brand Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 bg-gradient-primary rounded-full flex items-center justify-center animate-glow shadow-glow">
                <Flower2 className="h-5 w-5 text-white animate-float" />
              </div>
              <h3 className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent">
                BizSakhi
              </h3>
            </div>
            <p className="text-muted-foreground leading-relaxed">
              {language === "hi" ? 
                "भारत की महिला उद्यमियों के लिए बनाया गया स्मार्ट व्यापारिक समाधान।" :
                "Smart business solution built for India's women entrepreneurs."
              }
            </p>
            <div className="flex gap-3">
              <Button variant="ghost" size="icon" className="hover:scale-110 transition-transform">
                <Facebook className="h-5 w-5" />
              </Button>
              <Button variant="ghost" size="icon" className="hover:scale-110 transition-transform">
                <Twitter className="h-5 w-5" />
              </Button>
              <Button variant="ghost" size="icon" className="hover:scale-110 transition-transform">
                <Instagram className="h-5 w-5" />
              </Button>
              <Button variant="ghost" size="icon" className="hover:scale-110 transition-transform">
                <Youtube className="h-5 w-5" />
              </Button>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold">
              {language === "hi" ? "त्वरित लिंक्स" : "Quick Links"}
            </h4>
            <div className="space-y-2">
              {[
                { hi: "होम", en: "Home" },
                { hi: "फीचर्स", en: "Features" },
                { hi: "सफलता की कहानियां", en: "Success Stories" },
                { hi: "सहायता", en: "Help" },
                { hi: "संपर्क करें", en: "Contact Us" }
              ].map((item, index) => (
                <Button
                  key={index}
                  variant="ghost"
                  className="justify-start p-0 h-auto text-muted-foreground hover:text-primary transition-colors"
                >
                  {language === "hi" ? item.hi : item.en}
                </Button>
              ))}
            </div>
          </div>

          {/* Support */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold">
              {language === "hi" ? "सहायता" : "Support"}
            </h4>
            <div className="space-y-2">
              {[
                { hi: "ट्यूटोरियल", en: "Tutorials" },
                { hi: "FAQ", en: "FAQ" },
                { hi: "लाइव चैट", en: "Live Chat" },
                { hi: "कम्युनिटी", en: "Community" },
                { hi: "फीडबैक", en: "Feedback" }
              ].map((item, index) => (
                <Button
                  key={index}
                  variant="ghost"
                  className="justify-start p-0 h-auto text-muted-foreground hover:text-primary transition-colors"
                >
                  {language === "hi" ? item.hi : item.en}
                </Button>
              ))}
            </div>
          </div>

          {/* Contact Info */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold">
              {language === "hi" ? "संपर्क जानकारी" : "Contact Info"}
            </h4>
            <div className="space-y-3">
              <div className="flex items-center gap-3 text-muted-foreground">
                <Mail className="h-5 w-5 text-primary" />
                <span className="text-sm">support@bizsakhi.com</span>
              </div>
              <div className="flex items-center gap-3 text-muted-foreground">
                <Phone className="h-5 w-5 text-primary" />
                <span className="text-sm">+91 98765 43210</span>
              </div>
              <div className="flex items-start gap-3 text-muted-foreground">
                <MapPin className="h-5 w-5 text-primary mt-0.5" />
                <span className="text-sm">
                  {language === "hi" ? 
                    "बैंगलोर, कर्नाटक, भारत" :
                    "Bangalore, Karnataka, India"
                  }
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-border/50 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span>
                {language === "hi" ? 
                  "© 2024 BizSakhi. सभी अधिकार सुरक्षित।" :
                  "© 2024 BizSakhi. All rights reserved."
                }
              </span>
            </div>
            
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <span>
                {language === "hi" ? "प्यार से बनाया गया" : "Made with"}
              </span>
              <Heart className="h-4 w-4 text-red-500 animate-pulse" />
              <span>
                {language === "hi" ? "भारत में" : "in India"}
              </span>
            </div>
            
            <div className="flex gap-6 text-sm text-muted-foreground">
              <Button variant="ghost" className="p-0 h-auto hover:text-primary transition-colors">
                {language === "hi" ? "प्राइवेसी पॉलिसी" : "Privacy Policy"}
              </Button>
              <Button variant="ghost" className="p-0 h-auto hover:text-primary transition-colors">
                {language === "hi" ? "नियम व शर्तें" : "Terms of Service"}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}