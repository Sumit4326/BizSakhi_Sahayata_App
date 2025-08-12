import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Camera, Upload, Eye, Sparkles, Package, Tag } from "lucide-react";
import { toast } from "@/hooks/use-toast";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

interface GoogleLensAnalyzerProps {
  language: "en" | "hi";
}

interface AnalysisResult {
  success: boolean;
  message: string;
  scene_description?: string;
  scene_confidence?: number;
  detected_objects?: Array<{name: string; confidence: number}>;
  detected_brands?: Array<{name: string; confidence: number}>;
  image_tags?: Array<{name: string; confidence: number}>;
  image_categories?: Array<{name: string; score: number}>;
  color_analysis?: {dominantColors?: string[]; accentColor?: string};
  analysis_type?: string;
  extracted_text?: string;
}

export function GoogleLensAnalyzer({ language }: GoogleLensAnalyzerProps) {
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const analyzeImage = async (file: File) => {
    try {
      setAnalyzing(true);
      setResult(null);

      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => setSelectedImage(e.target?.result as string);
      reader.readAsDataURL(file);

      const formData = new FormData();
      formData.append('image_file', file);
      formData.append('language', language);
      formData.append('user_id', 'default_user');

      const response = await fetch(`${API_BASE_URL}/api/chat/image`, {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        setResult(data);
        
        if (data.analysis_type === 'google_lens_style') {
          toast({
            title: language === "hi" ? "विश्लेषण पूर्ण!" : "Analysis Complete!",
            description: language === "hi" ? "Google Lens स्टाइल विश्लेषण सफल" : "Google Lens style analysis successful",
          });
        }
      } else {
        throw new Error('Analysis failed');
      }
    } catch (error) {
      console.error('Error analyzing image:', error);
      toast({
        title: language === "hi" ? "त्रुटि" : "Error",
        description: language === "hi" ? "इमेज विश्लेषण में त्रुटि" : "Error analyzing image",
        variant: "destructive",
      });
    } finally {
      setAnalyzing(false);
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      analyzeImage(file);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Eye className="h-6 w-6 text-primary" />
            {language === "hi" ? "Google Lens स्टाइल इमेज एनालाइज़र" : "Google Lens Style Image Analyzer"}
          </CardTitle>
          <p className="text-muted-foreground">
            {language === "hi" 
              ? "फोटो लें और AI से पूछें कि यह क्या है - बिल्कुल Google Lens की तरह!"
              : "Take a photo and ask AI what it is - just like Google Lens!"
            }
          </p>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <Button
              onClick={() => document.getElementById('image-upload')?.click()}
              disabled={analyzing}
              className="bg-gradient-primary hover:scale-105 transition-all duration-300 shadow-glow"
            >
              {analyzing ? (
                <>
                  <Sparkles className="h-4 w-4 mr-2 animate-spin" />
                  {language === "hi" ? "विश्लेषण हो रहा है..." : "Analyzing..."}
                </>
              ) : (
                <>
                  <Camera className="h-4 w-4 mr-2" />
                  {language === "hi" ? "फोटो अपलोड करें" : "Upload Photo"}
                </>
              )}
            </Button>
            
            <input
              id="image-upload"
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              className="hidden"
            />
          </div>
        </CardContent>
      </Card>

      {/* Image Preview */}
      {selectedImage && (
        <Card className="shadow-card">
          <CardContent className="p-4">
            <img 
              src={selectedImage} 
              alt="Selected" 
              className="max-w-full h-auto max-h-64 mx-auto rounded-lg shadow-md"
            />
          </CardContent>
        </Card>
      )}

      {/* Analysis Results */}
      {result && (
        <div className="space-y-4">
          {/* AI Response */}
          <Card className="shadow-card border-primary/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-primary">
                <Sparkles className="h-5 w-5" />
                {language === "hi" ? "AI का जवाब" : "AI Response"}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-lg leading-relaxed">{result.message}</p>
              {result.analysis_type === 'google_lens_style' && (
                <Badge variant="secondary" className="mt-2">
                  <Eye className="h-3 w-3 mr-1" />
                  Google Lens Style
                </Badge>
              )}
            </CardContent>
          </Card>

          {/* Scene Description */}
          {result.scene_description && (
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Eye className="h-5 w-5 text-blue-600" />
                  {language === "hi" ? "दृश्य विवरण" : "Scene Description"}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">{result.scene_description}</p>
                {result.scene_confidence && (
                  <Badge variant="outline" className="mt-2">
                    {(result.scene_confidence * 100).toFixed(1)}% {language === "hi" ? "विश्वास" : "confidence"}
                  </Badge>
                )}
              </CardContent>
            </Card>
          )}

          {/* Detected Objects */}
          {result.detected_objects && result.detected_objects.length > 0 && (
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="h-5 w-5 text-green-600" />
                  {language === "hi" ? "पहचाने गए ऑब्जेक्ट" : "Detected Objects"}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {result.detected_objects.map((obj, index) => (
                    <Badge key={index} variant="secondary">
                      {obj.name} ({(obj.confidence * 100).toFixed(0)}%)
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Detected Brands */}
          {result.detected_brands && result.detected_brands.length > 0 && (
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Tag className="h-5 w-5 text-purple-600" />
                  {language === "hi" ? "पहचाने गए ब्रांड" : "Detected Brands"}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {result.detected_brands.map((brand, index) => (
                    <Badge key={index} variant="default" className="bg-purple-100 text-purple-800">
                      {brand.name} ({(brand.confidence * 100).toFixed(0)}%)
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Image Tags */}
          {result.image_tags && result.image_tags.length > 0 && (
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Tag className="h-5 w-5 text-orange-600" />
                  {language === "hi" ? "इमेज टैग्स" : "Image Tags"}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {result.image_tags.slice(0, 10).map((tag, index) => (
                    <Badge key={index} variant="outline">
                      {tag.name} ({(tag.confidence * 100).toFixed(0)}%)
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Color Analysis */}
          {result.color_analysis && result.color_analysis.dominantColors && (
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <div className="h-5 w-5 bg-gradient-to-r from-red-500 to-blue-500 rounded"></div>
                  {language === "hi" ? "रंग विश्लेषण" : "Color Analysis"}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div>
                    <span className="text-sm font-medium">
                      {language === "hi" ? "मुख्य रंग:" : "Dominant Colors:"}
                    </span>
                    <div className="flex gap-2 mt-1">
                      {result.color_analysis.dominantColors.map((color, index) => (
                        <Badge key={index} variant="outline">{color}</Badge>
                      ))}
                    </div>
                  </div>
                  {result.color_analysis.accentColor && (
                    <div>
                      <span className="text-sm font-medium">
                        {language === "hi" ? "एक्सेंट रंग:" : "Accent Color:"}
                      </span>
                      <Badge variant="outline" className="ml-2">
                        {result.color_analysis.accentColor}
                      </Badge>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Extracted Text */}
          {result.extracted_text && result.extracted_text.trim() && (
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Upload className="h-5 w-5 text-gray-600" />
                  {language === "hi" ? "निकाला गया टेक्स्ट" : "Extracted Text"}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground bg-gray-50 p-3 rounded">
                  {result.extracted_text}
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}
