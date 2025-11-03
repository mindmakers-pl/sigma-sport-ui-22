import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Building } from "lucide-react";

const Clubs = () => {
  const clubs = [
    { id: 1, name: "KS Górnik", members: 12, city: "Zabrze" },
    { id: 2, name: "MKS Cracovia", members: 8, city: "Kraków" },
    { id: 3, name: "Wisła Kraków", members: 15, city: "Kraków" },
  ];

  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h2 className="text-3xl font-bold text-slate-900 mb-2">Kluby</h2>
          <p className="text-slate-600">Zarządzaj klubami sportowymi</p>
        </div>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          Dodaj klub
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {clubs.map((club) => (
          <Card key={club.id} className="border-slate-200 bg-white hover:shadow-lg transition-all">
            <CardHeader>
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                <Building className="h-6 w-6 text-primary" />
              </div>
              <CardTitle className="text-slate-900">{club.name}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 mb-4">
                <p className="text-sm text-slate-600">
                  Miasto: <span className="font-medium text-slate-900">{club.city}</span>
                </p>
                <p className="text-sm text-slate-600">
                  Zawodnicy: <span className="font-medium text-slate-900">{club.members}</span>
                </p>
              </div>
              <Button variant="outline" className="w-full">
                Zobacz szczegóły
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default Clubs;
