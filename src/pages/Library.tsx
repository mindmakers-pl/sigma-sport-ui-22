import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Brain, Zap, Target, FileText, ClipboardList, Eye } from "lucide-react";
import { useNavigate } from "react-router-dom";
import BackButton from "@/components/BackButton";

const Library = () => {
  const navigate = useNavigate();
  const [exerciseModule, setExerciseModule] = useState("wszystkie");
  const [exerciseStrategy, setExerciseStrategy] = useState("wszystkie");

  const trainingModules = [
    {
      id: 1,
      title: "Moduł 1: Trening uwagi selektywnej",
      description: "Ćwiczenia rozwijające zdolność koncentracji na wybranych bodźcach",
      duration: "45 min",
      exercises: 8,
    },
    {
      id: 2,
      title: "Moduł 2: Kontrola impulsów",
      description: "Techniki zarządzania emocjami i reakcjami pod presją",
      duration: "50 min",
      exercises: 6,
    },
    {
      id: 3,
      title: "Moduł 3: Trening wyobrażeniowy",
      description: "Wizualizacja i mentalne reprogramowanie działań sportowych",
      duration: "40 min",
      exercises: 10,
    },
    {
      id: 4,
      title: "Moduł 4: Regulacja arousal",
      description: "Zarządzanie poziomem pobudzenia przed i podczas zawodów",
      duration: "35 min",
      exercises: 7,
    },
    {
      id: 5,
      title: "Moduł 5: Odporność na presję",
      description: "Budowanie wytrzymałości psychicznej w sytuacjach stresowych",
      duration: "55 min",
      exercises: 9,
    },
    {
      id: 6,
      title: "Moduł 6:Flow i szczytowa forma",
      description: "Techniki osiągania optymalnego stanu wydajności",
      duration: "45 min",
      exercises: 8,
    },
  ];

  const challenges = [
    {
      id: "scan",
      title: "Wyzwanie Sigma Scan",
      description: "Trening szybkości percepcji i reakcji wzrokowo-ruchowej",
      icon: Zap,
      color: "bg-blue-500",
      route: "/scan/training",
    },
    {
      id: "control",
      title: "Wyzwanie Sigma Control",
      description: "Trening kontroli impulsów i podejmowania decyzji pod presją",
      icon: Target,
      color: "bg-orange-500",
      route: "/control/training",
    },
    {
      id: "focus",
      title: "Wyzwanie Sigma Focus",
      description: "Trening koncentracji i odporności na dystrakcje",
      icon: Brain,
      color: "bg-purple-500",
      route: "/focus/training",
    },
    {
      id: "tracker",
      title: "Wyzwanie Sigma Tracker",
      description: "Trening śledzenia wielu obiektów i pamięci roboczej",
      icon: Eye,
      color: "bg-emerald-500",
      route: "/tracker/training",
    },
  ];

  const exercises = [
    {
      id: 1,
      title: "Skanowanie wzrokowe 360°",
      module: "Moduł 1",
      strategy: "Trening uwagi",
      duration: "5 min",
      difficulty: "Średni",
    },
    {
      id: 2,
      title: "Oddech rezonansowy",
      module: "Moduł 4",
      strategy: "Regulacja arousal",
      duration: "8 min",
      difficulty: "Łatwy",
    },
    {
      id: 3,
      title: "Wizualizacja idealnego wykonania",
      module: "Moduł 3",
      strategy: "Trening wyobrażeniowy",
      duration: "10 min",
      difficulty: "Średni",
    },
    {
      id: 4,
      title: "Stop-Signal Task",
      module: "Moduł 2",
      strategy: "Kontrola impulsów",
      duration: "7 min",
      difficulty: "Trudny",
    },
    {
      id: 5,
      title: "Anchoring (kotwiczenie stanu)",
      module: "Moduł 6",
      strategy: "Zarządzanie stanem",
      duration: "6 min",
      difficulty: "Średni",
    },
    {
      id: 6,
      title: "Progressive Muscle Relaxation",
      module: "Moduł 4",
      strategy: "Regulacja arousal",
      duration: "12 min",
      difficulty: "Łatwy",
    },
    {
      id: 7,
      title: "Self-talk pozytywny",
      module: "Moduł 5",
      strategy: "Odporność psychiczna",
      duration: "4 min",
      difficulty: "Łatwy",
    },
    {
      id: 8,
      title: "Medytacja w ruchu",
      module: "Moduł 6",
      strategy: "Flow",
      duration: "15 min",
      difficulty: "Trudny",
    },
  ];

  const questionnaires = [
    {
      id: 1,
      name: "MTQ48",
      fullName: "Mental Toughness Questionnaire 48",
      description: "Kompleksowe narzędzie mierzące odporność psychiczną w 4 wymiarach: Wyzwanie, Zaangażowanie, Kontrola, Pewność siebie",
      items: 48,
      duration: "10-15 min",
      scales: ["Wyzwanie", "Zaangażowanie", "Kontrola emocjonalna", "Kontrola życiowa", "Pewność w relacjach", "Pewność w umiejętnościach"],
    },
    {
      id: 2,
      name: "SAS-2",
      fullName: "Sport Anxiety Scale - 2",
      description: "Kwestionariusz mierzący lęk w sporcie w trzech wymiarach",
      items: 15,
      duration: "5-8 min",
      scales: ["Lęk somatyczny", "Zmartwienie", "Zaburzenia koncentracji"],
    },
    {
      id: 3,
      name: "CSAI-2R",
      fullName: "Competitive State Anxiety Inventory - 2 Revised",
      description: "Narzędzie do pomiaru lęku przedstartowego i pewności siebie",
      items: 17,
      duration: "5-7 min",
      scales: ["Lęk poznawczy", "Lęk somatyczny", "Pewność siebie"],
    },
    {
      id: 4,
      name: "TOPS",
      fullName: "Test of Performance Strategies",
      description: "Kwestionariusz oceniający strategie psychologiczne stosowane w treningu i zawodach",
      items: 64,
      duration: "15-20 min",
      scales: ["Automatyzm", "Kontrola emocjonalna", "Wyznaczanie celów", "Imagery", "Aktywacja", "Relaks", "Samoocena", "Self-talk"],
    },
    {
      id: 5,
      name: "POMS",
      fullName: "Profile of Mood States",
      description: "Profil nastroju - narzędzie do szybkiej oceny stanu emocjonalnego zawodnika",
      items: 30,
      duration: "5-10 min",
      scales: ["Napięcie", "Depresja", "Złość", "Wigor", "Zmęczenie", "Dezorientacja"],
    },
  ];

  const filteredExercises = exercises.filter((ex) => {
    const matchesModule = exerciseModule === "wszystkie" || ex.module === exerciseModule;
    const matchesStrategy = exerciseStrategy === "wszystkie" || ex.strategy === exerciseStrategy;
    return matchesModule && matchesStrategy;
  });

  return (
    <div className="space-y-6">
      <BackButton />
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Biblioteka</h1>
        <p className="text-slate-600 mt-2">Zasoby treningowe i narzędzia diagnostyczne</p>
      </div>

      <Tabs defaultValue="scenariusze" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="scenariusze">Scenariusze treningów</TabsTrigger>
          <TabsTrigger value="wyzwania">Wyzwania</TabsTrigger>
          <TabsTrigger value="cwiczenia">Ćwiczenia</TabsTrigger>
          <TabsTrigger value="kwestionariusze">Kwestionariusze</TabsTrigger>
        </TabsList>

        <TabsContent value="scenariusze" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {trainingModules.map((module) => (
              <Card key={module.id} className="hover:shadow-lg transition-shadow cursor-pointer">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <Brain className="h-8 w-8 text-primary" />
                    <Badge variant="outline">{module.duration}</Badge>
                  </div>
                  <CardTitle className="text-lg mt-4">{module.title}</CardTitle>
                  <CardDescription>{module.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between text-sm text-slate-600">
                    <span>{module.exercises} ćwiczeń</span>
                    <span className="text-primary font-medium">Zobacz konspekt →</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="wyzwania" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {challenges.map((challenge) => (
              <Card 
                key={challenge.id} 
                className="hover:shadow-lg transition-all cursor-pointer border-2 hover:border-primary"
                onClick={() => navigate(challenge.route)}
              >
                <CardHeader>
                  <div className={`${challenge.color} w-16 h-16 rounded-lg flex items-center justify-center mb-4`}>
                    <challenge.icon className="h-8 w-8 text-white" />
                  </div>
                  <CardTitle className="text-xl">{challenge.title}</CardTitle>
                  <CardDescription className="text-base">{challenge.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <Badge className="bg-green-100 text-green-800 hover:bg-green-200">
                    Tryb treningowy
                  </Badge>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="cwiczenia" className="space-y-6">
          <div className="flex gap-4">
            <div className="flex-1">
              <label className="text-sm font-medium text-slate-700 mb-2 block">Moduł</label>
              <Select value={exerciseModule} onValueChange={setExerciseModule}>
                <SelectTrigger>
                  <SelectValue placeholder="Wybierz moduł" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="wszystkie">Wszystkie moduły</SelectItem>
                  <SelectItem value="Moduł 1">Moduł 1: Uwaga selektywna</SelectItem>
                  <SelectItem value="Moduł 2">Moduł 2: Kontrola impulsów</SelectItem>
                  <SelectItem value="Moduł 3">Moduł 3: Trening wyobrażeniowy</SelectItem>
                  <SelectItem value="Moduł 4">Moduł 4: Regulacja arousal</SelectItem>
                  <SelectItem value="Moduł 5">Moduł 5: Odporność na presję</SelectItem>
                  <SelectItem value="Moduł 6">Moduł 6: Flow</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex-1">
              <label className="text-sm font-medium text-slate-700 mb-2 block">Strategia mentalna</label>
              <Select value={exerciseStrategy} onValueChange={setExerciseStrategy}>
                <SelectTrigger>
                  <SelectValue placeholder="Wybierz strategię" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="wszystkie">Wszystkie strategie</SelectItem>
                  <SelectItem value="Trening uwagi">Trening uwagi</SelectItem>
                  <SelectItem value="Trening wyobrażeniowy">Trening wyobrażeniowy</SelectItem>
                  <SelectItem value="Kontrola impulsów">Kontrola impulsów</SelectItem>
                  <SelectItem value="Regulacja arousal">Regulacja arousal</SelectItem>
                  <SelectItem value="Odporność psychiczna">Odporność psychiczna</SelectItem>
                  <SelectItem value="Zarządzanie stanem">Zarządzanie stanem</SelectItem>
                  <SelectItem value="Flow">Flow</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredExercises.map((exercise) => (
              <Card 
                key={exercise.id} 
                className="hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => navigate(`/biblioteka/cwiczenie/${exercise.id}`)}
              >
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <FileText className="h-6 w-6 text-primary" />
                    <Badge variant="secondary">{exercise.difficulty}</Badge>
                  </div>
                  <CardTitle className="text-lg mt-2">{exercise.title}</CardTitle>
                  <CardDescription>
                    {exercise.module} • {exercise.strategy}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-600">{exercise.duration}</span>
                    <span className="text-primary text-sm font-medium">Zobacz instrukcję →</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="kwestionariusze" className="space-y-6">
          <div className="grid grid-cols-1 gap-6">
            {questionnaires.map((questionnaire) => (
              <Card 
                key={questionnaire.id} 
                className="hover:shadow-lg transition-shadow cursor-pointer"
                onClick={() => navigate(`/biblioteka/kwestionariusz/${questionnaire.id}`)}
              >
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="bg-primary/10 p-3 rounded-lg">
                        <ClipboardList className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <CardTitle className="text-xl">{questionnaire.name}</CardTitle>
                        <p className="text-sm text-slate-600 mt-1">{questionnaire.fullName}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge variant="outline">{questionnaire.items} pozycji</Badge>
                      <p className="text-sm text-slate-600 mt-1">{questionnaire.duration}</p>
                    </div>
                  </div>
                  <CardDescription className="mt-4 text-base">{questionnaire.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <p className="text-sm font-medium text-slate-700">Skale pomiarowe:</p>
                    <div className="flex flex-wrap gap-2">
                      {questionnaire.scales.map((scale, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {scale}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Library;