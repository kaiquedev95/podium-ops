import { useState } from "react";
import { Plus, Clock, Car, User, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useAgendamentos, useMutateAgendamento, useClientes, useVeiculos } from "@/hooks/useSupabase";
import { toast } from "sonner";
import { Link } from "react-router-dom";
import { format, startOfWeek, addDays, isSameDay } from "date-fns";
import { ptBR } from "date-fns/locale";

const weekDayNames = ["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

const Schedule = () => {
  const { data: agendamentos } = useAgendamentos();
  const { data: clientes } = useClientes();
  const { create, update, remove } = useMutateAgendamento();
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [weekStart, setWeekStart] = useState(() => startOfWeek(new Date(), { weekStartsOn: 1 }));
  const [selectedDay, setSelectedDay] = useState(new Date());
  const [form, setForm] = useState({ cliente_id: "", veiculo_id: "", data_hora: "", servico_resumo: "", observacoes: "", status: "agendado" });

  const days = Array.from({ length: 6 }, (_, i) => addDays(weekStart, i));
  const dayAgendamentos = (agendamentos || []).filter((a) => isSameDay(new Date(a.data_hora), selectedDay));

  const openNew = () => { setForm({ cliente_id: "", veiculo_id: "", data_hora: "", servico_resumo: "", observacoes: "", status: "agendado" }); setEditId(null); setShowForm(true); };
  const openEdit = (a: any) => {
    setForm({
      cliente_id: a.cliente_id,
      veiculo_id: a.veiculo_id || "",
      data_hora: a.data_hora.slice(0, 16),
      servico_resumo: a.servico_resumo || "",
      observacoes: a.observacoes || "",
      status: a.status,
    });
    setEditId(a.id);
    setShowForm(true);
  };

  const handleSave = () => {
    if (!form.cliente_id || !form.data_hora) { toast.error("Cliente e horário obrigatórios"); return; }
    const payload = {
      cliente_id: form.cliente_id,
      veiculo_id: form.veiculo_id || null,
      data_hora: form.data_hora,
      servico_resumo: form.servico_resumo || null,
      observacoes: form.observacoes || null,
      status: form.status,
    };
    if (editId) {
      update.mutate({ id: editId, ...payload }, {
        onSuccess: () => { toast.success("Agendamento atualizado!"); setShowForm(false); },
        onError: (e) => toast.error(e.message),
      });
    } else {
      create.mutate(payload, {
        onSuccess: () => { toast.success("Agendamento criado!"); setShowForm(false); setForm({ cliente_id: "", veiculo_id: "", data_hora: "", servico_resumo: "", observacoes: "", status: "agendado" }); },
        onError: (e) => toast.error(e.message),
      });
    }
  };

  const handleDelete = (id: string) => {
    if (!confirm("Excluir agendamento?")) return;
    remove.mutate(id, { onSuccess: () => toast.success("Excluído!"), onError: (e) => toast.error(e.message) });
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Agendamentos</h1>
          <p className="text-sm text-muted-foreground">{format(weekStart, "'Semana de' dd", { locale: ptBR })} a {format(addDays(weekStart, 5), "dd 'de' MMMM", { locale: ptBR })}</p>
        </div>
        <div className="flex gap-2">
          <Link to="/"><Button variant="ghost" size="sm">Início</Button></Link>
          <Button className="gap-2" onClick={openNew}><Plus className="h-4 w-4" /> Novo Agendamento</Button>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <button className="rounded-lg p-2 text-muted-foreground hover:bg-secondary" onClick={() => setWeekStart(addDays(weekStart, -7))}>←</button>
        <div className="flex flex-1 gap-2">
          {days.map((day, i) => {
            const count = (agendamentos || []).filter((a) => isSameDay(new Date(a.data_hora), day)).length;
            const isSelected = isSameDay(day, selectedDay);
            const isToday = isSameDay(day, new Date());
            return (
              <button key={i} onClick={() => setSelectedDay(day)} className={`flex flex-1 flex-col items-center gap-1 rounded-xl border py-3 transition-all ${isSelected ? "border-primary bg-primary/10 text-primary" : "border-border bg-card text-secondary-foreground hover:border-primary/30"}`}>
                <span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">{weekDayNames[i]}</span>
                <span className={`text-lg font-bold ${isToday && !isSelected ? "text-primary" : ""}`}>{format(day, "dd")}</span>
                <span className="text-[10px] text-muted-foreground">{count} agend.</span>
              </button>
            );
          })}
        </div>
        <button className="rounded-lg p-2 text-muted-foreground hover:bg-secondary" onClick={() => setWeekStart(addDays(weekStart, 7))}>→</button>
      </div>

      <div className="space-y-3">
        {dayAgendamentos.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-xl border border-border bg-card py-16 text-muted-foreground">
            <Clock className="mb-3 h-8 w-8" />
            <p className="text-sm font-medium">Nenhum agendamento neste dia</p>
          </div>
        ) : (
          dayAgendamentos.map((apt) => (
            <div key={apt.id} className="flex items-center gap-4 rounded-xl border border-border bg-card p-4 card-hover">
              <div className="flex h-12 w-16 flex-col items-center justify-center rounded-lg bg-primary/10">
                <Clock className="mb-0.5 h-3 w-3 text-primary" />
                <span className="text-sm font-bold text-primary">{format(new Date(apt.data_hora), "HH:mm")}</span>
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <User className="h-3 w-3 text-muted-foreground" />
                  <p className="text-sm font-medium">{(apt as any).clientes?.nome}</p>
                </div>
                <div className="mt-1 flex items-center gap-3 text-xs text-muted-foreground">
                  {(apt as any).veiculos?.modelo && <span className="flex items-center gap-1"><Car className="h-3 w-3" /> {(apt as any).veiculos?.modelo}</span>}
                  {apt.servico_resumo && <span>• {apt.servico_resumo}</span>}
                </div>
              </div>
              <span className={apt.status === "confirmado" ? "badge-paid" : "badge-open"}>{apt.status}</span>
              <div className="flex gap-1">
                <button onClick={() => openEdit(apt)} className="rounded p-1 text-muted-foreground hover:text-primary"><Pencil className="h-4 w-4" /></button>
                <button onClick={() => handleDelete(apt.id)} className="rounded p-1 text-muted-foreground hover:text-destructive"><Trash2 className="h-4 w-4" /></button>
              </div>
            </div>
          ))
        )}
      </div>

      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent>
          <DialogHeader><DialogTitle>{editId ? "Editar" : "Novo"} Agendamento</DialogTitle></DialogHeader>
          <AgendForm form={form} setForm={setForm} clientes={clientes || []} onSave={handleSave} isPending={create.isPending || update.isPending} isEdit={!!editId} />
        </DialogContent>
      </Dialog>
    </div>
  );
};

