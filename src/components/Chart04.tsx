"use client";

import { useId } from "react";
import {
  CartesianGrid,
  Line,
  LineChart,
  Rectangle,
  XAxis,
  YAxis,
} from "recharts";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
  ChartContainer,
  ChartConfig,
  ChartTooltip,
} from "@/components/ui/chart";
import { CustomTooltipContent } from "@/components/charts-extra";

// 🔢 Simula tu data real (llegará de la API en este mismo formato)
const chartData = [
  { month: "Jan", LogeX: 1000, Alquilados: 500 },
  { month: "Feb", LogeX: 3500, Alquilados: 2000 },
  { month: "Mar", LogeX: 2700, Alquilados: 1800 },
  { month: "Apr", LogeX: 4000, Alquilados: 2200 },
  { month: "May", LogeX: 3200, Alquilados: 2900 },
];

// 🔑 Las dos claves que vamos a mostrar
const seriesKeys = ["LogeX", "Alquilados"] as const;

// 🧰 Configuración dinámica para ChartContainer
const chartConfig = seriesKeys.reduce((cfg, key) => {
  return {
    ...cfg,
    [key]: {
      label: key === "LogeX" ? "Propios" : "Alquilados",
      // Usamos el rojo/slate sobrio en modo claro
      color: key === "LogeX" ? "#b91c1c" : "#374151",
    },
  };
}, {} as ChartConfig);

// Cursor personalizado (igual que antes)
function CustomCursor({
  fill,
  points,
  height,
  pointerEvents,
  className,
}: {
  fill?: string;
  points?: { x: number; y: number }[];
  height?: number;
  pointerEvents?: string;
  className?: string;
}) {
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

export function Chart04() {
  const id = useId();

  return (
    <Card className="gap-4 shadow-none border-none">
      <CardHeader>
        {/* Leyenda dinámica */}
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="size-1.5 shrink-0 rounded-full bg-red-700 dark:bg-red-500" />
            <div className="text-[13px]/3 text-muted-foreground">Propios</div>
          </div>
          <div className="flex items-center gap-2">
            <div className="size-1.5 shrink-0 rounded-full bg-slate-700 dark:bg-slate-400" />
            <div className="text-[13px]/3 text-muted-foreground">
              Alquilados
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <ChartContainer
          config={chartConfig}
          className="aspect-auto h-60 w-full"
        >
          <LineChart
            data={chartData}
            margin={{ left: -12, right: 12, top: 12 }}
          >
            <defs>
              {/* Definimos un degradado para cada serie */}
              <linearGradient id={`${id}-logeX`} x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#f87171" /> {/* red-500 */}
                <stop offset="100%" stopColor="#b91c1c" /> {/* red-700 */}
              </linearGradient>
              <linearGradient id={`${id}-alquil`} x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#94a3b8" /> {/* slate-400 */}
                <stop offset="100%" stopColor="#374151" /> {/* slate-700 */}
              </linearGradient>
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
              tickFormatter={(v) => `${v / 1000}k`}
            />

            {/* Líneas dinámicas */}
            <Line
              dataKey="LogeX"
              stroke={`url(#${id}-logeX)`}
              strokeWidth={2}
              dot={false}
              activeDot={{
                r: 4,
                fill: "#b91c1c",
                stroke: "#fff",
                strokeWidth: 1,
              }}
            />
            <Line
              dataKey="Alquilados"
              stroke={`url(#${id}-alquil)`}
              strokeWidth={2}
              dot={false}
              activeDot={{
                r: 4,
                fill: "#374151",
                stroke: "#fff",
                strokeWidth: 1,
              }}
            />

            <ChartTooltip
              cursor={<CustomCursor fill="hsl(215,100%,80%)" />}
              content={
                <CustomTooltipContent
                  colorMap={{
                    LogeX: "#b91c1c",
                    Alquilados: "#374151",
                  }}
                  valueFormatter={(val) => `$${val.toLocaleString()}`}
                />
              }
            />
          </LineChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
