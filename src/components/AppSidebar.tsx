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
  useSidebar,
} from "@/components/ui/sidebar";
import { useIsMobile } from "@/hooks/use-mobile";

const navigationItems = [
  { title: "Kokpit", url: "/", icon: LayoutDashboard },
  { title: "Zawodnicy", url: "/zawodnicy", icon: Users },
  { title: "Kluby", url: "/kluby", icon: Building },
  { title: "Biblioteka", url: "/biblioteka", icon: BookOpen },
];

export function AppSidebar() {
  const { open } = useSidebar();
  const isMobile = useIsMobile();

  return (
    <Sidebar 
      collapsible={isMobile ? "offcanvas" : "icon"}
      className="bg-sidebar-primary z-50 group-data-[collapsible=icon]:hover:w-72"
    >
      <SidebarContent>
        <SidebarGroup>
          <div className="px-6 pt-4 pb-2 group-data-[collapsible=icon]:hidden">
            <h2 className="font-bold text-sidebar-primary-foreground text-xl transition-opacity">
              Sigma Sport
            </h2>
          </div>
          <div className="h-4 group-data-[collapsible=icon]:block hidden"></div>
          <SidebarGroupContent>
            <SidebarMenu>
              {navigationItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild className="text-sidebar-primary-foreground/80 hover:bg-sidebar-primary-foreground/10 hover:text-sidebar-primary-foreground data-[active=true]:bg-sidebar-primary-foreground/20 data-[active=true]:text-sidebar-primary-foreground">
                    <NavLink to={item.url} end>
                      <item.icon className="h-6 w-6" />
                      <span>{item.title}</span>
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild className="text-sidebar-primary-foreground/80 hover:bg-sidebar-primary-foreground/10 hover:text-sidebar-primary-foreground">
              <NavLink to="/ustawienia">
                <Settings className="h-6 w-6" />
                <span>Ustawienia</span>
              </NavLink>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
