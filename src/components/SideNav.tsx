import { Link, useLocation } from "react-router-dom";
import { Users, Building2, BookOpen, Settings, LayoutDashboard, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";

interface SideNavProps {
  isExpanded: boolean;
  onToggle: () => void;
}

const SideNav = ({ isExpanded, onToggle }: SideNavProps) => {
  const location = useLocation();
  const [isHovered, setIsHovered] = useState(false);
  
  const navItems = [
    { path: "/", label: "Dashboard", icon: LayoutDashboard },
    { path: "/zawodnicy", label: "Zawodnicy", icon: Users },
    { path: "/kluby", label: "Kluby", icon: Building2 },
    { path: "/biblioteka", label: "Biblioteka", icon: BookOpen },
    { path: "/ustawienia", label: "Ustawienia", icon: Settings },
  ];

  const showLabels = isExpanded || isHovered;

  return (
    <aside
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={cn(
        "fixed left-0 top-16 bottom-0 bg-slate-900 border-r border-slate-800 transition-all duration-300 ease-in-out z-50",
        showLabels ? "w-64" : "w-16"
      )}
    >
      <nav className="flex flex-col gap-1 p-2 h-full">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path || 
                         (item.path !== "/" && location.pathname.startsWith(item.path));
          
          return (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                "flex items-center gap-3 px-3 py-3 rounded-lg transition-all duration-200",
                "text-slate-300 hover:bg-slate-800 hover:text-white",
                isActive && "bg-slate-800 text-white font-medium border-l-2 border-primary"
              )}
            >
              <Icon className="h-5 w-5 flex-shrink-0" />
              <span
                className={cn(
                  "whitespace-nowrap transition-all duration-300",
                  showLabels ? "opacity-100" : "opacity-0 w-0 overflow-hidden"
                )}
              >
                {item.label}
              </span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
};

export default SideNav;
