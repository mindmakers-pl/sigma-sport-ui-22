import { Card, CardContent } from "@/components/ui/card";
import { Activity, BarChart3, Users, Zap } from "lucide-react";

const features = [
  {
    icon: Activity,
    title: "Smart Tracking",
    description: "Automatically track your workouts with precision. GPS, heart rate, and performance metrics in real-time.",
  },
  {
    icon: BarChart3,
    title: "Advanced Analytics",
    description: "Deep insights into your performance trends. Visualize progress and identify areas for improvement.",
  },
  {
    icon: Users,
    title: "Community",
    description: "Connect with athletes worldwide. Share achievements, join challenges, and stay motivated together.",
  },
  {
    icon: Zap,
    title: "Instant Sync",
    description: "Seamless data synchronization across all your devices. Your progress, always accessible.",
  },
];

const Features = () => {
  return (
    <section id="features" className="py-24 bg-muted/30">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-4xl font-bold text-foreground mb-4">
            Everything You Need to Excel
          </h2>
          <p className="text-lg text-muted-foreground">
            Powerful features designed for serious athletes who want professional-grade tracking and analytics.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <Card 
              key={index} 
              className="border-border bg-card hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
            >
              <CardContent className="pt-6">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                  <feature.icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-2">
                  {feature.title}
                </h3>
                <p className="text-muted-foreground">
                  {feature.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;
