import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useState, useEffect } from "react";
import { toast } from "sonner";

const Settings = () => {
  const [profile, setProfile] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: ''
  });

  const [notifications, setNotifications] = useState({
    emailNotifications: false,
    trainingReminders: false,
    weeklySummary: true
  });

  // Załaduj dane z localStorage przy montowaniu
  useEffect(() => {
    const storedProfile = localStorage.getItem('userProfile');
    if (storedProfile) {
      setProfile(JSON.parse(storedProfile));
    }

    const storedNotifications = localStorage.getItem('userNotifications');
    if (storedNotifications) {
      setNotifications(JSON.parse(storedNotifications));
    }
  }, []);

  const handleSaveProfile = () => {
    localStorage.setItem('userProfile', JSON.stringify(profile));
    toast.success("Dane profilu zostały zapisane");
  };

  const handleSaveNotifications = () => {
    localStorage.setItem('userNotifications', JSON.stringify(notifications));
    toast.success("Preferencje powiadomień zostały zapisane");
  };

  return (
    <div className="max-w-3xl">
      <h1 className="text-4xl font-bold mb-2">Ustawienia</h1>
      <p className="text-muted-foreground mb-8">Zarządzaj swoim kontem i preferencjami</p>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Profil</CardTitle>
          <CardDescription>Zaktualizuj swoje dane osobowe</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="firstName">Imię</Label>
              <Input 
                id="firstName" 
                placeholder="Jan"
                value={profile.firstName}
                onChange={(e) => setProfile({ ...profile, firstName: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName">Nazwisko</Label>
              <Input 
                id="lastName" 
                placeholder="Kowalski"
                value={profile.lastName}
                onChange={(e) => setProfile({ ...profile, lastName: e.target.value })}
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input 
              id="email" 
              type="email" 
              placeholder="jan@example.com"
              value={profile.email}
              onChange={(e) => setProfile({ ...profile, email: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone">Telefon</Label>
            <Input 
              id="phone" 
              type="tel" 
              placeholder="+48 123 456 789"
              value={profile.phone}
              onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
            />
          </div>
          <div>
            <Button 
              className="bg-primary text-primary-foreground hover:bg-primary/90"
              onClick={handleSaveProfile}
            >
              Zapisz zmiany
            </Button>
          </div>
          <div className="pt-4 border-t">
            <Button variant="outline" className="w-full">Zmień hasło</Button>
          </div>
        </CardContent>
      </Card>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Powiadomienia</CardTitle>
          <CardDescription>Zarządzaj preferencjami powiadomień</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Powiadomienia email</p>
              <p className="text-sm text-muted-foreground">Otrzymuj aktualizacje na email</p>
            </div>
            <Switch 
              checked={notifications.emailNotifications}
              onCheckedChange={(checked) => {
                setNotifications({ ...notifications, emailNotifications: checked });
                handleSaveNotifications();
              }}
            />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Przypomnienia o treningach</p>
              <p className="text-sm text-muted-foreground">Powiadomienia o nadchodzących sesjach</p>
            </div>
            <Switch 
              checked={notifications.trainingReminders}
              onCheckedChange={(checked) => {
                setNotifications({ ...notifications, trainingReminders: checked });
                handleSaveNotifications();
              }}
            />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Podsumowania tygodniowe</p>
              <p className="text-sm text-muted-foreground">Cotygodniowy raport aktywności</p>
            </div>
            <Switch 
              checked={notifications.weeklySummary}
              onCheckedChange={(checked) => {
                setNotifications({ ...notifications, weeklySummary: checked });
                handleSaveNotifications();
              }}
            />
          </div>
        </CardContent>
      </Card>

      <Card className="border-2 border-destructive/20">
        <CardContent className="pt-6">
          <Button variant="destructive" className="w-full">
            Wyloguj
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default Settings;
