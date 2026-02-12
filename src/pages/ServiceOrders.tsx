import { useState } from "react";
import { Plus, Search, ChevronRight, ArrowLeft, CreditCard, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useOrdensServico, useMutateOS, useClientes, useVeiculos, usePagamentos, useMutatePagamento, calcFinStatus } from "@/hooks/useSupabase";
import { toast } from "sonner";
import { Link } from "react-router-dom";
import { MoneyInput, parseBRL } from "@/components/MoneyInput";

const finBadge = (s: string) => {
  const map: Record<string, string> = { aberto: "badge-open", parcial: "badge-partial", pago: "badge-paid", atrasado: "badge-overdue" };
  return map[s] || "badge-pending";
};
const statusBadge = (s: string) => {
  const map: Record<string, string> = { "em andamento": "badge-open", "aguardando peça": "badge-partial", "concluída": "badge-paid", "orçamento": "badge-pending" };
  return map[s] || "badge-pending";
};

const ServiceOrders = () => {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("todos");
  const { data: ordensRaw, isLoading } = useOrdensServico();
  const { create, update } = useMutateOS();
  const { data: clientes } = useClientes();
  const [showForm, setShowForm] = useState(false);
  const [editOS, setEditOS] = useState<any>(null);
  const [selectedOS, setSelectedOS] = useState<string | null>(null);
  const [form, setForm] = useState({ cliente_id: "", veiculo_id: "", como_chegou: "", o_que_foi_feito: "", pecas_texto: "", total: "", status: "em andamento", vencimento: "" });

  const ordens = (ordensRaw || []).map((os) => {
    const totalPago = (os.pagamentos || []).reduce((s: number, p: any) => s + Number(p.valor), 0);
    const saldo = Number(os.total) - totalPago;
    const finStatus = calcFinStatus(Number(os.total), totalPago, os.vencimento);
    return { ...os, totalPago, saldo, finStatus };
  });

  const filters = [
    { label: "Todos", value: "todos" },
    { label: "Em Andamento", value: "em andamento" },
    { label: "Aguardando Peça", value: "aguardando peça" },
    { label: "Concluída", value: "concluída" },
  ];

  const filtered = ordens.filter((os) => {
    const matchSearch = ((os as any).clientes?.nome || "").toLowerCase().includes(search.toLowerCase()) || os.id.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "todos" || os.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const openNew = () => {
    setForm({ cliente_id: "", veiculo_id: "", como_chegou: "", o_que_foi_feito: "", pecas_texto: "", total: "", status: "em andamento", vencimento: "" });
    setEditOS(null);
    setShowForm(true);
  };

  const openEdit = (os: any) => {
    setForm({
      cliente_id: os.cliente_id,
      veiculo_id: os.veiculo_id || "",
      como_chegou: os.como_chegou || "",
      o_que_foi_feito: os.o_que_foi_feito || "",
      pecas_texto: os.pecas_texto || "",
      total: Number(os.total).toFixed(2).replace(".", ","),
      status: os.status,
      vencimento: os.vencimento || "",
    });
    setEditOS(os);
    setShowForm(true);
  };

  const handleSave = () => {
    if (!form.cliente_id) { toast.error("Selecione um cliente"); return; }
    const payload = {
      cliente_id: form.cliente_id,
      veiculo_id: form.veiculo_id || null,
      como_chegou: form.como_chegou || null,
      o_que_foi_feito: form.o_que_foi_feito || null,
      pecas_texto: form.pecas_texto || null,
      total: parseBRL(form.total),
      status: form.status,
      vencimento: form.vencimento || null,
    };

    if (editOS) {
      update.mutate({ id: editOS.id, ...payload }, {
        onSuccess: () => { toast.success("OS atualizada!"); setShowForm(false); },
        onError: (e) => toast.error(e.message),
      });
    } else {
      create.mutate(payload, {
        onSuccess: () => { toast.success("OS criada!"); setShowForm(false); },
        onError: (e) => toast.error(e.message),
      });
    }
  };

  if (selectedOS) {
    return <OSDetail id={selectedOS} onBack={() => setSelectedOS(null)} />;
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Ordens de Serviço</h1>
          <p className="text-sm text-muted-foreground">{ordens.length} ordens registradas</p>
        </div>
        <Button className="gap-2" onClick={openNew}><Plus className="h-4 w-4" /> Nova OS</Button>
      </div>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <div className="relative max-w-md flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Buscar por cliente ou ID..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10" />
        </div>
        <div className="flex gap-2">
          {filters.map((f) => (
            <button key={f.value} onClick={() => setStatusFilter(f.value)} className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${statusFilter === f.value ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground hover:bg-secondary/80"}`}>
              {f.label}
            </button>
          ))}
        </div>
      </div>

      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border bg-secondary/50">
              <th className="px-5 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">OS</th>
              <th className="px-5 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">Cliente / Veículo</th>
              <th className="px-5 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">Status</th>
              <th className="px-5 py-3 text-right text-xs font-medium uppercase tracking-wider text-muted-foreground">Financeiro</th>
              <th className="px-5 py-3 text-right text-xs font-medium uppercase tracking-wider text-muted-foreground">Total</th>
              <th className="px-5 py-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {filtered.map((os) => (
              <tr key={os.id} className="transition-colors hover:bg-secondary/30 cursor-pointer" onClick={() => setSelectedOS(os.id)}>
                <td className="px-5 py-3">
                  <span className="text-sm font-bold text-primary">{os.id.slice(0, 8)}</span>
                  <p className="text-[10px] text-muted-foreground">{new Date(os.data_entrada).toLocaleDateString("pt-BR")}</p>
                </td>
                <td className="px-5 py-3">
                  <p className="text-sm font-medium">{(os as any).clientes?.nome}</p>
                  <p className="text-xs text-muted-foreground">{(os as any).veiculos?.marca} {(os as any).veiculos?.modelo}</p>
                </td>
                <td className="px-5 py-3"><span className={statusBadge(os.status)}>{os.status}</span></td>
                <td className="px-5 py-3 text-right"><span className={finBadge(os.finStatus)}>{os.finStatus}</span></td>
                <td className="px-5 py-3 text-right">
                  <p className="text-sm font-semibold">R$ {Number(os.total).toLocaleString("pt-BR")}</p>
                  {os.totalPago > 0 && os.totalPago < Number(os.total) && <p className="text-[10px] text-muted-foreground">Pago: R$ {os.totalPago.toLocaleString("pt-BR")}</p>}
                </td>
                <td className="px-5 py-3 flex items-center gap-1">
                  <button onClick={(e) => { e.stopPropagation(); openEdit(os); }} className="rounded p-1 text-muted-foreground hover:text-primary"><Pencil className="h-4 w-4" /></button>
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>{editOS ? "Editar" : "Nova"} Ordem de Serviço</DialogTitle></DialogHeader>
          <NewOSForm form={form} setForm={setForm} clientes={clientes || []} onSave={handleSave} isPending={create.isPending || update.isPending} />
        </DialogContent>
      </Dialog>
    </div>
  );
};

const NewOSForm = ({ form, setForm, clientes, onSave, isPending }: any) => {
  const { data: veiculos } = useVeiculos(form.cliente_id || undefined);
  return (
    <div className="space-y-3 max-h-[60vh] overflow-y-auto">
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
      <textarea className="w-full rounded-lg border border-border bg-card p-2 text-sm min-h-[60px]" placeholder="Como o carro chegou" value={form.como_chegou} onChange={(e) => setForm({ ...form, como_chegou: e.target.value })} />
      <textarea className="w-full rounded-lg border border-border bg-card p-2 text-sm min-h-[60px]" placeholder="O que foi feito" value={form.o_que_foi_feito} onChange={(e) => setForm({ ...form, o_que_foi_feito: e.target.value })} />
      <Input placeholder="Peças" value={form.pecas_texto} onChange={(e) => setForm({ ...form, pecas_texto: e.target.value })} />
      <MoneyInput value={form.total} onChange={(v) => setForm({ ...form, total: v })} placeholder="0,00" />
      <Input type="date" placeholder="Vencimento" value={form.vencimento} onChange={(e) => setForm({ ...form, vencimento: e.target.value })} />
      <select className="w-full rounded-lg border border-border bg-card p-2 text-sm" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
        <option value="em andamento">Em andamento</option>
        <option value="aguardando peça">Aguardando peça</option>
        <option value="orçamento">Orçamento</option>
        <option value="concluída">Concluída</option>
      </select>
      <Button onClick={onSave} disabled={isPending} className="w-full">{isPending ? "Salvando..." : "Salvar"}</Button>
    </div>
  );
};

// ─── OS Detail ───
const OSDetail = ({ id, onBack }: { id: string; onBack: () => void }) => {
  const { data: os, isLoading } = useOrdensServico();
  const { data: pagamentos } = usePagamentos(id);
  const { create: createPag, remove: removePag } = useMutatePagamento();
  const { update: updateOS } = useMutateOS();
  const [showPay, setShowPay] = useState(false);
  const [payForm, setPayForm] = useState({ valor: "", forma_pagamento: "PIX", observacoes: "" });

  const osData = os?.find((o) => o.id === id);
  if (isLoading) return <p>Carregando...</p>;
  if (!osData) return <p>OS não encontrada</p>;

  const totalPago = (pagamentos || []).reduce((s, p) => s + Number(p.valor), 0);
  const saldo = Number(osData.total) - totalPago;
  const finStatus = calcFinStatus(Number(osData.total), totalPago, osData.vencimento);

  const handlePay = () => {
    if (!payForm.valor) { toast.error("Informe o valor"); return; }
    createPag.mutate({
      ordem_servico_id: id,
      valor: parseBRL(payForm.valor),
      forma_pagamento: payForm.forma_pagamento,
      observacoes: payForm.observacoes || null,
    }, {
      onSuccess: () => { toast.success("Pagamento registrado!"); setShowPay(false); setPayForm({ valor: "", forma_pagamento: "PIX", observacoes: "" }); },
      onError: (e) => toast.error(e.message),
    });
  };

  const handleDeletePag = (pagId: string) => {
    if (!confirm("Excluir pagamento?")) return;
    removePag.mutate(pagId, { onSuccess: () => toast.success("Pagamento excluído!"), onError: (e) => toast.error(e.message) });
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center gap-4">
        <Button variant="ghost" onClick={onBack}><ArrowLeft className="h-4 w-4 mr-2" /> Voltar</Button>
        <Link to="/"><Button variant="ghost" size="sm">Início</Button></Link>
      </div>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">OS {id.slice(0, 8)}</h1>
        <span className={statusBadge(osData.status)}>{osData.status}</span>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-xl border border-border bg-card p-5 space-y-2">
          <p className="stat-label">Cliente</p>
          <p className="font-medium">{(osData as any).clientes?.nome}</p>
          <p className="text-xs text-muted-foreground">{(osData as any).veiculos?.marca} {(osData as any).veiculos?.modelo} — {(osData as any).veiculos?.placa}</p>
        </div>
        <div className="rounded-xl border border-border bg-card p-5 space-y-2">
          <p className="stat-label">Financeiro</p>
          <div className="flex items-center gap-3">
            <span className={finBadge(finStatus)}>{finStatus}</span>
          </div>
          <p className="text-sm">Total: <strong>R$ {Number(osData.total).toLocaleString("pt-BR")}</strong></p>
          <p className="text-sm text-[hsl(var(--success))]">Pago: R$ {totalPago.toLocaleString("pt-BR")}</p>
          <p className="text-sm text-destructive font-bold">Saldo: R$ {Math.max(0, saldo).toLocaleString("pt-BR")}</p>
        </div>
      </div>
      {osData.como_chegou && <div className="rounded-xl border border-border bg-card p-5"><p className="stat-label mb-2">Como chegou</p><p className="text-sm">{osData.como_chegou}</p></div>}
      {osData.o_que_foi_feito && <div className="rounded-xl border border-border bg-card p-5"><p className="stat-label mb-2">O que foi feito</p><p className="text-sm">{osData.o_que_foi_feito}</p></div>}
      {osData.pecas_texto && <div className="rounded-xl border border-border bg-card p-5"><p className="stat-label mb-2">Peças</p><p className="text-sm">{osData.pecas_texto}</p></div>}

      {/* Pagamentos */}
      <div className="rounded-xl border border-border bg-card">
        <div className="flex items-center justify-between border-b border-border px-5 py-4">
          <h2 className="font-semibold">Pagamentos</h2>
          <Button size="sm" onClick={() => setShowPay(true)} disabled={saldo <= 0}><CreditCard className="h-3 w-3 mr-1" /> Registrar Pagamento</Button>
        </div>
        <div className="divide-y divide-border">
          {(pagamentos || []).map((p) => (
            <div key={p.id} className="px-5 py-3 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">R$ {Number(p.valor).toLocaleString("pt-BR")}</p>
                <p className="text-xs text-muted-foreground">{new Date(p.data_pagamento).toLocaleDateString("pt-BR")} — {p.forma_pagamento}</p>
              </div>
              <div className="flex items-center gap-2">
                {p.observacoes && <p className="text-xs text-muted-foreground">{p.observacoes}</p>}
                <button onClick={() => handleDeletePag(p.id)} className="rounded p-1 text-muted-foreground hover:text-destructive"><Trash2 className="h-3 w-3" /></button>
              </div>
            </div>
          ))}
          {(!pagamentos || pagamentos.length === 0) && <p className="px-5 py-4 text-sm text-muted-foreground">Nenhum pagamento</p>}
        </div>
      </div>

      <Dialog open={showPay} onOpenChange={setShowPay}>
        <DialogContent>
          <DialogHeader><DialogTitle>Registrar Pagamento</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">Saldo restante: R$ {Math.max(0, saldo).toLocaleString("pt-BR")}</p>
            <MoneyInput value={payForm.valor} onChange={(v) => setPayForm({ ...payForm, valor: v })} />
            <select className="w-full rounded-lg border border-border bg-card p-2 text-sm" value={payForm.forma_pagamento} onChange={(e) => setPayForm({ ...payForm, forma_pagamento: e.target.value })}>
              <option>PIX</option><option>Dinheiro</option><option>Cartão Débito</option><option>Cartão Crédito</option>
            </select>
            <Input placeholder="Observação" value={payForm.observacoes} onChange={(e) => setPayForm({ ...payForm, observacoes: e.target.value })} />
            <Button onClick={handlePay} disabled={createPag.isPending} className="w-full">{createPag.isPending ? "Salvando..." : "Registrar"}</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ServiceOrders;
