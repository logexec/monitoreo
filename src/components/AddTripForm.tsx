/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import { validarDocumento } from "@/lib/id-validator";
import axios, { addTrips, getCSRFToken, getPlateNumbers } from "@/lib/axios";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { format } from "date-fns";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Calendar as CalendarIcon } from "lucide-react";
import { Input } from "@/components/ui/input";
import { PhoneInput } from "@/components/ui/phone-input";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Check, ChevronsUpDown } from "lucide-react";

interface Driver {
  company_name: string;
  identification: string;
  phone: string;
}

interface Plates {
  id: number;
  name: string;
}

const formSchema = z.object({
  delivery_date: z.coerce.date(),
  origin: z.string().min(1).min(3),
  destination: z.string().min(1).min(3),
  project: z.string().min(1).min(3),
  driver_document: z.number(),
  driver_phone: z.string(),
  driver_name: z.string().min(1).min(3),
  property_type: z.unknown(),
  plate_number: z.string().min(4),
  usuario: z.string().min(1).optional(),
  clave: z.string().min(1).optional(),
  gps_provider: z.string().min(1),
});

const AddTripForm = () => {
  const [plateNumbers, setPlateNumbers] = useState<Plates[]>();

  useEffect(() => {
    const fetchPlateNumbers = async () => {
      try {
        const response = await getPlateNumbers();
        if (response && Array.isArray(response.data)) {
          setPlateNumbers(response.data || []);
        } else {
          toast.error(
            "Se produjo un error inesperado al tratar de obtener las placas"
          );
          console.error("Respuesta inesperada:", response);
          setPlateNumbers([]); // Evita que sea undefined
        }
      } catch (error) {
        console.error("Error al obtener las placas:", error);
        toast.error("Error al obtener las placas");
        setPlateNumbers([]); // Asegura que siempre sea un array
      }
    };
    fetchPlateNumbers();
  }, []);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      delivery_date: new Date(),
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      console.log(values);
      toast(
        <pre className="mt-2 w-[340px] rounded-md bg-slate-950 p-4">
          <code className="text-white">{JSON.stringify(values, null, 2)}</code>
        </pre>
      );
    } catch (error) {
      console.error("Form submission error", error);
      toast.error("Failed to submit the form. Please try again.");
    }
  }

  // Estado para almacenar el nombre completo obtenido para cada registro (índice)
  // const [driverInfo, setDriverInfo] = useState<Driver[]>([]);

  // async function onSubmit(data: z.infer<typeof FormSchema>) {
  //   if (!form.formState.isValid) {
  //     toast.error("Por favor, completa todos los campos obligatorios.");
  //     return;
  //   }

  //   try {
  //     const formattedTrips = data.trips.map((trip) => ({
  //       delivery_date: trip.deliveryDate,
  //       driver_name: trip.driver,
  //       driver_document: trip.driver_document,
  //       driver_phone: trip.driver_phone,
  //       origin: trip.origin,
  //       destination: trip.destination,
  //       project: trip.project,
  //       plate_number: trip.plate_number,
  //       property_type: trip.property_type,
  //       shift: trip.shift || getShift(),
  //       gps_provider: trip.gps_provider,
  //       uri_gps: trip.uri_gps,
  //       usuario: trip.usuario,
  //       clave: trip.clave,
  //       current_status: "SCHEDULED",
  //     }));

  //     await addTrips(formattedTrips);
  //     toast.success(
  //       data.trips.length > 1
  //         ? "¡Viajes agregados con éxito!"
  //         : "¡Viaje agregado con éxito!"
  //     );
  //     form.reset();
  //   } catch (error) {
  //     console.error("Error al registrar viajes:", error);
  //     toast.error("Error al registrar los viajes");
  //   }
  // }

  // const today = (date = new Date()) => {
  //   return parseInt(
  //     Intl.DateTimeFormat("es-EC", {
  //       hour: "numeric",
  //       hour12: false,
  //       timeZone: "America/Guayaquil",
  //     }).format(date)
  //   );
  // };

  // const getShift = (date = new Date()) => {
  //   const currentHour = today(date);
  //   if (currentHour >= 6 && currentHour < 18) {
  //     return "Día";
  //   }
  //   return "Noche";
  // };

  const [driverInfo, setDriverInfo] = useState<Driver | null>(null);

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-8 max-w-5xl mx-auto py-5"
      >
        <div className="grid grid-cols-12 gap-4">
          <h3 className="text-gray-400 dark:text-gray-600 font-medium text-xs col-span-12 border-b border-gray-200">
            Datos del viaje
          </h3>
          <div className="col-span-3">
            <FormField
              control={form.control}
              name="delivery_date"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Fecha de Entrega</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant={"outline"}
                          className={cn(
                            "w-[240px] pl-3 text-left font-normal",
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          {field.value ? (
                            format(field.value, "PPP")
                          ) : (
                            <span className="text-gray-400 dark:text-gray-600">
                              Selecciona una fecha
                            </span>
                          )}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <FormDescription>
                    Indica cuándo está prevista la entrega
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="col-span-3">
            <FormField
              control={form.control}
              name="origin"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Origen</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="QUITO"
                      type="text"
                      className="placeholder:text-gray-300 dark:placeholder:text-gray-700"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>Origen del viaje</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="col-span-3">
            <FormField
              control={form.control}
              name="destination"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Destino</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="GUAYAQUIL"
                      type="text"
                      className="placeholder:text-gray-300 dark:placeholder:text-gray-700"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>Ciudad de destino</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="col-span-3">
            <FormField
              control={form.control}
              name="project"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Proyecto</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="MABE"
                      type="text"
                      className="placeholder:text-gray-300 dark:placeholder:text-gray-700"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>A qué proyecto pertenece</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        <div className="grid grid-cols-12 gap-4 items-center">
          <h3 className="text-gray-400 dark:text-gray-600 font-medium text-xs col-span-12 border-b border-gray-200">
            Información del Chofer
          </h3>
          <div className="col-span-4">
            <FormField
              control={form.control}
              name="driver_document"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Chofer Asignado</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="17234567890"
                      type="number"
                      className="placeholder:text-gray-300 dark:placeholder:text-gray-700"
                      {...field}
                      onBlur={async () => {
                        try {
                          validarDocumento(field.value.toString());
                          await getCSRFToken();
                          const response = await axios.get(
                            `/personnel?cedula=${field.value}`
                          );
                          console.log("Driver: ", response.data.driver);
                          setDriverInfo(response.data.driver);
                        } catch (error) {
                          if (axios.isAxiosError(error) && error.response) {
                            console.error(
                              "Error response:",
                              error.response.data
                            );
                            toast.error(
                              error.response.data.error ||
                                "Error en la solicitud"
                            );
                          } else {
                            console.error("Error desconocido:", error);
                            toast.error(
                              error instanceof Error
                                ? error.message
                                : "Error inesperado"
                            );
                          }
                        }
                      }}
                    />
                  </FormControl>
                  <FormDescription>
                    Escribe el documento de identidad del chofer asignado
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="col-span-4">
            <FormField
              control={form.control}
              name="driver_phone"
              render={({ field }) => (
                <FormItem className="flex flex-col items-start">
                  <FormLabel>Número de Contacto</FormLabel>
                  <FormControl className="w-full">
                    <Input
                      placeholder="0987654321"
                      type="number"
                      className="placeholder:text-gray-300 dark:placeholder:text-gray-700"
                      {...field}
                      value={driverInfo?.phone ? driverInfo.phone : field.value}
                    />
                  </FormControl>
                  <FormDescription>
                    Escribe el número de contacto del Chofer asignado
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="col-span-4">
            <FormField
              control={form.control}
              name="driver_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nombre del Chofer</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Marco Aurelio Antonio"
                      type="text"
                      className=" placeholder:text-gray-200 dark:placeholder:text-gray-700"
                      {...field}
                      value={
                        driverInfo?.company_name
                          ? driverInfo.company_name
                          : field.value
                      }
                    />
                  </FormControl>
                  <FormDescription>
                    Escribe el Nombre del Chofer Asignado
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        <div className="grid grid-cols-12 gap-4 items-center">
          <h3 className="text-gray-400 dark:text-gray-600 font-medium text-xs col-span-12 border-b border-gray-200">
            Datos del camión
          </h3>
          <div className="col-span-6">
            <FormField
              control={form.control}
              name="property_type"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>¿El camión es de LogeX?</FormLabel>
                    <FormDescription>
                      Selecciona si es que es propio, déjala sin seleccionar si
                      es alquilado
                    </FormDescription>
                    <FormMessage />
                  </div>
                </FormItem>
              )}
            />
          </div>

          <div className="col-span-6">
            <FormField
              control={form.control}
              name="plate_number"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Placa del Camión</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant="outline"
                          role="combobox"
                          className={cn(
                            "w-[200px] justify-between placeholder:text-gray-200 dark:placeholder:text-gray-700",
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          {field.value
                            ? plateNumbers!.find(
                                (plate) => plate.id.toString() === field.value
                              )?.name
                            : "Selecciona una Placa"}
                          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-[200px] p-0">
                      <Command>
                        <CommandInput placeholder="Comienza a escribir..." />
                        <CommandList>
                          <CommandEmpty>
                            No se encontraron placas en el sistema.
                          </CommandEmpty>
                          <CommandGroup>
                            {(plateNumbers ?? []).map((plate) => (
                              <CommandItem
                                value={plate.name}
                                key={plate.id}
                                onSelect={() => {
                                  form.setValue(
                                    "plate_number",
                                    plate.id.toString()
                                  );
                                }}
                              >
                                <Check
                                  className={cn(
                                    "mr-2 h-4 w-4",
                                    plate.id.toString() ===
                                      form.watch("plate_number")
                                      ? "opacity-100"
                                      : "opacity-0"
                                  )}
                                />
                                {plate.name}
                              </CommandItem>
                            ))}
                          </CommandGroup>
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>
                  <FormDescription>
                    Ingresa la Placa del Camión Asignado
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        <div className="grid grid-cols-12 gap-4 items-center">
          <h3 className="text-gray-400 dark:text-gray-600 font-medium text-xs col-span-12 border-b border-gray-200">
            Información del GPS
          </h3>
          <div className="col-span-4 place-self-center self-center">
            <FormField
              control={form.control}
              name="usuario"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Usuario</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="usuario_logex"
                      type="text"
                      className="placeholder:text-gray-300 dark:placeholder:text-gray-700"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Ingresa el usuario del proveedor de gps
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="col-span-4">
            <FormField
              control={form.control}
              name="clave"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Contraseña</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="logex_2025"
                      type="text"
                      className="placeholder:text-gray-300 dark:placeholder:text-gray-700"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>Escribe la clave de acceso</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="col-span-4">
            <FormField
              control={form.control}
              name="gps_provider"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Proveedor de GPS</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Traccar"
                      type="text"
                      className="placeholder:text-gray-300 dark:placeholder:text-gray-700"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Indica el nombre del proveedor
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>
        <Button type="submit">Registrar</Button>
      </form>
    </Form>
  );
};

export default AddTripForm;
