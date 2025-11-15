import { Link, useLocation } from "react-router-dom";
import { Users, Building2, BookOpen, Settings, LayoutDashboard, Menu, UserCircle, Shield } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";

interface SideNavProps {
  isExpanded: boolean;
  onToggle: () => void;
  onHoverChange?: (isHovered: boolean) => void;
}

const SideNav = ({ isExpanded, onToggle, onHoverChange }: SideNavProps) => {
  const location = useLocation();
  const [isHovered, setIsHovered] = useState(false);
  const [userRole, setUserRole] = useState<string>("trainer");
  
  const handleMouseEnter = () => {
    setIsHovered(true);
    onHoverChange?.(true);
  };
  
  const handleMouseLeave = () => {
    setIsHovered(false);
    onHoverChange?.(false);
  };
  
  useEffect(() => {
    const role = localStorage.getItem("userRole") || "trainer";
    setUserRole(role);
    
    // Nasłuchuj zmian roli
    const handleStorageChange = () => {
      const newRole = localStorage.getItem("userRole") || "trainer";
      setUserRole(newRole);
    };
    
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [location.pathname]);

  const allNavItems = [
    { path: "/", label: "Kokpit", icon: LayoutDashboard, roles: ["trainer"] },
    { path: "/panel-zawodnika", label: "Kokpit", icon: UserCircle, roles: ["athlete"] },
    { path: "/panel-admin", label: "Admin", icon: Shield, roles: ["admin"] },
    { path: "/zawodnicy", label: "Zawodnicy", icon: Users, roles: ["trainer", "admin"] },
    { path: "/kluby", label: "Kluby", icon: Building2, roles: ["trainer", "admin"] },
    { path: "/biblioteka", label: "Biblioteka", icon: BookOpen, roles: ["trainer", "athlete", "admin"] },
    { path: "/ustawienia", label: "Ustawienia", icon: Settings, roles: ["trainer", "athlete", "admin"] },
  ];

  const navItems = allNavItems.filter(item => item.roles.includes(userRole));

  const showLabels = isExpanded || isHovered;

  return (
    <aside
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className={cn(
        "fixed left-0 top-0 bottom-0 bg-slate-900 border-r border-slate-800 transition-all duration-300 ease-in-out z-50",
        showLabels ? "w-64" : "w-16"
      )}
    >
      {/* Mobile/Tablet hamburger */}
      <div className="h-16 flex items-center px-3 border-b border-slate-800 lg:hidden">
        <Button
          variant="ghost"
          size="icon"
          onClick={onToggle}
          className="text-slate-300 hover:text-white hover:bg-slate-800"
        >
          <Menu className="h-5 w-5" />
        </Button>
      </div>

      {/* Desktop spacer */}
      <div className="hidden lg:block h-16 border-b border-slate-800" />

      <nav className="flex flex-col gap-1 p-2 flex-1 overflow-y-auto">
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
