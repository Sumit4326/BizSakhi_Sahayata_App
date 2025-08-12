import React, { useState, useEffect, useRef } from "react";
import { Mic, MicOff, Volume2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { useTranslation } from "@/utils/translations";

interface VoiceInputProps {
  onTranscript: (text: string) => void;
  placeholder?: string;
  language?: string;
}

// Check if Web Speech API is supported
const isWebSpeechSupported = 'webkitSpeechRecognition' in window || 'SpeechRecognition' in window;

export function VoiceInput({ onTranscript, placeholder = "Speak...", language = "hi-IN" }: VoiceInputProps) {
  const [isListening, setIsListening] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const recognitionRef = useRef<any>(null);
  const { t } = useTranslation(language);

  // Initialize Web Speech API
  useEffect(() => {
    if (!isWebSpeechSupported) return;

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();

    // Configure for fast, real-time recognition
    recognition.continuous = false;
    recognition.interimResults = false;

    // Map language codes to speech recognition language codes
    const speechLangMap: { [key: string]: string } = {
      'en': 'en-US',
      'hi': 'hi-IN',
      'ta': 'ta-IN',  // Tamil (India)
      'ml': 'ml-IN',  // Malayalam (India)
      'te': 'te-IN',  // Telugu (India)
      'kn': 'kn-IN',  // Kannada (India)
      'gu': 'gu-IN',  // Gujarati (India)
      'bn': 'bn-IN',  // Bengali (India)
      'mr': 'mr-IN'   // Marathi (India)
    };

    recognition.lang = speechLangMap[language] || 'en-US';
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      setIsListening(true);
      setIsProcessing(false);

      const langNames: { [key: string]: string } = {
        'en': 'English',
        'hi': 'हिन्दी',
        'ta': 'தமிழ்',
        'ml': 'മലയാളം',
        'te': 'తెలుగు',
        'kn': 'ಕನ್ನಡ',
        'gu': 'ગુજરાતી',
        'bn': 'বাংলা',
        'mr': 'मराठी'
      };

      toast({
        title: `🎤 ${t('voice.listening')}`,
        description: `${t('voice.speakNow')} (${langNames[language] || language})`,
      });
    };

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      const confidence = event.results[0][0].confidence;

      onTranscript(transcript);

      toast({
        title: `✅ ${t('voice.gotIt') || 'Got it!'}`,
        description: `"${transcript}" (${Math.round(confidence * 100)}% confident)`,
      });
    };

    recognition.onerror = (event) => {
      // Only log non-aborted errors to reduce console noise
      if (event.error !== 'aborted') {
        console.error("Speech recognition error:", event.error);
      }
      setIsListening(false);
      setIsProcessing(false);

      let errorMessage = t('voice.couldNotHear') || 'Could not hear you clearly';

      if (event.error === 'no-speech') {
        errorMessage = t('voice.noSpeech') || 'No speech detected';
      } else if (event.error === 'network') {
        errorMessage = t('voice.networkError') || 'Network error';
      }

      toast({
        title: `❌ ${t('common.error')}`,
        description: errorMessage,
        variant: "destructive",
      });
    };

    recognition.onend = () => {
      setIsListening(false);
      setIsProcessing(false);
    };

    recognitionRef.current = recognition;

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
    };
  }, [language, onTranscript]);

  const startListening = () => {
    if (!isWebSpeechSupported) {
      toast({
        title: language === "hi" ? "समर्थित नहीं" : "Not Supported",
        description: language === "hi" ? "आपका ब्राउज़र वॉइस इनपुट को सपोर्ट नहीं करता" : "Your browser doesn't support voice input",
        variant: "destructive",
      });
      return;
    }

    if (recognitionRef.current && !isListening) {
      recognitionRef.current.start();
    }
  };

  const stopListening = () => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop();
    }
  };

  return (
    <Button
      type="button"
      variant={isListening ? "destructive" : "outline"}
      size="sm"
      onClick={isListening ? stopListening : startListening}
      disabled={isProcessing || !isWebSpeechSupported}
      className={`transition-all duration-200 ${isListening ? "animate-pulse" : "hover:scale-105"}`}
      title={!isWebSpeechSupported ? (language === "hi" ? "वॉइस इनपुट समर्थित नहीं" : "Voice input not supported") : ""}
    >
      {isProcessing ? (
        <>
          <div className="animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full mr-2"></div>
          <span>{t('common.loading')}</span>
        </>
      ) : isListening ? (
        <>
          <MicOff className="h-4 w-4" />
          <span className="ml-2">{t('voice.stop') || (language === "hi" ? "रोकें" : "Stop")}</span>
        </>
      ) : (
        <>
          <Mic className="h-4 w-4" />
          <span className="ml-2">🚀 {t('voice.speak') || (language === "hi" ? "बोलें" : "Speak")}</span>
        </>
      )}
    </Button>
  );
}

// Add type declarations for Web Speech API
declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}