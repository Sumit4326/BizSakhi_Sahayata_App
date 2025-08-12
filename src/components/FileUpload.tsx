import React, { useRef, useState, useCallback } from "react";
import { Upload, FileImage, FileText, X, Eye, Camera, Sparkles, CheckCircle, AlertCircle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { CameraCapture } from "./CameraCapture";

interface FileUploadProps {
  onFileUpload: (file: File, extractedText?: string) => void;
  language?: string;
}

// Backend API base URL
const API_BASE_URL = "http://localhost:8000";

interface FileData {
  file: File;
  preview?: string;
  extractedText?: string;
  status: 'uploading' | 'processing' | 'success' | 'error';
  progress: number;
  id: string;
}

export function FileUpload({ onFileUpload, language = "hi" }: FileUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadedFiles, setUploadedFiles] = useState<FileData[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const [showCamera, setShowCamera] = useState(false);

  // Real OCR extraction using backend API
  const extractTextFromImage = async (file: File): Promise<string> => {
    try {
      const formData = new FormData();
      // Use the correct field name that the backend expects
      formData.append("image_file", file);
      formData.append("language", language === "hi" ? "hi" : "en");
      formData.append("user_id", "default_user");

      console.log("Sending image to OCR:", {
        fileName: file.name,
        fileSize: file.size,
        fileType: file.type,
        language: language
      });

      const response = await fetch(`${API_BASE_URL}/api/chat/image`, {
        method: "POST",
        body: formData,
      });

      console.log("OCR Response status:", response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error("OCR API error:", errorText);
        throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      console.log("OCR Response data:", data);

      return data.extracted_text || data.message || "No text could be extracted from this image.";
    } catch (error) {
      console.error("Error extracting text from image:", error);
      throw error;
    }
  };

  // Drag and drop handlers
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const files = Array.from(e.dataTransfer.files);
    processFiles(files);
  }, []);

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    processFiles(files);
  };

  const processFiles = async (files: File[]) => {
    for (const file of files) {
      if (file.size > 10 * 1024 * 1024) { // 10MB limit
        toast({
          title: language === "hi" ? "फाइल बहुत बड़ी है" : "File too large",
          description: language === "hi" ? "10MB से छोटी फाइल चुनें" : "Please select a file smaller than 10MB",
          variant: "destructive",
        });
        continue;
      }

      const fileId = Math.random().toString(36).substr(2, 9);
      const fileData: FileData = {
        file,
        status: 'uploading',
        progress: 0,
        id: fileId
      };

      setUploadedFiles(prev => [...prev, fileData]);
      setIsProcessing(true);

      try {
        // Simulate upload progress
        for (let progress = 0; progress <= 100; progress += 20) {
          await new Promise(resolve => setTimeout(resolve, 100));
          setUploadedFiles(prev =>
            prev.map(f => f.id === fileId ? { ...f, progress } : f)
          );
        }

        // Update status to processing
        setUploadedFiles(prev =>
          prev.map(f => f.id === fileId ? { ...f, status: 'processing', progress: 100 } : f)
        );

        let preview: string | undefined;
        let extractedText: string | undefined;

        // Create preview for images
        if (file.type.startsWith('image/')) {
          preview = URL.createObjectURL(file);

          // Real OCR extraction
          try {
            extractedText = await extractTextFromImage(file);

            // Update with success
            setUploadedFiles(prev =>
              prev.map(f => f.id === fileId ? {
                ...f,
                preview,
                extractedText,
                status: 'success'
              } : f)
            );

            onFileUpload(file, extractedText);

            toast({
              title: language === "hi" ? "✅ सफल!" : "✅ Success!",
              description: language === "hi" ? "टेक्स्ट सफलतापूर्वक निकाला गया" : "Text extracted successfully",
            });

          } catch (ocrError) {
            console.error("OCR extraction failed:", ocrError);
            setUploadedFiles(prev =>
              prev.map(f => f.id === fileId ? {
                ...f,
                preview,
                status: 'error',
                extractedText: language === "hi"
                  ? "टेक्स्ट निकालने में समस्या हुई"
                  : "Error extracting text"
              } : f)
            );

            toast({
              title: language === "hi" ? "⚠️ चेतावनी" : "⚠️ Warning",
              description: language === "hi" ? "टेक्स्ट निकालने में समस्या हुई" : "Error extracting text",
              variant: "destructive",
            });
          }
        }

      } catch (error) {
        setUploadedFiles(prev =>
          prev.map(f => f.id === fileId ? { ...f, status: 'error' } : f)
        );

        toast({
          title: language === "hi" ? "❌ त्रुटि" : "❌ Error",
          description: language === "hi" ? "फाइल अपलोड नहीं हो सकी" : "Could not upload file",
          variant: "destructive",
        });
      } finally {
        setIsProcessing(false);
      }
    }
  };

  const removeFile = (id: string) => {
    setUploadedFiles(prev => {
      const fileToRemove = prev.find(f => f.id === id);
      if (fileToRemove?.preview) {
        URL.revokeObjectURL(fileToRemove.preview);
      }
      return prev.filter(f => f.id !== id);
    });
  };

  const retryFile = async (id: string) => {
    const fileData = uploadedFiles.find(f => f.id === id);
    if (fileData) {
      processFiles([fileData.file]);
      removeFile(id);
    }
  };

  return (
    <div className="space-y-6">
      {/* Compact Upload Area */}
      <div
        className={cn(
          "relative border-2 border-dashed rounded-lg p-4 transition-all duration-300 cursor-pointer group",
          isDragOver
            ? "border-primary bg-primary/5"
            : "border-muted-foreground/25 hover:border-primary/50 hover:bg-muted/50",
          isProcessing && "pointer-events-none opacity-60"
        )}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={cn(
              "p-2 rounded-lg transition-all duration-300",
              isDragOver ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary"
            )}>
              {isDragOver ? (
                <Sparkles className="h-5 w-5" />
              ) : (
                <Camera className="h-5 w-5" />
              )}
            </div>

            <div>
              <p className="text-sm font-medium">
                {isDragOver
                  ? (language === "hi" ? "फाइल छोड़ें" : "Drop files here")
                  : (language === "hi" ? "बिल/रसीद अपलोड करें" : "Upload Bill/Receipt")
                }
              </p>
              <p className="text-xs text-muted-foreground">
                {language === "hi" ? "JPG, PNG, PDF" : "JPG, PNG, PDF"}
              </p>
            </div>
          </div>

          <div className="flex gap-2">
            <Button
              type="button"
              variant="default"
              size="sm"
              disabled={isProcessing}
              onClick={(e) => {
                e.stopPropagation();
                setShowCamera(true);
              }}
            >
              <Camera className="h-4 w-4 mr-1" />
              {language === "hi" ? "फोटो" : "Photo"}
            </Button>

            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={isProcessing}
              onClick={(e) => {
                e.stopPropagation();
                fileInputRef.current?.click();
              }}
            >
              <Upload className="h-4 w-4 mr-1" />
              {language === "hi" ? "फाइल" : "File"}
            </Button>
          </div>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*,.pdf,.doc,.docx,.txt"
          onChange={handleFileSelect}
          className="hidden"
        />
      </div>

      {/* Modern File List */}
      {uploadedFiles.length > 0 && (
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-muted-foreground">
            {language === "hi" ? "अपलोड की गई फाइलें" : "Uploaded Files"} ({uploadedFiles.length})
          </h4>

          <div className="space-y-2 max-h-48 overflow-y-auto">
            {uploadedFiles.map((fileData) => (
              <Card key={fileData.id} className={cn(
                "border transition-all duration-300 hover:shadow-md",
                fileData.status === 'success' && "border-green-200 bg-green-50/50",
                fileData.status === 'error' && "border-red-200 bg-red-50/50",
                fileData.status === 'processing' && "border-blue-200 bg-blue-50/50"
              )}>
                <CardContent className="p-3">
                  <div className="flex items-start gap-4">
                    {/* File Icon */}
                    <div className={cn(
                      "p-2 rounded-lg flex-shrink-0",
                      fileData.status === 'success' && "bg-green-100 text-green-600",
                      fileData.status === 'error' && "bg-red-100 text-red-600",
                      fileData.status === 'processing' && "bg-blue-100 text-blue-600",
                      fileData.status === 'uploading' && "bg-gray-100 text-gray-600"
                    )}>
                      {fileData.file.type.startsWith('image/') ? (
                        <FileImage className="h-5 w-5" />
                      ) : (
                        <FileText className="h-5 w-5" />
                      )}
                    </div>

                    {/* File Info */}
                    <div className="flex-1 min-w-0 space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm truncate">{fileData.file.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {(fileData.file.size / 1024 / 1024).toFixed(2)} MB
                          </p>
                        </div>

                        {/* Status Badge */}
                        <Badge variant={
                          fileData.status === 'success' ? 'default' :
                          fileData.status === 'error' ? 'destructive' :
                          fileData.status === 'processing' ? 'secondary' : 'outline'
                        } className="ml-2">
                          {fileData.status === 'success' && <CheckCircle className="h-3 w-3 mr-1" />}
                          {fileData.status === 'error' && <AlertCircle className="h-3 w-3 mr-1" />}
                          {fileData.status === 'processing' && <RefreshCw className="h-3 w-3 mr-1 animate-spin" />}

                          {fileData.status === 'uploading' && (language === "hi" ? "अपलोड हो रहा" : "Uploading")}
                          {fileData.status === 'processing' && (language === "hi" ? "प्रोसेसिंग" : "Processing")}
                          {fileData.status === 'success' && (language === "hi" ? "सफल" : "Success")}
                          {fileData.status === 'error' && (language === "hi" ? "त्रुटि" : "Error")}
                        </Badge>
                      </div>

                      {/* Progress Bar */}
                      {(fileData.status === 'uploading' || fileData.status === 'processing') && (
                        <Progress value={fileData.progress} className="h-2" />
                      )}

                      {/* Extracted Text Preview */}
                      {fileData.extractedText && fileData.status === 'success' && (
                        <div className="mt-3 p-3 bg-muted/50 rounded-lg border">
                          <p className="text-xs font-medium text-muted-foreground mb-2">
                            {language === "hi" ? "निकाला गया टेक्स्ट:" : "Extracted Text:"}
                          </p>
                          <p className="text-xs line-clamp-3 text-foreground">{fileData.extractedText}</p>
                        </div>
                      )}

                      {/* Action Buttons */}
                      <div className="flex items-center gap-2 pt-2">
                        {fileData.preview && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => window.open(fileData.preview)}
                            className="h-7 px-2 text-xs"
                          >
                            <Eye className="h-3 w-3 mr-1" />
                            {language === "hi" ? "देखें" : "View"}
                          </Button>
                        )}

                        {fileData.status === 'error' && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => retryFile(fileData.id)}
                            className="h-7 px-2 text-xs text-blue-600 hover:text-blue-700"
                          >
                            <RefreshCw className="h-3 w-3 mr-1" />
                            {language === "hi" ? "पुनः प्रयास" : "Retry"}
                          </Button>
                        )}

                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeFile(fileData.id)}
                          className="h-7 px-2 text-xs text-destructive hover:text-destructive"
                        >
                          <X className="h-3 w-3 mr-1" />
                          {language === "hi" ? "हटाएं" : "Remove"}
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Processing Indicator */}
      {isProcessing && uploadedFiles.length === 0 && (
        <Card className="border-dashed border-primary/30">
          <CardContent className="p-6">
            <div className="flex items-center justify-center space-x-3">
              <div className="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full"></div>
              <p className="text-sm font-medium">
                {language === "hi" ? "फाइल प्रोसेस हो रही है..." : "Processing file..."}
              </p>
            </div>
          </CardContent>
        </Card>
      )}



      {/* Camera Capture Modal */}
      <CameraCapture
        isOpen={showCamera}
        onClose={() => setShowCamera(false)}
        onCapture={(file) => processFiles([file])}
        language={language}
      />
    </div>
  );
}