import React from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

const Chart06: React.FC = () => {
  return (
    <Card className="gap-5 border-none shadow-none">
      <CardHeader>
        <div className="flex flex-wrap items-center justify-between gap-3 -mt-10">
          <div className="space-y-0.5">
            <div className="flex items-start gap-2">
              <div className="font-semibold text-2xl">520</div>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2">
              <div
                aria-hidden="true"
                className="size-1.5 shrink-0 rounded-xs bg-green-500"
              ></div>
              <div className="text-[13px]/3 text-muted-foreground/50">
                Finalizados
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div
                aria-hidden="true"
                className="size-1.5 shrink-0 rounded-xs bg-amber-500"
              ></div>
              <div className="text-[13px]/3 text-muted-foreground/50">
                Novedad
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div
                aria-hidden="true"
                className="size-1.5 shrink-0 rounded-xs bg-indigo-500"
              ></div>
              <div className="text-[13px]/3 text-muted-foreground/50">
                Seguim.
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div
                aria-hidden="true"
                className="size-1.5 shrink-0 rounded-xs bg-violet-500"
              ></div>
              <div className="text-[13px]/3 text-muted-foreground/50">
                Prep.
              </div>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex flex-col gap-5">
        <div className="flex gap-1 h-5">
          <div className="bg-green-500 h-full" style={{ width: "75%" }}></div>
          <div className="bg-amber-500 h-full" style={{ width: "15%" }}></div>
          <div className="bg-indigo-500 h-full" style={{ width: "6%" }}></div>
          <div className="bg-violet-500 h-full" style={{ width: "4%" }}></div>
        </div>
        <div>
          <div className="text-[13px]/3 text-muted-foreground/50 mb-3">
            Viajes del año en curso
          </div>
          <ul className="text-sm divide-y divide-border">
            <li className="py-2 flex items-center gap-2">
              <span
                className="size-2 shrink-0 rounded-full bg-green-500"
                aria-hidden="true"
              ></span>
              <span className="grow text-muted-foreground">Finalizados</span>
              <span className="text-[13px]/3 font-medium text-foreground/70">
                450
              </span>
            </li>
            <li className="py-2 flex items-center gap-2">
              <span
                className="size-2 shrink-0 rounded-full bg-amber-500"
                aria-hidden="true"
              ></span>
              <span className="grow text-muted-foreground">Con novedad</span>
              <span className="text-[13px]/3 font-medium text-foreground/70">
                30
              </span>
            </li>
            <li className="py-2 flex items-center gap-2">
              <span
                className="size-2 shrink-0 rounded-full bg-indigo-500"
                aria-hidden="true"
              ></span>
              <span className="grow text-muted-foreground">En seguimiento</span>
              <span className="text-[13px]/3 font-medium text-foreground/70">
                8
              </span>
            </li>
            <li className="py-2 flex items-center gap-2">
              <span
                className="size-2 shrink-0 rounded-full bg-violet-500"
                aria-hidden="true"
              ></span>
              <span className="grow text-muted-foreground">
                Preparados para salir
              </span>
              <span className="text-[13px]/3 font-medium text-foreground/70">
                6
              </span>
            </li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};

export default Chart06;
