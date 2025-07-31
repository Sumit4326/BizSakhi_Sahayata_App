import React, { useState, useEffect } from "react";
import { Mic, MicOff, Volume2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";

// Declare global interface for Speech Recognition
declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

interface VoiceInputProps {
  onTranscript: (text: string) => void;
  placeholder?: string;
  language?: string;
}

export function VoiceInput({ onTranscript, placeholder = "Speak...", language = "hi-IN" }: VoiceInputProps) {
  const [isListening, setIsListening] = useState(false);
  const [recognition, setRecognition] = useState<any>(null);

  useEffect(() => {
    if (typeof window !== "undefined" && "SpeechRecognition" in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = language === "hi" ? "hi-IN" : "en-IN";

      recognition.onstart = () => {
        setIsListening(true);
        toast({
          title: language === "hi" ? "सुन रहा हूँ..." : "Listening...",
          description: language === "hi" ? "अब बोलें" : "Speak now",
        });
      };

      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        onTranscript(transcript);
        setIsListening(false);
        toast({
          title: language === "hi" ? "सुन लिया!" : "Got it!",
          description: transcript,
        });
      };

      recognition.onerror = (event) => {
        setIsListening(false);
        toast({
          title: language === "hi" ? "त्रुटि" : "Error",
          description: language === "hi" ? "आवाज़ नहीं सुन पाया" : "Could not hear you clearly",
          variant: "destructive",
        });
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      setRecognition(recognition);
    }
  }, [language, onTranscript]);

  const startListening = () => {
    if (recognition) {
      recognition.start();
    } else {
      toast({
        title: language === "hi" ? "समर्थित नहीं" : "Not Supported",
        description: language === "hi" ? "आपका ब्राउज़र वॉयस इनपुट समर्थित नहीं करता" : "Your browser doesn't support voice input",
        variant: "destructive",
      });
    }
  };

  const stopListening = () => {
    if (recognition) {
      recognition.stop();
    }
  };

  return (
    <Button
      type="button"
      variant={isListening ? "destructive" : "outline"}
      size="sm"
      onClick={isListening ? stopListening : startListening}
      className={`transition-all duration-200 ${isListening ? "animate-pulse" : "hover:scale-105"}`}
    >
      {isListening ? (
        <>
          <MicOff className="h-4 w-4" />
          <span className="ml-2">{language === "hi" ? "रोकें" : "Stop"}</span>
        </>
      ) : (
        <>
          <Mic className="h-4 w-4" />
          <span className="ml-2">{language === "hi" ? "बोलें" : "Speak"}</span>
        </>
      )}
    </Button>
  );
}