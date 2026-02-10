import { AlertCircle, CheckCircle2, Clock, ChevronRight, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Pendency {
  id: number;
  client: string;
  description: string;
  dueDate: string;
  responsible: string;
  os?: string;
  status: "atrasada" | "hoje" | "proxima" | "concluida";
  channel: string;
}

const mockPendencies: Pendency[] = [
  { id: 1, client: "João Silva", description: "Retornar para alinhamento e balanceamento", dueDate: "10/02/2026", responsible: "Carlos", os: "OS-0039", status: "hoje", channel: "WhatsApp" },
  { id: 2, client: "Maria Santos", description: "Pagamento restante de R$ 500 da revisão", dueDate: "10/02/2026", responsible: "Admin", os: "OS-0036", status: "hoje", channel: "Presencial" },
  { id: 3, client: "Roberto Ferreira", description: "Pagar parcela de R$ 1.000 referente motor de partida", dueDate: "08/02/2026", responsible: "Admin", os: "OS-0038", status: "atrasada", channel: "WhatsApp" },
  { id: 4, client: "Luciana Mendes", description: "Ligar para confirmar recebimento da peça do câmbio", dueDate: "07/02/2026", responsible: "Carlos", os: "OS-0041", status: "atrasada", channel: "Telefone" },
  { id: 5, client: "Carlos Oliveira", description: "Trazer Hilux para revisão dos 50.000km", dueDate: "12/02/2026", responsible: "Admin", channel: "WhatsApp", status: "proxima" },
  { id: 6, client: "Ana Costa", description: "Retornar para verificar barulho no motor", dueDate: "14/02/2026", responsible: "Carlos", status: "proxima", channel: "Presencial" },
  { id: 7, client: "Pedro Almeida", description: "Buscar orçamento de suspensão aprovado", dueDate: "05/02/2026", responsible: "Admin", status: "concluida", channel: "WhatsApp" },
];

const statusConfig = {
  atrasada: { label: "Atrasada", badge: "badge-overdue", icon: AlertCircle },
  hoje: { label: "Hoje", badge: "badge-open", icon: Clock },
  proxima: { label: "Próxima", badge: "badge-pending", icon: Clock },
  concluida: { label: "Concluída", badge: "badge-paid", icon: CheckCircle2 },
};

const Pendencies = () => {
  const groups = [
    { title: "Atrasadas", items: mockPendencies.filter((p) => p.status === "atrasada"), color: "text-destructive" },
    { title: "Hoje", items: mockPendencies.filter((p) => p.status === "hoje"), color: "text-primary" },
    { title: "Próximas", items: mockPendencies.filter((p) => p.status === "proxima"), color: "text-muted-foreground" },
    { title: "Concluídas Recentes", items: mockPendencies.filter((p) => p.status === "concluida"), color: "text-[hsl(var(--success))]" },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Pendências</h1>
          <p className="text-sm text-muted-foreground">Combinados, retornos e compromissos com clientes</p>
        </div>
        <Button className="gap-2">
          <Plus className="h-4 w-4" /> Nova Pendência
        </Button>
      </div>

      {/* Summary */}
      <div className="grid gap-4 sm:grid-cols-4">
        {groups.map((g) => (
          <div key={g.title} className="rounded-xl border border-border bg-card p-4 text-center">
            <p className="stat-label">{g.title}</p>
            <p className={`mt-2 text-2xl font-bold ${g.color}`}>{g.items.length}</p>
          </div>
        ))}
      </div>

      {/* Grouped Lists */}
      {groups.filter((g) => g.items.length > 0).map((group) => (
        <div key={group.title}>
          <h2 className={`mb-3 text-sm font-semibold uppercase tracking-wider ${group.color}`}>
            {group.title} ({group.items.length})
          </h2>
          <div className="space-y-2">
            {group.items.map((p) => {
              const cfg = statusConfig[p.status];
              return (
                <div
                  key={p.id}
                  className="flex items-center gap-4 rounded-xl border border-border bg-card p-4 card-hover cursor-pointer"
                >
                  <cfg.icon className={`h-5 w-5 flex-shrink-0 ${group.color}`} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium">{p.client}</p>
                      {p.os && <span className="text-[10px] font-bold text-primary">{p.os}</span>}
                      <span className="rounded bg-secondary px-1.5 py-0.5 text-[10px] text-muted-foreground">
                        {p.channel}
                      </span>
                    </div>
                    <p className="mt-0.5 text-xs text-muted-foreground">{p.description}</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <span className={cfg.badge}>{p.dueDate}</span>
                    <p className="mt-1 text-[10px] text-muted-foreground">Resp: {p.responsible}</p>
                  </div>
                  <ChevronRight className="h-4 w-4 flex-shrink-0 text-muted-foreground" />
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
};

export default Pendencies;
