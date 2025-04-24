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

import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
} from "@/components/ui/chart";
import { CustomTooltipContent } from "./charts-extra";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const colorPalette = [
  "#64748b",
  "#94a3b8",
  "#475569",
  "#3b82f6",
  "#60a5fa",
  "#1e3a8a",
  "#334155",
];

const chartData = [
  { month: "Jan", ProyectoA: 5000, ProyectoB: 2000, ProyectoC: 3500 },
  { month: "Feb", ProyectoA: 7000, ProyectoB: 3000, ProyectoC: 4000 },
  // …
];

// Extraemos las claves (proyectos) dinámicamente
const projectKeys = Object.keys(chartData[0]).filter((k) => k !== "month");

// 🔧 Construimos chartConfig dinámico
const chartConfig: ChartConfig = projectKeys.reduce((cfg, key, i) => {
  return {
    ...cfg,
    [key]: {
      label: key, // puedes formatear el nombre aquí
      color: colorPalette[i % colorPalette.length],
    },
  };
}, {} as ChartConfig);

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

  return (
    <Card className="gap-4 shadow-none border-none">
      <CardHeader>
        <div className="flex flex-wrap items-center justify-between gap-3 -mt-8">
          <div className="space-y-0.5">
            <CardTitle>Viajes por Proyecto</CardTitle>
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
              tickFormatter={(v) => `${v / 1000}k`}
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
                  valueFormatter={(v) => `$${v.toLocaleString()}`}
                />
              }
            />
          </LineChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
