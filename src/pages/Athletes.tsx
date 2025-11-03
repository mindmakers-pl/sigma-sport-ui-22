import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Search } from "lucide-react";
import { Input } from "@/components/ui/input";

const Athletes = () => {
  const athletes = [
    { id: 1, name: "Jan Kowalski", club: "KS Górnik", performance: "95%", status: "Aktywny" },
    { id: 2, name: "Anna Nowak", club: "MKS Cracovia", performance: "92%", status: "Aktywny" },
    { id: 3, name: "Piotr Wiśniewski", club: "KS Górnik", performance: "89%", status: "Aktywny" },
    { id: 4, name: "Maria Kowalczyk", club: "Wisła Kraków", performance: "87%", status: "Nieaktywny" },
  ];

  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h2 className="text-3xl font-bold text-slate-900 mb-2">Zawodnicy</h2>
          <p className="text-slate-600">Zarządzaj swoimi zawodnikami</p>
        </div>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          Dodaj zawodnika
        </Button>
      </div>

      <Card className="border-slate-200 bg-white mb-6">
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input 
              placeholder="Szukaj zawodnika..." 
              className="pl-10 bg-slate-50 border-slate-200"
            />
          </div>
        </CardContent>
      </Card>

      <Card className="border-slate-200 bg-white">
        <CardHeader>
          <CardTitle className="text-slate-900">Lista zawodników</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-200">
                  <th className="text-left py-3 px-4 text-sm font-semibold text-slate-900">Zawodnik</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-slate-900">Klub</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-slate-900">Wydajność</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-slate-900">Status</th>
                  <th className="text-right py-3 px-4 text-sm font-semibold text-slate-900">Akcje</th>
                </tr>
              </thead>
              <tbody>
                {athletes.map((athlete) => (
                  <tr key={athlete.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white font-bold">
                          {athlete.name.charAt(0)}
                        </div>
                        <span className="font-medium text-slate-900">{athlete.name}</span>
                      </div>
                    </td>
                    <td className="py-4 px-4 text-slate-600">{athlete.club}</td>
                    <td className="py-4 px-4">
                      <span className="font-semibold text-primary">{athlete.performance}</span>
                    </td>
                    <td className="py-4 px-4">
                      <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
                        athlete.status === "Aktywny" 
                          ? "bg-emerald-100 text-emerald-700" 
                          : "bg-slate-100 text-slate-700"
                      }`}>
                        {athlete.status}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-right">
                      <Button variant="ghost" size="sm">
                        Szczegóły
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Athletes;
