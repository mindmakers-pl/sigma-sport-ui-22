import { LayoutDashboard, Users, Building, Settings, BookOpen, Activity } from "lucide-react";
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
      className="bg-slate-900 border-r border-slate-800 group-data-[collapsible=icon]:w-20 group-data-[collapsible=icon]:hover:w-64"
    >
      <SidebarContent>
        <SidebarGroup>
          <div className="px-4 py-4 flex items-center justify-center group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:hover:justify-start group-data-[collapsible=icon]:hover:px-6">
            <Activity className="h-8 w-8 text-primary shrink-0" />
            <div className="ml-3 group-data-[collapsible=icon]:hidden group-data-[collapsible=icon]:group-hover/sidebar:block">
              <h2 className="font-bold text-white text-xl">
                Sigma Sport
              </h2>
            </div>
          </div>
          <SidebarGroupContent>
            <SidebarMenu>
              {navigationItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild className="text-slate-300 hover:bg-slate-800 hover:text-white data-[active=true]:bg-primary data-[active=true]:text-white h-12">
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
            <SidebarMenuButton asChild className="text-slate-300 hover:bg-slate-800 hover:text-white h-12">
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
