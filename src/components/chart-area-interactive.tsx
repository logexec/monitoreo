/* eslint-disable @typescript-eslint/no-explicit-any */
import * as React from "react";
import { Area, AreaChart, CartesianGrid, XAxis } from "recharts";
import axios from "axios";

import { useIsMobile } from "@/hooks/use-mobile";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ChartContainer, ChartTooltip } from "@/components/ui/chart";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { useGlobalFilters } from "@/contexts/GlobalFilterContext";
import { ProjectMultiSelect } from "./ProjectMultiSelect";

// Color palette for project lines
const COLOR_PALETTE = [
  "hsl(var(--chart-1))",
  "hsl(var(--chart-2))",
  "hsl(var(--chart-3))",
  "hsl(var(--chart-4))",
  "hsl(var(--chart-5))",
  "hsl(120, 60%, 50%)",
  "hsl(240, 60%, 50%)",
  "hsl(0, 60%, 50%)",
  "hsl(180, 60%, 50%)",
  "hsl(300, 60%, 50%)",
];

// Type for destination data
type DestinationTripData = {
  destination: string;
  trips: number;
  [key: string]:
    | number
    | string
    | Array<{ delivery_date: string; count: number }>
    | Array<{ name: string; trips: number }>
    | undefined;
  details?: Array<{ delivery_date: string; count: number }>;
  projects?: Array<{ name: string; trips: number }>;
};

// Type for project data (when filtering by destination)
type ProjectTripData = {
  project: string;
  trips: number;
  details?: Array<{ delivery_date: string; count: number }>;
  isProjectMode: boolean;
};

