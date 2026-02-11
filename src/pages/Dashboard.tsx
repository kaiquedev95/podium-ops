import { CalendarDays, ClipboardList, DollarSign, AlertCircle, TrendingUp, ChevronRight, CheckCircle2 } from "lucide-react";
import { Link } from "react-router-dom";
import { useAgendamentos, useOrdensServico, usePendencias, calcFinStatus } from "@/hooks/useSupabase";
import { Button } from "@/components/ui/button";
import { useMutatePendencia, useMutatePagamento } from "@/hooks/useSupabase";
import { toast } from "sonner";
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { format } from "date-fns";

const Dashboard = () => {
  const { data: agendamentos } = useAgendamentos();
  const { data: ordensServico } = useOrdensServico();
  const { data: pendencias } = usePendencias();
  const { update: updatePendencia } = useMutatePendencia();
  const { create: createPagamento } = useMutatePagamento();

  const [payDialog, setPayDialog] = useState<{ osId: string; saldo: number } | null>(null);
  const [payVal, setPayVal] = useState("");
  const [payForma, setPayForma] = useState("PIX");

  const today = format(new Date(), "yyyy-MM-dd");

  const todayAgend = agendamentos?.filter((a) => a.data_hora.startsWith(today)) || [];

  const activeOS = ordensServico?.filter((os) => os.status === "em andamento" || os.status === "aguardando peça") || [];

  // Compute receivables from OS
  const osWithBalance = (ordensServico || []).map((os) => {
    const totalPago = (os.pagamentos || []).reduce((s: number, p: any) => s + Number(p.valor), 0);
    const saldo = Number(os.total) - totalPago;
    const finStatus = calcFinStatus(Number(os.total), totalPago, os.vencimento);
    return { ...os, totalPago, saldo, finStatus };
  });

  const totalReceivable = osWithBalance.reduce((s, os) => s + Math.max(0, os.saldo), 0);
  const topDebtors = osWithBalance.filter((os) => os.saldo > 0).sort((a, b) => b.saldo - a.saldo).slice(0, 5);

  const todayStr = new Date().toISOString().split("T")[0];
  const pendHoje = pendencias?.filter((p) => p.status === "aberta" && p.data_prevista === todayStr) || [];
  const pendAtrasadas = pendencias?.filter((p) => p.status === "aberta" && p.data_prevista < todayStr) || [];
  const pendProximas = pendencias?.filter((p) => p.status === "aberta" && p.data_prevista > todayStr) || [];

  const stats = [
    { label: "Agendamentos Hoje", value: String(todayAgend.length), icon: CalendarDays, color: "text-primary" },
    { label: "OS em Andamento", value: String(activeOS.length), icon: ClipboardList, color: "text-[hsl(var(--chart-3))]" },
    { label: "Faturamento (Mês)", value: `R$ ${osWithBalance.filter(os => os.finStatus === 'pago').reduce((s, os) => s + Number(os.total), 0).toLocaleString("pt-BR")}`, icon: TrendingUp, color: "text-[hsl(var(--success))]" },
    { label: "A Receber", value: `R$ ${totalReceivable.toLocaleString("pt-BR")}`, icon: DollarSign, color: "text-destructive" },
  ];

  const handleConcluir = (id: string) => {
    updatePendencia.mutate({ id, status: "concluida" }, { onSuccess: () => toast.success("Pendência concluída!") });
  };

  const handlePay = () => {
    if (!payDialog || !payVal) return;
    createPagamento.mutate(
      { ordem_servico_id: payDialog.osId, valor: Number(payVal), forma_pagamento: payForma },
      {
        onSuccess: () => { toast.success("Pagamento registrado!"); setPayDialog(null); setPayVal(""); },
        onError: (e) => toast.error("Erro: " + e.message),
      }
    );
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-sm text-muted-foreground">Visão geral da oficina — {format(new Date(), "dd/MM/yyyy")}</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <div key={stat.label} className="rounded-xl border border-border bg-card p-5 card-hover">
            <stat.icon className={`h-5 w-5 ${stat.color}`} />
            <p className="mt-3 stat-value">{stat.value}</p>
            <p className="mt-1 stat-label">{stat.label}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Today Schedule */}
        <div className="lg:col-span-2 rounded-xl border border-border bg-card">
          <div className="flex items-center justify-between border-b border-border px-5 py-4">
            <h2 className="font-semibold">Agendamentos de Hoje</h2>
            <Link to="/agendamentos" className="flex items-center gap-1 text-xs text-primary hover:underline">Ver todos <ChevronRight className="h-3 w-3" /></Link>
          </div>
          <div className="divide-y divide-border">
            {todayAgend.length === 0 && <p className="px-5 py-8 text-center text-sm text-muted-foreground">Nenhum agendamento hoje</p>}
            {todayAgend.map((a) => (
              <div key={a.id} className="flex items-center gap-4 px-5 py-3">
                <div className="flex h-10 w-16 items-center justify-center rounded-md bg-secondary text-xs font-bold text-secondary-foreground">
                  {format(new Date(a.data_hora), "HH:mm")}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{(a as any).clientes?.nome}</p>
                  <p className="text-xs text-muted-foreground truncate">{(a as any).veiculos?.modelo} — {a.servico_resumo}</p>
                </div>
                <span className={a.status === "confirmado" ? "badge-paid" : "badge-open"}>{a.status}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Pendencies */}
        <div className="rounded-xl border border-border bg-card">
          <div className="flex items-center justify-between border-b border-border px-5 py-4">
            <h2 className="font-semibold">Pendências ({pendAtrasadas.length + pendHoje.length})</h2>
            <Link to="/pendencias" className="flex items-center gap-1 text-xs text-primary hover:underline">Ver todas <ChevronRight className="h-3 w-3" /></Link>
          </div>
          <div className="divide-y divide-border">
            {[...pendAtrasadas, ...pendHoje].slice(0, 5).map((p) => (
              <div key={p.id} className="px-5 py-3">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium">{(p as any).clientes?.nome}</p>
                  <div className="flex items-center gap-2">
                    <span className={p.data_prevista < todayStr ? "badge-overdue" : "badge-open"}>{p.data_prevista}</span>
                    <button onClick={() => handleConcluir(p.id)} className="rounded p-1 text-muted-foreground hover:text-[hsl(var(--success))]">
                      <CheckCircle2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
                <p className="mt-1 text-xs text-muted-foreground">{p.descricao}</p>
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
            <Link to="/ordens-servico" className="flex items-center gap-1 text-xs text-primary hover:underline">Ver todas <ChevronRight className="h-3 w-3" /></Link>
          </div>
          <div className="divide-y divide-border">
            {activeOS.slice(0, 5).map((os) => (
              <div key={os.id} className="flex items-center justify-between px-5 py-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-primary">{os.id.slice(0, 8)}</span>
                    <span className="text-sm font-medium">{(os as any).clientes?.nome}</span>
                  </div>
                  <p className="text-xs text-muted-foreground">{(os as any).veiculos?.modelo}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold">R$ {Number(os.total).toLocaleString("pt-BR")}</p>
                  <span className={os.status === "aguardando peça" ? "badge-open" : "badge-paid"}>{os.status}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top Debtors */}
        <div className="rounded-xl border border-border bg-card">
          <div className="flex items-center justify-between border-b border-border px-5 py-4">
            <h2 className="font-semibold">Maiores Saldos</h2>
            <Link to="/financeiro" className="flex items-center gap-1 text-xs text-primary hover:underline">Ver todos <ChevronRight className="h-3 w-3" /></Link>
          </div>
          <div className="divide-y divide-border">
            {topDebtors.map((d) => (
              <div key={d.id} className="flex items-center justify-between px-5 py-3">
                <div>
                  <p className="text-sm font-medium">{(d as any).clientes?.nome}</p>
                  <p className="text-xs text-muted-foreground">{(d as any).veiculos?.modelo}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-bold text-destructive">R$ {d.saldo.toLocaleString("pt-BR")}</span>
                  <Button size="sm" variant="outline" className="text-xs" onClick={() => setPayDialog({ osId: d.id, saldo: d.saldo })}>
                    Pagar
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Pay Dialog */}
      <Dialog open={!!payDialog} onOpenChange={() => setPayDialog(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Registrar Pagamento</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">Saldo: R$ {payDialog?.saldo.toLocaleString("pt-BR")}</p>
            <Input type="number" placeholder="Valor" value={payVal} onChange={(e) => setPayVal(e.target.value)} />
            <select className="w-full rounded-lg border border-border bg-card p-2 text-sm" value={payForma} onChange={(e) => setPayForma(e.target.value)}>
              <option>PIX</option><option>Dinheiro</option><option>Cartão Débito</option><option>Cartão Crédito</option>
            </select>
            <Button onClick={handlePay} disabled={createPagamento.isPending} className="w-full">
              {createPagamento.isPending ? "Salvando..." : "Registrar"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Dashboard;
