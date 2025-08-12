import React, { useRef, useState, useCallback } from "react";
import { Camera, X, RotateCcw, Check, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface CameraCaptureProps {
  isOpen: boolean;
  onClose: () => void;
  onCapture: (file: File) => void;
  language?: string;
}

export function CameraCapture({ isOpen, onClose, onCapture, language = "hi" }: CameraCaptureProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [isStreaming, setIsStreaming] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('environment');

  const startCamera = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: facingMode,
          width: { ideal: 1920 },
          height: { ideal: 1080 }
        }
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
        setIsStreaming(true);
      }
    } catch (error) {
      console.error("Error accessing camera:", error);
    }
  }, [facingMode]);

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setIsStreaming(false);
  }, []);

  const capturePhoto = useCallback(() => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');

      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      if (context) {
        context.drawImage(video, 0, 0);
        const imageDataUrl = canvas.toDataURL('image/jpeg', 0.9);
        setCapturedImage(imageDataUrl);
      }
    }
  }, []);

  const confirmCapture = useCallback(() => {
    if (capturedImage && canvasRef.current) {
      canvasRef.current.toBlob((blob) => {
        if (blob) {
          const file = new File([blob], `receipt-${Date.now()}.jpg`, { type: 'image/jpeg' });
          onCapture(file);
          handleClose();
        }
      }, 'image/jpeg', 0.9);
    }
  }, [capturedImage, onCapture]);

  const retakePhoto = useCallback(() => {
    setCapturedImage(null);
  }, []);

  const switchCamera = useCallback(() => {
    setFacingMode(prev => prev === 'user' ? 'environment' : 'user');
    stopCamera();
    setTimeout(startCamera, 100);
  }, [startCamera, stopCamera]);

  const handleClose = useCallback(() => {
    stopCamera();
    setCapturedImage(null);
    onClose();
  }, [stopCamera, onClose]);

  React.useEffect(() => {
    if (isOpen) {
      startCamera();
    } else {
      stopCamera();
    }

    return () => {
      stopCamera();
    };
  }, [isOpen, startCamera, stopCamera]);

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-md p-0 gap-0">
        <DialogHeader className="p-4 pb-2">
          <DialogTitle className="flex items-center gap-2">
            <Camera className="h-5 w-5" />
            {language === "hi" ? "रसीद की फोटो लें" : "Capture Receipt"}
          </DialogTitle>
        </DialogHeader>

        <div className="relative bg-black">
          {!capturedImage ? (
            <>
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-64 object-cover"
              />
              
              {isStreaming && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="absolute inset-4 border-2 border-white/50 rounded-lg"></div>
                  <div className="absolute top-4 left-4 right-4 text-center">
                    <p className="text-white text-sm bg-black/50 rounded px-2 py-1">
                      {language === "hi" ? "रसीद को फ्रेम में रखें" : "Frame the receipt"}
                    </p>
                  </div>
                </div>
              )}
            </>
          ) : (
            <img
              src={capturedImage}
              alt="Captured"
              className="w-full h-64 object-cover"
            />
          )}

          <canvas ref={canvasRef} className="hidden" />
        </div>

        <div className="p-4 space-y-3">
          {!capturedImage ? (
            <div className="flex items-center justify-center gap-4">
              <Button
                variant="outline"
                size="sm"
                onClick={switchCamera}
                disabled={!isStreaming}
              >
                <RotateCcw className="h-4 w-4" />
              </Button>

              <Button
                size="lg"
                onClick={capturePhoto}
                disabled={!isStreaming}
                className="rounded-full h-16 w-16 p-0"
              >
                <Camera className="h-6 w-6" />
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={handleClose}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={retakePhoto}
                className="flex-1"
              >
                <RotateCcw className="h-4 w-4 mr-2" />
                {language === "hi" ? "दोबारा लें" : "Retake"}
              </Button>
              
              <Button
                onClick={confirmCapture}
                className="flex-1"
              >
                <Check className="h-4 w-4 mr-2" />
                {language === "hi" ? "उपयोग करें" : "Use Photo"}
              </Button>
            </div>
          )}

          <div className="text-center">
            <p className="text-xs text-muted-foreground flex items-center justify-center gap-1">
              <Zap className="h-3 w-3" />
              {language === "hi" 
                ? "बेहतर परिणामों के लिए अच्छी रोशनी में फोटो लें"
                : "Take photos in good lighting for better results"
              }
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
