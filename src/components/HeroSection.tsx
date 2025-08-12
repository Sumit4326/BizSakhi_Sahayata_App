import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowRight, Sparkles, Heart, Star, MessageSquare, Smile, Headphones } from "lucide-react";
import { useTranslation } from "@/utils/translations";
import businessHero from "@/assets/business-hero.jpg";

interface HeroSectionProps {
  language: string;
  onGetStarted: () => void;
}

export function HeroSection({ language, onGetStarted }: HeroSectionProps) {
  const { t } = useTranslation(language);

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-radial">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 left-10 animate-float">
          <Sparkles className="h-6 w-6 text-accent/60" />
        </div>
        <div className="absolute top-40 right-20 animate-float-delayed">
          <Heart className="h-8 w-8 text-primary/40" />
        </div>
        <div className="absolute bottom-32 left-20 animate-bounce-slow">
          <Star className="h-5 w-5 text-secondary/50" />
        </div>
        <div className="absolute top-60 right-10 animate-pulse-slow">
          <div className="h-4 w-4 bg-accent/30 rounded-full"></div>
        </div>
        
        {/* Decorative Patterns */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-full h-full bg-pattern-dots"></div>
          <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-primary rounded-full blur-3xl opacity-20 animate-pulse-slow"></div>
          <div className="absolute bottom-0 left-0 w-72 h-72 bg-gradient-secondary rounded-full blur-3xl opacity-15 animate-pulse-slow"></div>
        </div>
      </div>

      {/* Hero Content */}
      <div className="relative z-10 container mx-auto px-4 py-20">
        <div className="grid lg:grid-cols-2 gap-12 items-center min-h-screen">
          {/* Text Content */}
          <div className="space-y-8 animate-fade-in">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 bg-gradient-primary/10 backdrop-blur-sm border border-primary/20 rounded-full px-4 py-2 animate-glow">
              <Sparkles className="h-4 w-4 text-primary animate-pulse" />
              <span className="text-sm font-medium text-primary">
                {language === "hi" ? "भारत की #1 महिला व्यापार ऐप" : "India's #1 Women's Business App"}
              </span>
            </div>

            {/* Main Heading */}
            <div className="space-y-4">
              <h1 className="text-4xl md:text-6xl font-bold leading-tight">
                <span className="bg-gradient-primary bg-clip-text text-transparent animate-text-shimmer">
                  {t('hero.title')}
                </span>
              </h1>
              
              <p className="text-lg md:text-xl text-muted-foreground leading-relaxed max-w-2xl">
                {t('hero.subtitle')}
              </p>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <Button 
                size="lg" 
                className="group h-14 px-8 bg-gradient-primary hover:scale-105 transition-all duration-300 shadow-glow"
                onClick={onGetStarted}
              >
                {t('hero.cta')}
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 pt-8">
              {/* Average Rating */}
              <div className="text-center rounded-xl border border-primary/10 bg-background/60 backdrop-blur-sm p-4 shadow-card">
                <div className="flex items-center justify-center gap-2 text-2xl md:text-3xl font-bold text-primary">
                  4.8
                  <Star className="h-5 w-5 text-primary" />
                </div>
                <div className="mt-1 text-sm text-muted-foreground">{t('stats.averageRating')}</div>
              </div>

              {/* Reviews */}
              <div className="text-center rounded-xl border border-secondary/10 bg-background/60 backdrop-blur-sm p-4 shadow-card">
                <div className="flex items-center justify-center gap-2 text-2xl md:text-3xl font-bold text-secondary">
                  10K+
                  <MessageSquare className="h-5 w-5 text-secondary" />
                </div>
                <div className="mt-1 text-sm text-muted-foreground">{t('stats.reviews')}</div>
              </div>

              {/* Satisfaction */}
              <div className="text-center rounded-xl border border-accent/10 bg-background/60 backdrop-blur-sm p-4 shadow-card">
                <div className="flex items-center justify-center gap-2 text-2xl md:text-3xl font-bold text-accent">
                  95%
                  <Smile className="h-5 w-5 text-accent" />
                </div>
                <div className="mt-1 text-sm text-muted-foreground">{t('stats.satisfaction')}</div>
              </div>

              {/* Support */}
              <div className="text-center rounded-xl border border-primary/10 bg-background/60 backdrop-blur-sm p-4 shadow-card">
                <div className="flex items-center justify-center gap-2 text-2xl md:text-3xl font-bold text-primary">
                  24/7
                  <Headphones className="h-5 w-5 text-primary" />
                </div>
                <div className="mt-1 text-sm text-muted-foreground">{t('stats.support')}</div>
              </div>
            </div>
          </div>

          {/* Hero Image */}
          <div className="relative animate-fade-in animation-delay-200">
            <Card className="relative overflow-hidden shadow-2xl transform rotate-2 hover:rotate-0 transition-transform duration-500">
              <CardContent className="p-0">
                <div className="relative">
                  <img 
                    src={businessHero}
                    alt="Rural women entrepreneurs"
                    className="w-full h-[500px] object-cover"
                  />
                  
                  {/* Overlay Gradient */}
                  <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent"></div>
                  
                  {/* Floating Cards */}
                  <div className="absolute top-4 right-4 animate-float">
                    <Card className="bg-background/90 backdrop-blur-sm shadow-card">
                      <CardContent className="p-3">
                        <div className="flex items-center gap-2">
                          <div className="h-2 w-2 bg-secondary rounded-full animate-pulse"></div>
                          <span className="text-xs font-medium">
                            {language === "hi" ? "₹2,500 कमाई" : "₹2,500 Earned"}
                          </span>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                  
                  <div className="absolute bottom-4 left-4 animate-float-delayed">
                    <Card className="bg-background/90 backdrop-blur-sm shadow-card">
                      <CardContent className="p-3">
                        <div className="flex items-center gap-2">
                          <div className="h-2 w-2 bg-primary rounded-full animate-pulse"></div>
                          <span className="text-xs font-medium">
                            {language === "hi" ? "15 उत्पाद स्टॉक में" : "15 Items in Stock"}
                          </span>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}