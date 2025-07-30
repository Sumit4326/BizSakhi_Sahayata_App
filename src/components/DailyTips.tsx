import { useState, useEffect, createElement } from "react";
import { Lightbulb, RefreshCw, Heart, TrendingUp, Users } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface Tip {
  id: string;
  title: string;
  titleHi: string;
  content: string;
  contentHi: string;
  category: "business" | "motivation" | "finance" | "marketing";
  mediaType?: "text" | "image" | "video";
  mediaUrl?: string;
  date: Date;
}

// Mock tips - in real app, these would be fetched from API
const mockTips: Tip[] = [
  {
    id: "1",
    title: "Customer First Approach",
    titleHi: "ग्राहक प्राथमिकता",
    content: "Always listen to your customers' needs. Happy customers become your best advocates and bring more business through word-of-mouth.",
    contentHi: "हमेशा अपने ग्राहकों की जरूरतों को सुनें। खुश ग्राहक आपके सबसे अच्छे समर्थक बनते हैं और मुंह की बात से अधिक व्यापार लाते हैं।",
    category: "business",
    date: new Date()
  },
  {
    id: "2",
    title: "Keep Track of Every Rupee",
    titleHi: "हर रुपये का हिसाब रखें",
    content: "Small expenses add up! Track every income and expense daily. This helps you understand where your money goes and how to save more.",
    contentHi: "छोटे खर्च जुड़ जाते हैं! हर दिन हर आय और खर्च का हिसाब रखें। इससे आपको पता चलता है कि आपका पैसा कहाँ जाता है और कैसे अधिक बचत करें।",
    category: "finance",
    date: new Date()
  },
  {
    id: "3",
    title: "Believe in Yourself",
    titleHi: "अपने आप पर विश्वास रखें",
    content: "You have the strength to overcome any challenge. Every successful businesswoman started where you are today. Keep moving forward!",
    contentHi: "आपके पास किसी भी चुनौती से पार पाने की शक्ति है। हर सफल व्यापारी महिला वहीं से शुरू हुई है जहाँ आप आज हैं। आगे बढ़ते रहें!",
    category: "motivation",
    date: new Date()
  },
  {
    id: "4",
    title: "Use Social Media Wisely",
    titleHi: "सोशल मीडिया का बुद्धिमानी से उपयोग करें",
    content: "Share photos of your products on WhatsApp status and Facebook. Let people know what you're making - it's free marketing!",
    contentHi: "व्हाट्सऐप स्टेटस और फेसबुक पर अपने उत्पादों की तस्वीरें साझा करें। लोगों को बताएं कि आप क्या बना रही हैं - यह मुफ्त मार्केटिंग है!",
    category: "marketing",
    date: new Date()
  }
];

interface DailyTipsProps {
  language: string;
}

