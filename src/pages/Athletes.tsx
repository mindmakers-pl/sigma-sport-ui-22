import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const Athletes = () => {
  const navigate = useNavigate();
  
  const athletes = [
    { id: 1, name: "Kowalski Jan", club: "KS Górnik" },
    { id: 2, name: "Nowak Anna", club: "MKS Cracovia" },
    { id: 3, name: "Wiśniewski Piotr", club: "KS Górnik" },
    { id: 4, name: "Kowalczyk Maria", club: "Wisła Kraków" },
    { id: 5, name: "Zieliński Tomasz", club: "Legia Warszawa" },
  ];

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-bold text-slate-900">Zawodnicy</h1>
        <Button>+ Dodaj Zawodnika</Button>
      </div>

      <div className="bg-white rounded-lg border border-slate-200">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="text-slate-900 font-semibold">Nazwisko i Imię</TableHead>
              <TableHead className="text-slate-900 font-semibold">Klub</TableHead>
              <TableHead className="text-slate-900 font-semibold text-right">Akcje</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {athletes.map((athlete) => (
              <TableRow key={athlete.id}>
                <TableCell className="font-medium text-slate-900">{athlete.name}</TableCell>
                <TableCell className="text-slate-600">{athlete.club}</TableCell>
                <TableCell className="text-right">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => navigate(`/zawodnicy/${athlete.id}`)}
                  >
                    Zobacz Profil
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default Athletes;
