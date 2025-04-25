import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import Chart06 from "./Chart06";
import { Chart01 } from "./Chart01";
import { Chart02 } from "./Chart02";
import { Chart04 } from "./Chart04";

export function SectionCards() {
  return (
    <div className="data-[slot=card]:*:shadow-2xs @xl/main:grid-cols-2 @5xl/main:grid-cols-4 grid grid-cols-1 gap-4 px-4 data-[slot=card]:*:bg-linear-to-t data-[slot=card]:*:from-primary/5 data-[slot=card]:*:to-card dark:data-[slot=card]:*:bg-card lg:px-6">
      <Card className="@container/card">
        <CardHeader className="relative">
          <CardTitle className="@[250px]/card:text-3xl text-2xl font-semibold">
            Viajes Totales
          </CardTitle>
        </CardHeader>
        <Chart06 />
      </Card>
      <Card className="@container/card">
        <CardHeader className="relative">
          <CardTitle className="@[250px]/card:text-3xl text-2xl font-semibold">
            Tipo de Camiones
          </CardTitle>
          <CardDescription className="text-gray-400 dark:text-gray-600 text-xs -mt-1">
            (Propios o alquilados)
          </CardDescription>
        </CardHeader>
        <Chart04 />
      </Card>
      <Card className="@container/card">
        <Chart02 />
      </Card>
      <Chart01 />
    </div>
  );
}
