import { useState, useRef, useEffect } from "react";
import { Send, Mic, MicOff, Volume2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import sakhiAvatar from "@/assets/sakhi-avatar.jpg";

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
}

interface VoiceChatAssistantProps {
  language: string;
}

export function VoiceChatAssistant({ language }: VoiceChatAssistantProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      text: language === "hi" ? "नमस्ते! मैं सखी हूं, आपकी व्यापारिक सहायक। आप मुझसे कुछ भी पूछ सकती हैं!" : "Hello! I'm Sakhi, your business assistant. You can ask me anything!",
      isUser: false,
      timestamp: new Date()
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

  useEffect(scrollToBottom, [messages]);

  const handleSendMessage = () => {
    if (!inputText.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputText,
      isUser: true,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText("");

    // Simulate Sakhi's response
    setTimeout(() => {
      const responses = language === "hi" ? [
        "यह एक बहुत अच्छा सवाल है! मैं आपकी मदद करूंगी।",
        "मुझे खुशी है कि आपने मुझसे पूछा। क्या आप और विस्तार से बता सकती हैं?",
        "आपके व्यापार के लिए यह जानकारी बहुत उपयोगी होगी।"
      ] : [
        "That's a great question! I'll help you with that.",
        "I'm glad you asked me. Can you tell me more details?",
        "This information will be very useful for your business."
      ];

      const sakhiMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: responses[Math.floor(Math.random() * responses.length)],
        isUser: false,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, sakhiMessage]);
    }, 1000);
  };

  const toggleListening = () => {
    setIsListening(!isListening);
    // In real implementation, this would start/stop speech recognition
  };

  const speakMessage = (text: string) => {
    setIsSpeaking(true);
    // In real implementation, this would use text-to-speech
    setTimeout(() => setIsSpeaking(false), 2000);
  };

  return (
    <div className="flex flex-col h-full max-h-[80vh]">
      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.isUser ? "justify-end" : "justify-start"} animate-fade-in`}
          >
            <div className={`flex max-w-[80%] ${message.isUser ? "flex-row-reverse" : "flex-row"} gap-2`}>
              <Avatar className="h-8 w-8">
                {message.isUser ? (
                  <AvatarFallback className="bg-primary text-primary-foreground">U</AvatarFallback>
                ) : (
                  <>
                    <AvatarImage src={sakhiAvatar} alt="Sakhi" />
                    <AvatarFallback className="bg-secondary text-secondary-foreground">S</AvatarFallback>
                  </>
                )}
              </Avatar>
              
              <Card className={`${message.isUser ? "bg-primary text-primary-foreground" : "bg-card"} shadow-card`}>
                <CardContent className="p-3">
                  <p className="text-sm">{message.text}</p>
                  {!message.isUser && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="mt-2 h-6 p-1"
                      onClick={() => speakMessage(message.text)}
                    >
                      <Volume2 className="h-3 w-3" />
                    </Button>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 border-t bg-background">
        <div className="flex gap-2">
          <div className="flex-1 relative">
            <Input
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder={language === "hi" ? "अपना संदेश टाइप करें..." : "Type your message..."}
              onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
              className="pr-12"
            />
          </div>
          
          <Button
            variant={isListening ? "default" : "outline"}
            size="icon"
            onClick={toggleListening}
            className={isListening ? "animate-glow" : ""}
          >
            {isListening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
          </Button>
          
          <Button onClick={handleSendMessage} size="icon">
            <Send className="h-4 w-4" />
          </Button>
        </div>
        
        <p className="text-xs text-muted-foreground mt-2 text-center">
          {language === "hi" ? "टाइप करें या माइक बटन दबाकर बोलें" : "Type or press mic button to speak"}
        </p>
      </div>
    </div>
  );
}