import { useState } from "react";
import { Plus, ChevronLeft, ChevronRight, Clock, Car, User } from "lucide-react";
import { Button } from "@/components/ui/button";

const weekDays = ["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

const mockSchedule: Record<string, { time: string; client: string; vehicle: string; service: string; status: string }[]> = {
  "10/02": [
    { time: "08:00", client: "João Silva", vehicle: "Civic 2019", service: "Troca de óleo", status: "confirmado" },
    { time: "09:30", client: "Maria Santos", vehicle: "Onix 2021", service: "Revisão completa", status: "confirmado" },
    { time: "11:00", client: "Carlos Oliveira", vehicle: "Hilux 2020", service: "Freios", status: "aguardando" },
    { time: "14:00", client: "Ana Costa", vehicle: "HB20 2022", service: "Diagnóstico", status: "confirmado" },
    { time: "16:00", client: "Pedro Almeida", vehicle: "Corolla 2018", service: "Suspensão", status: "aguardando" },
  ],
  "11/02": [
    { time: "08:00", client: "Roberto Ferreira", vehicle: "Gol G7 2020", service: "Embreagem", status: "confirmado" },
    { time: "10:00", client: "Fernanda Lima", vehicle: "Argo 2021", service: "Ar condicionado", status: "confirmado" },
    { time: "14:00", client: "Marcos Souza", vehicle: "S10 2019", service: "Injeção eletrônica", status: "aguardando" },
  ],
  "12/02": [
    { time: "09:00", client: "Carlos Oliveira", vehicle: "Hilux 2020", service: "Revisão", status: "confirmado" },
    { time: "15:00", client: "Paula Ribeiro", vehicle: "Kicks 2022", service: "Pneus", status: "aguardando" },
  ],
  "13/02": [
    { time: "08:30", client: "Ricardo Dias", vehicle: "Toro 2021", service: "Motor", status: "confirmado" },
  ],
  "14/02": [],
  "15/02": [
    { time: "08:00", client: "Juliana Martins", vehicle: "Creta 2023", service: "Revisão 10.000km", status: "confirmado" },
  ],
};

const days = ["10/02", "11/02", "12/02", "13/02", "14/02", "15/02"];

const Schedule = () => {
  const [selectedDay, setSelectedDay] = useState("10/02");
  const appointments = mockSchedule[selectedDay] || [];

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Agendamentos</h1>
          <p className="text-sm text-muted-foreground">Semana de 10 a 15 de Fevereiro</p>
        </div>
        <Button className="gap-2">
          <Plus className="h-4 w-4" /> Novo Agendamento
        </Button>
      </div>

      {/* Week Strip */}
      <div className="flex items-center gap-2">
        <button className="rounded-lg p-2 text-muted-foreground hover:bg-secondary">
          <ChevronLeft className="h-4 w-4" />
        </button>
        <div className="flex flex-1 gap-2">
          {days.map((day, i) => {
            const count = (mockSchedule[day] || []).length;
            const isSelected = day === selectedDay;
            const isToday = day === "10/02";
            return (
              <button
                key={day}
                onClick={() => setSelectedDay(day)}
                className={`flex flex-1 flex-col items-center gap-1 rounded-xl border py-3 transition-all ${
                  isSelected
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border bg-card text-secondary-foreground hover:border-primary/30"
                }`}
              >
                <span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                  {weekDays[i]}
                </span>
                <span className={`text-lg font-bold ${isToday && !isSelected ? "text-primary" : ""}`}>
                  {day.split("/")[0]}
                </span>
                <span className="text-[10px] text-muted-foreground">{count} agend.</span>
              </button>
            );
          })}
        </div>
        <button className="rounded-lg p-2 text-muted-foreground hover:bg-secondary">
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>

      {/* Appointments for selected day */}
      <div className="space-y-3">
        {appointments.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-xl border border-border bg-card py-16 text-muted-foreground">
            <Clock className="mb-3 h-8 w-8" />
            <p className="text-sm font-medium">Nenhum agendamento neste dia</p>
          </div>
        ) : (
          appointments.map((apt, i) => (
            <div
              key={i}
              className="flex items-center gap-4 rounded-xl border border-border bg-card p-4 card-hover cursor-pointer"
            >
              <div className="flex h-12 w-16 flex-col items-center justify-center rounded-lg bg-primary/10">
                <Clock className="mb-0.5 h-3 w-3 text-primary" />
                <span className="text-sm font-bold text-primary">{apt.time}</span>
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <User className="h-3 w-3 text-muted-foreground" />
                  <p className="text-sm font-medium">{apt.client}</p>
                </div>
                <div className="mt-1 flex items-center gap-3 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Car className="h-3 w-3" /> {apt.vehicle}
                  </span>
                  <span>• {apt.service}</span>
                </div>
              </div>
              <span className={apt.status === "confirmado" ? "badge-paid" : "badge-open"}>
                {apt.status}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Schedule;
