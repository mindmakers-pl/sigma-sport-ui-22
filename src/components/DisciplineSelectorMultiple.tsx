import { useState, useEffect } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";

interface DisciplineSelectorMultipleProps {
  value: string[];
  onChange: (value: string[]) => void;
  label?: string;
}

const DisciplineSelectorMultiple = ({ value, onChange, label = "Dyscypliny sportu" }: DisciplineSelectorMultipleProps) => {
  const [disciplines, setDisciplines] = useState<string[]>([]);
  const [selectedDiscipline, setSelectedDiscipline] = useState("");
  const [customDiscipline, setCustomDiscipline] = useState("");
  const [showCustomInput, setShowCustomInput] = useState(false);

  // Fetch unique disciplines from Supabase
  useEffect(() => {
    const fetchDisciplines = async () => {
      const uniqueDisciplines = new Set<string>();
      
      try {
        // From athletes
        const { data: athletes } = await supabase
          .from('athletes')
          .select('discipline');
        
        if (athletes) {
          athletes.forEach(athlete => {
            if (athlete.discipline && athlete.discipline.trim() !== "") {
              uniqueDisciplines.add(athlete.discipline);
            }
          });
        }
        
        // From clubs
        const { data: clubs } = await supabase
          .from('clubs')
          .select('disciplines');
        
        if (clubs) {
          clubs.forEach(club => {
            if (club.disciplines && Array.isArray(club.disciplines)) {
              club.disciplines.forEach(disc => {
                if (disc && disc.trim() !== "") {
                  uniqueDisciplines.add(disc);
                }
              });
            }
          });
        }
      } catch (error) {
        console.error('Error fetching disciplines:', error);
      }
      
      setDisciplines(Array.from(uniqueDisciplines).sort());
    };
    
    fetchDisciplines();
  }, []);

  const handleAddDiscipline = () => {
    let disciplineToAdd = "";
    
    if (showCustomInput && customDiscipline.trim() !== "") {
      disciplineToAdd = customDiscipline.trim();
    } else if (selectedDiscipline && selectedDiscipline !== "custom") {
      disciplineToAdd = selectedDiscipline;
    }
    
    if (disciplineToAdd && !value.includes(disciplineToAdd)) {
      onChange([...value, disciplineToAdd]);
      setSelectedDiscipline("");
      setCustomDiscipline("");
      setShowCustomInput(false);
    }
  };

  const handleRemoveDiscipline = (discipline: string) => {
    onChange(value.filter(d => d !== discipline));
  };

  const handleSelectChange = (selected: string) => {
    if (selected === "custom") {
      setShowCustomInput(true);
      setSelectedDiscipline("");
    } else {
      setSelectedDiscipline(selected);
      setShowCustomInput(false);
    }
  };

  return (
    <div>
      <Label>{label}</Label>
      <div className="flex gap-2 mt-2">
        {!showCustomInput ? (
          <Select value={selectedDiscipline} onValueChange={handleSelectChange}>
            <SelectTrigger className="flex-1">
              <SelectValue placeholder="Wybierz dyscyplinę" />
            </SelectTrigger>
            <SelectContent>
              {disciplines
                .filter(d => !value.includes(d))
                .map((discipline) => (
                  <SelectItem key={discipline} value={discipline}>
                    {discipline}
                  </SelectItem>
                ))}
              <SelectItem value="custom">Inna (wpisz)</SelectItem>
            </SelectContent>
          </Select>
        ) : (
          <div className="flex-1 space-y-2">
            <Input
              value={customDiscipline}
              onChange={(e) => setCustomDiscipline(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddDiscipline())}
              placeholder="Wpisz nazwę dyscypliny"
            />
            <button
              type="button"
              onClick={() => {
                setShowCustomInput(false);
                setCustomDiscipline("");
              }}
              className="text-sm text-primary hover:underline"
            >
              Wybierz z listy
            </button>
          </div>
        )}
        <Button type="button" onClick={handleAddDiscipline} variant="outline">
          Dodaj
        </Button>
      </div>
      <div className="flex flex-wrap gap-2 mt-2">
        {value.map(discipline => (
          <Badge 
            key={discipline} 
            variant="secondary" 
            className="cursor-pointer" 
            onClick={() => handleRemoveDiscipline(discipline)}
          >
            {discipline} ×
          </Badge>
        ))}
      </div>
    </div>
  );
};

export default DisciplineSelectorMultiple;
