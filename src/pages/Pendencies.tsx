import { AlertCircle, CheckCircle2, Clock, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { usePendencias, useMutatePendencia } from "@/hooks/useSupabase";
import { toast } from "sonner";
import { Link } from "react-router-dom";

const Pendencies = () => {
  const { data: pendencias, isLoading } = usePendencias();
  const { update } = useMutatePendencia();

  const todayStr = new Date().toISOString().split("T")[0];

  const groups = [
    { title: "Atrasadas", items: (pendencias || []).filter((p) => p.status === "aberta" && p.data_prevista < todayStr), color: "text-destructive", icon: AlertCircle },
    { title: "Hoje", items: (pendencias || []).filter((p) => p.status === "aberta" && p.data_prevista === todayStr), color: "text-primary", icon: Clock },
    { title: "Próximas", items: (pendencias || []).filter((p) => p.status === "aberta" && p.data_prevista > todayStr), color: "text-muted-foreground", icon: Clock },
    { title: "Concluídas Recentes", items: (pendencias || []).filter((p) => p.status === "concluida").slice(0, 10), color: "text-[hsl(var(--success))]", icon: CheckCircle2 },
  ];

  const handleConcluir = (id: string) => {
    update.mutate({ id, status: "concluida" }, { onSuccess: () => toast.success("Concluída!") });
  };
  const handleReabrir = (id: string) => {
    update.mutate({ id, status: "aberta" }, { onSuccess: () => toast.success("Reaberta!") });
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Pendências</h1>
          <p className="text-sm text-muted-foreground">Combinados, retornos e compromissos com clientes</p>
        </div>
        <Link to="/"><Button variant="ghost" size="sm">Início</Button></Link>
      </div>

      <div className="grid gap-4 sm:grid-cols-4">
        {groups.map((g) => (
          <div key={g.title} className="rounded-xl border border-border bg-card p-4 text-center">
            <p className="stat-label">{g.title}</p>
            <p className={`mt-2 text-2xl font-bold ${g.color}`}>{g.items.length}</p>
          </div>
        ))}
      </div>

      {groups.filter((g) => g.items.length > 0).map((group) => (
        <div key={group.title}>
          <h2 className={`mb-3 text-sm font-semibold uppercase tracking-wider ${group.color}`}>
            {group.title} ({group.items.length})
          </h2>
          <div className="space-y-2">
            {group.items.map((p) => (
              <div key={p.id} className="flex items-center gap-4 rounded-xl border border-border bg-card p-4 card-hover">
                <group.icon className={`h-5 w-5 flex-shrink-0 ${group.color}`} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium">{(p as any).clientes?.nome}</p>
                  </div>
                  <p className="mt-0.5 text-xs text-muted-foreground">{p.descricao}</p>
                </div>
                <div className="text-right flex-shrink-0">
                  <span className={p.data_prevista < todayStr ? "badge-overdue" : p.data_prevista === todayStr ? "badge-open" : "badge-pending"}>
                    {p.data_prevista}
                  </span>
                  <p className="mt-1 text-[10px] text-muted-foreground">Resp: {p.responsavel}</p>
                </div>
                <div className="flex-shrink-0">
                  {p.status === "aberta" ? (
                    <Button size="sm" variant="outline" className="gap-1 text-xs" onClick={() => handleConcluir(p.id)}>
                      <CheckCircle2 className="h-3 w-3" /> Concluir
                    </Button>
                  ) : (
                    <Button size="sm" variant="ghost" className="gap-1 text-xs" onClick={() => handleReabrir(p.id)}>
                      <RotateCcw className="h-3 w-3" /> Reabrir
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default Pendencies;
