import { useState } from "react";
import { MessageSquare, Send, HelpCircle, FileText, Banknote, Loader2, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { API_BASE_URL } from "@/utils/api";
import { useTranslation } from "@/utils/translations";
import { VoiceInput } from "@/components/VoiceInput";
import ReactMarkdown from "react-markdown";

interface LoanScheme {
  id: string;
  name: string;
  name_hi?: string;
  description: string;
  description_hi?: string;
  eligibility: string;
  eligibility_hi?: string;
  max_amount: string;
  interest_rate?: string;
  tenure?: string;
  category: string;
  application_process?: string;
  application_process_hi?: string;
  documents_required?: string[];
  benefits?: string[];
  benefits_hi?: string[];
  website?: string;
  contact?: string;
  similarity_score?: number;
}

interface ChatMessage {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
  schemes?: LoanScheme[];
  loading?: boolean;
}

interface LoanHelperProps {
  language: string;
}

// Common questions in multiple languages
const commonQuestions = {
  en: [
    "Low interest rate loans?",
    "Loans for women entrepreneurs?",
    "No collateral loans?",
    "Food business loans?",
    "Small business loans?",
    "Government schemes?"
  ],
  hi: [
    "कम ब्याज दर वाला लोन?",
    "महिला उद्यमियों के लिए लोन?",
    "बिना गारंटी लोन?",
    "खाने का धंधा लोन?",
    "छोटा व्यापार लोन?",
    "सरकारी योजनाएं?"
  ],
  ta: [
    "குறைந்த வட்டி விகித கடன்?",
    "பெண் தொழில்முனைவோருக்கான கடன்?",
    "பிணையம் இல்லா கடன்?",
    "உணவு வணிக கடன்?",
    "சிறு வணிக கடன்?",
    "அரசு திட்டங்கள்?"
  ],
  ml: [
    "കുറഞ്ഞ പലിശ നിരക്ക് വായ്പ?",
    "സ്ത്രീ സംരംഭകർക്കുള്ള വായ്പ?",
    "അടിസ്ഥാനം ഇല്ലാത്ത വായ്പ?",
    "ഭക്ഷണ ബിസിനസ് വായ്പ?",
    "ചെറിയ ബിസിനസ് വായ്പ?",
    "സർക്കാർ പദ്ധതികൾ?"
  ],
  te: [
    "తక్కువ వడ్డీ రేటు రుణాలు?",
    "మహిళా వ్యవస్థాపకులకు రుణాలు?",
    "అడ్డుకట్టు లేని రుణాలు?",
    "ఆహార వ్యాపార రుణాలు?",
    "చిన్న వ్యాపార రుణాలు?",
    "ప్రభుత్వ పథకాలు?"
  ],
  kn: [
    "ಕಡಿಮೆ ಬಡ್ಡಿ ದರ ಸಾಲಗಳು?",
    "ಮಹಿಳಾ ಉದ್ಯಮಿಗಳಿಗೆ ಸಾಲಗಳು?",
    "ಅಡ್ಡಿಕಟ್ಟು ಇಲ್ಲದ ಸಾಲಗಳು?",
    "ಆಹಾರ ವ್ಯಾಪಾರ ಸಾಲಗಳು?",
    "ಸಣ್ಣ ವ್ಯಾಪಾರ ಸಾಲಗಳು?",
    "ಸರ್ಕಾರಿ ಯೋಜನೆಗಳು?"
  ],
  gu: [
    "ઓછા વ્યાજ દરની લોન?",
    "મહિલા ઉદ્યોગસાહસિકો માટે લોન?",
    "ગેરંટી વગરની લોન?",
    "ખોરાક વ્યવસાય લોન?",
    "નાના વ્યવસાય લોન?",
    "સરકારી યોજનાઓ?"
  ],
  bn: [
    "কম সুদের হার ঋণ?",
    "মহিলা উদ্যোক্তাদের জন্য ঋণ?",
    "জামানত ছাড়া ঋণ?",
    "খাদ্য ব্যবসা ঋণ?",
    "ছোট ব্যবসা ঋণ?",
    "সরকারি প্রকল্প?"
  ],
  mr: [
    "कम व्याज दर कर्ज?",
    "महिला उद्योजकांसाठी कर्ज?",
    "जामीनगिरी नसलेले कर्ज?",
    "अन्न व्यवसाय कर्ज?",
    "लहान व्यवसाय कर्ज?",
    "सरकारी योजना?"
  ]
};

// Popular schemes in multiple languages
const popularSchemes = {
  en: [
    { key: "mudra", label: "MUDRA" },
    { key: "pmegp", label: "PMEGP" },
    { key: "shg", label: "SHG" },
    { key: "women", label: "Women" },
    { key: "food", label: "Food Business" },
    { key: "small", label: "Small Business" }
  ],
  hi: [
    { key: "mudra", label: "मुद्रा" },
    { key: "pmegp", label: "पीएमईजीपी" },
    { key: "shg", label: "एसएचजी" },
    { key: "women", label: "महिला" },
    { key: "food", label: "खाने का धंधा" },
    { key: "small", label: "छोटा व्यापार" }
  ],
  ta: [
    { key: "mudra", label: "முத்ரா" },
    { key: "pmegp", label: "பிஎம்ஈஜிபி" },
    { key: "shg", label: "எஸ்ஹெச்ஜி" },
    { key: "women", label: "பெண்கள்" },
    { key: "food", label: "உணவு வணிகம்" },
    { key: "small", label: "சிறு வணிகம்" }
  ],
  ml: [
    { key: "mudra", label: "മുദ്ര" },
    { key: "pmegp", label: "പിഎംഇജിപി" },
    { key: "shg", label: "എസ്ഹെജി" },
    { key: "women", label: "സ്ത്രീകൾ" },
    { key: "food", label: "ഭക്ഷണ ബിസിനസ്" },
    { key: "small", label: "ചെറിയ ബിസിനസ്" }
  ],
  te: [
    { key: "mudra", label: "ముద్ర" },
    { key: "pmegp", label: "పిఎంఇజిపి" },
    { key: "shg", label: "ఎస్హెజి" },
    { key: "women", label: "మహిళలు" },
    { key: "food", label: "ఆహార వ్యాపారం" },
    { key: "small", label: "చిన్న వ్యాపారం" }
  ],
  kn: [
    { key: "mudra", label: "ಮುದ್ರ" },
    { key: "pmegp", label: "ಪಿಎಂಇಜಿಪಿ" },
    { key: "shg", label: "ಎಸ್ಹೆಜಿ" },
    { key: "women", label: "ಮಹಿಳೆಯರು" },
    { key: "food", label: "ಆಹಾರ ವ್ಯಾಪಾರ" },
    { key: "small", label: "ಸಣ್ಣ ವ್ಯಾಪಾರ" }
  ],
  gu: [
    { key: "mudra", label: "મુદ્રા" },
    { key: "pmegp", label: "પીએમઇજીપી" },
    { key: "shg", label: "એસએચજી" },
    { key: "women", label: "મહિળાઓ" },
    { key: "food", label: "ખોરાક વ્યવસાય" },
    { key: "small", label: "નાનો વ્યવસાય" }
  ],
  bn: [
    { key: "mudra", label: "মুদ্রা" },
    { key: "pmegp", label: "পিএমইজিপি" },
    { key: "shg", label: "এসএইচজি" },
    { key: "women", label: "মহিলা" },
    { key: "food", label: "খাদ্য ব্যবসা" },
    { key: "small", label: "ছোট ব্যবসা" }
  ],
  mr: [
    { key: "mudra", label: "मुद्रा" },
    { key: "pmegp", label: "पीएमईजीपी" },
    { key: "shg", label: "एसएचजी" },
    { key: "women", label: "महिला" },
    { key: "food", label: "अन्न व्यवसाय" },
    { key: "small", label: "लहान व्यवसाय" }
  ]
};

export function LoanHelper({ language }: LoanHelperProps) {
  const { toast } = useToast();
  const { t } = useTranslation(language);
  
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "1",
      text: language === "hi" 
        ? "नमस्ते! मैं आपको सरकारी लोन स्कीमों की जानकारी देने में मदद करूंगी। आप क्या जानना चाहती हैं?"
        : language === "ta"
        ? "வணக்கம்! நான் உங்களுக்கு அரசு கடன் திட்டங்களைப் பற்றிய தகவல்களை வழங்க உதவுகிறேன். நீங்கள் என்ன தெரிந்து கொள்ள விரும்புகிறீர்கள்?"
        : language === "ml"
        ? "ഹലോ! സർക്കാർ വായ്പാ പദ്ധതികളെക്കുറിച്ചുള്ള വിവരങ്ങൾ നൽകാൻ ഞാൻ സഹായിക്കാം. നിങ്ങൾക്ക് എന്ത് അറിയണം?"
        : language === "te"
        ? "నమస్కారం! నేను మీకు ప్రభుత్వ రుణ పథకాల గురించి సమాచారం అందించడానికి సహాయం చేస్తాను. మీరు ఏమి తెలుసుకోవాలనుకుంటున్నారు?"
        : language === "kn"
        ? "ನಮಸ್ಕಾರ! ಸರ್ಕಾರಿ ಸಾಲ ಯೋಜನೆಗಳ ಬಗ್ಗೆ ಮಾಹಿತಿ ನೀಡಲು ನಾನು ಸಹಾಯ ಮಾಡುತ್ತೇನೆ. ನೀವು ಏನು ತಿಳಿದುಕೊಳ್ಳಲು ಬಯಸುತ್ತೀರಿ?"
        : language === "gu"
        ? "નમસ્તે! હું તમને સરકારી લોન સ્કીમ્સ વિશેની માહિતી આપવામાં મદદ કરીશ. તમે શું જાણવા માગો છો?"
        : language === "bn"
        ? "নমস্কার! আমি আপনাকে সরকারি ঋণ প্রকল্প সম্পর্কে তথ্য প্রদান করতে সাহায্য করব। আপনি কী জানতে চান?"
        : language === "mr"
        ? "नमस्कार! मी तुम्हाला सरकारी कर्ज योजनांबद्दल माहिती देण्यात मदत करेन. तुम्हाला काय माहिती हवे आहे?"
        : "Hello! I'll help you learn about government loan schemes. What would you like to know?",
      isUser: false,
      timestamp: new Date()
    }
  ]);

  const [inputText, setInputText] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const processLoanQuery = async (query: string) => {
    try {
      setIsLoading(true);
      
      const response = await fetch(`${API_BASE_URL}/api/loan/query`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: query,
          language: "auto" // Let the backend auto-detect language
        })
      });

      const result = await response.json();
      
      if (result.success) {
        return {
          text: result.response,
          schemes: result.relevant_schemes || []
        };
      } else {
        throw new Error(result.message || 'Failed to process loan query');
      }
    } catch (error) {
      console.error('Error processing loan query:', error);
      toast({
        title: language === "hi" ? "त्रुटि" : "Error",
        description: language === "hi" ? "लोन क्वेरी प्रोसेस करने में समस्या हुई" : "Failed to process loan query",
        variant: "destructive"
      });
      return {
        text: language === "hi" 
          ? "माफ़ करें, लोन क्वेरी प्रोसेस करने में समस्या हुई। कृपया फिर से कोशिश करें।"
          : "Sorry, there was an issue processing your loan query. Please try again.",
        schemes: []
      };
    } finally {
      setIsLoading(false);
    }
  };

  const handleVoiceInput = (transcript: string) => {
    setInputText(transcript);
    // Auto-send voice transcript after a short delay
    setTimeout(() => {
      if (transcript.trim()) {
        handleSendMessage();
      }
    }, 500);
  };

  const handleSendMessage = async () => {
    if (!inputText.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      text: inputText,
      isUser: true,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    const currentQuery = inputText;
    setInputText("");

    // Add loading message
    const loadingMessage: ChatMessage = {
      id: (Date.now() + 1).toString(),
      text: language === "hi" ? "जानकारी खोज रही हूं..." : "Searching for information...",
      isUser: false,
      timestamp: new Date(),
      loading: true
    };

    setMessages(prev => [...prev, loadingMessage]);

    // Process the query using RAG
    const result = await processLoanQuery(currentQuery);

    // Remove loading message and add response
    setMessages(prev => {
      const filteredMessages = prev.filter(msg => !msg.loading);
      return [...filteredMessages, {
        id: (Date.now() + 2).toString(),
        text: result.text,
        isUser: false,
        timestamp: new Date(),
        schemes: result.schemes
      }];
    });
  };

  const getCategoryColor = (category: string) => {
    switch (category.toLowerCase()) {
      case "mudra": return "bg-primary text-primary-foreground";
      case "pmegp": return "bg-secondary text-secondary-foreground";
      case "shg": return "bg-accent text-accent-foreground";
      case "nabard": return "bg-muted text-muted-foreground";
      case "food_business": return "bg-green-500 text-white";
      case "women_entrepreneurs": return "bg-pink-500 text-white";
      case "greenfield_enterprise": return "bg-blue-500 text-white";
      case "women_empowerment": return "bg-purple-500 text-white";
      default: return "bg-primary text-primary-foreground";
    }
  };

  const handleSchemeClick = (schemeKey: string) => {
    const queries = {
      mudra: {
        hi: "मुद्रा लोन के बारे में बताएं",
        ta: "முத்ரா கடன்களைப் பற்றி சொல்லுங்கள்",
        ml: "മുദ്ര വായ്പകളെക്കുറിച്ച് പറയൂ",
        te: "ముద్ర రుణాల గురించి చెప్పండి",
        kn: "ಮುದ್ರ ಸಾಲಗಳ ಬಗ್ಗೆ ಹೇಳಿ",
        gu: "મુદ્રા લોન વિશે કહો",
        bn: "মুদ্রা ঋণ সম্পর্কে বলুন",
        mr: "मुद्रा कर्जाबद्दल सांगा",
        en: "Tell me about MUDRA loans"
      },
      pmegp: {
        hi: "पीएमईजीपी योजना के बारे में जानकारी दें",
        ta: "பிஎம்ஈஜிபி திட்டத்தைப் பற்றிய தகவலை வழங்குங்கள்",
        ml: "പിഎംഇജിപി പദ്ധതിയെക്കുറിച്ചുള്ള വിവരങ്ങൾ നൽകുക",
        te: "పిఎంఇజిపి పథకం గురించి సమాచారం ఇవ్వండి",
        kn: "ಪಿಎಂಇಜಿಪಿ ಯೋಜನೆಯ ಬಗ್ಗೆ ಮಾಹಿತಿ ನೀಡಿ",
        gu: "પીએમઇજીપી યોજના વિશે માહિતી આપો",
        bn: "পিএমইজিপি প্রকল্প সম্পর্কে তথ্য দিন",
        mr: "पीएमईजीपी योजनेबद्दल माहिती द्या",
        en: "Information about PMEGP scheme"
      },
      shg: {
        hi: "एसएचजी लोन के बारे में बताएं",
        ta: "எஸ்ஹெச்ஜி கடன்களைப் பற்றி சொல்லுங்கள்",
        ml: "എസ്ഹെജി വായ്പകളെക്കുറിച്ച് പറയൂ",
        te: "ఎస్హెజి రుణాల గురించి చెప్పండి",
        kn: "ಎಸ್ಹೆಜಿ ಸಾಲಗಳ ಬಗ್ಗೆ ಹೇಳಿ",
        gu: "એસએચજી લોન વિશે કહો",
        bn: "এসএইচজি ঋণ সম্পর্কে বলুন",
        mr: "एसएचजी कर्जाबद्दल सांगा",
        en: "Tell me about SHG loans"
      },
      women: {
        hi: "महिलाओं के लिए लोन योजनाएं",
        ta: "பெண்களுக்கான கடன் திட்டங்கள்",
        ml: "സ്ത്രീകൾക്കുള്ള വായ്പാ പദ്ധതികൾ",
        te: "మహిళలకు రుణ పథకాలు",
        kn: "ಮಹಿಳೆಯರಿಗೆ ಸಾಲ ಯೋಜನೆಗಳು",
        gu: "મહિળાઓ માટે લોન યોજનાઓ",
        bn: "মহিলাদের জন্য ঋণ প্রকল্প",
        mr: "महिलांसाठी कर्ज योजना",
        en: "Loan schemes for women"
      },
      food: {
        hi: "खाने के धंधे के लिए लोन",
        ta: "உணவு வணிகத்திற்கான கடன்கள்",
        ml: "ഭക്ഷണ ബിസിനസിനുള്ള വായ്പകൾ",
        te: "ఆహార వ్యాపారానికి రుణాలు",
        kn: "ಆಹಾರ ವ್ಯಾಪಾರಕ್ಕಾಗಿ ಸಾಲಗಳು",
        gu: "ખોરાક વ્યવસાય માટે લોન",
        bn: "খাদ্য ব্যবসার জন্য ঋণ",
        mr: "अन्न व्यवसायासाठी कर्ज",
        en: "Loans for food business"
      },
      small: {
        hi: "छोटे व्यापार के लिए लोन",
        ta: "சிறு வணிகத்திற்கான கடன்கள்",
        ml: "ചെറിയ ബിസിനസിനുള്ള വായ്പകൾ",
        te: "చిన్న వ్యాపారానికి రుణాలు",
        kn: "ಸಣ್ಣ ವ್ಯಾಪಾರಕ್ಕಾಗಿ ಸಾಲಗಳು",
        gu: "નાના વ્યવસાય માટે લોન",
        bn: "ছোট ব্যবসার জন্য ঋণ",
        mr: "लहान व्यवसायासाठी कर्ज",
        en: "Loans for small business"
      }
    };
    
    const schemeQueries = queries[schemeKey as keyof typeof queries];
    if (schemeQueries) {
      setInputText(schemeQueries[language as keyof typeof schemeQueries] || schemeQueries.en);
    }
  };

  return (
    <div className="flex flex-col h-full max-h-[90vh] bg-background">
      {/* Popular Schemes Header */}
      <div className="p-4 border-b bg-card">
        <div className="flex items-center gap-2 mb-3">
          <Globe className="h-4 w-4 text-primary" />
          <h3 className="font-semibold text-lg">
            {language === "hi" ? "लोकप्रिय योजनाएं" : 
             language === "ta" ? "பிரபலமான திட்டங்கள்" :
             language === "ml" ? "ജനപ്രിയ പദ്ധതികൾ" :
             language === "te" ? "ప్రజాదరణ పൊందిన పథకాలు" :
             language === "kn" ? "ಜನಪ್ರಿಯ ಯೋಜನೆಗಳು" :
             language === "gu" ? "લોકપ્રિય યોજનાઓ" :
             language === "bn" ? "জনপ্রিয় প্রকল্প" :
             language === "mr" ? "लोकप्रिय योजना" :
             "Popular Schemes"}
          </h3>
        </div>
        <div className="flex gap-2 flex-wrap">
          {(popularSchemes[language as keyof typeof popularSchemes] || popularSchemes.en).map((scheme) => (
            <Button
              key={scheme.key}
              variant="outline"
              size="sm"
              onClick={() => handleSchemeClick(scheme.key)}
              className="text-xs"
            >
              <Banknote className="h-3 w-3 mr-1" />
              {scheme.label}
            </Button>
          ))}
        </div>
      </div>

      {/* Chat Messages - Bigger Chat Box */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 min-h-[400px] max-h-[500px]">
        {messages.map((message) => (
          <div key={message.id} className="animate-fade-in">
            <div className={`flex ${message.isUser ? "justify-end" : "justify-start"} mb-2`}>
              <div className={`max-w-[85%] p-4 rounded-lg ${
                message.isUser 
                  ? "bg-primary text-primary-foreground" 
                  : "bg-card border shadow-card"
              }`}>
                {message.loading ? (
                  <div className="flex items-center justify-center p-2">
                    <Loader2 className="h-5 w-5 animate-spin text-primary" />
                    <span className="ml-2 text-sm">
                      {language === "hi" ? "जानकारी खोज रही हूं..." : 
                       language === "ta" ? "தகவலைத் தேடுகிறேன்..." :
                       language === "ml" ? "വിവരങ്ങൾ തിരയുന്നു..." :
                       language === "te" ? "సమాచారాన్ని వెతుకుతున్నాను..." :
                       language === "kn" ? "ಮಾಹಿತಿಯನ್ನು ಹುಡುಕುತ್ತಿದ್ದೇನೆ..." :
                       language === "gu" ? "માહિતી શોધી રહ્યા છીએ..." :
                       language === "bn" ? "তথ্য খੁਸ਼িত হচ্ছে..." :
                       language === "mr" ? "माहिती शोधत आहे..." :
                       "Searching for information..."}
                    </span>
                  </div>
                ) : (
                  <div className="prose-chat">
                    <ReactMarkdown>{message.text.trim() || "No response received"}</ReactMarkdown>
                  </div>
                )}
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
                            {language === "hi" ? scheme.name_hi || scheme.name : scheme.name}
                          </CardTitle>
                          <Badge className={getCategoryColor(scheme.category)} variant="secondary">
                            {scheme.category.toUpperCase()}
                          </Badge>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-muted-foreground">
                            {language === "hi" ? "अधिकतम राशि" : 
                             language === "ta" ? "அதிகபட்ச தொகை" :
                             language === "ml" ? "പരമാവധി തുക" :
                             language === "te" ? "గరిష్ట మొత్తం" :
                             language === "kn" ? "ಗರಿಷ್ಠ ಮೊತ್ತ" :
                             language === "gu" ? "મહત્તમ રકમ" :
                             language === "bn" ? "সর্বোচ্চ পরিমাণ" :
                             language === "mr" ? "कमाल रक्कम" :
                             "Max Amount"}
                          </p>
                          <p className="font-bold text-primary">{scheme.max_amount}</p>
                        </div>
                      </div>
                    </CardHeader>
                    
                    <CardContent className="space-y-3">
                      <div>
                        <h4 className="font-medium text-sm mb-1">
                          {language === "hi" ? "विवरण:" : 
                           language === "ta" ? "விளக்கம்:" :
                           language === "ml" ? "വിവരണം:" :
                           language === "te" ? "వివరణ:" :
                           language === "kn" ? "ವಿವರಣೆ:" :
                           language === "gu" ? "વર્ણન:" :
                           language === "bn" ? "বিবরণ:" :
                           language === "mr" ? "वर्णन:" :
                           "Description:"}
                        </h4>
                        <p className="text-sm text-muted-foreground">
                          {language === "hi" ? scheme.description_hi || scheme.description : scheme.description}
                        </p>
                      </div>
                      
                      <div>
                        <h4 className="font-medium text-sm mb-1">
                          {language === "hi" ? "पात्रता:" : 
                           language === "ta" ? "தகுதி:" :
                           language === "ml" ? "യോഗ്യത:" :
                           language === "te" ? "అర్హత:" :
                           language === "kn" ? "ಅರ್ಹತೆ:" :
                           language === "gu" ? "યോગ્યતા:" :
                           language === "bn" ? "যোগ্যতা:" :
                           language === "mr" ? "पात्रता:" :
                           "Eligibility:"}
                        </h4>
                        <p className="text-sm text-muted-foreground">
                          {language === "hi" ? scheme.eligibility_hi || scheme.eligibility : scheme.eligibility}
                        </p>
                      </div>

                      {scheme.interest_rate && (
                        <div>
                          <h4 className="font-medium text-sm mb-1">
                            {language === "hi" ? "ब्याज दर:" : 
                             language === "ta" ? "வட்டி விகிதம்:" :
                             language === "ml" ? "പലിശ നിരക്ക്:" :
                             language === "te" ? "వడ్డీ రేటు:" :
                             language === "kn" ? "ಬಡ್ಡಿ ದರ:" :
                             language === "gu" ? "વ્યાજ દર:" :
                             language === "bn" ? "সুদের হার:" :
                             language === "mr" ? "व्याज दर:" :
                             "Interest Rate:"}
                          </h4>
                          <p className="text-sm text-muted-foreground">{scheme.interest_rate}</p>
                        </div>
                      )}

                      {scheme.tenure && (
                        <div>
                          <h4 className="font-medium text-sm mb-1">
                            {language === "hi" ? "अवधि:" : 
                             language === "ta" ? "காலம்:" :
                             language === "ml" ? "காலாவ஧ி:" :
                             language === "te" ? "కాలవ్యవధి:" :
                             language === "kn" ? "ಅವಧಿ:" :
                             language === "gu" ? "અવધિ:" :
                             language === "bn" ? "মেয়াদ:" :
                             language === "mr" ? "कालावधी:" :
                             "Tenure:"}
                          </h4>
                          <p className="text-sm text-muted-foreground">{scheme.tenure}</p>
                        </div>
                      )}

                      {scheme.benefits && scheme.benefits.length > 0 && (
                        <div>
                          <h4 className="font-medium text-sm mb-1">
                            {language === "hi" ? "लाभ:" : 
                             language === "ta" ? "நன்மைகள்:" :
                             language === "ml" ? "ആനുകൂല്യങ്ങൾ:" :
                             language === "te" ? "ప్రయోజనాలు:" :
                             language === "kn" ? "ಲಾಭಗಳು:" :
                             language === "gu" ? "લાભો:" :
                             language === "bn" ? "সুবিধা:" :
                             language === "mr" ? "फायदे:" :
                             "Benefits:"}
                          </h4>
                          <ul className="text-sm text-muted-foreground list-disc list-inside">
                            {scheme.benefits.slice(0, 3).map((benefit, index) => (
                              <li key={index}>{benefit}</li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {scheme.application_process && (
                        <div>
                          <h4 className="font-medium text-sm mb-1">
                            {language === "hi" ? "आवेदन प्रक्रिया:" : 
                             language === "ta" ? "விண்ணப்ப செயல்முறை:" :
                             language === "ml" ? "அபேக்ஷ ப்ரக்ரிய:" :
                             language === "te" ? "஦ர஖ாஸ்து ப்ரக்ரிய:" :
                             language === "kn" ? "அர்ஜி ப்ரக்ரியெ:" :
                             language === "gu" ? "அரஜீ ப்ரக்ரியா:" :
                             language === "bn" ? "ஆபேசின் செயல்முறை:" :
                             language === "mr" ? "अर्ज प्रक्रिया:" :
                             "Application Process:"}
                          </h4>
                          <p className="text-sm text-muted-foreground">
                            {language === "hi" ? scheme.application_process_hi || scheme.application_process : scheme.application_process}
                          </p>
                        </div>
                      )}
                      

                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Quick Questions - Fixed and Multilingual */}
      <div className="p-4 border-t border-b bg-card">
        <p className="text-sm text-muted-foreground mb-3 flex items-center gap-2">
          <HelpCircle className="h-4 w-4" />
          {language === "hi" ? "सामान्य प्रश्न:" : 
           language === "ta" ? "பொதுவான கேள்விகள்:" :
           language === "ml" ? "സാധാരണ ചോദ്യങ്ങൾ:" :
           language === "te" ? "సాధారణ ప్రశ్నలు:" :
           language === "kn" ? "ಸಾಮಾನ್ಯ ಪ್ರಶ್ನೆಗಳು:" :
           language === "gu" ? "સામાન્ય પ્રશ્નો:" :
           language === "bn" ? "সাধারণ প্রশ্ন:" :
           language === "mr" ? "सामान्य प्रश्न:" :
           "Common Questions:"}
        </p>
        <div className="flex gap-2 flex-wrap">
          {(commonQuestions[language as keyof typeof commonQuestions] || commonQuestions.en).map((question) => (
            <Button
              key={question}
              variant="ghost"
              size="sm"
              onClick={() => setInputText(question)}
              className="text-xs border border-border hover:bg-accent"
            >
              <HelpCircle className="h-3 w-3 mr-1" />
              {question}
            </Button>
          ))}
        </div>
      </div>

      {/* Input Area - Bigger and Better with Voice */}
      <div className="p-4 bg-background border-t">
        <div className="flex gap-2">
          <Input
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder={language === "hi" ? "लोन के बारे में पूछें..." : 
                         language === "ta" ? "கடனைப் பற்றி கேள்வி கேளுங்கள்..." :
                         language === "ml" ? "വായ്പയെക്കുറിച്ച് ചോദിക്കുക..." :
                         language === "te" ? "రుణం గురించి అడగండి..." :
                         language === "kn" ? "ಸಾಲದ ಬಗ್ಗೆ ಕೇಳಿ..." :
                         language === "gu" ? "લોન વિશે પૂછો..." :
                         language === "bn" ? "ঋণ সম্পর্কে জিজ্ঞাসা করুন..." :
                         language === "mr" ? "कर्जाबद्दल विचारा..." :
                         "Ask about loans..."}
            onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
            className="flex-1 text-base"
          />
          
          <VoiceInput 
            onTranscript={handleVoiceInput}
            language={language}
          />
          
          <Button onClick={handleSendMessage} size="icon" disabled={isLoading} className="h-10 w-10">
            <Send className="h-4 w-4" />
          </Button>
        </div>
        <p className="text-xs text-muted-foreground mt-2 text-center">
          {language === "hi" 
            ? "🎤 टाइप करें या बोलें • सरकारी योजनाओं की अप-टू-डेट जानकारी" 
            : language === "ta"
            ? "🎤 தட்டச்சு செய்யுங்கள் அல்லது பேசுங்கள் • அரசு திட்டங்களின் தற்போதைய தகவல்கள்"
            : language === "ml"
            ? "🎤 ടൈപ്പ് ചെയ്യുക അല്ലെങ്കിൽ സംസാരിക്കുക • സർക്കാർ പദ്ധതികളുടെ അപ്‌-ടു-ഡേറ്റ് വിവരങ്ങൾ"
            : language === "te"
            ? "ప్రభుత్వ పథకాల యొక్క అప్-టു-డേట్ సమాచారం"
            : language === "kn"
            ? "ಸರ್ಕಾರಿ ಯೋಜನೆಗಳ ಅಪ್-ಟು-ಡೇಟ್ ಮಾಹಿತಿ"
            : language === "gu"
            ? "સરકારી યોજનાઓની અપ-ટુ-ડેટ માહિતી"
            : language === "bn"
            ? "সরকারি প্রকল্পের আপ-টু-ডেট তথ্য"
            : language === "mr"
            ? "सरकारी योजनांची अप-टू-डेट माहिती"
            : "🎤 Type or speak • Up-to-date information on government schemes"
          }
        </p>
      </div>
    </div>
  );
}