const CustomDestinationTooltip = ({ active, payload, label, filters }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    const isProjectMode = data.isProjectMode;
    const noFilters =
      filters.projects.length === 0 && filters.destinations.length === 0;

    return (
      <div className="grid min-w-[8rem] items-start gap-1.5 rounded-lg border border-border/50 bg-background px-2.5 py-1.5 text-xs shadow-xl">
        <div className="font-medium">
          {isProjectMode ? "Proyecto" : "Destino"}: {label}
        </div>
        <div className="grid gap-1.5">
          {isProjectMode ? (
            <div className="flex w-full flex-wrap gap-2 items-center">
              <div className="shrink-0 rounded-[2px] h-2.5 w-2.5 bg-primary"></div>
              <div className="flex flex-1 justify-between leading-none items-center">
                <span>Total Viajes</span>
                <span className="font-mono font-medium tabular-nums text-foreground">
                  {data.trips}
                </span>
              </div>
            </div>
          ) : noFilters && data.projects && data.projects.length > 0 ? (
            data.projects.map((project: { name: string; trips: number }) => (
              <div
                key={project.name}
                className="flex w-full flex-wrap gap-2 items-center"
              >
                <div className="shrink-0 rounded-[2px] h-2.5 w-2.5 bg-primary"></div>
                <div className="flex flex-1 justify-between leading-none items-center">
                  <span>{project.name}</span>
                  <span className="font-mono font-medium tabular-nums text-foreground">
                    {project.trips}
                  </span>
                </div>
              </div>
            ))
          ) : (
            <div className="flex w-full flex-wrap gap-2 items-center">
              <div className="shrink-0 rounded-[2px] h-2.5 w-2.5 bg-primary"></div>
              <div className="flex flex-1 justify-between leading-none items-center">
                <span>Total Viajes</span>
                <span className="font-mono font-medium tabular-nums text-foreground">
                  {Object.entries(data)
                    .filter(
                      ([key, value]) =>
                        typeof value === "number" && key !== "trips"
                    )
                    .reduce((sum, [, value]) => sum + (value as number), 0)}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }
  return null;
};

export function ChartAreaInteractive() {
  const isMobile = useIsMobile();
  const { filters, setFilters, filterOptions } = useGlobalFilters();
  const [chartData, setChartData] = React.useState<
    (DestinationTripData | ProjectTripData)[]
  >([]);
  const [rawData, setRawData] = React.useState<any[]>([]);
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  // Set default period for mobile
  React.useEffect(() => {
    if (isMobile && filters.period !== "last_7_days") {
      setFilters((prev) => ({ ...prev, period: "last_7_days" }));
    }
  }, [isMobile, setFilters]);

  const [chartConfig, setChartConfig] = React.useState<{
    [key: string]: { label: string; color: string };
  }>({
    visitors: { label: "Viajes", color: "" },
  });

  // Filter data by time range
  const filterDataByTimeRange = (data: any[], range: string) => {
    const now = new Date();
    let startDate: Date;

    switch (range) {
      case "last_30_days":
        startDate = new Date(now.setDate(now.getDate() - 30));
        break;
      case "last_7_days":
        startDate = new Date(now.setDate(now.getDate() - 7));
        break;
      case "today":
        startDate = new Date();
        startDate.setHours(0, 0, 0, 0);
        break;
      case "last_3_months":
      default:
        return data;
    }

    const filteredData = data
      .map((item) => {
        const isProjectMode = item.isProjectMode;
        if (!item.details) {
          return { ...item, trips: 0 };
        }

        const filteredDetails = item.details.filter(
          (detail: { delivery_date: string; count: number }) => {
            const detailDate = new Date(detail.delivery_date);
            if (range === "today") {
              return (
                detailDate.getFullYear() === startDate.getFullYear() &&
                detailDate.getMonth() === startDate.getMonth() &&
                detailDate.getDate() === startDate.getDate()
              );
            }
            return detailDate >= startDate;
          }
        );

        const filteredTrips = filteredDetails.reduce(
          (sum: number, detail: { count: number }) => sum + detail.count,
          0
        );

        const result: any = {
          ...item,
          details: filteredDetails,
          trips: filteredTrips,
        };

        if (!isProjectMode) {
          // Update project-specific counts for destination mode
          if (item.projects) {
            result.projects = item.projects
              .map((proj: { name: string; trips: number }) => ({
                ...proj,
                trips: filteredTrips, // Update based on filtered details
              }))
              .filter((proj: { trips: number }) => proj.trips > 0);
          }
          // Update dynamic project fields
          Object.keys(item).forEach((key) => {
            if (typeof item[key] === "number" && key !== "trips") {
              result[key] = filteredTrips;
            }
          });
        }

        return result;
      })
      .filter(
        (item) =>
          item.trips > 0 ||
          Object.values(item).some((val) => typeof val === "number" && val > 0)
      );

    return filteredData;
  };

  // Fetch data only when projects or destinations change
  React.useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const isProjectMode = filters.destinations.length > 0;

        if (isProjectMode) {
          const res = await axios.get("/dashboardTrips", {
            params: {
              period: "last_3_months",
              destination: filters.destinations,
              groupBy: "project",
            },
          });

          if (Array.isArray(res.data)) {
            const processedData = res.data
              .map(
                (item: {
                  project: string;
                  trips: number;
                  details?: any[];
                }) => ({
                  project: item.project,
                  trips: item.trips,
                  details: item.details,
                  isProjectMode: true,
                })
              )
              .sort((a, b) => b.trips - a.trips)
              .filter((item) => item.trips > 0);

            setRawData(processedData);
            setChartData(filterDataByTimeRange(processedData, filters.period));
            setChartConfig({
              visitors: { label: "Viajes por Proyecto", color: "" },
              trips: { label: "Total Viajes", color: COLOR_PALETTE[0] },
            });
          } else {
            setError("Formato de datos inesperado");
          }
        } else {
          const res = await axios.get("/dashboardTrips", {
            params: {
              period: "last_3_months",
              project: filters.projects.length ? filters.projects : undefined,
              groupBy: "destination",
            },
          });

          if (Array.isArray(res.data)) {
            const projectRes = await axios.get("/dashboardTrips", {
              params: {
                period: "last_3_months",
                destination: filters.destinations.length
                  ? filters.destinations
                  : undefined,
                groupBy: "project",
              },
            });

            const projectsWithTrips: string[] = projectRes.data
              .filter((p: { project: string; trips: number }) => p.trips > 0)
              .map((p: { project: string }) => p.project);

            const newChartConfig: {
              [key: string]: { label: string; color: string };
            } = {
              visitors: { label: "Viajes por Destino", color: "" },
            };
            projectsWithTrips.forEach((proj, index) => {
              newChartConfig[proj] = {
                label: proj,
                color: COLOR_PALETTE[index % COLOR_PALETTE.length],
              };
            });
            setChartConfig(newChartConfig);

            const processedData = await Promise.all(
              res.data.map(
                async (item: {
                  destination: string;
                  trips: number;
                  details?: any[];
                }) => {
                  const dataPoint: DestinationTripData = {
                    destination: item.destination,
                    trips: item.trips,
                    details: item.details,
                  };

                  const projectBreakdown = await axios.get("/dashboardTrips", {
                    params: {
                      period: "last_3_months",
                      destination: [item.destination],
                      groupBy: "project",
                    },
                  });

                  projectsWithTrips.forEach((proj) => {
                    dataPoint[proj] = 0;
                  });

                  if (Array.isArray(projectBreakdown.data)) {
                    projectBreakdown.data.forEach(
                      (p: { project: string; trips: number }) => {
                        if (projectsWithTrips.includes(p.project)) {
                          dataPoint[p.project] = p.trips;
                        }
                      }
                    );

                    if (filters.projects.length === 0) {
                      dataPoint.projects = projectBreakdown.data
                        .filter((p: { trips: number }) => p.trips > 0)
                        .map((p: { project: string; trips: number }) => ({
                          name: p.project,
                          trips: p.trips,
                        }))
                        .sort((a, b) => b.trips - a.trips);
                    }
                  }

                  return dataPoint;
                }
              )
            );

            setRawData(processedData);
            setChartData(filterDataByTimeRange(processedData, filters.period));
          } else {
            setError("Formato de datos inesperado");
          }
        }
      } catch (error) {
        console.error("Error fetching chart data", error);
        setError("No se pudieron cargar los datos del gráfico.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [filters.projects, filters.destinations]);

  // Update chartData when period changes (no fetch)
  React.useEffect(() => {
    const filteredData = filterDataByTimeRange(rawData, filters.period);
    setChartData(filteredData);
  }, [filters.period, rawData]);

  return (
    <Card className="@container/card">
      <CardHeader className="relative">
        <CardTitle>
          {filters.destinations.length > 0
            ? "Viajes por Proyecto"
            : "Viajes por Destino"}
        </CardTitle>
        <CardDescription>
          <span className="@[540px]/card:block hidden">
            Total por los últimos 3 meses
          </span>
          <span className="@[540px]/card:hidden">Últimos 3 meses</span>
        </CardDescription>
        <div className="absolute right-4 top-4">
          <div className="flex gap-2 mb-2">
            <ProjectMultiSelect
              placeholder="Filtrar proyectos"
              options={filterOptions.projectOptions}
              selected={filters.projects}
              onChange={(selected) =>
                setFilters((prev) => ({ ...prev, projects: selected }))
              }
            />
            <ProjectMultiSelect
              placeholder="Filtrar destinos"
              options={filterOptions.destinationOptions}
              selected={filters.destinations}
              onChange={(selected) =>
                setFilters((prev) => ({ ...prev, destinations: selected }))
              }
            />
          </div>
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
              Últimos 30 días
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
              aria-label="Select a value"
            >
              <SelectValue placeholder="Last 3 months" />
            </SelectTrigger>
            <SelectContent className="rounded-xl">
              <SelectItem value="last_3_months" className="rounded-lg">
                Last 3 months
              </SelectItem>
              <SelectItem value="last_30_days" className="rounded-lg">
                Last 30 days
              </SelectItem>
              <SelectItem value="last_7_days" className="rounded-lg">
                Last 7 days
              </SelectItem>
              <SelectItem value="today" className="rounded-lg">
                Today
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
        {isLoading && <p className="text-center py-4">Cargando datos...</p>}
        {error && <p className="text-red-500 text-center py-4">{error}</p>}
        {!isLoading && !error && chartData.length === 0 && (
          <p className="text-center py-4">
            No hay datos disponibles para los filtros seleccionados.
          </p>
        )}
        {!isLoading && chartData.length > 0 && (
          <ChartContainer
            config={chartConfig}
            className="aspect-auto h-[250px] w-full"
          >
            <AreaChart data={chartData}>
              <defs>
                {Object.keys(chartConfig)
                  .filter((key) => key !== "visitors")
                  .map((key) => (
                    <linearGradient
                      key={key}
                      id={`fill${key}`}
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop
                        offset="5%"
                        stopColor={chartConfig[key].color}
                        stopOpacity={1.0}
                      />
                      <stop
                        offset="95%"
                        stopColor={chartConfig[key].color}
                        stopOpacity={0.1}
                      />
                    </linearGradient>
                  ))}
              </defs>
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey={
                  filters.destinations.length > 0 ? "project" : "destination"
                }
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                interval={0}
                tick={{ fontSize: 11 }}
              />
              <ChartTooltip
                cursor={false}
                content={<CustomDestinationTooltip filters={filters} />}
              />
              {filters.destinations.length > 0 ? (
                <Area
                  dataKey="trips"
                  type="natural"
                  fill="url(#filltrips)"
                  stroke={chartConfig.trips?.color || COLOR_PALETTE[0]}
                  stackId="a"
                />
              ) : (
                Object.keys(chartConfig)
                  .filter((key) => key !== "visitors")
                  .map((key) => (
                    <Area
                      key={key}
                      dataKey={key}
                      type="natural"
                      fill={`url(#fill${key})`}
                      stroke={chartConfig[key].color}
                      stackId="a"
                    />
                  ))
              )}
            </AreaChart>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  );
}
