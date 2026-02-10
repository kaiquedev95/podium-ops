import { useState } from "react";
import { DollarSign, Search, Filter, ChevronRight, CreditCard } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface Receivable {
  os: string;
  client: string;
  vehicle: string;
  total: number;
  paid: number;
  balance: number;
  dueDate: string;
  status: "aberto" | "parcial" | "atrasado";
  daysOverdue: number;
}

const mockReceivables: Receivable[] = [
  { os: "OS-0042", client: "Roberto Ferreira", vehicle: "Gol G7 2020", total: 1850, paid: 0, balance: 1850, dueDate: "15/02/2026", status: "aberto", daysOverdue: 0 },
  { os: "OS-0041", client: "Luciana Mendes", vehicle: "Tracker 2021", total: 3200, paid: 2000, balance: 1200, dueDate: "10/02/2026", status: "parcial", daysOverdue: 0 },
  { os: "OS-0038", client: "Roberto Ferreira", vehicle: "Gol G7 2020", total: 2800, paid: 450, balance: 2350, dueDate: "28/01/2026", status: "atrasado", daysOverdue: 13 },
  { os: "OS-0035", client: "Luciana Mendes", vehicle: "Tracker 2021", total: 1800, paid: 600, balance: 1200, dueDate: "20/01/2026", status: "atrasado", daysOverdue: 21 },
  { os: "OS-0033", client: "Ana Paula Lima", vehicle: "Celta 2015", total: 950, paid: 100, balance: 850, dueDate: "02/02/2026", status: "atrasado", daysOverdue: 8 },
];

const totalBalance = mockReceivables.reduce((sum, r) => sum + r.balance, 0);
const totalOverdue = mockReceivables.filter((r) => r.status === "atrasado").reduce((sum, r) => sum + r.balance, 0);

const Financial = () => {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("todos");

  const filters = [
    { label: "Todos", value: "todos" },
    { label: "Aberto", value: "aberto" },
    { label: "Parcial", value: "parcial" },
    { label: "Atrasado", value: "atrasado" },
  ];

  const filtered = mockReceivables.filter((r) => {
    const matchSearch = r.client.toLowerCase().includes(search.toLowerCase()) || r.os.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "todos" || r.status === statusFilter;
    return matchSearch && matchStatus;
  });

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold">Contas a Receber</h1>
        <p className="text-sm text-muted-foreground">Controle de pagamentos e clientes devendo</p>
      </div>

      {/* Summary */}
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-border bg-card p-5">
          <p className="stat-label">Total a Receber</p>
          <p className="mt-2 text-2xl font-bold text-primary">R$ {totalBalance.toLocaleString("pt-BR")}</p>
        </div>
        <div className="rounded-xl border border-border bg-card p-5">
          <p className="stat-label">Atrasados</p>
          <p className="mt-2 text-2xl font-bold text-destructive">R$ {totalOverdue.toLocaleString("pt-BR")}</p>
        </div>
        <div className="rounded-xl border border-border bg-card p-5">
          <p className="stat-label">Clientes Devendo</p>
          <p className="mt-2 stat-value">{new Set(mockReceivables.map((r) => r.client)).size}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <div className="relative max-w-md flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Buscar por cliente ou OS..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10" />
        </div>
        <div className="flex gap-2">
          {filters.map((f) => (
            <button
              key={f.value}
              onClick={() => setStatusFilter(f.value)}
              className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                statusFilter === f.value ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Receivables List */}
      <div className="space-y-3">
        {filtered.map((r) => (
          <div key={r.os} className="flex items-center gap-4 rounded-xl border border-border bg-card p-4 card-hover cursor-pointer">
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-destructive/10">
              <DollarSign className="h-5 w-5 text-destructive" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-primary">{r.os}</span>
                <span className="text-sm font-medium">{r.client}</span>
              </div>
              <p className="text-xs text-muted-foreground">
                {r.vehicle} • Vencimento: {r.dueDate}
                {r.daysOverdue > 0 && <span className="text-destructive"> • {r.daysOverdue} dias atrasado</span>}
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm font-bold text-destructive">R$ {r.balance.toLocaleString("pt-BR")}</p>
              <p className="text-[10px] text-muted-foreground">
                de R$ {r.total.toLocaleString("pt-BR")} (pago: R$ {r.paid.toLocaleString("pt-BR")})
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button size="sm" variant="outline" className="gap-1 text-xs">
                <CreditCard className="h-3 w-3" /> Registrar Pgto
              </Button>
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Financial;
