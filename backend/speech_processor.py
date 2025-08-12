from faster_whisper import WhisperModel
import os
import tempfile
from typing import Optional, Tuple
import logging

class SpeechProcessor:
    def __init__(self):
        # Initialize Whisper model (small model for faster processing)
        self.model = WhisperModel("small", device="cpu", compute_type="int8")
        
    def transcribe_audio(self, audio_file_path: str, language: str = "hi") -> Tuple[str, float]:
        """
        Transcribe audio file to text using Faster-Whisper
        
        Args:
            audio_file_path: Path to the audio file
            language: Language code (hi, en, etc.)
            
        Returns:
            Tuple of (transcribed_text, confidence_score)
        """
        try:
            # Transcribe audio
            segments, info = self.model.transcribe(
                audio_file_path,
                language=language,
                beam_size=5,
                vad_filter=True
            )
            
            # Combine all segments
            transcribed_text = ""
            total_confidence = 0.0
            segment_count = 0
            
            for segment in segments:
                transcribed_text += segment.text + " "
                total_confidence += segment.avg_logprob
                segment_count += 1
            
            # Calculate average confidence
            avg_confidence = total_confidence / segment_count if segment_count > 0 else 0.0
            
            # Clean up text
            transcribed_text = transcribed_text.strip()
            
            logging.info(f"Transcription completed: {transcribed_text[:50]}...")
            
            return transcribed_text, avg_confidence
            
        except Exception as e:
            logging.error(f"Error in transcription: {str(e)}")
            return "", 0.0
    
    def detect_language(self, audio_file_path: str) -> str:
        """
        Detect the language of the audio file
        
        Args:
            audio_file_path: Path to the audio file
            
        Returns:
            Language code (hi, en, etc.)
        """
        try:
            # Detect language
            segments, info = self.model.transcribe(
                audio_file_path,
                language=None,  # Auto-detect
                beam_size=5
            )
            
            detected_language = info.language
            logging.info(f"Detected language: {detected_language}")
            
            return detected_language
            
        except Exception as e:
            logging.error(f"Error in language detection: {str(e)}")
            return "hi"  # Default to Hindi
    
    def transcribe_with_language_detection(self, audio_file_path: str) -> Tuple[str, float, str]:
        """
        Transcribe audio with automatic language detection
        
        Args:
            audio_file_path: Path to the audio file
            
        Returns:
            Tuple of (transcribed_text, confidence_score, detected_language)
        """
        try:
            # First detect language
            detected_language = self.detect_language(audio_file_path)
            
            # Then transcribe with detected language
            transcribed_text, confidence = self.transcribe_audio(audio_file_path, detected_language)
            
            return transcribed_text, confidence, detected_language
            
        except Exception as e:
            logging.error(f"Error in transcription with language detection: {str(e)}")
            return "", 0.0, "hi" 