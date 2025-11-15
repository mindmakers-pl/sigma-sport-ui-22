import { LayoutDashboard, Users, Building, Settings, BookOpen } from "lucide-react";
import { NavLink } from "react-router-dom";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarFooter,
} from "@/components/ui/sidebar";
import { useIsMobile } from "@/hooks/use-mobile";

const navigationItems = [
  { title: "Panel Trenera", url: "/", icon: LayoutDashboard },
  { title: "Zawodnicy", url: "/zawodnicy", icon: Users },
  { title: "Kluby", url: "/kluby", icon: Building },
  { title: "Biblioteka", url: "/biblioteka", icon: BookOpen },
];

export function AppSidebar() {
  const isMobile = useIsMobile();

  return (
    <Sidebar 
      collapsible={isMobile ? "offcanvas" : "icon"}
      className="border-r-0 bg-sidebar-primary text-sidebar-primary-foreground transition-all duration-300 ease-in-out"
    >
      <SidebarContent className="bg-sidebar-primary">
        <SidebarGroup className="pt-6">
          {/* Logo */}
          <div className="px-6 pb-6 overflow-hidden">
            <h2 className="font-bold text-sidebar-primary-foreground text-xl whitespace-nowrap">
              Sigma Sport
            </h2>
          </div>

          {/* Navigation Items */}
          <SidebarGroupContent>
            <SidebarMenu className="gap-1 px-3">
              {navigationItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton 
                    asChild 
                    className="h-11 px-3 text-sidebar-primary-foreground hover:bg-sidebar-primary-foreground/15 data-[active=true]:bg-sidebar-primary-foreground/20 transition-colors duration-200"
                  >
                    <NavLink to={item.url} end className="flex items-center gap-3">
                      <item.icon className="h-5 w-5 shrink-0 text-sidebar-primary-foreground" />
                      <span className="font-medium text-sidebar-primary-foreground whitespace-nowrap">
                        {item.title}
                      </span>
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      {/* Footer */}
      <SidebarFooter className="bg-sidebar-primary border-t border-sidebar-primary-foreground/10">
        <SidebarMenu className="px-3">
          <SidebarMenuItem>
            <SidebarMenuButton 
              asChild 
              className="h-11 px-3 text-sidebar-primary-foreground hover:bg-sidebar-primary-foreground/15 transition-colors duration-200"
            >
              <NavLink to="/ustawienia" className="flex items-center gap-3">
                <Settings className="h-5 w-5 shrink-0 text-sidebar-primary-foreground" />
                <span className="font-medium text-sidebar-primary-foreground whitespace-nowrap">
                  Ustawienia
                </span>
              </NavLink>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
