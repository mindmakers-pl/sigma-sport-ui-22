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
      className="border-r-0 group-data-[collapsible=icon]:w-16 group-data-[collapsible=icon]:hover:w-56 transition-all duration-300"
    >
      <SidebarContent className="bg-sidebar-primary text-sidebar-primary-foreground">
        <SidebarGroup className="pt-6">
          <div className="px-6 pb-6 group-data-[collapsible=icon]:px-3 group-data-[collapsible=icon]:pb-4">
            <h2 className="font-bold text-sidebar-primary-foreground text-xl group-data-[collapsible=icon]:opacity-0 group-data-[collapsible=icon]:text-xs transition-all duration-200">
              Sigma Sport
            </h2>
          </div>
          <SidebarGroupContent>
            <SidebarMenu className="gap-1">
              {navigationItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton 
                    asChild 
                    className="h-11 text-sidebar-primary-foreground hover:bg-sidebar-primary-foreground/15 hover:text-sidebar-primary-foreground data-[active=true]:bg-sidebar-primary-foreground/20 data-[active=true]:text-sidebar-primary-foreground transition-colors duration-200"
                  >
                    <NavLink to={item.url} end>
                      <item.icon className="h-5 w-5 flex-shrink-0" />
                      <span className="font-medium whitespace-nowrap">{item.title}</span>
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="bg-sidebar-primary border-t border-sidebar-primary-foreground/10 text-sidebar-primary-foreground">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton 
              asChild 
              className="h-11 text-sidebar-primary-foreground hover:bg-sidebar-primary-foreground/15 hover:text-sidebar-primary-foreground transition-colors duration-200"
            >
              <NavLink to="/ustawienia">
                <Settings className="h-5 w-5 flex-shrink-0" />
                <span className="font-medium whitespace-nowrap">Ustawienia</span>
              </NavLink>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
