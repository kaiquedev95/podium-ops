import { useState } from "react";
import { Plus, Search, ChevronRight, Eye, DollarSign, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type OSStatus = "em andamento" | "aguardando peça" | "concluída" | "orçamento";
type FinStatus = "aberto" | "parcial" | "pago" | "atrasado";

interface OS {
  id: string;
  client: string;
  vehicle: string;
  plate: string;
  status: OSStatus;
  finStatus: FinStatus;
  total: number;
  paid: number;
  date: string;
  services: string;
}

const mockOS: OS[] = [
  { id: "OS-0042", client: "Roberto Ferreira", vehicle: "Gol G7 2020", plate: "JKL-3456", status: "em andamento", finStatus: "aberto", total: 1850, paid: 0, date: "10/02/2026", services: "Embreagem completa + retífica" },
  { id: "OS-0041", client: "Luciana Mendes", vehicle: "Tracker 2021", plate: "MNO-7890", status: "aguardando peça", finStatus: "parcial", total: 3200, paid: 2000, date: "08/02/2026", services: "Câmbio automático — peça em pedido" },
  { id: "OS-0040", client: "Felipe Ramos", vehicle: "Compass 2022", plate: "XYZ-4321", status: "em andamento", finStatus: "aberto", total: 2100, paid: 0, date: "07/02/2026", services: "Suspensão dianteira + alinhamento" },
  { id: "OS-0039", client: "João Silva", vehicle: "Civic 2019", plate: "ABC-1234", status: "concluída", finStatus: "pago", total: 450, paid: 450, date: "05/02/2026", services: "Troca de óleo + filtros" },
  { id: "OS-0038", client: "Roberto Ferreira", vehicle: "Gol G7 2020", plate: "JKL-3456", status: "concluída", finStatus: "atrasado", total: 2800, paid: 450, date: "26/01/2026", services: "Motor de partida + bateria" },
  { id: "OS-0037", client: "Ana Costa", vehicle: "HB20 2022", plate: "STU-5678", status: "concluída", finStatus: "pago", total: 380, paid: 380, date: "20/01/2026", services: "Diagnóstico + limpeza de bicos" },
];

const statusBadge = (s: OSStatus) => {
  const map: Record<OSStatus, string> = {
    "em andamento": "badge-open",
    "aguardando peça": "badge-partial",
    "concluída": "badge-paid",
    "orçamento": "badge-pending",
  };
  return map[s];
};

const finBadge = (s: FinStatus) => {
  const map: Record<FinStatus, string> = {
    aberto: "badge-open",
    parcial: "badge-partial",
    pago: "badge-paid",
    atrasado: "badge-overdue",
  };
  return map[s];
};

const ServiceOrders = () => {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("todos");

  const filters: { label: string; value: string }[] = [
    { label: "Todos", value: "todos" },
    { label: "Em Andamento", value: "em andamento" },
    { label: "Aguardando Peça", value: "aguardando peça" },
    { label: "Concluída", value: "concluída" },
  ];

  const filtered = mockOS.filter((os) => {
    const matchSearch = os.client.toLowerCase().includes(search.toLowerCase()) ||
      os.id.toLowerCase().includes(search.toLowerCase()) ||
      os.plate.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "todos" || os.status === statusFilter;
    return matchSearch && matchStatus;
  });

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Ordens de Serviço</h1>
          <p className="text-sm text-muted-foreground">{mockOS.length} ordens registradas</p>
        </div>
        <Button className="gap-2">
          <Plus className="h-4 w-4" /> Nova OS
        </Button>
      </div>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <div className="relative max-w-md flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar por OS, cliente ou placa..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex gap-2">
          {filters.map((f) => (
            <button
              key={f.value}
              onClick={() => setStatusFilter(f.value)}
              className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                statusFilter === f.value
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* OS Table */}
      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border bg-secondary/50">
              <th className="px-5 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">OS</th>
              <th className="px-5 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">Cliente / Veículo</th>
              <th className="px-5 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">Serviço</th>
              <th className="px-5 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">Status</th>
              <th className="px-5 py-3 text-right text-xs font-medium uppercase tracking-wider text-muted-foreground">Financeiro</th>
              <th className="px-5 py-3 text-right text-xs font-medium uppercase tracking-wider text-muted-foreground">Total</th>
              <th className="px-5 py-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {filtered.map((os) => (
              <tr key={os.id} className="transition-colors hover:bg-secondary/30 cursor-pointer">
                <td className="px-5 py-3">
                  <span className="text-sm font-bold text-primary">{os.id}</span>
                  <p className="text-[10px] text-muted-foreground">{os.date}</p>
                </td>
                <td className="px-5 py-3">
                  <p className="text-sm font-medium">{os.client}</p>
                  <p className="text-xs text-muted-foreground">{os.vehicle} • {os.plate}</p>
                </td>
                <td className="px-5 py-3">
                  <p className="text-sm text-secondary-foreground max-w-[200px] truncate">{os.services}</p>
                </td>
                <td className="px-5 py-3">
                  <span className={statusBadge(os.status)}>{os.status}</span>
                </td>
                <td className="px-5 py-3 text-right">
                  <span className={finBadge(os.finStatus)}>{os.finStatus}</span>
                </td>
                <td className="px-5 py-3 text-right">
                  <p className="text-sm font-semibold">R$ {os.total.toLocaleString("pt-BR")}</p>
                  {os.paid > 0 && os.paid < os.total && (
                    <p className="text-[10px] text-muted-foreground">
                      Pago: R$ {os.paid.toLocaleString("pt-BR")}
                    </p>
                  )}
                </td>
                <td className="px-5 py-3">
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ServiceOrders;
