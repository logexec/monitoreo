import { useGlobalFilters } from "@/contexts/GlobalFilterContext";
import { useEffect, useId, useState } from "react";
import axios from "axios";
import { Card, CardContent } from "./ui/card";
import { ChartContainer, ChartTooltip } from "./ui/chart";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";
import { CustomTooltipContent } from "./charts-extra";

type TripData = {
  destination: string;
  trips: number;
};

export function Chart01() {
  const id = useId();
  const { filters } = useGlobalFilters();
  const [chartData, setChartData] = useState<TripData[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axios.get("/api/dashboardTrips", {
          params: {
            period: filters.period,
            project: filters.projects,
            destination: filters.destinations,
            groupBy: "destination", // importante que el backend acepte esto
          },
        });
        setChartData(res.data.trips); // debe venir en formato: [{ destination: "Quito", trips: 12 }, ...]
      } catch (error) {
        console.error("Error fetching chart data", error);
      }
    };
    fetchData();
  }, [filters]);

  const chartConfig = {
    trips: {
      label: "Viajes",
      color: "var(--chart-1)",
    },
  };

  return (
    <Card className="gap-4 shadow-none border-none">
      <CardContent>
        <ChartContainer config={chartConfig} className="h-60 w-full">
          <BarChart
            data={chartData}
            maxBarSize={20}
            margin={{ left: -12, right: 12, top: 12 }}
          >
            <CartesianGrid vertical={false} strokeDasharray="2 2" />
            <XAxis dataKey="destination" tickLine={false} />
            <YAxis tickLine={false} />
            <ChartTooltip
              content={<CustomTooltipContent dataKeys={["trips"]} />}
            />
            <Bar dataKey="trips" fill={`url(#${id}-gradient)`} />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
