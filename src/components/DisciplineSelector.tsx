import { useState, useEffect } from "react";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";

interface DisciplineSelectorProps {
  value: string;
  onChange: (value: string) => void;
  label?: string;
  required?: boolean;
}

const DisciplineSelector = ({ value, onChange, label = "Dyscyplina", required = false }: DisciplineSelectorProps) => {
  const [disciplines, setDisciplines] = useState<string[]>([]);
  const [isCustom, setIsCustom] = useState(false);
  const [customValue, setCustomValue] = useState("");

  // Pobierz unikalne dyscypliny z localStorage
  useEffect(() => {
    const getDisciplines = () => {
      const uniqueDisciplines = new Set<string>();
      
      // Z zawodników
      const storedAthletes = localStorage.getItem('athletes');
      if (storedAthletes) {
        const athletesData = JSON.parse(storedAthletes);
        athletesData.forEach((athlete: any) => {
          if (athlete.discipline && athlete.discipline.trim() !== "") {
            uniqueDisciplines.add(athlete.discipline);
          }
        });
      }
      
      // Z klubów
      const storedClubs = localStorage.getItem('clubs');
      if (storedClubs) {
        const clubsData = JSON.parse(storedClubs);
        clubsData.forEach((club: any) => {
          if (club.disciplines && Array.isArray(club.disciplines)) {
            club.disciplines.forEach((disc: string) => {
              if (disc && disc.trim() !== "") {
                uniqueDisciplines.add(disc);
              }
            });
          }
        });
      }
      
      return Array.from(uniqueDisciplines).sort();
    };
    
    setDisciplines(getDisciplines());
  }, []);

  // Sprawdź czy obecna wartość jest w liście
  useEffect(() => {
    if (value && !disciplines.includes(value) && value !== "custom") {
      setIsCustom(true);
      setCustomValue(value);
    } else if (value === "custom") {
      setIsCustom(true);
    } else {
      setIsCustom(false);
    }
  }, [value, disciplines]);

  const handleSelectChange = (selectedValue: string) => {
    if (selectedValue === "custom") {
      setIsCustom(true);
      setCustomValue("");
      onChange("");
    } else {
      setIsCustom(false);
      onChange(selectedValue);
    }
  };

  const handleCustomInputChange = (inputValue: string) => {
    setCustomValue(inputValue);
    onChange(inputValue);
  };

  return (
    <div>
      <Label className="text-slate-900 font-semibold">
        {label} {required && <span className="text-red-500">*</span>}
      </Label>
      {!isCustom ? (
        <Select value={value} onValueChange={handleSelectChange}>
          <SelectTrigger className="mt-2">
            <SelectValue placeholder="Wybierz dyscyplinę" />
          </SelectTrigger>
          <SelectContent>
            {disciplines.map((discipline) => (
              <SelectItem key={discipline} value={discipline}>
                {discipline}
              </SelectItem>
            ))}
            <SelectItem value="custom">Inna (wpisz)</SelectItem>
          </SelectContent>
        </Select>
      ) : (
        <div className="space-y-2">
          <Input
            value={customValue}
            onChange={(e) => handleCustomInputChange(e.target.value)}
            placeholder="Wpisz nazwę dyscypliny"
            className="mt-2"
          />
          <button
            type="button"
            onClick={() => {
              setIsCustom(false);
              onChange("");
            }}
            className="text-sm text-primary hover:underline"
          >
            Wybierz z listy
          </button>
        </div>
      )}
    </div>
  );
};

export default DisciplineSelector;
