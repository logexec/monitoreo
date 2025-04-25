import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import axios from "axios";
import { useGlobalFilters } from "@/contexts/GlobalFilterContext";

type StatusCounts = {
  finalizados: number;
  con_novedad: number;
  en_seguimiento: number;
  preparados: number;
};

type ChartData = {
  total: number;
  status_counts: StatusCounts;
};

const statusConfig = [
  {
    key: "finalizados",
    label: "Finalizados",
    color: "bg-green-500",
  },
  {
    key: "con_novedad",
    label: "Con novedad",
    color: "bg-amber-500",
  },
  {
    key: "en_seguimiento",
    label: "En seguimiento",
    color: "bg-indigo-500",
  },
  {
    key: "preparados",
    label: "Preparados para salir",
    color: "bg-violet-500",
  },
] as const;

const Chart06: React.FC = () => {
  const { filters } = useGlobalFilters();
  const [chartData, setChartData] = useState<ChartData>({
    total: 0,
    status_counts: {
      finalizados: 0,
      con_novedad: 0,
      en_seguimiento: 0,
      preparados: 0,
    },
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const res = await axios.get("/dashboardTrips", {
          params: {
            action: "status_counts",
            period: filters.period,
            project: filters.projects.length ? filters.projects : undefined,
            destination: filters.destinations.length
              ? filters.destinations
              : undefined,
          },
        });

        if (
          res.data &&
          res.data.total !== undefined &&
          res.data.status_counts
        ) {
          setChartData({
            total: res.data.total,
            status_counts: res.data.status_counts,
          });
        } else {
          setError("Formato de datos inesperado");
        }
      } catch (error) {
        console.error("Error fetching chart data", error);
        setError("No se pudieron cargar los datos.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [filters.projects, filters.destinations, filters.period]);

  // Filter statuses with non-zero counts
  const activeStatuses = statusConfig.filter(
    (status) => chartData.status_counts[status.key] > 0
  );

  // Calculate total of non-zero counts
  const activeTotal =
    activeStatuses.reduce(
      (sum, status) => sum + chartData.status_counts[status.key],
      0
    ) || 1; // Avoid division by zero

  // Calculate percentages for the progress bar
  const percentages = activeStatuses.reduce(
    (acc, status) => ({
      ...acc,
      [status.key]: (chartData.status_counts[status.key] / activeTotal) * 100,
    }),
    {} as Record<string, number>
  );

  return (
    <Card className="gap-5 border-none shadow-none">
      <CardHeader>
        <div className="flex flex-wrap items-center justify-between gap-3 -mt-10">
          <div className="space-y-0.5">
            <div className="flex items-start gap-2">
              <div className="font-semibold text-2xl">{activeTotal}</div>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-4">
            {activeStatuses.map((status) => (
              <div key={status.key} className="flex items-center gap-2">
                <div
                  aria-hidden="true"
                  className={`size-1.5 shrink-0 rounded-xs ${status.color}`}
                />
                <div className="text-[13px]/3 text-muted-foreground/50">
                  {status.label.split(" ")[0]}
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex flex-col gap-5">
        {isLoading && <p className="text-center py-4">Cargando datos...</p>}
        {error && <p className="text-red-500 text-center py-4">{error}</p>}
        {!isLoading && !error && (
          <>
            <div className="flex gap-1 h-5">
              {activeStatuses.map((status) => (
                <div
                  key={status.key}
                  className={`${status.color} h-full`}
                  style={{ width: `${percentages[status.key]}%` }}
                />
              ))}
            </div>
            <div>
              <div className="text-[13px]/3 text-muted-foreground/50 mb-3">
                Viajes del período seleccionado
              </div>
              <ul className="text-sm divide-y divide-border">
                {activeStatuses.map((status) => (
                  <li key={status.key} className="py-2 flex items-center gap-2">
                    <span
                      className={`size-2 shrink-0 rounded-full ${status.color}`}
                      aria-hidden="true"
                    ></span>
                    <span className="grow text-muted-foreground">
                      {status.label}
                    </span>
                    <span className="text-[13px]/3 font-medium text-foreground/70">
                      {chartData.status_counts[status.key]}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default Chart06;
