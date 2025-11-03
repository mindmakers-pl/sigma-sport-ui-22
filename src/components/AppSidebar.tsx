import { LayoutDashboard, Users, Building, Settings } from "lucide-react";
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

const navigationItems = [
  { title: "Kokpit", url: "/", icon: LayoutDashboard },
  { title: "Zawodnicy", url: "/zawodnicy", icon: Users },
  { title: "Kluby", url: "/kluby", icon: Building },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const isCollapsed = state === "collapsed";

  return (
    <Sidebar className="bg-slate-900 border-r border-slate-800">
      <SidebarContent>
        <SidebarGroup>
          <div className="px-6 py-6">
            <h2 className={`font-bold text-white transition-all ${isCollapsed ? "text-lg" : "text-xl"}`}>
              {isCollapsed ? "SS" : "Sigma Sport"}
            </h2>
            {!isCollapsed && (
              <p className="text-sm text-slate-400 mt-1">Panel trenera</p>
            )}
          </div>
          <SidebarGroupContent>
            <SidebarMenu>
              {navigationItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild className="text-slate-900 hover:bg-slate-800 hover:text-white data-[active=true]:bg-primary data-[active=true]:text-white">
                    <NavLink to={item.url} end>
                      {({ isActive }) => (
                        <>
                          <item.icon className="h-5 w-5" />
                          {!isCollapsed && <span>{item.title}</span>}
                        </>
                      )}
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
            <SidebarMenuButton asChild className="text-slate-900 hover:bg-slate-800 hover:text-white">
              <NavLink to="/ustawienia">
                <Settings className="h-5 w-5" />
                {!isCollapsed && <span>Ustawienia</span>}
              </NavLink>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
