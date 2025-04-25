"use client";

import { useEffect, useId, useState } from "react";
import {
  CartesianGrid,
  Line,
  LineChart,
  Rectangle,
  XAxis,
  YAxis,
} from "recharts";
import axios from "axios";

import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
} from "@/components/ui/chart";
import { CustomTooltipContent } from "./charts-extra";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useGlobalFilters } from "@/contexts/GlobalFilterContext";

const colorPalette = [
  "#10B981", // Tailwind green-500
  "#F59E0B", // Tailwind amber-500
  "#6366F1", // Tailwind indigo-500
  "#8B5CF6", // Tailwind violet-500
  "#6B7280", // Tailwind gray-500
  "#EC4899", // Tailwind pink-500
  "#3B82F6", // Tailwind blue-500
];

interface ChartDataPoint {
  month: string;
  [key: string]: number | string;
}

interface CustomCursorProps {
  fill?: string;
  pointerEvents?: string;
  height?: number;
  points?: Array<{ x: number; y: number }>;
  className?: string;
}

function CustomCursor(props: CustomCursorProps) {
  const { fill, points, height, pointerEvents, className } = props;
  if (!points?.length) return null;
  const { x, y } = points[0]!;
  return (
    <>
      <Rectangle
        x={x - 12}
        y={y}
        width={24}
        height={height}
        fill={fill}
        pointerEvents={pointerEvents}
        className={className}
      />
      <Rectangle
        x={x - 1}
        y={y}
        width={1}
        height={height}
        fill={fill}
        pointerEvents={pointerEvents}
        className="recharts-tooltip-inner-cursor"
      />
    </>
  );
}

export function Chart02() {
  const id = useId();
  const { filters } = useGlobalFilters();
  const [chartData, setChartData] = useState<ChartDataPoint[]>([]);
  const [rawData, setRawData] = useState<ChartDataPoint[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [chartConfig, setChartConfig] = useState<ChartConfig>({});

  // Filter data by time range
  const filterDataByTimeRange = (data: ChartDataPoint[], range: string) => {
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
        const itemDate = new Date(`${item.month}-01`);
        if (range === "today") {
          return itemDate.getFullYear() === startDate.getFullYear() &&
            itemDate.getMonth() === startDate.getMonth() &&
            itemDate.getDate() === startDate.getDate()
            ? item
            : {
                ...item,
                ...Object.fromEntries(
                  Object.keys(item)
                    .filter((k) => k !== "month")
                    .map((k) => [k, 0])
                ),
              };
        }
        return itemDate >= startDate
          ? item
          : {
              ...item,
              ...Object.fromEntries(
                Object.keys(item)
                  .filter((k) => k !== "month")
                  .map((k) => [k, 0])
              ),
            };
      })
      .filter((item) =>
        Object.values(item).some((val) => typeof val === "number" && val > 0)
      );

    return filteredData;
  };

  // Fetch data when projects or destinations change
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const res = await axios.get("/dashboardTrips", {
          params: {
            period: "last_3_months", // Always fetch widest range
            project: filters.projects.length ? filters.projects : undefined,
            destination: filters.destinations.length
              ? filters.destinations
              : undefined,
            groupBy: "month_project", // Custom groupBy for month and project
          },
        });

        if (Array.isArray(res.data)) {
          // Transform data into chart format: { month: "YYYY-MM", ProjectA: N, ProjectB: M, ... }
          const dataByMonth: { [month: string]: ChartDataPoint } = {};
          res.data.forEach(
            (item: { month: string; project: string; trips: number }) => {
              if (!dataByMonth[item.month]) {
                dataByMonth[item.month] = { month: item.month };
              }
              dataByMonth[item.month][item.project] = item.trips;
            }
          );

          const processedData = Object.values(dataByMonth);

          // Generate chartConfig dynamically
          const projectKeys = Array.from(
            new Set(res.data.map((item: { project: string }) => item.project))
          ).filter((key) => key);
          const newChartConfig: ChartConfig = projectKeys.reduce(
            (cfg, key, i) => {
              return {
                ...cfg,
                [key]: {
                  label: key,
                  color: colorPalette[i % colorPalette.length],
                },
              };
            },
            {} as ChartConfig
          );
          setChartConfig(newChartConfig);

          setRawData(processedData);
          setChartData(filterDataByTimeRange(processedData, filters.period));
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
  }, [filters.projects, filters.destinations]);

  // Update chartData when period changes (no fetch)
  useEffect(() => {
    const filteredData = filterDataByTimeRange(rawData, filters.period);
    setChartData(filteredData);
  }, [filters.period, rawData]);

  const projectKeys = Object.keys(chartConfig);

  return (
    <Card className="gap-4 shadow-none border-none">
      <CardHeader>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="space-y-0.5">
            <CardTitle className="@[250px]/card:text-3xl text-2xl font-semibold mb-1">
              Viajes por Proyecto
            </CardTitle>
          </div>
          <div className="flex flex-wrap items-center gap-4">
            {projectKeys.map((key, idx) => (
              <div key={key} className="flex items-center gap-2">
                <span
                  className="size-1.5 block rounded-full"
                  style={{
                    backgroundColor: colorPalette[idx % colorPalette.length],
                  }}
                />
                <span className="text-[13px]/3 text-muted-foreground">
                  {key}
                </span>
              </div>
            ))}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading && <p className="text-center py-4">Cargando datos...</p>}
        {error && <p className="text-red-500 text-center py-4">{error}</p>}
        {!isLoading && !error && chartData.length === 0 && (
          <p className="text-center py-4">
            No hay datos disponibles para los filtros seleccionados.
          </p>
        )}
        {!isLoading && !error && chartData.length > 0 && (
          <ChartContainer config={chartConfig} className="h-60 w-full">
            <LineChart
              data={chartData}
              margin={{ left: -12, right: 12, top: 12 }}
            >
              <defs>
                {projectKeys.map((key, idx) => (
                  <linearGradient
                    key={key}
                    id={`${id}-${key}`}
                    x1="0"
                    y1="0"
                    x2="1"
                    y2="0"
                  >
                    <stop
                      offset="0%"
                      stopColor={colorPalette[idx % colorPalette.length]}
                      stopOpacity={0.8}
                    />
                    <stop
                      offset="100%"
                      stopColor={colorPalette[idx % colorPalette.length]}
                      stopOpacity={0.3}
                    />
                  </linearGradient>
                ))}
              </defs>
              <CartesianGrid
                vertical={false}
                strokeDasharray="2 2"
                stroke="var(--border)"
              />
              <XAxis dataKey="month" tickLine={false} stroke="var(--border)" />
              <YAxis
                axisLine={false}
                tickLine={false}
                tickFormatter={(v) => `${v}`}
              />
              {projectKeys.map((key, idx) => (
                <Line
                  key={key}
                  dataKey={key}
                  stroke={`url(#${id}-${key})`}
                  strokeWidth={2}
                  dot={false}
                  activeDot={{
                    r: 5,
                    fill: colorPalette[idx % colorPalette.length],
                    stroke: "#fff",
                    strokeWidth: 1,
                  }}
                />
              ))}
              <ChartTooltip
                cursor={<CustomCursor fill="hsl(215, 100%, 80%)" />}
                content={
                  <CustomTooltipContent
                    colorMap={projectKeys.reduce((m, k, i) => {
                      m[k] = colorPalette[i % colorPalette.length];
                      return m;
                    }, {} as Record<string, string>)}
                    valueFormatter={(v) => `${v} viajes`}
                  />
                }
              />
            </LineChart>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  );
}
