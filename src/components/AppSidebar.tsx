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
      className="bg-accent z-50 group-data-[collapsible=icon]:hover:w-72"
    >
      <SidebarContent>
        <SidebarGroup>
          <div className="px-6 py-6">
            <h2 className="font-bold text-accent-foreground text-xl group-data-[collapsible=icon]:opacity-0 group-data-[collapsible=icon]:group-hover/sidebar:opacity-100 transition-opacity">
              Sigma Sport
            </h2>
            <p className="text-sm text-accent-foreground/60 mt-1 group-data-[collapsible=icon]:opacity-0 group-data-[collapsible=icon]:group-hover/sidebar:opacity-100 transition-opacity">
              Panel trenera
            </p>
          </div>
          <SidebarGroupContent>
            <SidebarMenu>
              {navigationItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild className="text-accent-foreground/80 hover:bg-accent-foreground/10 hover:text-accent-foreground data-[active=true]:bg-accent-foreground/20 data-[active=true]:text-accent-foreground">
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
            <SidebarMenuButton asChild className="text-accent-foreground/80 hover:bg-accent-foreground/10 hover:text-accent-foreground">
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