const AgendForm = ({ form, setForm, clientes, onSave, isPending, isEdit }: any) => {
  const { data: veiculos } = useVeiculos(form.cliente_id || undefined);
  return (
    <div className="space-y-3">
      <select className="w-full rounded-lg border border-border bg-card p-2 text-sm" value={form.cliente_id} onChange={(e) => setForm({ ...form, cliente_id: e.target.value, veiculo_id: "" })}>
        <option value="">Selecione o cliente *</option>
        {clientes.map((c: any) => <option key={c.id} value={c.id}>{c.nome}</option>)}
      </select>
      {form.cliente_id && (
        <select className="w-full rounded-lg border border-border bg-card p-2 text-sm" value={form.veiculo_id} onChange={(e) => setForm({ ...form, veiculo_id: e.target.value })}>
          <option value="">Selecione o veículo</option>
          {(veiculos || []).map((v: any) => <option key={v.id} value={v.id}>{v.marca} {v.modelo} — {v.placa}</option>)}
        </select>
      )}
      <Input type="datetime-local" value={form.data_hora} onChange={(e) => setForm({ ...form, data_hora: e.target.value })} />
      <Input placeholder="Serviço resumo" value={form.servico_resumo} onChange={(e) => setForm({ ...form, servico_resumo: e.target.value })} />
      <Input placeholder="Observações" value={form.observacoes} onChange={(e) => setForm({ ...form, observacoes: e.target.value })} />
      {isEdit && (
        <select className="w-full rounded-lg border border-border bg-card p-2 text-sm" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
          <option value="agendado">Agendado</option>
          <option value="confirmado">Confirmado</option>
          <option value="cancelado">Cancelado</option>
          <option value="realizado">Realizado</option>
        </select>
      )}
      <Button onClick={onSave} disabled={isPending} className="w-full">{isPending ? "Salvando..." : "Salvar"}</Button>
    </div>
  );
};

export default Schedule;
