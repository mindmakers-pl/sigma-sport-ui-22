import { Activity, Menu, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

interface TopBarProps {
  onToggleSidebar: () => void;
  isSidebarExpanded: boolean;
}

const TopBar = ({ onToggleSidebar, isSidebarExpanded }: TopBarProps) => {
  // To będzie później dynamiczne na podstawie zalogowanego użytkownika
  const currentRole = "Panel Trenera"; // lub "Panel Zawodnika" / "Panel Admin"

  return (
    <header className="fixed top-0 left-0 right-0 h-16 bg-background border-b border-border z-40">
      <div className="flex items-center justify-between h-full px-4">
        {/* Left: Logo & Menu Toggle */}
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={onToggleSidebar}
            className="lg:hidden"
          >
            <Menu className="h-5 w-5" />
          </Button>
          
          <div className="flex items-center gap-2">
            <Activity className="h-6 w-6 text-primary" />
            <span className="text-xl font-bold text-foreground hidden sm:inline">
              Sigma Sport
            </span>
          </div>
        </div>

        {/* Right: Role Selector */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button 
              variant="outline" 
              className="gap-2 bg-background hover:bg-muted"
              onClick={onToggleSidebar}
            >
              <span className="font-medium">{currentRole}</span>
              <ChevronDown className="h-4 w-4 opacity-50" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48 bg-popover z-50">
            <DropdownMenuItem className="cursor-pointer">
              Panel Trenera
            </DropdownMenuItem>
            <DropdownMenuItem className="cursor-pointer">
              Panel Zawodnika
            </DropdownMenuItem>
            <DropdownMenuItem className="cursor-pointer">
              Panel Admin
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
};

export default TopBar;
