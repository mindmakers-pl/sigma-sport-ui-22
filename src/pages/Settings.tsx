import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

const Settings = () => {
  return (
    <div className="max-w-4xl">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-slate-900 mb-2">Ustawienia</h2>
        <p className="text-slate-600">Zarządzaj swoim kontem i preferencjami</p>
      </div>

      <div className="space-y-6">
        <Card className="border-slate-200 bg-white">
          <CardHeader>
            <CardTitle className="text-slate-900">Profil</CardTitle>
            <CardDescription>Zaktualizuj swoje dane osobowe</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">Imię</Label>
                <Input id="firstName" placeholder="Jan" className="bg-slate-50 border-slate-200" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Nazwisko</Label>
                <Input id="lastName" placeholder="Kowalski" className="bg-slate-50 border-slate-200" />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" placeholder="jan@example.com" className="bg-slate-50 border-slate-200" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Telefon</Label>
              <Input id="phone" type="tel" placeholder="+48 123 456 789" className="bg-slate-50 border-slate-200" />
            </div>
            <Button>Zapisz zmiany</Button>
          </CardContent>
        </Card>

        <Card className="border-slate-200 bg-white">
          <CardHeader>
            <CardTitle className="text-slate-900">Powiadomienia</CardTitle>
            <CardDescription>Zarządzaj preferencjami powiadomień</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-slate-900">Powiadomienia email</p>
                <p className="text-sm text-slate-600">Otrzymuj aktualizacje na email</p>
              </div>
              <Switch />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-slate-900">Przypomnienia o treningach</p>
                <p className="text-sm text-slate-600">Powiadomienia o nadchodzących sesjach</p>
              </div>
              <Switch />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-slate-900">Podsumowania tygodniowe</p>
                <p className="text-sm text-slate-600">Cotygodniowy raport aktywności</p>
              </div>
              <Switch defaultChecked />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Settings;