export function DailyTips({ language }: DailyTipsProps) {
  const [currentTip, setCurrentTip] = useState<Tip>(mockTips[0]);
  const [tipIndex, setTipIndex] = useState(0);

  useEffect(() => {
    // In real app, this would fetch today's tip from API
    const today = new Date();
    const dayOfYear = Math.floor((today.getTime() - new Date(today.getFullYear(), 0, 0).getTime()) / 86400000);
    const index = dayOfYear % mockTips.length;
    setCurrentTip(mockTips[index]);
    setTipIndex(index);
  }, []);

  const getNextTip = () => {
    const nextIndex = (tipIndex + 1) % mockTips.length;
    setCurrentTip(mockTips[nextIndex]);
    setTipIndex(nextIndex);
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "business": return TrendingUp;
      case "motivation": return Heart;
      case "finance": return Lightbulb;
      case "marketing": return Users;
      default: return Lightbulb;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "business": return "bg-primary text-primary-foreground";
      case "motivation": return "bg-accent text-accent-foreground";
      case "finance": return "bg-secondary text-secondary-foreground";
      case "marketing": return "bg-muted text-muted-foreground";
      default: return "bg-primary text-primary-foreground";
    }
  };

  const getCategoryName = (category: string) => {
    const names = {
      business: language === "hi" ? "व्यापार" : "Business",
      motivation: language === "hi" ? "प्रेरणा" : "Motivation", 
      finance: language === "hi" ? "वित्त" : "Finance",
      marketing: language === "hi" ? "मार्केटिंग" : "Marketing"
    };
    return names[category as keyof typeof names] || category;
  };

  const CategoryIcon = getCategoryIcon(currentTip.category);

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-2">
          {language === "hi" ? "आज की सलाह" : "Today's Tip"}
        </h2>
        <p className="text-muted-foreground">
          {language === "hi" ? "आपकी सफलता के लिए दैनिक सुझाव" : "Daily guidance for your success"}
        </p>
      </div>

      <Card className="shadow-warm animate-fade-in bg-gradient-card">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="p-4 rounded-full bg-primary text-primary-foreground animate-glow">
              <CategoryIcon className="h-8 w-8" />
            </div>
          </div>
          
          <Badge className={getCategoryColor(currentTip.category)} variant="secondary">
            {getCategoryName(currentTip.category)}
          </Badge>
          
          <CardTitle className="text-xl mt-4">
            {language === "hi" ? currentTip.titleHi : currentTip.title}
          </CardTitle>
        </CardHeader>
        
        <CardContent className="text-center space-y-6">
          <p className="text-lg leading-relaxed">
            {language === "hi" ? currentTip.contentHi : currentTip.content}
          </p>
          
          {currentTip.mediaUrl && (
            <div className="rounded-lg overflow-hidden">
              {currentTip.mediaType === "image" && (
                <img 
                  src={currentTip.mediaUrl} 
                  alt="Tip illustration" 
                  className="w-full h-48 object-cover"
                />
              )}
              {currentTip.mediaType === "video" && (
                <video 
                  src={currentTip.mediaUrl} 
                  controls 
                  className="w-full h-48"
                />
              )}
            </div>
          )}
          
          <Button 
            onClick={getNextTip}
            variant="outline"
            className="w-full"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            {language === "hi" ? "अगली सलाह देखें" : "See Next Tip"}
          </Button>
        </CardContent>
      </Card>

      {/* Motivational Quote Section */}
      <Card className="shadow-card bg-gradient-primary text-primary-foreground">
        <CardContent className="p-6 text-center">
          <div className="flex justify-center mb-4">
            <Heart className="h-6 w-6 animate-float" />
          </div>
          <blockquote className="text-lg italic mb-4">
            {language === "hi" 
              ? "सफलता का राज है निरंतर कोशिश और धैर्य।"
              : "The secret of success is constant effort and patience."
            }
          </blockquote>
          <p className="text-sm opacity-80">
            {language === "hi" ? "— सभी सफल उद्यमी महिलाओं के लिए" : "— For all successful women entrepreneurs"}
          </p>
        </CardContent>
      </Card>

      {/* Quick Tips Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {mockTips.slice(0, 4).map((tip, index) => (
          <Card 
            key={tip.id} 
            className={`shadow-card cursor-pointer transition-all hover:shadow-warm ${
              tip.id === currentTip.id ? "ring-2 ring-primary" : ""
            }`}
            onClick={() => {
              setCurrentTip(tip);
              setTipIndex(index);
            }}
          >
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <div className={`p-2 rounded-full ${getCategoryColor(tip.category)}`}>
                  {createElement(getCategoryIcon(tip.category), { className: "h-4 w-4" })}
                </div>
                <div className="flex-1">
                  <h4 className="font-medium text-sm mb-1">
                    {language === "hi" ? tip.titleHi : tip.title}
                  </h4>
                  <p className="text-xs text-muted-foreground line-clamp-2">
                    {language === "hi" ? tip.contentHi.slice(0, 80) + "..." : tip.content.slice(0, 80) + "..."}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}