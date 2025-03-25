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
import { getUser } from "@/lib/auth";

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const [user, setUser] = React.useState<{
    name: string;
    email: string;
  } | null>(null);

  React.useEffect(() => {
    async function fetchUser() {
      const authenticatedUser = await getUser();
      if (authenticatedUser) {
        setUser({
          name: authenticatedUser.name,
          email: authenticatedUser.email,
        });
      } else {
        window.location.href = "/login"; // Redirige si no está autenticado
      }
    }

    fetchUser();
  }, []);

  if (!user) return null; // No renderiza nada hasta obtener los datos

  return (
    <Sidebar collapsible="icon" {...props} className="z-40">
      <SidebarHeader className="p-5">
        <Link to={"/"} className="block">
          <img src={logo} alt="Logex Logo" />
        </Link>
      </SidebarHeader>
      <SidebarContent>
        <NavMain
          items={[
            {
              title: "Viajes",
              url: "#",
              icon: Truck,
              isActive: true,
              items: [
                { title: "Lista de viajes", url: "/" },
                { title: "Nuevo viaje", url: "/new-trip" },
                { title: "Cargar viajes (Excel)", url: "/upload" },
                { title: "Historial", url: "/updates" },
              ],
            },
          ]}
        />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
