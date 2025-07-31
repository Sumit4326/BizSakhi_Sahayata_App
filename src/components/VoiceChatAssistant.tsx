import React, { useState, useEffect, useRef } from "react";
import { Send, Mic, MicOff, Volume2, Paperclip } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { VoiceInput } from "@/components/VoiceInput";
import { FileUpload } from "@/components/FileUpload";
import sakhiAvatar from "@/assets/sakhi-avatar.jpg";

interface Message {
  id: number;
  text: string;
  sender: "user" | "ai";
  isUser: boolean;
  timestamp: Date;
}

interface VoiceChatAssistantProps {
  language: string;
}

export function VoiceChatAssistant({ language }: VoiceChatAssistantProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      text: language === "hi" 
        ? "नमस्ते! मैं सखी हूं, आपकी व्यापारिक सहायक। आप मुझसे कुछ भी पूछ सकती हैं! 🙏" 
        : "Hello! I'm Sakhi, your business assistant. You can ask me anything! 🙏",
      sender: "ai",
      isUser: false,
      timestamp: new Date(),
    }
  ]);
  const [inputText, setInputText] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [showFileUpload, setShowFileUpload] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = () => {
    if (inputText.trim()) {
      const userMessage: Message = {
        id: Date.now(),
        text: inputText,
        sender: "user",
        isUser: true,
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, userMessage]);
      setInputText("");

      // Simulate AI response with typing delay
      setTimeout(() => {
        const responses = language === "hi" ? [
          "मैं आपकी मदद करने के लिए यहाँ हूँ। आपका व्यापार कैसा चल रहा है? 📈",
          "यह बहुत अच्छा सुझाव है! क्या आपको और कोई सहायता चाहिए? 💡",
          "मैं आपके लिए इसकी जानकारी ला सकती हूँ। कुछ और बताइए। 📋",
          "आपका व्यापार बढ़ाने के लिए मैं यहाँ हूँ। और कैसे मदद कर सकती हूँ? 🚀"
        ] : [
          "I'm here to help you with your business. How is everything going? 📈",
          "That's a great point! Do you need any other assistance? 💡",
          "I can help you get that information. Tell me more. 📋",
          "I'm here to help grow your business. How else can I assist you? 🚀"
        ];

        const aiMessage: Message = {
          id: Date.now() + 1,
          text: responses[Math.floor(Math.random() * responses.length)],
          sender: "ai",
          isUser: false,
          timestamp: new Date(),
        };

        setMessages(prev => [...prev, aiMessage]);
        scrollToBottom();
      }, 1200);
    }
  };

  const handleFileUpload = (file: File, extractedText?: string) => {
    const fileMessage: Message = {
      id: Date.now(),
      text: extractedText 
        ? `📁 ${file.name}\n\n${language === "hi" ? "निकाला गया टेक्स्ट:" : "Extracted text:"}\n${extractedText}`
        : `📁 ${file.name} ${language === "hi" ? "अपलोड किया गया" : "uploaded"}`,
      sender: "user",
      isUser: true,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, fileMessage]);

    // AI response for file upload
    setTimeout(() => {
      const aiResponse: Message = {
        id: Date.now() + 1,
        text: language === "hi" 
          ? "मैंने आपकी फाइल देख ली है। क्या आपको इसके साथ कोई सहायता चाहिए? 📊"
          : "I've received your file. Do you need help analyzing it? 📊",
        sender: "ai",
        isUser: false,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, aiResponse]);
      scrollToBottom();
    }, 800);
  };

  const handleVoiceInput = (transcript: string) => {
    setInputText(transcript);
  };

  const speakMessage = (text: string) => {
    setIsSpeaking(true);
    // In real implementation, this would use text-to-speech
    setTimeout(() => setIsSpeaking(false), 2000);
  };

  return (
    <div className="flex flex-col h-full max-h-[80vh] bg-gradient-subtle">
      {/* Chat Header */}
      <div className="p-4 border-b border-primary/10 bg-gradient-card">
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
                    <p className="text-sm whitespace-pre-wrap leading-relaxed">{message.text}</p>
                    {!message.isUser && (
                      <div className="flex items-center gap-2 mt-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 p-1 hover:scale-110 transition-transform duration-200 text-muted-foreground hover:text-primary"
                          onClick={() => speakMessage(message.text)}
                        >
                          <Volume2 className="h-3 w-3" />
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
            className="hover:scale-105 transition-transform duration-200"
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
            disabled={!inputText.trim()}
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
              {language === "hi" ? "बोल रही हूँ..." : "Speaking..."}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}