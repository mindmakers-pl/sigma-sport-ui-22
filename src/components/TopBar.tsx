import { Activity, Menu, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

interface TopBarProps {
  onToggleSidebar: () => void;
  isSidebarExpanded: boolean;
}

const TopBar = ({ onToggleSidebar, isSidebarExpanded }: TopBarProps) => {
  const [currentRole, setCurrentRole] = useState("Panel Trenera");
  
  useEffect(() => {
    const updateRole = () => {
      const role = localStorage.getItem("userRole") || "trainer";
      switch(role) {
        case "athlete":
          setCurrentRole("Panel Zawodnika");
          break;
        case "admin":
          setCurrentRole("Panel Admin");
          break;
        default:
          setCurrentRole("Panel Trenera");
      }
    };
    
    updateRole();
    window.addEventListener('storage', updateRole);
    return () => window.removeEventListener('storage', updateRole);
  }, []);

  return (
    <header 
      className={cn(
        "fixed top-0 right-0 h-16 bg-background border-b border-border z-40 transition-all duration-300",
        isSidebarExpanded ? "left-64" : "left-16"
      )}
    >
      <div className="flex items-center justify-end h-full px-4">

        {/* Role Selector */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button 
              variant="outline" 
              className="gap-2 bg-background hover:bg-muted"
            >
              <span className="font-medium">{currentRole}</span>
              <ChevronDown className="h-4 w-4 opacity-50" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48 bg-popover z-50">
            <DropdownMenuItem 
              className="cursor-pointer"
              onClick={() => {
                localStorage.setItem("userRole", "trainer");
                window.location.href = "/";
              }}
            >
              Panel Trenera
            </DropdownMenuItem>
            <DropdownMenuItem 
              className="cursor-pointer"
              onClick={() => {
                localStorage.setItem("userRole", "athlete");
                window.location.href = "/panel-zawodnika";
              }}
            >
              Panel Zawodnika
            </DropdownMenuItem>
            <DropdownMenuItem 
              className="cursor-pointer"
              onClick={() => {
                localStorage.setItem("userRole", "admin");
                window.location.href = "/panel-admin";
              }}
            >
              Panel Admin
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
};

export default TopBar;
