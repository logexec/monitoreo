import * as React from "react";
import { Truck } from "lucide-react";

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
import { data as auth } from "@/lib/auth";

// This is sample data.
const data = {
  usuario: {
    name: "Usuario",
    email: "ejemplo@logex.ec",
    avatar: "/avatars/shadcn.jpg",
  },
  navMain: [
    {
      title: "Viajes",
      url: "#",
      icon: Truck,
      isActive: true,
      items: [
        {
          title: "Lista de viajes",
          url: "/",
        },
        {
          title: "Nuevo viaje",
          url: "/new-trip",
        },
        {
          title: "Cargar viajes (Excel)",
          url: "/upload",
        },
        {
          title: "Historial",
          url: "/updates",
        },
      ],
    },
  ],
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const user = {
    name: `${auth.session!.user.email!.split(".")[0]} ${
      auth.session!.user.email!.split(".")[1].split("@")[0]
    }`,
    email: auth.session!.user.email!,
    avatar: "/avatars/shadcn.jpg",
  };

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader className="p-5">
        <Link to={"/"} className="block">
          <img src={logo} alt="Logex Logo" />
        </Link>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
        {/* <NavProjects projects={data.projects} /> */}
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
