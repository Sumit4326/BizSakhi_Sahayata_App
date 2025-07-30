import { useState } from "react";
import { MessageSquare, Send, HelpCircle, FileText, Banknote } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

interface LoanScheme {
  id: string;
  name: string;
  nameHi: string;
  description: string;
  descriptionHi: string;
  eligibility: string;
  eligibilityHi: string;
  maxAmount: string;
  category: "mudra" | "pmegp" | "shg" | "nabard";
}

interface ChatMessage {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
  schemes?: LoanScheme[];
}

// Mock loan schemes - in real app, these would come from RAG system
const mockSchemes: LoanScheme[] = [
  {
    id: "1",
    name: "Mudra Shishu Loan",
    nameHi: "मुद्रा शिशु लोन",
    description: "For starting or enhancing income-generating activities. Perfect for small businesses.",
    descriptionHi: "आय पैदा करने वाली गतिविधियों को शुरू करने या बढ़ाने के लिए। छोटे व्यापार के लिए उत्तम।",
    eligibility: "Women entrepreneurs, existing small businesses",
    eligibilityHi: "महिला उद्यमी, मौजूदा छोटे व्यापार",
    maxAmount: "₹50,000",
    category: "mudra"
  },
  {
    id: "2", 
    name: "PMEGP Scheme",
    nameHi: "पीएमईजीपी योजना",
    description: "Prime Minister's Employment Generation Programme for new ventures and job creation.",
    descriptionHi: "प्रधानमंत्री रोजगार सृजन कार्यक्रम नए उद्यमों और रोजगार सृजन के लिए।",
    eligibility: "18+ years, minimum 8th class education",
    eligibilityHi: "18+ वर्ष, न्यूनतम आठवीं कक्षा की शिक्षा",
    maxAmount: "₹25 lakhs",
    category: "pmegp"
  },
  {
    id: "3",
    name: "SHG Bank Linkage",
    nameHi: "एसएचजी बैंक लिंकेज",
    description: "Self Help Group linkage for collective savings and credit support.",
    descriptionHi: "सामूहिक बचत और ऋण सहायता के लिए स्वयं सहायता समूह लिंकेज।",
    eligibility: "Member of registered SHG",
    eligibilityHi: "पंजीकृत एसएचजी का सदस्य",
    maxAmount: "₹10 lakhs",
    category: "shg"
  }
];

interface LoanHelperProps {
  language: string;
}

