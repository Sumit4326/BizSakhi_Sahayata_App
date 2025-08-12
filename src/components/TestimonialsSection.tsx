import { Card, CardContent } from "@/components/ui/card";
import { Star, Quote } from "lucide-react";
import { useTranslation } from "@/utils/translations";

interface TestimonialsSectionProps {
  language: string;
}

export function TestimonialsSection({ language }: TestimonialsSectionProps) {
  const { t } = useTranslation(language);

  const testimonials = [
    {
      text: t('testimonials.1.text'),
      author: t('testimonials.1.author'),
      rating: 5,
      image: "👩‍💼",
      business: t('testimonials.1.business')
    },
    {
      text: t('testimonials.2.text'),
      author: t('testimonials.2.author'),
      rating: 5,
      image: "👩‍🌾",
      business: t('testimonials.2.business')
    },
    {
      text: t('testimonials.3.text'),
      author: t('testimonials.3.author'),
      rating: 5,
      image: "👩‍🍳",
      business: t('testimonials.3.business')
    }
  ];

  return (
    <section className="py-20 bg-gradient-warm">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-16 animate-fade-in">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            <span className="bg-gradient-primary bg-clip-text text-transparent">
              {t('testimonials.title')}
            </span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">{t('testimonials.subtitle')}</p>
        </div>

        {/* Testimonials Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <Card 
              key={index}
              className="group shadow-warm hover:shadow-glow transition-all duration-300 transform hover:-translate-y-2 animate-fade-in bg-background/90 backdrop-blur-sm border-none"
              style={{ animationDelay: `${index * 200}ms` }}
            >
              <CardContent className="p-6 space-y-4">
                {/* Quote Icon */}
                <div className="relative">
                  <Quote className="h-8 w-8 text-primary/30 absolute -top-2 -left-2" />
                  <div className="pl-6">
                    {/* Rating */}
                    <div className="flex items-center gap-1 mb-3">
                      {Array.from({ length: testimonial.rating }).map((_, i) => (
                        <Star key={i} className="h-4 w-4 fill-warning text-warning" />
                      ))}
                    </div>
                    
                    {/* Testimonial Text */}
                    <p className="text-foreground leading-relaxed font-medium italic">
                      "{testimonial.text}"
                    </p>
                  </div>
                </div>
                
                {/* Author */}
                <div className="flex items-center gap-3 pt-4 border-t border-border/50">
                  <div className="w-12 h-12 bg-gradient-primary rounded-full flex items-center justify-center text-2xl shadow-glow">
                    {testimonial.image}
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">
                      {testimonial.author}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {testimonial.business}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}