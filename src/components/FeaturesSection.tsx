import { Card, CardContent } from "@/components/ui/card";
import { MessageSquare, TrendingUp, Package, Lightbulb, Mic, Globe, Zap, Shield } from "lucide-react";
import { useTranslation } from "@/utils/translations";

interface FeaturesSectionProps {
  language: string;
}

export function FeaturesSection({ language }: FeaturesSectionProps) {
  const { t } = useTranslation(language);

  const features = [
    {
      icon: MessageSquare,
      title: t('features.chat.title'),
      description: t('features.chat.desc'),
      color: "text-primary",
      bgColor: "bg-primary/10",
      gradient: "bg-gradient-primary"
    },
    {
      icon: TrendingUp,
      title: t('features.money.title'),
      description: t('features.money.desc'),
      color: "text-secondary",
      bgColor: "bg-secondary/10",
      gradient: "bg-gradient-secondary"
    },
    {
      icon: Package,
      title: t('features.inventory.title'),
      description: t('features.inventory.desc'),
      color: "text-accent",
      bgColor: "bg-accent/10",
      gradient: "bg-gradient-accent"
    },
    {
      icon: Lightbulb,
      title: t('features.tips.title'),
      description: t('features.tips.desc'),
      color: "text-warning",
      bgColor: "bg-warning/10",
      gradient: "bg-gradient-warning"
    },
    {
      icon: Mic,
      title: t('features.voice.title'),
      description: t('features.voice.desc'),
      color: "text-violet-500",
      bgColor: "bg-violet-500/10",
      gradient: "bg-gradient-to-r from-violet-500 to-purple-600"
    },
    {
      icon: Globe,
      title: t('features.languages.title'),
      description: t('features.languages.desc'),
      color: "text-emerald-500",
      bgColor: "bg-emerald-500/10",
      gradient: "bg-gradient-to-r from-emerald-500 to-teal-600"
    },
    {
      icon: Zap,
      title: t('features.fast.title'),
      description: t('features.fast.desc'),
      color: "text-amber-500",
      bgColor: "bg-amber-500/10",
      gradient: "bg-gradient-to-r from-amber-500 to-orange-600"
    },
    {
      icon: Shield,
      title: t('features.secure.title'),
      description: t('features.secure.desc'),
      color: "text-blue-500",
      bgColor: "bg-blue-500/10",
      gradient: "bg-gradient-to-r from-blue-500 to-indigo-600"
    }
  ];

  return (
    <section className="py-20 bg-gradient-subtle">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-16 animate-fade-in">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            <span className="bg-gradient-primary bg-clip-text text-transparent">
              {t('features.title')}
            </span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">{t('features.subtitle')}</p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <Card 
                key={index}
                className="group shadow-card hover:shadow-warm transition-all duration-300 transform hover:-translate-y-2 animate-fade-in border-none bg-background/80 backdrop-blur-sm"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <CardContent className="p-6 text-center space-y-4">
                  {/* Icon */}
                  <div className={`w-16 h-16 mx-auto ${feature.bgColor} rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300 relative overflow-hidden`}>
                    <div className={`absolute inset-0 ${feature.gradient} opacity-0 group-hover:opacity-20 transition-opacity duration-300`}></div>
                    <Icon className={`h-8 w-8 ${feature.color} relative z-10`} />
                  </div>
                  
                  {/* Content */}
                  <div className="space-y-2">
                    <h3 className="text-lg font-semibold group-hover:text-primary transition-colors">
                      {feature.title}
                    </h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {feature.description}
                    </p>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Bottom CTA */}
        <div className="text-center mt-16 animate-fade-in animation-delay-600">
          <Card className="inline-block bg-gradient-primary/5 border-primary/20 shadow-glow">
            <CardContent className="p-6">
              <p className="text-lg font-medium mb-2">{t('features.subtitle')}</p>
              <p className="text-sm text-muted-foreground">{t('homepage.features')}</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}