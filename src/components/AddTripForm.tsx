"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useFieldArray } from "react-hook-form";
import { z } from "zod";
import { useState } from "react";

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
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { validarDocumento } from "@/lib/id-validator";
import { Calendar } from "./ui/calendar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { CalendarDays, Trash2, Plus } from "lucide-react";

// Se agrega la importación de supabase para el fetch
// import { supabase } from "@/lib/supabase";

const TripSchema = z.object({
  username: z.string().min(2, {
    message: "Username must be at least 2 characters.",
  }),
  deliveryDate: z.date().default(() => {
    return new Date(Date.now() - 5 * 3600000);
  }),
  ownership: z.enum(["propio", "contratado"], {
    message: "Debes seleccionar un tipo.",
  }),
  driver: z.string().min(2, {
    message: "Driver must be at least 2 characters.",
  }),
  driverContact: z
    .string()
    .min(10, {
      message: "El número de teléfono del conductor debe tener 10 caracteres.",
    })
    .max(10, {
      message: "El número de teléfono del conductor debe tener 10 caracteres.",
    }),
  truck: z.string().min(2, {
    message: "Truck must be at least 2 characters.",
  }),
  destination: z.string().min(2, {
    message: "Truck must be at least 2 characters.",
  }),
  project: z.string().min(2, {
    message: "Truck must be at least 2 characters.",
  }),
  shift: z.string().time(),
});

const FormSchema = z.object({
  trips: z.array(TripSchema),
});

const AddTripForm = () => {
  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      trips: [
        {
          username: "",
          deliveryDate: new Date(),
          ownership: undefined,
          driver: "",
          driverContact: "",
          truck: "",
          destination: "",
          project: "",
          shift: "",
        },
      ],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "trips",
  });

  // Estado para almacenar el nombre completo obtenido para cada registro (índice)
  const [driverFullNames, setDriverFullNames] = useState<
    Record<number, string>
  >({});

  function onSubmit(data: z.infer<typeof FormSchema>) {
    if (!form.formState.isValid) {
      toast.error("Por favor, completa todos los campos obligatorios.");
      return;
    }
    toast.success(`Carga exitosa: ${JSON.stringify(data.trips)}`);
    form.reset({
      trips: [
        {
          username: "",
          deliveryDate: new Date(),
          ownership: undefined,
          driver: "",
          driverContact: "",
          truck: "",
          destination: "",
          project: "",
          shift: "",
        },
      ],
    });
    // Reiniciamos los nombres completos
    setDriverFullNames({});
  }

  const today = (date = new Date()) => {
    return parseInt(
      Intl.DateTimeFormat("es-EC", {
        hour: "numeric",
        hour12: false,
        timeZone: "America/Guayaquil",
      }).format(date)
    );
  };

  const getShift = (date = new Date()) => {
    const currentHour = today(date);
    if (currentHour >= 6 && currentHour < 18) {
      return "Día";
    }
    return "Noche";
  };

  return (
    <Form {...form}>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          form.trigger();
          if (form.formState.isValid) {
            form.handleSubmit(onSubmit)();
          } else {
            toast.error("Por favor, completa todos los campos obligatorios.");
          }
        }}
      >
        {fields.map((field, index) => (
          <div
            key={field.id}
            className="flex flex-row items-center justify-around space-x-6 w-full mb-4"
          >
            <Button
              type="button"
              variant="default"
              onClick={() => remove(index)}
            >
              <Trash2 size={16} />
            </Button>
            <FormField
              control={form.control}
              name={`trips.${index}.ownership`}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Propietario</FormLabel>
                  <FormControl>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Selecciona" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="propio">Propio</SelectItem>
                        <SelectItem value="contratado">Contratado</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormDescription>
                    Indica si el camión es de la empresa o contratado.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name={`trips.${index}.deliveryDate`}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Fecha de entrega</FormLabel>
                  <FormControl>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="outline">
                          <CalendarDays size={24} />
                          {field.value.toLocaleDateString()}
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent className="w-fit">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={(date) => {
                            if (date) {
                              field.onChange(date);
                            }
                          }}
                          disabled={(date) => date < new Date()}
                        />
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </FormControl>
                  <FormDescription>
                    Ingresa la fecha de entrega.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name={`trips.${index}.driver`}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Conductor asignado</FormLabel>
                  <FormControl>
                    <Input
                      className="bg-white"
                      placeholder="Identificación"
                      type="text"
                      pattern="[0-9]*"
                      {...field}
                    />
                  </FormControl>
                  {/* Se muestra el nombre completo al lado si existe */}
                  {driverFullNames[index] && (
                    <span className="text-green-600 ml-2">
                      {driverFullNames[index]}
                    </span>
                  )}
                  <FormDescription>
                    Inserta el número de identificación del conductor asignado.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name={`trips.${index}.driverContact`}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Contacto del Conductor</FormLabel>
                  <FormControl>
                    <Input
                      className="bg-white"
                      placeholder="Número"
                      type="tel"
                      onKeyDown={() => validarDocumento(field.value)}
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Inserta el número de contacto del conductor asignado.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name={`trips.${index}.shift`}
              render={() => (
                <FormItem>
                  <FormLabel>Jornada</FormLabel>
                  <FormControl>
                    <Input
                      type="text"
                      value={getShift()}
                      readOnly
                      disabled
                      className="shadow-none cursor-not-allowed"
                    />
                  </FormControl>
                  <FormDescription>
                    Se asigna automáticamente según la hora actual.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        ))}
        <div className="flex items-center justify-between mt-4">
          <Button
            type="button"
            onClick={() =>
              append({
                username: "",
                deliveryDate: new Date(),
                ownership: undefined,
                driver: "",
                driverContact: "",
                truck: "",
                destination: "",
                project: "",
                shift: "",
              })
            }
          >
            <Plus size={16} className="mr-2" /> Agregar registro
          </Button>
          <Button type="submit" disabled={!form.formState.isValid}>
            Enviar
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default AddTripForm;
