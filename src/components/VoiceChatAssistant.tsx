import React, { useState, useEffect, useRef } from "react";
import { Send, Mic, MicOff, Volume2, Paperclip, MessageCircle, DollarSign } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { VoiceInput } from "@/components/VoiceInput";
import { FileUpload } from "@/components/FileUpload";
import { ItemClarificationTable } from "@/components/ItemClarificationTable";
import { ReceiptItemsTable } from "@/components/ReceiptItemsTable";
import { toast } from "@/hooks/use-toast";
import { useTranslation } from "@/utils/translations";
import { apiCall, apiCallFormData, API_BASE_URL } from "@/utils/api";
import sakhiAvatar from "@/assets/sakhi-avatar.jpg";
import ReactMarkdown from "react-markdown";

interface Message {
  id: number;
  text: string;
  sender: "user" | "ai";
  isUser: boolean;
  timestamp: Date;
  clarificationItems?: any[];
  needsClarification?: boolean;
}

interface VoiceChatAssistantProps {
  language: string;
}



export function VoiceChatAssistant({ language }: VoiceChatAssistantProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(true);
  const [inputText, setInputText] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [showFileUpload, setShowFileUpload] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showClarification, setShowClarification] = useState(false);
  const [clarificationItems, setClarificationItems] = useState<any[]>([]);
  const [showReceiptTable, setShowReceiptTable] = useState(false);
  const [receiptData, setReceiptData] = useState<any>(null);
  const [currentAudio, setCurrentAudio] = useState<HTMLAudioElement | null>(null);
  const [chatMode, setChatMode] = useState<"general" | "business">("general");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { t } = useTranslation(language);



  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Load chat history on component mount
  const loadChatHistory = async () => {
    try {
      const response = await apiCall('/api/chat/history');
      if (response.ok) {
        const data = await response.json();
        if (data.success && data.messages.length > 0) {
          // Convert backend format to frontend format
          const formattedMessages = data.messages.map((msg: any) => ({
            id: msg.id,
            text: msg.text,
            sender: msg.sender,
            isUser: msg.isUser,
            timestamp: new Date(msg.timestamp)
          }));
          setMessages(formattedMessages);
        } else {
          // Set welcome message if no history
          setMessages([{
            id: 1,
            text: language === "hi"
              ? "नमस्ते! मैं सखी हूं, आपकी व्यापारिक सहायक। आप मुझसे कुछ भी पूछ सकती हैं! 🙏"
              : "Hello! I'm Sakhi, your business assistant. You can ask me anything! 🙏",
            sender: "ai",
            isUser: false,
            timestamp: new Date(),
          }]);
        }
      }
    } catch (error) {
      console.error("Error loading chat history:", error);
      // Set welcome message on error
      setMessages([{
        id: 1,
        text: language === "hi"
          ? "नमस्ते! मैं सखी हूं, आपकी व्यापारिक सहायक। आप मुझसे कुछ भी पूछ सकती हैं! 🙏"
          : "Hello! I'm Sakhi, your business assistant. You can ask me anything! 🙏",
        sender: "ai",
        isUser: false,
        timestamp: new Date(),
      }]);
    } finally {
      setIsLoadingHistory(false);
    }
  };

  useEffect(() => {
    loadChatHistory();
  }, [language]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Cleanup audio on unmount
  useEffect(() => {
    return () => {
      if (currentAudio) {
        currentAudio.pause();
        currentAudio.currentTime = 0;
      }
    };
  }, [currentAudio]);

  // Send text message to backend
  const sendTextMessage = async (text: string) => {
    try {
      const formData = new FormData();
      formData.append('message', text);
      formData.append('language', language);
      formData.append('chat_mode', chatMode);

      const response = await apiCallFormData('/api/chat/text', formData);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Error sending text message:", error);
      throw error;
    }
  };

  // Send voice message to backend
  const sendVoiceMessage = async (audioBlob: Blob) => {
    try {
      const formData = new FormData();
      formData.append("audio_file", audioBlob, "voice_message.wav");
      formData.append("language", language);

      const response = await apiCallFormData('/api/chat/voice', formData);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Error sending voice message:", error);
      throw error;
    }
  };

  // Send image for OCR processing
  const sendImageMessage = async (file: File) => {
    try {
      const formData = new FormData();
      formData.append("image_file", file);
      formData.append("language", language === "hi" ? "hi" : "en");

      const response = await apiCallFormData('/api/chat/image', formData);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Error sending image:", error);
      throw error;
    }
  };

  const handleSendMessage = async () => {
    if (inputText.trim() && !isProcessing) {
      const userMessage: Message = {
        id: Date.now(),
        text: inputText,
        sender: "user",
        isUser: true,
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, userMessage]);
      setInputText("");
      setIsProcessing(true);

      try {
        const response = await sendTextMessage(inputText);

        const aiMessage: Message = {
          id: Date.now() + 1,
          text: response.message || response.response || "No response received",
          sender: "ai",
          isUser: false,
          timestamp: new Date(),
          needsClarification: response.needs_clarification || false,
          clarificationItems: response.clarification_items || []
        };

        setMessages(prev => [...prev, aiMessage]);

        // Handle clarification if needed
        if (response.needs_clarification && response.clarification_items?.length > 0) {
          setClarificationItems(response.clarification_items);
          setShowClarification(true);
        }

        // Show success toast if database was updated
        if (response.business_results?.length > 0 || response.transactions_processed > 0 || response.business_result || response.database_updated) {
          toast({
            title: language === "hi" ? "सफलतापूर्वक अपडेट किया गया" : "Successfully Updated",
            description: response.transactions_processed > 1
              ? `${response.transactions_processed} transactions processed`
              : response.message || response.response,
          });
        }
      } catch (error) {
        // Fallback response if API fails
        const fallbackResponses = language === "hi" ? [
          "माफ़ करें, मैं अभी आपकी मदद नहीं कर पा रही हूँ। कृपया कुछ देर बाद कोशिश करें।",
          "कुछ तकनीकी समस्या है। कृपया फिर से प्रयास करें।"
        ] : [
          "Sorry, I'm having trouble helping you right now. Please try again later.",
          "There's a technical issue. Please try again."
        ];

        const aiMessage: Message = {
          id: Date.now() + 1,
          text: fallbackResponses[Math.floor(Math.random() * fallbackResponses.length)],
          sender: "ai",
          isUser: false,
          timestamp: new Date(),
        };

        setMessages(prev => [...prev, aiMessage]);
        
        toast({
          title: language === "hi" ? "त्रुटि" : "Error",
          description: language === "hi" ? "संदेश भेजने में समस्या" : "Error sending message",
          variant: "destructive",
        });
      } finally {
        setIsProcessing(false);
        scrollToBottom();
      }
    }
  };

  const handleFileUpload = async (file: File, extractedText?: string) => {
    const fileMessage: Message = {
      id: Date.now(),
      text: `📁 ${file.name} ${language === "hi" ? "अपलोड किया गया" : "uploaded"}`,
      sender: "user",
      isUser: true,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, fileMessage]);
    setIsProcessing(true);

    try {
      const response = await sendImageMessage(file);

      const aiResponse: Message = {
        id: Date.now() + 1,
        text: response.message || response.response || "Image processed successfully",
        sender: "ai",
        isUser: false,
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, aiResponse]);

      // Check if Azure Document Intelligence found receipt items
      if (response.receipt_data && response.receipt_data.items && response.receipt_data.items.length > 0) {
        // Convert Azure Document Intelligence items to our table format
        const tableItems = response.receipt_data.items.map((item: any) => ({
          name: item.name || "Unknown Item",
          quantity: item.quantity || 1,
          unit_price: item.unit_price || 0,
          total_price: item.total_price || 0,
          category: "expense" as const // Default to expense, user can change
        }));

        setReceiptData({
          items: tableItems,
          merchantName: response.receipt_data.merchant?.name || "Unknown Store",
          totalAmount: response.receipt_data.total_amount || 0,
          service_used: response.receipt_data.service_used || "azure_document_intelligence"
        });
        setShowReceiptTable(true);

        // Professional behavior: Close file upload interface after successful processing
        setShowFileUpload(false);

        toast({
          title: language === "hi" ? "रसीद पढ़ी गई!" : "Receipt Read!",
          description: language === "hi"
            ? `${tableItems.length} आइटम्स मिले। कृपया टेबल चेक करें।`
            : `Found ${tableItems.length} items. Please check the table.`,
        });
      } else {
        // Show success toast if database was updated (old logic)
        if (response.business_results || response.database_updated) {
          toast({
            title: language === "hi" ? "बिल सफलतापूर्वक प्रोसेस किया गया" : "Bill Processed Successfully",
            description: response.message || response.response,
          });
        }
      }
    } catch (error) {
      const fallbackResponse: Message = {
        id: Date.now() + 1,
        text: language === "hi" 
          ? "माफ़ करें, मैं इस फाइल को प्रोसेस नहीं कर पा रही हूँ। कृपया फिर से कोशिश करें।"
          : "Sorry, I couldn't process this file. Please try again.",
        sender: "ai",
        isUser: false,
        timestamp: new Date(),
      };
      
      setMessages(prev => [...prev, fallbackResponse]);
      
      toast({
        title: language === "hi" ? "त्रुटि" : "Error",
        description: language === "hi" ? "फाइल प्रोसेसिंग में समस्या" : "Error processing file",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
      scrollToBottom();
    }
  };

  const handleVoiceInput = async (transcript: string) => {
    setInputText(transcript);
    
    // Auto-send voice transcript
    if (transcript.trim()) {
      const userMessage: Message = {
        id: Date.now(),
        text: transcript,
        sender: "user",
        isUser: true,
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, userMessage]);
      setInputText("");
      setIsProcessing(true);

      try {
        const response = await sendTextMessage(transcript);

        const aiMessage: Message = {
          id: Date.now() + 1,
          text: response.message || response.response || "No response received",
          sender: "ai",
          isUser: false,
          timestamp: new Date(),
        };

        setMessages(prev => [...prev, aiMessage]);

        // Handle clarification if needed
        if (response.needs_clarification && response.clarification_items?.length > 0) {
          setClarificationItems(response.clarification_items);
          setShowClarification(true);
        }

        // Show success toast if database was updated (but not for clarification)
        if (!response.needs_clarification && (response.business_results?.length > 0 || response.transactions_processed > 0 || response.business_result || response.database_updated)) {
          toast({
            title: language === "hi" ? "सफलतापूर्वक अपडेट किया गया" : "Successfully Updated",
            description: response.transactions_processed > 1
              ? `${response.transactions_processed} transactions processed`
              : response.message || response.response,
          });
        }
      } catch (error) {
        const fallbackResponses = language === "hi" ? [
          "माफ़ करें, मैं आपकी आवाज़ नहीं समझ पाई। कृपया फिर से बोलें।",
          "कुछ तकनीकी समस्या है। कृपया टेक्स्ट में लिखें।"
        ] : [
          "Sorry, I couldn't understand your voice. Please speak again.",
          "There's a technical issue. Please type your message."
        ];

        const aiMessage: Message = {
          id: Date.now() + 1,
          text: fallbackResponses[Math.floor(Math.random() * fallbackResponses.length)],
          sender: "ai",
          isUser: false,
          timestamp: new Date(),
        };

        setMessages(prev => [...prev, aiMessage]);
        
        toast({
          title: language === "hi" ? "त्रुटि" : "Error",
          description: language === "hi" ? "आवाज़ प्रोसेसिंग में समस्या" : "Error processing voice",
          variant: "destructive",
        });
      } finally {
        setIsProcessing(false);
        scrollToBottom();
      }
    }
  };

  const handleClarificationConfirm = (businessResults: any[]) => {
    setShowClarification(false);
    setClarificationItems([]);

    // Add confirmation message to chat
    const confirmationMessage: Message = {
      id: Date.now(),
      text: `✅ Successfully processed ${businessResults.length} items!`,
      sender: "ai",
      isUser: false,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, confirmationMessage]);

    // Show success toast
    toast({
      title: language === "hi" ? "सफलतापूर्वक सहेजा गया" : "Successfully Saved",
      description: `${businessResults.length} items have been processed`,
    });
  };

  const handleClarificationCancel = () => {
    setShowClarification(false);
    setClarificationItems([]);

    // Add cancellation message to chat
    const cancelMessage: Message = {
      id: Date.now(),
      text: language === "hi" ? "आइटम प्रसंस्करण रद्द कर दिया गया।" : "Item processing cancelled.",
      sender: "ai",
      isUser: false,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, cancelMessage]);
  };

  const handleReceiptTableSave = async (items: any[]) => {
    try {
      setIsProcessing(true);

      // Process each item through the backend using authenticated API calls
      const businessResults = [];

      for (const item of items) {
        if (item.category === "expense") {
          const response = await apiCall('/api/expenses', {
            method: 'POST',
            body: JSON.stringify({
              amount: item.total_price,
              description: item.name,
              category: "general",
              language: language
            })
          });
          if (response.ok) {
            const result = await response.json();
            if (result.success) {
              businessResults.push({ type: "expense", item: item.name });
            } else {
              console.error('❌ Failed to save expense:', result.error);
            }
          } else {
            console.error('❌ API call failed for expense:', response.status);
          }
        } else if (item.category === "inventory") {
          const response = await apiCall('/api/inventory', {
            method: 'POST',
            body: JSON.stringify({
              product_name: item.name,
              quantity: item.quantity,
              cost_per_unit: item.unit_price,
              unit: "pieces"
            })
          });
          if (response.ok) {
            const result = await response.json();
            if (result.success) {
              businessResults.push({ type: "inventory", item: item.name });
            } else {
              console.error('❌ Failed to save inventory:', result.error);
            }
          } else {
            console.error('❌ API call failed for inventory:', response.status);
          }
        }
      }

      // Hide the table and keep file upload closed
      setShowReceiptTable(false);
      setReceiptData(null);
      setShowFileUpload(false);

      // Add success message to chat
      const successMessage: Message = {
        id: Date.now(),
        text: language === "hi"
          ? `✅ ${businessResults.length} आइटम्स सफलतापूर्वक सेव किए गए!`
          : `✅ ${businessResults.length} items saved successfully!`,
        sender: "ai",
        isUser: false,
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, successMessage]);

      // Show appropriate toast based on results
      if (businessResults.length === items.length) {
        toast({
          title: language === "hi" ? "सफलतापूर्वक सहेजा गया" : "Successfully Saved",
          description: language === "hi"
            ? `${businessResults.length} आइटम्स प्रोसेस किए गए`
            : `${businessResults.length} items processed`,
        });
      } else if (businessResults.length > 0) {
        toast({
          title: language === "hi" ? "आंशिक रूप से सहेजा गया" : "Partially Saved",
          description: language === "hi"
            ? `${businessResults.length}/${items.length} आइटम्स सहेजे गए`
            : `${businessResults.length}/${items.length} items saved`,
          variant: "destructive",
        });
      } else {
        toast({
          title: language === "hi" ? "सेव नहीं हुआ" : "Save Failed",
          description: language === "hi" ? "कोई आइटम सेव नहीं हुआ" : "No items were saved",
          variant: "destructive",
        });
      }

    } catch (error) {
      toast({
        title: language === "hi" ? "त्रुटि" : "Error",
        description: language === "hi" ? "आइटम्स सेव करने में समस्या" : "Error saving items",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReceiptTableCancel = () => {
    setShowReceiptTable(false);
    setReceiptData(null);

    // Professional behavior: Keep file upload closed after cancellation
    setShowFileUpload(false);

    // Add cancellation message to chat
    const cancelMessage: Message = {
      id: Date.now(),
      text: language === "hi" ? "रसीद प्रसंस्करण रद्द कर दिया गया।" : "Receipt processing cancelled.",
      sender: "ai",
      isUser: false,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, cancelMessage]);
  };

  const cleanTextForSpeech = (text: string): string => {
    return text
      // Remove emojis
      .replace(/[\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]|[\u{1F1E0}-\u{1F1FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]/gu, '')
      // Remove special symbols like ✅ ❌ 🔊 💰 📊 etc.
      .replace(/[✅❌🔊💰📊📦🎤🎯🌟🎉⚡]/g, '')
      // Clean up multiple spaces
      .replace(/\s+/g, ' ')
      // Add proper pauses for punctuation
      .replace(/\./g, '. ')
      .replace(/,/g, ', ')
      .replace(/!/g, '! ')
      .replace(/\?/g, '? ')
      .replace(/:/g, ': ')
      .trim();
  };

  const selectBestVoice = (lang: string): SpeechSynthesisVoice | null => {
    const voices = window.speechSynthesis.getVoices();

    // Language-specific voice preferences (female voices preferred)
    const voicePreferences: { [key: string]: string[] } = {
      'ta': ['ta-IN', 'Tamil', 'female', 'Google தமிழ்', 'Microsoft Tamil'],
      'ml': ['ml-IN', 'Malayalam', 'female', 'Google മലയാളം', 'Microsoft Malayalam'],
      'hi': ['hi-IN', 'Hindi', 'female', 'Google हिन्दी', 'Microsoft Hindi'],
      'en': ['en-US', 'English', 'female', 'Google US English', 'Microsoft Zira']
    };

    const preferences = voicePreferences[lang] || voicePreferences['en'];

    // Try to find the best matching voice
    for (const preference of preferences) {
      const voice = voices.find(v =>
        v.lang.includes(preference) ||
        v.name.toLowerCase().includes(preference.toLowerCase()) ||
        (preference === 'female' && v.name.toLowerCase().includes('female'))
      );
      if (voice) return voice;
    }

    // Fallback: find any voice for the language
    return voices.find(v => v.lang.startsWith(lang)) || null;
  };

  const speakMessage = async (text: string) => {
    try {
      // Stop any ongoing audio
      if (currentAudio) {
        currentAudio.pause();
        currentAudio.currentTime = 0;
      }

      setIsSpeaking(true);

      // Clean text for better speech
      const cleanText = cleanTextForSpeech(text);

      toast({
        title: `🔊 ${t('voice.speaking')}`,
        description: cleanText.substring(0, 50) + (cleanText.length > 50 ? "..." : ""),
      });

      // Call Google TTS API
      const response = await apiCall('/api/tts', {
        method: 'POST',
        body: JSON.stringify({
          text: cleanText,
          language: language
        })
      });

      if (!response.ok) {
        throw new Error(`TTS API error: ${response.status}`);
      }

      // Get audio blob
      const audioBlob = await response.blob();
      const audioUrl = URL.createObjectURL(audioBlob);

      // Create and play audio
      const audio = new Audio(audioUrl);
      setCurrentAudio(audio);

      audio.onplay = () => {
        setIsSpeaking(true);
      };

      audio.onended = () => {
        setIsSpeaking(false);
        URL.revokeObjectURL(audioUrl);
        setCurrentAudio(null);
      };

      audio.onerror = () => {
        setIsSpeaking(false);
        URL.revokeObjectURL(audioUrl);
        setCurrentAudio(null);
        toast({
          title: `❌ ${t('common.error')}`,
          description: language === "ta" ? "பேசுவதில் பிழை" :
                      language === "ml" ? "സംസാരിക്കുന്നതിൽ പിശക്" :
                      language === "hi" ? "बोलने में समस्या हुई" :
                      "Error in speech",
          variant: "destructive",
        });
      };

      // Play the audio
      await audio.play();

    } catch (error) {
      console.error('Google TTS error:', error);
      setIsSpeaking(false);
      toast({
        title: `❌ ${t('common.error')}`,
        description: language === "ta" ? "Google TTS सेवा उपलब्ध नहीं है" :
                    language === "ml" ? "Google TTS സേവനം ലഭ്യമല്ല" :
                    language === "hi" ? "Google TTS सेवा उपलब्ध नहीं है" :
                    "Google TTS service unavailable",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="flex flex-col h-full max-h-[80vh] bg-gradient-subtle">
      {/* Chat Header */}
      <div className="p-4 border-b border-primary/10 bg-gradient-card">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10 ring-2 ring-primary/20 animate-float">
              <AvatarImage src={sakhiAvatar} alt="Sakhi" />
              <AvatarFallback className="bg-gradient-primary text-white">S</AvatarFallback>
            </Avatar>
            <div>
              <h3 className="font-semibold bg-gradient-primary bg-clip-text text-transparent">
                {language === "hi" ? "सखी - आपकी सहायक" : "Sakhi - Your Assistant"}
              </h3>
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                {language === "hi" ? "ऑनलाइन" : "Online"}
                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse-slow"></span>
              </p>
            </div>
          </div>
          
          {/* Chat Mode Toggle */}
          <div className="flex items-center gap-2">
            <div className="flex bg-muted/50 rounded-xl p-1.5 shadow-inner border border-primary/10 hover:shadow-md transition-all duration-300">
              <Button
                variant={chatMode === "general" ? "default" : "ghost"}
                size="sm"
                onClick={() => setChatMode("general")}
                className={`h-9 px-4 text-xs font-medium transition-all duration-300 rounded-lg ${
                  chatMode === "general" 
                    ? "bg-gradient-primary text-white shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 scale-105" 
                    : "hover:bg-background/80 hover:scale-105 text-muted-foreground hover:text-foreground"
                }`}
              >
                <MessageCircle className={`h-3.5 w-3.5 mr-2 transition-all duration-300 ${
                  chatMode === "general" ? "animate-pulse" : ""
                }`} />
                {language === "hi" ? "सामान्य" : "General"}
              </Button>
              <Button
                variant={chatMode === "business" ? "default" : "ghost"}
                size="sm"
                onClick={() => setChatMode("business")}
                className={`h-9 px-4 text-xs font-medium transition-all duration-300 rounded-lg ${
                  chatMode === "business" 
                    ? "bg-gradient-primary text-white shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 scale-105" 
                    : "hover:bg-background/80 hover:scale-105 text-muted-foreground hover:text-foreground"
                }`}
              >
                <DollarSign className={`h-3.5 w-3.5 mr-2 transition-all duration-300 ${
                  chatMode === "business" ? "animate-pulse" : ""
                }`} />
                {language === "hi" ? "व्यापार" : "Business"}
              </Button>
            </div>
          </div>
        </div>
        
        {/* Mode Indicator */}
        <div className="mt-3 flex items-center justify-center">
          <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-medium transition-all duration-300 animate-fade-in ${
            chatMode === "general" 
              ? "bg-blue-50 text-blue-700 border border-blue-200 shadow-sm hover:shadow-md hover:bg-blue-100" 
              : "bg-green-50 text-green-700 border border-green-200 shadow-sm hover:shadow-md hover:bg-green-100"
          }`}>
            {chatMode === "general" ? (
              <>
                <MessageCircle className="h-3.5 w-3.5 text-blue-500 animate-pulse" />
                <span>
                  {language === "hi" 
                    ? "सामान्य मोड: प्रश्न पूछें और सलाह लें" 
                    : "General Mode: Ask questions and get advice"
                  }
                </span>
              </>
            ) : (
              <>
                <DollarSign className="h-3.5 w-3.5 text-green-500 animate-pulse" />
                <span>
                  {language === "hi" 
                    ? "व्यापार मोड: लेन-देन दर्ज करें और प्रबंधन करें" 
                    : "Business Mode: Record transactions and manage business"
                  }
                </span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message, index) => (
          <div
            key={message.id}
            className={`flex ${message.isUser ? "justify-end" : "justify-start"} animate-fade-in`}
            style={{ animationDelay: `${index * 100}ms` }}
          >
            <div className={`flex max-w-[85%] ${message.isUser ? "flex-row-reverse" : "flex-row"} gap-3`}>
              <Avatar className="h-8 w-8 flex-shrink-0">
                {message.isUser ? (
                  <AvatarFallback className="bg-gradient-primary text-white text-xs">
                    {language === "hi" ? "आप" : "You"}
                  </AvatarFallback>
                ) : (
                  <>
                    <AvatarImage src={sakhiAvatar} alt="Sakhi" />
                    <AvatarFallback className="bg-gradient-primary text-white">S</AvatarFallback>
                  </>
                )}
              </Avatar>
              
              <div className="flex flex-col">
                <Card className={`${
                  message.isUser 
                    ? "bg-gradient-primary text-white shadow-glow" 
                    : "bg-card border-primary/10 hover:shadow-warm transition-all duration-200"
                } shadow-card`}>
                  <CardContent className="p-3">
                    <div className="prose-chat">
                      <ReactMarkdown>{message.text.trim() || "No response received"}</ReactMarkdown>
                    </div>
                    {!message.isUser && (
                      <div className="flex items-center gap-2 mt-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          className={`h-6 p-1 hover:scale-110 transition-all duration-200 ${
                            isSpeaking ? 'text-primary animate-pulse bg-primary/10' : 'text-muted-foreground hover:text-primary'
                          }`}
                          onClick={() => {
                            if (isSpeaking) {
                              // Stop Google TTS audio
                              if (currentAudio) {
                                currentAudio.pause();
                                currentAudio.currentTime = 0;
                                setCurrentAudio(null);
                              }
                              setIsSpeaking(false);
                            } else {
                              // Start Google TTS speech
                              speakMessage(message.text);
                            }
                          }}
                          title={isSpeaking ?
                            (language === "ta" ? "பேசுவதை நிறுத்து" :
                             language === "ml" ? "സംസാരം നിർത്തുക" :
                             language === "hi" ? "बोलना बंद करें" : "Stop speaking") :
                            (language === "ta" ? "கேளுங்கள்" :
                             language === "ml" ? "കേൾക്കുക" :
                             language === "hi" ? "सुनें" : "Listen")
                          }
                        >
                          <Volume2 className={`h-3 w-3 ${isSpeaking ? 'animate-bounce text-primary' : ''}`} />
                        </Button>
                        <span className="text-xs opacity-60">
                          {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    )}
                  </CardContent>
                </Card>
                {message.isUser && (
                  <span className="text-xs text-muted-foreground mt-1 text-right">
                    {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Item Clarification Table */}
      {showClarification && clarificationItems.length > 0 && (
        <div className="p-4 border-t border-primary/10 bg-gradient-card">
          <ItemClarificationTable
            items={clarificationItems}
            onConfirm={handleClarificationConfirm}
            onCancel={handleClarificationCancel}
            language={language}
          />
        </div>
      )}

      {/* Receipt Items Table */}
      {showReceiptTable && receiptData && (
        <div className="p-4 border-t border-primary/10 bg-gradient-card">
          <ReceiptItemsTable
            items={receiptData.items}
            merchantName={receiptData.merchantName}
            totalAmount={receiptData.totalAmount}
            onSave={handleReceiptTableSave}
            onCancel={handleReceiptTableCancel}
            language={language}
          />
        </div>
      )}

      {/* Input Area */}
      <div className="p-4 border-t border-primary/10 bg-gradient-card">
        {/* File Upload Section */}
        {showFileUpload && (
          <div className="mb-4 p-3 border border-primary/20 rounded-lg bg-muted/50 animate-fade-in">
            <FileUpload 
              onFileUpload={handleFileUpload}
              language={language}
            />
          </div>
        )}

        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowFileUpload(!showFileUpload)}
            className={`hover:scale-105 transition-all duration-200 ${
              showFileUpload ? 'bg-primary/10 border-primary text-primary' : ''
            }`}
            disabled={isProcessing || showReceiptTable}
          >
            <Paperclip className={`h-4 w-4 ${showFileUpload ? 'text-primary' : ''}`} />
          </Button>

          <div className="flex-1 relative">
            <Input
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder={language === "hi" ? "अपना संदेश टाइप करें... 💬" : "Type your message... 💬"}
              onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
              className="transition-all duration-200 focus:scale-[1.02] focus:shadow-glow"
            />
          </div>

          <VoiceInput 
            onTranscript={handleVoiceInput}
            language={language}
          />
          
          <Button 
            onClick={handleSendMessage} 
            size="icon"
            className="bg-gradient-primary hover:scale-105 transition-transform duration-200 shadow-glow"
            disabled={!inputText.trim() || isProcessing}
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
        
        <div className="flex items-center justify-between mt-3">
          <p className="text-xs text-muted-foreground">
            {language === "hi" ? "टाइप करें, बोलें या फाइल अपलोड करें 📎🎤" : "Type, speak or upload files 📎🎤"}
          </p>
          {isSpeaking && (
            <div className="flex items-center gap-2 text-xs text-primary animate-pulse">
              <Volume2 className="h-3 w-3" />
              {t('voice.speaking') || (language === "hi" ? "बोल रही हूँ..." : language === "ta" ? "பேசுகிறேன்..." : language === "ml" ? "സംസാരിക്കുന്നു..." : "Speaking...")}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}