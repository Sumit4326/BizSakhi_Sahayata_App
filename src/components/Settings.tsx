import { useState } from "react";
import { User, Globe, Volume2, Smartphone, Info, Heart } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { LanguageSelector } from "./LanguageSelector";

interface UserProfile {
  name: string;
  businessType: string;
  region: string;
  phone: string;
}

interface SettingsProps {
  language: string;
  onLanguageChange: (language: string) => void;
}

export function Settings({ language, onLanguageChange }: SettingsProps) {
  const [profile, setProfile] = useState<UserProfile>({
    name: "",
    businessType: "",
    region: "",
    phone: ""
  });

  const [notifications, setNotifications] = useState({
    dailyTips: true,
    lowStock: true,
    loanUpdates: true,
    voiceReminders: false
  });

  const [voiceSettings, setVoiceSettings] = useState({
    voiceSpeed: "normal",
    voiceGender: "female"
  });

  const businessTypes = language === "hi" ? [
    "कपड़े की दुकान",
    "दर्जी का काम", 
    "हस्तशिल्प",
    "खाद्य सामग्री",
    "सब्जी बेचना",
    "किराना दुकान",
    "अन्य"
  ] : [
    "Clothing Store",
    "Tailoring",
    "Handicrafts", 
    "Food Items",
    "Vegetable Selling",
    "Grocery Store",
    "Other"
  ];

  const regions = language === "hi" ? [
    "उत्तर प्रदेश",
    "महाराष्ट्र",
    "बिहार",
    "पश्चिम बंगाल",
    "मध्य प्रदेश",
    "तमिलनाडु",
    "राजस्थान",
    "कर्नाटक",
    "गुजरात",
    "आंध्र प्रदेश",
    "अन्य"
  ] : [
    "Uttar Pradesh",
    "Maharashtra", 
    "Bihar",
    "West Bengal",
    "Madhya Pradesh",
    "Tamil Nadu",
    "Rajasthan",
    "Karnataka",
    "Gujarat",
    "Andhra Pradesh",
    "Other"
  ];

  const handleSaveProfile = () => {
    // In real app, this would save to backend
    console.log("Saving profile:", profile);
  };

  return (
    <div className="space-y-6 pb-20 lg:pb-6">
      {/* Profile Section */}
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            {language === "hi" ? "व्यक्तिगत जानकारी" : "Personal Information"}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>{language === "hi" ? "आपका नाम" : "Your Name"}</Label>
            <Input
              value={profile.name}
              onChange={(e) => setProfile(prev => ({ ...prev, name: e.target.value }))}
              placeholder={language === "hi" ? "अपना नाम दर्ज करें" : "Enter your name"}
            />
          </div>

          <div className="space-y-2">
            <Label>{language === "hi" ? "व्यापार का प्रकार" : "Business Type"}</Label>
            <Select value={profile.businessType} onValueChange={(value) => 
              setProfile(prev => ({ ...prev, businessType: value }))
            }>
              <SelectTrigger>
                <SelectValue placeholder={language === "hi" ? "व्यापार चुनें" : "Select business type"} />
              </SelectTrigger>
              <SelectContent>
                {businessTypes.map((type, index) => (
                  <SelectItem key={index} value={type}>
                    {type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>{language === "hi" ? "राज्य/क्षेत्र" : "State/Region"}</Label>
            <Select value={profile.region} onValueChange={(value) => 
              setProfile(prev => ({ ...prev, region: value }))
            }>
              <SelectTrigger>
                <SelectValue placeholder={language === "hi" ? "राज्य चुनें" : "Select state"} />
              </SelectTrigger>
              <SelectContent>
                {regions.map((region, index) => (
                  <SelectItem key={index} value={region}>
                    {region}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>{language === "hi" ? "फोन नंबर" : "Phone Number"}</Label>
            <Input
              type="tel"
              value={profile.phone}
              onChange={(e) => setProfile(prev => ({ ...prev, phone: e.target.value }))}
              placeholder={language === "hi" ? "फोन नंबर दर्ज करें" : "Enter phone number"}
            />
          </div>

          <Button onClick={handleSaveProfile} className="w-full">
            {language === "hi" ? "जानकारी सहेजें" : "Save Information"}
          </Button>
        </CardContent>
      </Card>

      {/* Language Settings */}
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5" />
            {language === "hi" ? "भाषा सेटिंग्स" : "Language Settings"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label>{language === "hi" ? "ऐप की भाषा" : "App Language"}</Label>
                <p className="text-sm text-muted-foreground">
                  {language === "hi" ? "अपनी पसंदीदा भाषा चुनें" : "Choose your preferred language"}
                </p>
              </div>
              <LanguageSelector 
                selectedLanguage={language}
                onLanguageSelect={onLanguageChange}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Voice Settings */}
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Volume2 className="h-5 w-5" />
            {language === "hi" ? "आवाज़ सेटिंग्स" : "Voice Settings"}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>{language === "hi" ? "आवाज़ की गति" : "Voice Speed"}</Label>
            <Select value={voiceSettings.voiceSpeed} onValueChange={(value) => 
              setVoiceSettings(prev => ({ ...prev, voiceSpeed: value }))
            }>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="slow">{language === "hi" ? "धीमी" : "Slow"}</SelectItem>
                <SelectItem value="normal">{language === "hi" ? "सामान्य" : "Normal"}</SelectItem>
                <SelectItem value="fast">{language === "hi" ? "तेज़" : "Fast"}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>{language === "hi" ? "आवाज़ का प्रकार" : "Voice Type"}</Label>
            <Select value={voiceSettings.voiceGender} onValueChange={(value) => 
              setVoiceSettings(prev => ({ ...prev, voiceGender: value }))
            }>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="female">{language === "hi" ? "महिला आवाज़" : "Female Voice"}</SelectItem>
                <SelectItem value="male">{language === "hi" ? "पुरुष आवाज़" : "Male Voice"}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Notification Settings */}
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Smartphone className="h-5 w-5" />
            {language === "hi" ? "सूचना सेटिंग्स" : "Notification Settings"}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label>{language === "hi" ? "दैनिक सुझाव" : "Daily Tips"}</Label>
              <p className="text-sm text-muted-foreground">
                {language === "hi" ? "रोज़ाना व्यापारिक सलाह" : "Daily business advice"}
              </p>
            </div>
            <Switch
              checked={notifications.dailyTips}
              onCheckedChange={(checked) => 
                setNotifications(prev => ({ ...prev, dailyTips: checked }))
              }
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label>{language === "hi" ? "कम स्टॉक अलर्ट" : "Low Stock Alerts"}</Label>
              <p className="text-sm text-muted-foreground">
                {language === "hi" ? "जब स्टॉक कम हो जाए" : "When inventory runs low"}
              </p>
            </div>
            <Switch
              checked={notifications.lowStock}
              onCheckedChange={(checked) => 
                setNotifications(prev => ({ ...prev, lowStock: checked }))
              }
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label>{language === "hi" ? "लोन अपडेट" : "Loan Updates"}</Label>
              <p className="text-sm text-muted-foreground">
                {language === "hi" ? "नई योजनाओं की जानकारी" : "New scheme notifications"}
              </p>
            </div>
            <Switch
              checked={notifications.loanUpdates}
              onCheckedChange={(checked) => 
                setNotifications(prev => ({ ...prev, loanUpdates: checked }))
              }
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label>{language === "hi" ? "आवाज़ रिमाइंडर" : "Voice Reminders"}</Label>
              <p className="text-sm text-muted-foreground">
                {language === "hi" ? "बोलकर याद दिलाना" : "Spoken reminders"}
              </p>
            </div>
            <Switch
              checked={notifications.voiceReminders}
              onCheckedChange={(checked) => 
                setNotifications(prev => ({ ...prev, voiceReminders: checked }))
              }
            />
          </div>
        </CardContent>
      </Card>

      {/* About Section */}
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Info className="h-5 w-5" />
            {language === "hi" ? "ऐप के बारे में" : "About App"}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-center">
            <div className="h-16 w-16 bg-gradient-primary rounded-full flex items-center justify-center mx-auto mb-4 animate-glow">
              <span className="text-primary-foreground font-bold text-2xl">B</span>
            </div>
            <h3 className="text-xl font-bold bg-gradient-primary bg-clip-text text-transparent mb-2">
              BizSakhi
            </h3>
            <p className="text-muted-foreground mb-4">
              {language === "hi" 
                ? "ग्रामीण भारतीय महिला उद्यमियों के लिए स्मार्ट सहायक" 
                : "Smart assistant for rural Indian women entrepreneurs"
              }
            </p>
            <p className="text-sm text-muted-foreground">
              {language === "hi" ? "संस्करण 1.0.0" : "Version 1.0.0"}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Footer */}
      <Card className="shadow-card bg-gradient-primary text-primary-foreground">
        <CardContent className="p-6 text-center">
          <Heart className="h-6 w-6 mx-auto mb-2 animate-float" />
          <p className="text-sm">
            {language === "hi" 
              ? "भारत की महिला उद्यमियों के लिए ❤️ के साथ बनाया गया - BizSakhi"
              : "Made with ❤️ for India's Women Entrepreneurs - BizSakhi"
            }
          </p>
        </CardContent>
      </Card>
    </div>
  );
}