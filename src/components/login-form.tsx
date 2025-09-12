/* eslint-disable @typescript-eslint/no-explicit-any */
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { toast } from "sonner";
import api from "@/lib/axios";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

export function LoginForm({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"form">) {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const { setUser } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);

    try {
      const response = await api.post(`/login`, formData);
      setUser(response.data.user);
      toast.success(
        `¡Hola, ${
          response.data.user.name.split(" ")[0]
        }, la Torre de Control te da la bienvenida.`
      );
      navigate("/");
    } catch (error: any) {
      if (error?.response) {
        const status = error.response.status;
        const message = error.response.data?.message || "";

        if (status === 401) {
          if (
            message.toLowerCase().includes("credenciales") ||
            message.toLowerCase().includes("incorrecto") ||
            message.toLowerCase().includes("no autorizado")
          ) {
            toast.error("Usuario o contraseña incorrectos.");
          } else {
            toast.error(
              "La sesión ha expirado. Por favor, vuelve a identificarte."
            );
          }
        } else {
          toast.error(message || "Error inesperado, intenta nuevamente.");
        }
        console.error("Error login:", error.response.data);
      } else {
        toast.error("No se pudo conectar con el servidor.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({
      ...prev,
      [event.target.name]: event.target.value,
    }));
  };

  return (
    <form
      className={cn("flex flex-col gap-6", className)}
      {...props}
      onSubmit={handleLogin}
    >
      <div className="flex flex-col items-center gap-2 text-center">
        <h1 className="text-2xl font-bold">Inicia sesión en tu cuenta</h1>
        <p className="text-balance text-sm text-muted-foreground">
          Escribe tu email para ingresar en tu cuenta
        </p>
      </div>
      <div className="grid gap-6">
        <div className="grid gap-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            placeholder="alguien@logex.ec"
            required
            name="email"
            value={formData.email}
            onChange={handleInputChange}
          />
        </div>
        <div className="grid gap-2">
          <Input
            id="password"
            type="password"
            required
            name="password"
            placeholder="Contraseña"
            value={formData.password}
            onChange={handleInputChange}
          />
        </div>
        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? "Iniciando sesión..." : "Identificarse"}
        </Button>
      </div>
    </form>
  );
}
