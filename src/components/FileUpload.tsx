import React, { useRef, useState } from "react";
import { Upload, FileImage, FileText, X, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "@/hooks/use-toast";

interface FileUploadProps {
  onFileUpload: (file: File, extractedText?: string) => void;
  language?: string;
}

export function FileUpload({ onFileUpload, language = "hi" }: FileUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadedFiles, setUploadedFiles] = useState<Array<{ file: File; preview?: string; extractedText?: string }>>([]);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    
    for (const file of files) {
      if (file.size > 10 * 1024 * 1024) { // 10MB limit
        toast({
          title: language === "hi" ? "फाइल बहुत बड़ी है" : "File too large",
          description: language === "hi" ? "10MB से छोटी फाइल चुनें" : "Please select a file smaller than 10MB",
          variant: "destructive",
        });
        continue;
      }

      setIsProcessing(true);
      
      try {
        let preview: string | undefined;
        let extractedText: string | undefined;

        // Create preview for images
        if (file.type.startsWith('image/')) {
          preview = URL.createObjectURL(file);
          
          // Mock OCR extraction
          extractedText = await mockOCRExtraction(file);
        }

        const fileData = { file, preview, extractedText };
        setUploadedFiles(prev => [...prev, fileData]);
        onFileUpload(file, extractedText);

        toast({
          title: language === "hi" ? "फाइल अपलोड हुई" : "File uploaded",
          description: extractedText 
            ? language === "hi" ? "टेक्स्ट निकाला गया" : "Text extracted successfully"
            : language === "hi" ? "फाइल सफलतापूर्वक अपलोड हुई" : "File uploaded successfully",
        });
      } catch (error) {
        toast({
          title: language === "hi" ? "त्रुटि" : "Error",
          description: language === "hi" ? "फाइल अपलोड नहीं हो सकी" : "Could not upload file",
          variant: "destructive",
        });
      } finally {
        setIsProcessing(false);
      }
    }
  };

  // Mock OCR function - in real app, this would call an OCR API
  const mockOCRExtraction = async (file: File): Promise<string> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        // Mock extracted text based on file name or type
        if (file.name.toLowerCase().includes('bill') || file.name.toLowerCase().includes('invoice')) {
          resolve(language === "hi" 
            ? "बिल नंबर: 12345\nकुल राशि: ₹500\nदुकान: राम की दुकान"
            : "Bill No: 12345\nTotal Amount: ₹500\nShop: Ram's Store"
          );
        } else {
          resolve(language === "hi"
            ? "यह एक नमूना टेक्स्ट है जो छवि से निकाला गया है। वास्तविक OCR यहाँ काम करेगा।"
            : "This is sample text extracted from the image. Real OCR would work here."
          );
        }
      }, 1500);
    });
  };

  const removeFile = (index: number) => {
    setUploadedFiles(prev => {
      const newFiles = [...prev];
      if (newFiles[index].preview) {
        URL.revokeObjectURL(newFiles[index].preview!);
      }
      newFiles.splice(index, 1);
      return newFiles;
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => fileInputRef.current?.click()}
          disabled={isProcessing}
          className="hover:scale-105 transition-transform duration-200"
        >
          <Upload className="h-4 w-4 mr-2" />
          {language === "hi" ? "फाइल अपलोड करें" : "Upload File"}
        </Button>
        
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*,.pdf,.doc,.docx,.txt"
          onChange={handleFileSelect}
          className="hidden"
        />
      </div>

      {uploadedFiles.length > 0 && (
        <div className="space-y-2 max-h-40 overflow-y-auto">
          {uploadedFiles.map((fileData, index) => (
            <Card key={index} className="border-2 border-dashed border-primary/20 hover:border-primary/40 transition-colors">
              <CardContent className="p-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 flex-1">
                    {fileData.file.type.startsWith('image/') ? (
                      <FileImage className="h-8 w-8 text-primary flex-shrink-0" />
                    ) : (
                      <FileText className="h-8 w-8 text-secondary flex-shrink-0" />
                    )}
                    
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">{fileData.file.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {(fileData.file.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                      {fileData.extractedText && (
                        <p className="text-xs text-primary mt-1 line-clamp-2">
                          {language === "hi" ? "टेक्स्ट निकाला गया" : "Text extracted"}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    {fileData.preview && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => window.open(fileData.preview)}
                        className="h-8 w-8 p-0"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    )}
                    
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeFile(index)}
                      className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {fileData.extractedText && (
                  <div className="mt-2 p-2 bg-muted rounded text-xs">
                    <p className="font-medium mb-1">
                      {language === "hi" ? "निकाला गया टेक्स्ट:" : "Extracted Text:"}
                    </p>
                    <p className="line-clamp-3">{fileData.extractedText}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {isProcessing && (
        <div className="text-center py-4">
          <div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full mx-auto mb-2"></div>
          <p className="text-sm text-muted-foreground">
            {language === "hi" ? "प्रोसेसिंग..." : "Processing..."}
          </p>
        </div>
      )}
    </div>
  );
}