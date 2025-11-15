import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

const BackButton = () => {
  const navigate = useNavigate();

  return (
    <Button
      variant="ghost"
      onClick={() => navigate(-1)}
      className="mb-4 gap-2 hover:bg-muted"
    >
      <ArrowLeft className="h-4 w-4" />
      Powrót
    </Button>
  );
};

export default BackButton;
