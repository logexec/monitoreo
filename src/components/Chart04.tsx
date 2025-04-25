"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Tooltip,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

const chartData = [
  { name: "Propios", cantidad: 1775 },
  { name: "Alquilados", cantidad: 3759 },
];

export function Chart04() {
  return (
    <Card className="gap-4 shadow-none border-none">
      <CardHeader>
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
        <div className="h-60 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} barGap={50} margin={{ top: 30 }}>
              <defs>
                <linearGradient id="propios" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#f87171" />
                  <stop offset="100%" stopColor="#b91c1c" />
                </linearGradient>
                <linearGradient id="alquilados" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#94a3b8" />
                  <stop offset="100%" stopColor="#374151" />
                </linearGradient>
              </defs>

              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="name" tickLine={false} stroke="var(--border)" />
              <YAxis
                tickFormatter={(v) => `${v}`}
                axisLine={false}
                tickLine={false}
                stroke="var(--border)"
              />
              <Tooltip
                formatter={(cantidad: number) => `${cantidad.toLocaleString()}`}
              />
              <Bar
                dataKey="cantidad"
                radius={[4, 4, 0, 0]}
                label={{ position: "top", fill: "#888", fontSize: 12 }}
              >
                {chartData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={`url(#${entry.name.toLowerCase()})`}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
