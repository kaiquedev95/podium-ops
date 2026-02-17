import { useState } from "react";
import { DollarSign, Search, CreditCard } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useOrdensServico, useMutatePagamento, usePagamentos, calcFinStatus } from "@/hooks/useSupabase";
import { toast } from "sonner";
import { Link } from "react-router-dom";
import { MoneyInput, parseBRL } from "@/components/MoneyInput";

const Financial = () => {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("todos");
  const { data: ordensRaw } = useOrdensServico();
  const { create: createPag } = useMutatePagamento();
  const [payDialog, setPayDialog] = useState<{ osId: string; saldo: number } | null>(null);
  const [payVal, setPayVal] = useState("");
  const [payForma, setPayForma] = useState("PIX");
  const [historyOS, setHistoryOS] = useState<string | null>(null);

  const ordens = (ordensRaw || []).map((os) => {
    const totalPago = (os.pagamentos || []).reduce((s: number, p: any) => s + Number(p.valor), 0);
    const saldo = Number(os.total) - totalPago;
    const finStatus = calcFinStatus(Number(os.total), totalPago, os.vencimento);
    return { ...os, totalPago, saldo, finStatus };
  }).filter((os) => os.saldo > 0);

  const filters = [
    { label: "Todos", value: "todos" },
    { label: "Aberto", value: "aberto" },
    { label: "Parcial", value: "parcial" },
    { label: "Atrasado", value: "atrasado" },
  ];

  const filtered = ordens.filter((r) => {
    const matchSearch = ((r as any).clientes?.nome || "").toLowerCase().includes(search.toLowerCase()) || r.id.includes(search);
    const matchStatus = statusFilter === "todos" || r.finStatus === statusFilter;
    return matchSearch && matchStatus;
  });

  const totalBalance = ordens.reduce((s, r) => s + r.saldo, 0);
  const totalOverdue = ordens.filter((r) => r.finStatus === "atrasado").reduce((s, r) => s + r.saldo, 0);

  const handlePay = () => {
    if (!payDialog || !payVal) return;
    createPag.mutate(
      { ordem_servico_id: payDialog.osId, valor: parseBRL(payVal), forma_pagamento: payForma },
      {
        onSuccess: () => { toast.success("Pagamento registrado!"); setPayDialog(null); setPayVal(""); },
        onError: (e) => toast.error(e.message),
      }
    );
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center gap-4">
        <div className="flex-1">
          <h1 className="text-2xl font-bold">Contas a Receber</h1>
          <p className="text-sm text-muted-foreground">Controle de pagamentos e clientes devendo</p>
        </div>
        <Link to="/"><Button variant="ghost" size="sm">Início</Button></Link>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4">
        <div className="rounded-xl border border-border bg-card p-4 sm:p-5">
          <p className="stat-label">Total a Receber</p>
          <p className="mt-2 text-lg sm:text-2xl font-bold text-primary">R$ {totalBalance.toLocaleString("pt-BR")}</p>
        </div>
        <div className="rounded-xl border border-border bg-card p-4 sm:p-5">
          <p className="stat-label">Atrasados</p>
          <p className="mt-2 text-lg sm:text-2xl font-bold text-destructive">R$ {totalOverdue.toLocaleString("pt-BR")}</p>
        </div>
        <div className="col-span-2 sm:col-span-1 rounded-xl border border-border bg-card p-4 sm:p-5">
          <p className="stat-label">OS com saldo</p>
          <p className="mt-2 stat-value">{ordens.length}</p>
        </div>
      </div>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <div className="relative max-w-md flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Buscar por cliente ou OS..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10" />
        </div>
        <div className="flex gap-2">
          {filters.map((f) => (
            <button key={f.value} onClick={() => setStatusFilter(f.value)} className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${statusFilter === f.value ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground hover:bg-secondary/80"}`}>
              {f.label}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-3">
        {filtered.map((r) => (
          <div key={r.id} className="rounded-xl border border-border bg-card p-4 card-hover space-y-3 sm:space-y-0 sm:flex sm:items-center sm:gap-4">
            <div className="flex items-center gap-3 sm:flex-1 sm:min-w-0">
              <div className="hidden sm:flex h-11 w-11 items-center justify-center rounded-full bg-destructive/10">
                <DollarSign className="h-5 w-5 text-destructive" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-primary">{r.id.slice(0, 8)}</span>
                  <span className="text-sm font-medium">{(r as any).clientes?.nome}</span>
                </div>
                <p className="text-xs text-muted-foreground">
                  {(r as any).veiculos?.modelo} • {r.vencimento ? `Venc: ${r.vencimento}` : "Sem vencimento"}
                </p>
              </div>
            </div>
            <div className="flex items-center justify-between gap-3 sm:flex-shrink-0">
              <div className="text-left sm:text-right">
                <p className="text-sm font-bold text-destructive">R$ {r.saldo.toLocaleString("pt-BR")}</p>
                <p className="text-[10px] text-muted-foreground">de R$ {Number(r.total).toLocaleString("pt-BR")} (pago: R$ {r.totalPago.toLocaleString("pt-BR")})</p>
              </div>
              <div className="flex items-center gap-2">
                <Button size="sm" variant="outline" className="gap-1 text-xs" onClick={() => setPayDialog({ osId: r.id, saldo: r.saldo })}>
                  <CreditCard className="h-3 w-3" /> Pagar
                </Button>
                <Button size="sm" variant="ghost" className="text-xs" onClick={() => setHistoryOS(r.id)}>Histórico</Button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <Dialog open={!!payDialog} onOpenChange={() => setPayDialog(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Registrar Pagamento</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">Saldo: R$ {payDialog?.saldo.toLocaleString("pt-BR")}</p>
            <MoneyInput value={payVal} onChange={setPayVal} />
            <select className="w-full rounded-lg border border-border bg-card p-2 text-sm" value={payForma} onChange={(e) => setPayForma(e.target.value)}>
              <option>PIX</option><option>Dinheiro</option><option>Cartão Débito</option><option>Cartão Crédito</option>
            </select>
            <Button onClick={handlePay} disabled={createPag.isPending} className="w-full">{createPag.isPending ? "Salvando..." : "Registrar"}</Button>
          </div>
        </DialogContent>
      </Dialog>

      {historyOS && <PaymentHistory osId={historyOS} onClose={() => setHistoryOS(null)} />}
    </div>
  );
};

const PaymentHistory = ({ osId, onClose }: { osId: string; onClose: () => void }) => {
  const { data: pagamentos } = usePagamentos(osId);
  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader><DialogTitle>Histórico de Pagamentos</DialogTitle></DialogHeader>
        <div className="divide-y divide-border max-h-[300px] overflow-y-auto">
          {(pagamentos || []).map((p) => (
            <div key={p.id} className="py-3 flex justify-between">
              <div>
                <p className="text-sm font-medium">R$ {Number(p.valor).toLocaleString("pt-BR")}</p>
                <p className="text-xs text-muted-foreground">{new Date(p.data_pagamento).toLocaleDateString("pt-BR")} — {p.forma_pagamento}</p>
              </div>
              {p.observacoes && <p className="text-xs text-muted-foreground">{p.observacoes}</p>}
            </div>
          ))}
          {(!pagamentos || pagamentos.length === 0) && <p className="py-4 text-sm text-muted-foreground">Nenhum pagamento</p>}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default Financial;