export function LoanHelper({ language }: LoanHelperProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "1",
      text: language === "hi" 
        ? "नमस्ते! मैं आपको सरकारी लोन स्कीमों की जानकारी देने में मदद करूंगी। आप क्या जानना चाहती हैं?"
        : "Hello! I'll help you learn about government loan schemes. What would you like to know?",
      isUser: false,
      timestamp: new Date(),
      schemes: mockSchemes.slice(0, 3)
    }
  ]);

  const [inputText, setInputText] = useState("");

  const handleSendMessage = () => {
    if (!inputText.trim()) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      text: inputText,
      isUser: true,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText("");

    // Simulate RAG-powered response
    setTimeout(() => {
      let responseText = "";
      let relevantSchemes: LoanScheme[] = [];

      // Simple keyword matching - in real app, this would be RAG
      if (inputText.toLowerCase().includes("mudra") || inputText.toLowerCase().includes("मुद्रा")) {
        relevantSchemes = mockSchemes.filter(s => s.category === "mudra");
        responseText = language === "hi"
          ? "मुद्रा योजना के बारे में यहाँ जानकारी है। यह छोटे व्यापार के लिए बहुत उपयोगी है।"
          : "Here's information about Mudra schemes. These are very useful for small businesses.";
      } else if (inputText.toLowerCase().includes("pmegp") || inputText.toLowerCase().includes("employment")) {
        relevantSchemes = mockSchemes.filter(s => s.category === "pmegp");
        responseText = language === "hi"
          ? "पीएमईजीपी योजना नए व्यापार शुरू करने के लिए है। यहाँ विस्तार है।"
          : "PMEGP scheme is for starting new businesses. Here are the details.";
      } else if (inputText.toLowerCase().includes("shg") || inputText.toLowerCase().includes("group")) {
        relevantSchemes = mockSchemes.filter(s => s.category === "shg");
        responseText = language === "hi"
          ? "स्वयं सहायता समूह के माध्यम से लोन की जानकारी यहाँ है।"
          : "Here's information about loans through Self Help Groups.";
      } else {
        relevantSchemes = mockSchemes;
        responseText = language === "hi"
          ? "यहाँ कुछ मुख्य सरकारी लोन स्कीमें हैं जो आपके काम आ सकती हैं।"
          : "Here are some main government loan schemes that might be useful for you.";
      }

      const sakhiMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        text: responseText,
        isUser: false,
        timestamp: new Date(),
        schemes: relevantSchemes
      };

      setMessages(prev => [...prev, sakhiMessage]);
    }, 1000);
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "mudra": return "bg-primary text-primary-foreground";
      case "pmegp": return "bg-secondary text-secondary-foreground";
      case "shg": return "bg-accent text-accent-foreground";
      case "nabard": return "bg-muted text-muted-foreground";
      default: return "bg-primary text-primary-foreground";
    }
  };

  return (
    <div className="flex flex-col h-full max-h-[80vh]">
      {/* Popular Schemes Header */}
      <div className="p-4 border-b">
        <h3 className="font-semibold mb-3">
          {language === "hi" ? "लोकप्रिय योजनाएं" : "Popular Schemes"}
        </h3>
        <div className="flex gap-2 flex-wrap">
          {["mudra", "pmegp", "shg"].map((category) => (
            <Button
              key={category}
              variant="outline"
              size="sm"
              onClick={() => setInputText(category === "mudra" ? "मुद्रा लोन" : category === "pmegp" ? "PMEGP scheme" : "SHG loans")}
            >
              <Banknote className="h-3 w-3 mr-1" />
              {category.toUpperCase()}
            </Button>
          ))}
        </div>
      </div>

      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div key={message.id} className="animate-fade-in">
            <div className={`flex ${message.isUser ? "justify-end" : "justify-start"} mb-2`}>
              <div className={`max-w-[85%] p-3 rounded-lg ${
                message.isUser 
                  ? "bg-primary text-primary-foreground" 
                  : "bg-card border shadow-card"
              }`}>
                <p className="text-sm">{message.text}</p>
              </div>
            </div>

            {/* Loan Schemes Cards */}
            {message.schemes && message.schemes.length > 0 && (
              <div className="space-y-3 ml-2">
                {message.schemes.map((scheme) => (
                  <Card key={scheme.id} className="shadow-card">
                    <CardHeader className="pb-2">
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="text-lg">
                            {language === "hi" ? scheme.nameHi : scheme.name}
                          </CardTitle>
                          <Badge className={getCategoryColor(scheme.category)} variant="secondary">
                            {scheme.category.toUpperCase()}
                          </Badge>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-muted-foreground">
                            {language === "hi" ? "अधिकतम राशि" : "Max Amount"}
                          </p>
                          <p className="font-bold text-primary">{scheme.maxAmount}</p>
                        </div>
                      </div>
                    </CardHeader>
                    
                    <CardContent className="space-y-3">
                      <div>
                        <h4 className="font-medium text-sm mb-1">
                          {language === "hi" ? "विवरण:" : "Description:"}
                        </h4>
                        <p className="text-sm text-muted-foreground">
                          {language === "hi" ? scheme.descriptionHi : scheme.description}
                        </p>
                      </div>
                      
                      <div>
                        <h4 className="font-medium text-sm mb-1">
                          {language === "hi" ? "पात्रता:" : "Eligibility:"}
                        </h4>
                        <p className="text-sm text-muted-foreground">
                          {language === "hi" ? scheme.eligibilityHi : scheme.eligibility}
                        </p>
                      </div>
                      
                      <Button variant="outline" size="sm" className="w-full">
                        <FileText className="h-3 w-3 mr-2" />
                        {language === "hi" ? "और जानकारी" : "Learn More"}
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Quick Questions */}
      <div className="p-4 border-t border-b">
        <p className="text-sm text-muted-foreground mb-2">
          {language === "hi" ? "सामान्य प्रश्न:" : "Common Questions:"}
        </p>
        <div className="flex gap-2 flex-wrap">
          {[
            language === "hi" ? "कम ब्याज दर वाला लोन?" : "Low interest loan?",
            language === "hi" ? "महिलाओं के लिए योजना?" : "Schemes for women?",
            language === "hi" ? "बिना गारंटी लोन?" : "Loan without guarantee?"
          ].map((question) => (
            <Button
              key={question}
              variant="ghost"
              size="sm"
              onClick={() => setInputText(question)}
              className="text-xs"
            >
              <HelpCircle className="h-3 w-3 mr-1" />
              {question}
            </Button>
          ))}
        </div>
      </div>

      {/* Input Area */}
      <div className="p-4 bg-background">
        <div className="flex gap-2">
          <Input
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder={language === "hi" ? "लोन के बारे में पूछें..." : "Ask about loans..."}
            onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
            className="flex-1"
          />
          <Button onClick={handleSendMessage} size="icon">
            <Send className="h-4 w-4" />
          </Button>
        </div>
        <p className="text-xs text-muted-foreground mt-2 text-center">
          {language === "hi" 
            ? "सरकारी योजनाओं की अप-टू-डेट जानकारी" 
            : "Up-to-date information on government schemes"
          }
        </p>
      </div>
    </div>
  );
}