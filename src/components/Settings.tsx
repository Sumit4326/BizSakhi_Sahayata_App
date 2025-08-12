import { useState, useEffect } from "react";
import { User, Globe, Volume2, Smartphone, Info, Heart, LogOut } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { LanguageSelector } from "./LanguageSelector";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useTranslation } from "@/utils/translations";
import { apiCall } from "@/utils/api";

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
  const navigate = useNavigate();
  const { signOut, user } = useAuth();
  const { t } = useTranslation(language);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
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

  // Load user profile from backend
  const loadUserProfile = async () => {
    try {
      setLoading(true);
      
      // First, try to get profile from user metadata (from signup)
      const userMetadata = user?.user_metadata;
      if (userMetadata) {
        setProfile({
          name: userMetadata.full_name || "",
          businessType: userMetadata.business_type || "",
          region: userMetadata.location || "",
          phone: userMetadata.phone || ""
        });
      }
      
      // Then try to get updated profile from backend
      const response = await apiCall('/api/profile');
      
      if (response.ok) {
        const data = await response.json();
        if (data.success && data.profile) {
          // Update with backend data (this will override metadata if backend has more recent data)
          setProfile({
            name: data.profile.name || userMetadata?.full_name || "",
            businessType: data.profile.businessType || userMetadata?.business_type || "",
            region: data.profile.region || userMetadata?.location || "",
            phone: data.profile.phone || userMetadata?.phone || ""
          });
        }
      } else {
        console.error('Failed to load profile from backend:', response.status);
        // If backend fails, we still have the metadata data loaded above
      }
    } catch (error) {
      console.error('Error loading profile:', error);
      // If everything fails, we still have the metadata data loaded above
    } finally {
      setLoading(false);
    }
  };

  // Load profile on component mount
  useEffect(() => {
    loadUserProfile();
  }, []);

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

  // Helper function to get unique business types including user's custom value
  const getUniqueBusinessTypes = () => {
    const userBusinessType = profile.businessType;
    if (userBusinessType && !businessTypes.includes(userBusinessType)) {
      return [userBusinessType, ...businessTypes];
    }
    return businessTypes;
  };

  // Helper function to get unique regions including user's custom value
  const getUniqueRegions = () => {
    const userRegion = profile.region;
    if (userRegion && !regions.includes(userRegion)) {
      return [userRegion, ...regions];
    }
    return regions;
  };

  const handleSaveProfile = async () => {
    try {
      setSaving(true);
      const response = await apiCall('/api/profile', {
        method: 'PUT',
        body: JSON.stringify(profile)
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          console.log('✅ Profile saved successfully');
          alert(language === "hi" ? "जानकारी सहेजी गई!" : "Information saved!");
        } else {
          console.error('❌ Failed to save profile:', data.error);
          alert(language === "hi" ? "जानकारी सहेजने में त्रुटि" : "Error saving information");
        }
      } else {
        console.error('❌ Failed to save profile:', response.status);
        alert(language === "hi" ? "जानकारी सहेजने में त्रुटि" : "Error saving information");
      }
    } catch (error) {
      console.error('❌ Error saving profile:', error);
      alert(language === "hi" ? "जानकारी सहेजने में त्रुटि" : "Error saving information");
    } finally {
      setSaving(false);
    }
  };

  const handleSaveSettings = async () => {
    try {
      setSaving(true);
      const settings = {
        notifications,
        voiceSettings,
        language
      };

      const response = await apiCall('/api/settings', {
        method: 'POST',
        body: JSON.stringify(settings)
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          console.log('✅ Settings saved successfully');
          alert(language === "hi" ? "सेटिंग्स सहेजी गईं!" : "Settings saved!");
        } else {
          console.error('❌ Failed to save settings:', data.error);
          alert(language === "hi" ? "सेटिंग्स सहेजने में त्रुटि" : "Error saving settings");
        }
      } else {
        console.error('❌ Failed to save settings:', response.status);
        alert(language === "hi" ? "सेटिंग्स सहेजने में त्रुटि" : "Error saving settings");
      }
    } catch (error) {
      console.error('❌ Error saving settings:', error);
      alert(language === "hi" ? "सेटिंग्स सहेजने में त्रुटि" : "Error saving settings");
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut();
      navigate("/login");
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6 pb-20 lg:pb-6">
        <Card className="shadow-card">
          <CardContent className="p-6">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
              <p className="mt-2 text-muted-foreground">
                {language === "hi" ? "लोड हो रहा है..." : "Loading..."}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-20 lg:pb-6">
      {/* Profile Section */}
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            {language === "hi" ? "व्यक्तिगत जानकारी" : "Personal Information"}
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            {language === "hi" 
              ? "आपकी खाता जानकारी यहाँ लोड की गई है। आप इसे अपडेट कर सकते हैं।"
              : "Your account information has been loaded here. You can update it."
            }
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>{language === "hi" ? "आपका नाम" : "Your Name"}</Label>
            <Input
              value={profile.name}
              onChange={(e) => setProfile(prev => ({ ...prev, name: e.target.value }))}
              placeholder={language === "hi" ? "अपना नाम दर्ज करें" : language === "ta" ? "உங்கள் பெயரை உள்ளிடவும்" : language === "ml" ? "നിങ്ങളുടെ പേര് നൽകുക" : "Enter your name"}
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
                {getUniqueBusinessTypes().map((type, index) => (
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
                {getUniqueRegions().map((region, index) => (
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

          <Button onClick={handleSaveProfile} className="w-full" disabled={saving}>
            {saving ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                {language === "hi" ? "सहेज रहा है..." : "Saving..."}
              </>
            ) : (
              language === "hi" ? "जानकारी सहेजें" : "Save Information"
            )}
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
        <CardContent className="pt-0">
          <Button onClick={handleSaveSettings} className="w-full" disabled={saving}>
            {saving ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                {language === "hi" ? "सहेज रहा है..." : "Saving..."}
              </>
            ) : (
              language === "hi" ? "आवाज़ सेटिंग्स सहेजें" : "Save Voice Settings"
            )}
          </Button>
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
        <CardContent className="pt-0">
          <Button onClick={handleSaveSettings} className="w-full" disabled={saving}>
            {saving ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                {language === "hi" ? "सहेज रहा है..." : "Saving..."}
              </>
            ) : (
              language === "hi" ? "सूचना सेटिंग्स सहेजें" : "Save Notification Settings"
            )}
          </Button>
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

      {/* Logout Section */}
      <Card className="shadow-card border-destructive/20">
        <CardContent className="p-6">
          <div className="text-center">
            <Button 
              variant="destructive" 
              onClick={handleLogout}
              className="w-full"
            >
              <LogOut className="h-4 w-4 mr-2" />
              {language === "hi" ? "लॉग आउट करें" : "Logout"}
            </Button>
            <p className="text-sm text-muted-foreground mt-2">
              {language === "hi" 
                ? "अपने खाते से बाहर निकलें"
                : "Sign out of your account"
              }
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