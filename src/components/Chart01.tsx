import { useEffect, useState } from "react";
import axios from "axios";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { ChartContainer, ChartTooltip } from "./ui/chart";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { ToggleGroup, ToggleGroupItem } from "./ui/toggle-group";
import { useIsMobile } from "@/hooks/use-mobile";
import { useGlobalFilters } from "@/contexts/GlobalFilterContext";

type MonthlyTripData = {
  month: string;
  trips: number;
};

export function Chart01() {
  const isMobile = useIsMobile();
  const { filters, setFilters } = useGlobalFilters();
  const [chartData, setChartData] = useState<MonthlyTripData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isMobile && filters.period !== "last_7_days") {
      setFilters((prev) => ({ ...prev, period: "last_7_days" }));
    }
  }, [isMobile, setFilters]);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const res = await axios.get("/dashboardTrips", {
          params: {
            period: filters.period,
            groupBy: "month",
          },
        });

        if (Array.isArray(res.data)) {
          const sortedData = res.data
            .map((item: { month: string; trips: number }) => ({
              month: item.month,
              trips: item.trips,
            }))
            .sort((a: MonthlyTripData, b: MonthlyTripData) => {
              return (
                new Date(a.month + "-01").getTime() -
                new Date(b.month + "-01").getTime()
              );
            });

          setChartData(sortedData);
        } else {
          setError("Formato de datos inesperado");
        }
      } catch (error) {
        console.error("Error fetching chart data", error);
        setError("No se pudieron cargar los datos del gráfico.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [filters.period]);

  const chartConfig = {
    trips: {
      label: "Viajes",
      color: "hsl(233, 90%, 45%)",
    },
  };

  return (
    <Card className="@container/card">
      <CardHeader className="relative">
        <CardTitle className="@[250px]/card:text-3xl text-2xl font-semibold">
          Viajes por Mes
        </CardTitle>
        <div className="absolute right-4 top-4">
          <ToggleGroup
            type="single"
            value={filters.period}
            onValueChange={(value) =>
              value && setFilters((prev) => ({ ...prev, period: value }))
            }
            variant="outline"
            className="@[767px]/card:flex hidden"
          >
            <ToggleGroupItem value="last_3_months" className="h-8 px-2.5">
              Últimos 3 meses
            </ToggleGroupItem>
            <ToggleGroupItem value="last_30_days" className="h-8 px-2.5">
              Último mes
            </ToggleGroupItem>
            <ToggleGroupItem value="last_7_days" className="h-8 px-2.5">
              Últimos 7 días
            </ToggleGroupItem>
            <ToggleGroupItem value="today" className="h-8 px-2.5">
              Hoy
            </ToggleGroupItem>
          </ToggleGroup>
          <Select
            value={filters.period}
            onValueChange={(value) =>
              setFilters((prev) => ({ ...prev, period: value }))
            }
          >
            <SelectTrigger
              className="@[767px]/card:hidden flex w-40"
              aria-label="Seleccionar período"
            >
              <SelectValue placeholder="Últimos 3 meses" />
            </SelectTrigger>
            <SelectContent className="rounded-xl">
              <SelectItem value="last_3_months" className="rounded-lg">
                Últimos 3 meses
              </SelectItem>
              <SelectItem value="last_30_days" className="rounded-lg">
                Último mes
              </SelectItem>
              <SelectItem value="last_7_days" className="rounded-lg">
                Últimos 7 días
              </SelectItem>
              <SelectItem value="today" className="rounded-lg">
                Hoy
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading && <p>Cargando datos...</p>}
        {error && <p className="text-red-500">{error}</p>}
        {!isLoading && !error && chartData.length === 0 && (
          <p>No hay datos disponibles para el período seleccionado.</p>
        )}
        {chartData.length > 0 && (
          <ChartContainer config={chartConfig} className="h-[300px] w-full">
            <BarChart
              data={chartData}
              margin={{ left: 0, right: 20, top: 20, bottom: 20 }}
            >
              <CartesianGrid strokeDasharray="2 2" vertical={false} />
              <XAxis
                dataKey="month"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                tickFormatter={(value) => {
                  const date = new Date(value);
                  return date.toLocaleDateString("es-ES", {
                    month: "short",
                  });
                }}
              />
              <YAxis tickLine={false} axisLine={false} tickMargin={8} />
              <ChartTooltip
                content={({ active, payload, label }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload;
                    return (
                      <div className="grid min-w-[8rem] items-start gap-1.5 rounded-lg border border-border/50 bg-background px-2.5 py-1.5 text-xs shadow-xl">
                        <div className="font-medium">
                          {new Date(label).toLocaleDateString("es-ES", {
                            year: "numeric",
                            month: "long",
                          })}
                        </div>
                        <div className="flex w-full flex-wrap gap-2 items-center">
                          <div className="shrink-0 rounded-[2px] h-2.5 w-2.5 bg-primary"></div>
                          <div className="flex flex-1 justify-between leading-none items-center">
                            <span>Viajes</span>
                            <span className="font-mono font-medium tabular-nums text-foreground">
                              {data.trips}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Bar
                dataKey="trips"
                fill="hsl(233, 90%, 45%)"
                radius={[4, 4, 0, 0]}
                barSize={30}
              />
            </BarChart>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  );
}
