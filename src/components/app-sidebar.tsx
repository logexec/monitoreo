import * as React from "react";
import { LocateFixedIcon, Shield, Truck } from "lucide-react";
import { NavMain } from "@/components/nav-main";
import { NavUser } from "@/components/nav-user";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar";
import logo from "@/assets/logex_logo.png";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { NavDashboard } from "./nav-dashboard";

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { user, isLoading } = useAuth();

  if (isLoading || !user) return null; // No renderiza nada hasta obtener los datos

  const items = user.isAdmin
    ? [
        {
          title: "Administración",
          url: "#",
          icon: Shield,
          isActive: true,
          items: [{ title: "Usuarios", url: "/users" }],
        },
        {
          title: "Viajes",
          url: "#",
          icon: Truck,
          isActive: true,
          items: [
            { title: "Lista de viajes", url: "/trips" },
            // { title: "Nuevo viaje", url: "/new-trip" },
            // { title: "Cargar viajes (Excel)", url: "/upload" },
            { title: "Historial", url: "/updates" },
          ],
        },
        {
          title: "GPS",
          url: "#",
          icon: LocateFixedIcon,
          isActive: true,
          items: [{ title: "Historial de alertas", url: "/gps-history" }],
        },
      ]
    : [
        {
          title: "Viajes",
          url: "#",
          icon: Truck,
          isActive: true,
          items: [
            { title: "Lista de viajes", url: "/trips" },
            // { title: "Nuevo viaje", url: "/new-trip" },
            // { title: "Cargar viajes (Excel)", url: "/upload" },
            { title: "Historial", url: "/updates" },
          ],
        },
        {
          title: "GPS",
          url: "#",
          icon: LocateFixedIcon,
          isActive: true,
          items: [{ title: "Historial de alertas", url: "/gps-history" }],
        },
      ];

  return (
    <Sidebar collapsible="icon" {...props} className="z-50">
      <SidebarHeader className="p-5">
        <Link to={"/"} className="block">
          <img src={logo} alt="Logex Logo" />
        </Link>
      </SidebarHeader>
      <SidebarContent>
        <NavDashboard />
        <NavMain items={items} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
