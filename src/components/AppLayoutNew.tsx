import { ReactNode, useState } from "react";
import TopBar from "./TopBar";
import SideNav from "./SideNav";
import { cn } from "@/lib/utils";

interface AppLayoutNewProps {
  children: ReactNode;
}

const AppLayoutNew = ({ children }: AppLayoutNewProps) => {
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(false);
  const [isSidebarHovered, setIsSidebarHovered] = useState(false);

  const toggleSidebar = () => {
    setIsSidebarExpanded(!isSidebarExpanded);
  };

  const effectiveExpanded = isSidebarExpanded || isSidebarHovered;

  return (
    <div className="min-h-screen bg-background">
      <TopBar 
        onToggleSidebar={toggleSidebar}
        isSidebarExpanded={isSidebarExpanded}
      />
      
      <SideNav 
        isExpanded={isSidebarExpanded}
        onToggle={toggleSidebar}
        onHoverChange={setIsSidebarHovered}
      />
      
      <main 
        className={cn(
          "pt-16 transition-all duration-300",
          effectiveExpanded ? "ml-64" : "ml-16"
        )}
      >
        <div className="p-6 max-w-full overflow-x-hidden">
          {children}
        </div>
      </main>
    </div>
  );
};

export default AppLayoutNew;
