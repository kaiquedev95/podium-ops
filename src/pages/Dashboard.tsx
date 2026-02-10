import {
  CalendarDays,
  ClipboardList,
  DollarSign,
  AlertCircle,
  TrendingUp,
  Users,
  Car,
  Clock,
  ChevronRight,
} from "lucide-react";
import { Link } from "react-router-dom";

// Mock data
const stats = [
  { label: "Agendamentos Hoje", value: "5", icon: CalendarDays, color: "text-primary" },
  { label: "OS em Andamento", value: "8", icon: ClipboardList, color: "text-[hsl(var(--chart-3))]" },
  { label: "Faturamento (Mês)", value: "R$ 42.350", icon: TrendingUp, color: "text-[hsl(var(--success))]" },
  { label: "A Receber", value: "R$ 8.720", icon: DollarSign, color: "text-destructive" },
];

const todaySchedule = [
  { time: "08:00", client: "João Silva", vehicle: "Civic 2019", service: "Troca de óleo + filtros", status: "confirmado" },
  { time: "09:30", client: "Maria Santos", vehicle: "Onix 2021", service: "Revisão completa", status: "confirmado" },
  { time: "11:00", client: "Carlos Oliveira", vehicle: "Hilux 2020", service: "Freios dianteiros", status: "aguardando" },
  { time: "14:00", client: "Ana Costa", vehicle: "HB20 2022", service: "Diagnóstico eletrônico", status: "confirmado" },
  { time: "16:00", client: "Pedro Almeida", vehicle: "Corolla 2018", service: "Suspensão", status: "aguardando" },
];

const activeOS = [
  { id: "OS-0042", client: "Roberto Ferreira", vehicle: "Gol G7 2020", status: "em andamento", total: "R$ 1.850" },
  { id: "OS-0041", client: "Luciana Mendes", vehicle: "Tracker 2021", status: "aguardando peça", total: "R$ 3.200" },
  { id: "OS-0040", client: "Felipe Ramos", vehicle: "Compass 2022", status: "em andamento", total: "R$ 2.100" },
];

const pendencies = [
  { client: "João Silva", description: "Retornar para alinhamento", date: "Hoje", type: "atrasada" },
  { client: "Maria Santos", description: "Pagamento restante R$ 500", date: "Hoje", type: "hoje" },
  { client: "Carlos Oliveira", description: "Trazer carro para revisão", date: "12/02", type: "proxima" },
];

const debtors = [
  { client: "Roberto Ferreira", total: "R$ 2.350", os: "OS-0038", days: 15 },
  { client: "Luciana Mendes", total: "R$ 1.200", os: "OS-0035", days: 22 },
  { client: "Ana Paula Lima", total: "R$ 850", os: "OS-0033", days: 8 },
];

const Dashboard = () => {
  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-sm text-muted-foreground">Visão geral da oficina — 10 de fevereiro, 2026</p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <div key={stat.label} className="rounded-xl border border-border bg-card p-5 card-hover">
            <div className="flex items-center justify-between">
              <stat.icon className={`h-5 w-5 ${stat.color}`} />
            </div>
            <p className="mt-3 stat-value">{stat.value}</p>
            <p className="mt-1 stat-label">{stat.label}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Today's Schedule */}
        <div className="lg:col-span-2 rounded-xl border border-border bg-card">
          <div className="flex items-center justify-between border-b border-border px-5 py-4">
            <h2 className="font-semibold">Agendamentos de Hoje</h2>
            <Link to="/agendamentos" className="flex items-center gap-1 text-xs text-primary hover:underline">
              Ver todos <ChevronRight className="h-3 w-3" />
            </Link>
          </div>
          <div className="divide-y divide-border">
            {todaySchedule.map((item, i) => (
              <div key={i} className="flex items-center gap-4 px-5 py-3">
                <div className="flex h-10 w-16 items-center justify-center rounded-md bg-secondary text-xs font-bold text-secondary-foreground">
                  {item.time}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{item.client}</p>
                  <p className="text-xs text-muted-foreground truncate">{item.vehicle} — {item.service}</p>
                </div>
                <span className={item.status === "confirmado" ? "badge-paid" : "badge-open"}>
                  {item.status}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Pendencies */}
        <div className="rounded-xl border border-border bg-card">
          <div className="flex items-center justify-between border-b border-border px-5 py-4">
            <h2 className="font-semibold">Pendências</h2>
            <Link to="/pendencias" className="flex items-center gap-1 text-xs text-primary hover:underline">
              Ver todas <ChevronRight className="h-3 w-3" />
            </Link>
          </div>
          <div className="divide-y divide-border">
            {pendencies.map((item, i) => (
              <div key={i} className="px-5 py-3">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium">{item.client}</p>
                  <span className={
                    item.type === "atrasada" ? "badge-overdue" :
                    item.type === "hoje" ? "badge-open" : "badge-pending"
                  }>
                    {item.date}
                  </span>
                </div>
                <p className="mt-1 text-xs text-muted-foreground">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Active OS */}
        <div className="rounded-xl border border-border bg-card">
          <div className="flex items-center justify-between border-b border-border px-5 py-4">
            <h2 className="font-semibold">OS em Andamento</h2>
            <Link to="/ordens-servico" className="flex items-center gap-1 text-xs text-primary hover:underline">
              Ver todas <ChevronRight className="h-3 w-3" />
            </Link>
          </div>
          <div className="divide-y divide-border">
            {activeOS.map((os) => (
              <div key={os.id} className="flex items-center justify-between px-5 py-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-primary">{os.id}</span>
                    <span className="text-sm font-medium">{os.client}</span>
                  </div>
                  <p className="text-xs text-muted-foreground">{os.vehicle}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold">{os.total}</p>
                  <span className={os.status === "aguardando peça" ? "badge-open" : "badge-paid"}>
                    {os.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Debtors */}
        <div className="rounded-xl border border-border bg-card">
          <div className="flex items-center justify-between border-b border-border px-5 py-4">
            <h2 className="font-semibold">Clientes Devendo</h2>
            <Link to="/financeiro" className="flex items-center gap-1 text-xs text-primary hover:underline">
              Ver todos <ChevronRight className="h-3 w-3" />
            </Link>
          </div>
          <div className="divide-y divide-border">
            {debtors.map((d, i) => (
              <div key={i} className="flex items-center justify-between px-5 py-3">
                <div>
                  <p className="text-sm font-medium">{d.client}</p>
                  <p className="text-xs text-muted-foreground">{d.os} — {d.days} dias</p>
                </div>
                <span className="text-sm font-bold text-destructive">{d.total}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
