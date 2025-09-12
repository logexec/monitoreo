/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useMemo, useState } from "react";
import api from "@/lib/axios";
import {
  UserPlus,
  Save,
  Trash2,
  Edit2,
  Loader2,
  Search,
  AlertCircle,
  X,
  Check,
} from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import CopyToClipboardAlert from "./CopyToClipboardAlert";
import { useGlobalFilters } from "@/contexts/GlobalFilterContext";
import axios from "axios";

interface User {
  id: number;
  name: string;
  email: string;
}

const UserManagement: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [deleteConfirmUser, setDeleteConfirmUser] = useState<User | null>(null);
  const [notification, setNotification] = useState<{
    type: "error" | "success";
    message: string;
  } | null>(null);
  const [errors, setErrors] = useState<string | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

  const { filters, setFilters } = useGlobalFilters();

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    if (!notification) return;
    const t = setTimeout(() => setNotification(null), 3000);
    return () => clearTimeout(t);
  }, [notification]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const { data } = await api.get<User[]>("/users");
      if (Array.isArray(data)) {
        setUsers(data);
      } else {
        console.error("Expected users array, got:", data);
        setUsers([]);
        setNotification({
          type: "error",
          message: "Respuesta inesperada del servidor.",
        });
      }
    } catch (error: unknown) {
      console.error(error);
      setNotification({ type: "error", message: "Error al cargar operadores" });
    } finally {
      setLoading(false);
    }
  };

  const showNotification = (type: "error" | "success", message: string) => {
    setNotification({ type, message });
  };

  const handleAddDialogOpen = () => {
    setName("");
    setEmail("");
    setFilters((prev: any) => ({ ...prev, password: "" }));
    setIsAddDialogOpen(true);
  };

  const handleEditUser = (user: User) => {
    setName(user.name);
    setEmail(user.email);
    setEditingUser(user);
  };

  const addUser = async () => {
    if (!name || !email || !filters.password) {
      showNotification("error", "Nombre, email y contraseña son requeridos");
      return;
    }
    setSubmitting(true);
    try {
      await api.post("/users", { name, email, password: filters.password });
      await fetchUsers();
      setName("");
      setEmail("");
      setFilters((prev: any) => ({ ...prev, password: "" }));
      setIsAddDialogOpen(false);
      showNotification("success", "Operador añadido correctamente");
    } catch (error: unknown) {
      console.error(error);
      if (axios.isAxiosError(error) && error.response) {
        setErrors(
          (typeof error.response.data === "object" &&
            error.response.data &&
            "message" in error.response.data &&
            String((error.response.data as { message?: unknown }).message)) ||
            "Error en la solicitud"
        );
      } else {
        setErrors(error instanceof Error ? error.message : "Error inesperado");
      }
      showNotification("error", "Error al añadir operador");
    } finally {
      setSubmitting(false);
    }
  };

  const updateUser = async () => {
    if (!editingUser) return;
    if (!name || !email) {
      showNotification("error", "Nombre y email son requeridos");
      return;
    }
    setSubmitting(true);
    try {
      await api.put(`/users/${editingUser.id}`, { name, email });
      await fetchUsers();
      setName("");
      setEmail("");
      setEditingUser(null);
      showNotification("success", "Operador actualizado correctamente");
    } catch (error: unknown) {
      console.error(error);
      showNotification("error", "Error al actualizar operador");
    } finally {
      setSubmitting(false);
    }
  };

  const deleteUser = async () => {
    if (!deleteConfirmUser) return;
    setSubmitting(true);
    try {
      await api.delete(`/users/${deleteConfirmUser.id}`);
      await fetchUsers();
      setDeleteConfirmUser(null);
      showNotification("success", "Operador eliminado correctamente");
    } catch (error: unknown) {
      console.error(error);
      showNotification("error", "Error al eliminar operador");
    } finally {
      setSubmitting(false);
    }
  };

  const filteredUsers = useMemo(() => {
    if (!searchTerm) return users;
    const term = searchTerm.toLowerCase();
    return users.filter(
      (u) =>
        u.name.toLowerCase().includes(term) ||
        u.email.toLowerCase().includes(term)
    );
  }, [users, searchTerm]);

  return (
    <div className="w-full bg-white dark:bg-black">
      {/* Notificación */}
      {notification && (
        <div
          className={`fixed top-4 right-4 z-50 px-6 py-3 rounded-md shadow-lg flex items-center ${
            notification.type === "error"
              ? "bg-red-50 dark:bg-red-950 border-l-4 border-red-700 text-red-700 dark:border-red-300 dark:text-red-300"
              : "bg-slate-50 dark:bg-slate-950 border-l-4 border-slate-700 text-slate-700 dark:border-slate-300 dark:text-slate-300"
          }`}
        >
          <div className="mr-3">
            {notification.type === "error" ? (
              <AlertCircle className="h-5 w-5" />
            ) : (
              <Check className="h-5 w-5" />
            )}
          </div>
          <p className="text-sm font-medium">{notification.message}</p>
          <button
            onClick={() => setNotification(null)}
            className="ml-4 text-slate-500 hover:text-slate-700 dark:text-slate-300"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      <Card className="border-none shadow-none">
        <CardHeader className="pb-4">
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="text-2xl font-semibold text-slate-800 dark:text-slate-200">
                Control de Operadores
              </CardTitle>
              <p className="text-sm text-slate-500 mt-1">
                Sistema de gestión de operadores de monitorización de vehículos
              </p>
            </div>
            <Button
              onClick={handleAddDialogOpen}
              className="bg-slate-800 dark:bg-slate-200 hover:bg-slate-700 dark:hover:bg-slate-300 text-white dark:text-black"
            >
              <UserPlus className="h-4 w-4 mr-2" />
              Nuevo Operador
            </Button>
          </div>
        </CardHeader>

        <CardContent>
          <div className="mb-6 flex items-center">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 dark:text-slate-600 h-4 w-4" />
              <Input
                type="text"
                placeholder="Buscar operador..."
                value={searchTerm}
                className="pl-10 border-slate-300 dark:border-slate-700 focus:border-slate-500 focus:ring-slate-500"
                onChange={(e) => {
                  if (e.target.value.length > 20) return;
                  setSearchTerm(e.target.value);
                }}
              />
            </div>
            <div className="ml-4">
              <Badge className="bg-slate-100 dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 border-none">
                {filteredUsers.length}{" "}
                {filteredUsers.length === 1 ? "operador" : "operadores"}
              </Badge>
            </div>
          </div>

          {loading ? (
            <div className="flex justify-center items-center py-20">
              <Loader2 className="h-8 w-8 animate-spin text-slate-700 dark:text-slate-300" />
              <span className="ml-2 text-slate-600 dark:text-slate-400">
                Cargando operadores...
              </span>
            </div>
          ) : (
            <div className="rounded-md border border-slate-2 00 dark:border-slate-800 overflow-hidden">
              <div className="min-w-full divide-y divide-slate-200 dark:divide-slate-800">
                <div className="bg-slate-50 dark:bg-slate-950">
                  <div className="grid grid-cols-12 px-6 py-3">
                    <div className="col-span-5 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                      Nombre
                    </div>
                    <div className="col-span-5 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                      Email
                    </div>
                    <div className="col-span-2 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">
                      Acciones
                    </div>
                  </div>
                </div>
                <div className="bg-white dark:bg-black divide-y divide-slate-200 dark:divide-slate-800">
                  {filteredUsers.length === 0 ? (
                    <div className="px-6 py-12 text-center">
                      <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-900 mb-4">
                        <Search className="h-6 w-6 text-slate-400 dark:text-slate-600" />
                      </div>
                      <h3 className="text-sm font-medium text-slate-900 dark:text-slate-100">
                        No se encontraron operadores
                      </h3>
                      <p className="mt-1 text-sm text-slate-500">
                        {searchTerm
                          ? "No hay resultados para tu búsqueda."
                          : "Añade un nuevo operador para comenzar."}
                      </p>
                      {searchTerm && (
                        <button
                          onClick={() => setSearchTerm("")}
                          className="mt-4 text-sm text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-slate-100 underline"
                        >
                          Limpiar búsqueda
                        </button>
                      )}
                    </div>
                  ) : (
                    <>
                      {filteredUsers.map((user: any) => (
                        <div
                          key={user.id}
                          className="grid grid-cols-12 px-6 py-4 hover:bg-slate-50 dark:hover:bg-slate-950 transition-colors duration-150"
                        >
                          <div className="col-span-5 flex items-center">
                            <div className="shrink-0 h-10 w-10 rounded-full bg-slate-700 dark:bg-slate-300 flex items-center justify-center text-white dark:text-black font-medium">
                              {user.name.charAt(0).toUpperCase()}
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-slate-900 dark:text-slate-100">
                                {user.name}
                              </div>
                              <div className="text-xs text-slate-500">
                                ID: {user.id}
                              </div>
                            </div>
                          </div>
                          <div className="col-span-5 flex items-center">
                            <div className="text-sm text-slate-900 dark:text-slate-100">
                              {user.email}
                            </div>
                          </div>
                          <div className="col-span-2 flex justify-end items-center space-x-2">
                            <Button
                              variant="outline"
                              size="icon"
                              className="h-8 w-8 border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-900 hover:text-slate-900 dark:hover:text-slate-100"
                              onClick={() => handleEditUser(user)}
                            >
                              <Edit2 className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="icon"
                              className="h-8 w-8 border-slate-200 hover:bg-red-50 hover:text-red-700 hover:border-red-200 dark:border-slate-800 dark:hover:bg-red-950 dark:hover:text-red-300 dark:hover:border-red-800"
                              onClick={() => setDeleteConfirmUser(user)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </>
                  )}
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add User Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold text-slate-800 dark:text-slate-200">
              Añadir Nuevo Operador
            </DialogTitle>
            <DialogDescription className="text-slate-500">
              Complete la información para registrar un nuevo operador en el
              sistema.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <div>
              <label
                htmlFor="name"
                className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1"
              >
                Nombre completo
              </label>
              <Input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Nombre del operador"
                className="w-full border-slate-300 dark:border-slate-700 focus:border-slate-500 focus:ring-slate-500"
              />
            </div>
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1"
              >
                Email
              </label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="correo@ejemplo.com"
                className="w-full border-slate-300 dark:border-slate-700 focus:border-slate-500 focus:ring-slate-500"
              />
            </div>
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1"
              >
                Contraseña
              </label>
              <Input
                id="password"
                type="password"
                value={filters.password || ""}
                onChange={(e) =>
                  setFilters((prev: any) => ({ ...prev, password: e.target.value }))
                }
                className="w-full border-slate-300 dark:border-slate-700 focus:border-slate-500 focus:ring-slate-500"
              />
              {errors && <span className="text-red-700">{errors}</span>}
            </div>
          </div>
          <CopyToClipboardAlert />
          <DialogFooter>
            <Button
              variant="outline"
              className="border-slate-300 text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-900"
              onClick={() => setIsAddDialogOpen(false)}
            >
              Cancelar
            </Button>
            <Button
              className="bg-slate-800 hover:bg-slate-700 text-white dark:bg-slate-200 dark:hover:bg-slate-300 dark:text-black ml-2"
              onClick={addUser}
              disabled={submitting}
            >
              {submitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Añadiendo...
                </>
              ) : (
                <>
                  <UserPlus className="h-4 w-4 mr-2" />
                  Añadir Operador
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit User Dialog */}
      <Dialog
        open={!!editingUser}
        onOpenChange={(open) => !open && setEditingUser(null)}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold text-slate-800 dark:text-slate-200">
              Editar Operador
            </DialogTitle>
            <DialogDescription className="text-slate-500">
              Actualice la información del operador.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <div>
              <label
                htmlFor="edit-name"
                className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1"
              >
                Nombre completo
              </label>
              <Input
                id="edit-name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full border-slate-300 dark:border-slate-700 focus:border-slate-500 focus:ring-slate-500"
              />
            </div>
            <div>
              <label
                htmlFor="edit-email"
                className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1"
              >
                Email
              </label>
              <Input
                id="edit-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full border-slate-300 dark:border-slate-700 focus:border-slate-500 focus:ring-slate-500"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              className="border-slate-300 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-900"
              onClick={() => setEditingUser(null)}
            >
              Cancelar
            </Button>
            <Button
              className="bg-slate-800 hover:bg-slate-700 text-white dark:bg-slate-200 dark:hover:bg-slate-300 dark:text-black ml-2"
              onClick={updateUser}
              disabled={submitting}
            >
              {submitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Actualizando...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Guardar Cambios
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete confirmation */}
      <AlertDialog
        open={!!deleteConfirmUser}
        onOpenChange={(open) => !open && setDeleteConfirmUser(null)}
      >
        <AlertDialogContent className="max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-red-700 dark:text-red-300">
              ¿Eliminar operador?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-slate-500">
              Esta acción no se puede deshacer. El operador será eliminado
              permanentemente del sistema.
            </AlertDialogDescription>
          </AlertDialogHeader>
          {deleteConfirmUser && (
            <div className="my-2 p-4 bg-slate-50 dark:bg-slate-950 rounded-md">
              <div className="flex items-center">
                <div className="shrink-0 h-10 w-10 rounded-full bg-slate-200 dark:bg-slate-800 flex items-center justify-center text-slate-700 dark:text-slate-300 font-medium">
                  {deleteConfirmUser.name.charAt(0).toUpperCase()}
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-slate-900 dark:text-slate-100">
                    {deleteConfirmUser.name}
                  </p>
                  <p className="text-xs text-slate-500">
                    {deleteConfirmUser.email}
                  </p>
                </div>
              </div>
            </div>
          )}
          <AlertDialogFooter>
            <AlertDialogCancel className="border-slate-300 text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-900">
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-700 hover:bg-red-800 text-white dark:bg-red-300 dark:hover:bg-red-100 dark:text-black"
              onClick={deleteUser}
              disabled={submitting}
            >
              {submitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Eliminando...
                </>
              ) : (
                <>
                  <Trash2 className="h-4 w-4 mr-2" />
                  Eliminar
                </>
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default UserManagement;
