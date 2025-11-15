import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Brain, Zap, Target, Eye, Trophy } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Training = () => {
  const navigate = useNavigate();

  const challenges = [
    {
      id: "scan",
      title: "Sigma Scan",
      description: "Trening szybkości percepcji i reakcji wzrokowo-ruchowej",
      icon: Zap,
      color: "bg-blue-500",
      route: "/scan/training",
    },
    {
      id: "control",
      title: "Sigma Control",
      description: "Trening kontroli impulsów i podejmowania decyzji pod presją",
      icon: Target,
      color: "bg-orange-500",
      route: "/control/training",
    },
    {
      id: "focus",
      title: "Sigma Focus",
      description: "Trening koncentracji i odporności na dystrakcje",
      icon: Brain,
      color: "bg-purple-500",
      route: "/focus/training",
    },
    {
      id: "tracker",
      title: "Sigma Tracker",
      description: "Trening śledzenia wielu obiektów i pamięci roboczej",
      icon: Eye,
      color: "bg-emerald-500",
      route: "/tracker/training",
    },
  ];

  const trainingResults = [
    {
      id: 1,
      gameName: "Sigma Scan",
      date: "2024-03-15",
      score: 850,
      accuracy: "92%",
      avgTime: "1.2s",
    },
    {
      id: 2,
      gameName: "Sigma Focus",
      date: "2024-03-14",
      score: 720,
      accuracy: "88%",
      avgTime: "1.5s",
    },
    {
      id: 3,
      gameName: "Sigma Control",
      date: "2024-03-13",
      score: 650,
      accuracy: "85%",
      avgTime: "1.8s",
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Trening</h1>
        <p className="text-muted-foreground mt-2">
          Trenuj swoje umiejętności kognitywne i śledź postępy
        </p>
      </div>

      <Tabs defaultValue="challenges" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="challenges">Wyzwania</TabsTrigger>
          <TabsTrigger value="exercises">Ćwiczenia</TabsTrigger>
          <TabsTrigger value="results">Historia wyników</TabsTrigger>
        </TabsList>

        <TabsContent value="challenges" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {challenges.map((challenge) => {
              const Icon = challenge.icon;
              return (
                <Card key={challenge.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <CardTitle className="text-xl">{challenge.title}</CardTitle>
                    <CardDescription className="mt-1">
                      {challenge.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button
                      className="w-full"
                      onClick={() => navigate(challenge.route)}
                    >
                      Go!
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="exercises" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Ćwiczenia treningowe</CardTitle>
              <CardDescription>
                Ta sekcja będzie wkrótce dostępna
              </CardDescription>
            </CardHeader>
            <CardContent className="flex items-center justify-center py-12">
              <div className="text-center text-muted-foreground">
                <Trophy className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Ćwiczenia będą dostępne wkrótce</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="results" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Historia wyników</CardTitle>
              <CardDescription>
                Twoje ostatnie wyniki treningowe
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {trainingResults.map((result) => (
                  <div
                    key={result.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div>
                      <h4 className="font-semibold text-foreground">{result.gameName}</h4>
                      <p className="text-sm text-muted-foreground">{result.date}</p>
                    </div>
                    <div className="flex gap-6 text-sm">
                      <div>
                        <p className="text-muted-foreground">Wynik</p>
                        <p className="font-semibold text-foreground">{result.score}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Celność</p>
                        <p className="font-semibold text-foreground">{result.accuracy}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Śr. czas</p>
                        <p className="font-semibold text-foreground">{result.avgTime}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Training;
