import { useState } from "react";
import { AlertCircle, CheckCircle2, Clock, RotateCcw, Pencil, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { usePendencias, useMutatePendencia, useClientes } from "@/hooks/useSupabase";
import { toast } from "sonner";
import { Link } from "react-router-dom";

const Pendencies = () => {
  const { data: pendencias, isLoading } = usePendencias();
  const { data: clientes } = useClientes();
  const { create, update } = useMutatePendencia();
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState({ descricao: "", data_prevista: "", responsavel: "Admin", cliente_id: "" });

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

  const openNew = () => { setForm({ descricao: "", data_prevista: "", responsavel: "Admin", cliente_id: "" }); setEditId(null); setShowForm(true); };
  const openEdit = (p: any) => { setForm({ descricao: p.descricao, data_prevista: p.data_prevista, responsavel: p.responsavel, cliente_id: p.cliente_id }); setEditId(p.id); setShowForm(true); };

  const handleSave = () => {
    if (!form.descricao.trim() || !form.data_prevista || !form.cliente_id) { toast.error("Preencha descrição, data e cliente"); return; }
    if (editId) {
      update.mutate({ id: editId, descricao: form.descricao, data_prevista: form.data_prevista, responsavel: form.responsavel, cliente_id: form.cliente_id }, {
        onSuccess: () => { toast.success("Pendência atualizada!"); setShowForm(false); },
        onError: (e) => toast.error(e.message),
      });
    } else {
      create.mutate({ descricao: form.descricao, data_prevista: form.data_prevista, responsavel: form.responsavel, cliente_id: form.cliente_id }, {
        onSuccess: () => { toast.success("Pendência criada!"); setShowForm(false); },
        onError: (e) => toast.error(e.message),
      });
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">Pendências</h1>
          <p className="text-sm text-muted-foreground">Combinados, retornos e compromissos com clientes</p>
        </div>
        <div className="flex gap-2">
          <Link to="/"><Button variant="ghost" size="sm">Início</Button></Link>
          <Button className="gap-2" onClick={openNew}><Plus className="h-4 w-4" /> Nova Pendência</Button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
        {groups.map((g) => (
          <div key={g.title} className="rounded-xl border border-border bg-card p-3 sm:p-4 text-center">
            <p className="stat-label text-[10px] sm:text-xs">{g.title}</p>
            <p className={`mt-1 sm:mt-2 text-xl sm:text-2xl font-bold ${g.color}`}>{g.items.length}</p>
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
              <div key={p.id} className="rounded-xl border border-border bg-card p-4 card-hover space-y-3 sm:space-y-0 sm:flex sm:items-center sm:gap-4">
                <div className="flex items-center gap-3 sm:flex-1 sm:min-w-0">
                  <group.icon className={`h-5 w-5 flex-shrink-0 ${group.color}`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium">{(p as any).clientes?.nome}</p>
                    <p className="mt-0.5 text-xs text-muted-foreground truncate">{p.descricao}</p>
                  </div>
                </div>
                <div className="flex items-center justify-between gap-2 sm:flex-shrink-0">
                  <div>
                    <span className={p.data_prevista < todayStr ? "badge-overdue" : p.data_prevista === todayStr ? "badge-open" : "badge-pending"}>
                      {p.data_prevista}
                    </span>
                    <p className="mt-1 text-[10px] text-muted-foreground">Resp: {p.responsavel}</p>
                  </div>
                  <div className="flex gap-1">
                    <button onClick={() => openEdit(p)} className="rounded p-1 text-muted-foreground hover:text-primary"><Pencil className="h-4 w-4" /></button>
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
              </div>
            ))}
          </div>
        </div>
      ))}

      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent>
          <DialogHeader><DialogTitle>{editId ? "Editar" : "Nova"} Pendência</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <select className="w-full rounded-lg border border-border bg-card p-2 text-sm" value={form.cliente_id} onChange={(e) => setForm({ ...form, cliente_id: e.target.value })}>
              <option value="">Selecione o cliente *</option>
              {(clientes || []).map((c) => <option key={c.id} value={c.id}>{c.nome}</option>)}
            </select>
            <textarea className="w-full rounded-lg border border-border bg-card p-2 text-sm min-h-[80px]" placeholder="Descrição *" value={form.descricao} onChange={(e) => setForm({ ...form, descricao: e.target.value })} />
            <Input type="date" placeholder="Data prevista *" value={form.data_prevista} onChange={(e) => setForm({ ...form, data_prevista: e.target.value })} />
            <Input placeholder="Responsável" value={form.responsavel} onChange={(e) => setForm({ ...form, responsavel: e.target.value })} />
            <Button onClick={handleSave} disabled={create.isPending || update.isPending} className="w-full">
              {(create.isPending || update.isPending) ? "Salvando..." : "Salvar"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Pendencies;
