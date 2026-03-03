import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { ChevronDown, ChevronRight, Wrench, Package, CreditCard, Car, Filter, FileText } from "lucide-react";
import { calcFinStatus } from "@/hooks/useSupabase";

interface ClientHistoryProps {
  clienteId: string;
}

const statusBadge = (s: string) => {
  const map: Record<string, string> = {
    "em andamento": "badge-open",
    "aguardando peça": "badge-partial",
    "concluída": "badge-paid",
    "orçamento": "badge-pending",
    "cancelada": "bg-destructive/10 text-destructive text-xs px-2 py-0.5 rounded-full font-medium",
  };
  return map[s] || "badge-pending";
};

const finBadge = (s: string) => {
  const map: Record<string, string> = { aberto: "badge-open", parcial: "badge-partial", pago: "badge-paid", atrasado: "badge-overdue" };
  return map[s] || "badge-pending";
};

export const ClientHistory = ({ clienteId }: ClientHistoryProps) => {
  const [expandedOS, setExpandedOS] = useState<Set<string>>(new Set());
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [typeFilter, setTypeFilter] = useState("todos");
  const [statusFilter, setStatusFilter] = useState("todos");

  const { data: ordens, isLoading } = useQuery({
    queryKey: ["client_history", clienteId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("ordens_servico")
        .select("*, veiculos(placa, modelo, marca), servicos_os(*), pecas_os(*, estoque_pecas(nome, codigo)), pagamentos(*)")
        .eq("cliente_id", clienteId)
        .order("data_entrada", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const { data: veiculos } = useQuery({
    queryKey: ["client_vehicles_history", clienteId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("veiculos")
        .select("*")
        .eq("cliente_id", clienteId)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const toggleOS = (id: string) => {
    setExpandedOS((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const filtered = useMemo(() => {
    if (!ordens) return [];
    return ordens.filter((os) => {
      if (statusFilter !== "todos" && os.status !== statusFilter) return false;
      if (dateFrom && new Date(os.data_entrada) < new Date(dateFrom)) return false;
      if (dateTo && new Date(os.data_entrada) > new Date(dateTo + "T23:59:59")) return false;
      return true;
    });
  }, [ordens, statusFilter, dateFrom, dateTo]);

  // Stats
  const totalOS = ordens?.length || 0;
  const totalPago = ordens?.reduce((sum, os) =>
    sum + ((os as any).pagamentos || []).reduce((s: number, p: any) => s + Number(p.valor), 0), 0) || 0;
  const totalGeral = ordens?.reduce((sum, os) => sum + Number(os.total), 0) || 0;

  if (isLoading) return <p className="text-sm text-muted-foreground p-5">Carregando histórico...</p>;

  return (
    <div className="space-y-4">
      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="rounded-lg border border-border bg-secondary/30 p-3 text-center">
          <p className="text-xs text-muted-foreground">Total de OS</p>
          <p className="text-lg font-bold">{totalOS}</p>
        </div>
        <div className="rounded-lg border border-border bg-secondary/30 p-3 text-center">
          <p className="text-xs text-muted-foreground">Veículos</p>
          <p className="text-lg font-bold">{veiculos?.length || 0}</p>
        </div>
        <div className="rounded-lg border border-border bg-secondary/30 p-3 text-center">
          <p className="text-xs text-muted-foreground">Total Faturado</p>
          <p className="text-lg font-bold text-primary">R$ {totalGeral.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</p>
        </div>
        <div className="rounded-lg border border-border bg-secondary/30 p-3 text-center">
          <p className="text-xs text-muted-foreground">Total Pago</p>
          <p className="text-lg font-bold text-[hsl(var(--success))]">R$ {totalPago.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2 items-center">
        <Filter className="h-4 w-4 text-muted-foreground" />
        <Input type="date" className="w-36" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} placeholder="De" />
        <Input type="date" className="w-36" value={dateTo} onChange={(e) => setDateTo(e.target.value)} placeholder="Até" />
        <select className="rounded-lg border border-input bg-background p-2 text-xs" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
          <option value="todos">Todos Status</option>
          <option value="em andamento">Em andamento</option>
          <option value="aguardando peça">Aguardando peça</option>
          <option value="orçamento">Orçamento</option>
          <option value="concluída">Concluída</option>
        </select>
      </div>

      {/* Vehicles */}
      {veiculos && veiculos.length > 0 && (
        <div className="rounded-xl border border-border bg-card">
          <div className="flex items-center gap-2 border-b border-border px-5 py-3">
            <Car className="h-4 w-4 text-primary" />
            <h3 className="font-semibold text-sm">Veículos do Cliente</h3>
          </div>
          <div className="divide-y divide-border">
            {veiculos.map((v) => (
              <div key={v.id} className="px-5 py-2 text-sm flex items-center gap-3">
                <span className="font-medium">{v.marca} {v.modelo}</span>
                <span className="text-muted-foreground">{v.placa || "Sem placa"}</span>
                <span className="text-xs text-muted-foreground">{v.ano || ""} {v.motor ? `· ${v.motor}` : ""}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* OS List */}
      {filtered.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border p-8 text-center">
          <FileText className="mx-auto h-8 w-8 text-muted-foreground mb-2" />
          <p className="text-sm text-muted-foreground">Nenhuma ordem de serviço encontrada</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((os) => {
            const servicos = (os as any).servicos_os || [];
            const pecas = (os as any).pecas_os || [];
            const pagamentos = (os as any).pagamentos || [];
            const totalPago = pagamentos.reduce((s: number, p: any) => s + Number(p.valor), 0);
            const finStatus = calcFinStatus(Number(os.total), totalPago, os.vencimento);
            const isExpanded = expandedOS.has(os.id);
            const veiculo = (os as any).veiculos;

            return (
              <div key={os.id} className="rounded-xl border border-border bg-card overflow-hidden">
                {/* Header */}
                <button
                  onClick={() => toggleOS(os.id)}
                  className="w-full flex items-center gap-3 px-5 py-4 text-left hover:bg-secondary/30 transition-colors"
                >
                  {isExpanded ? <ChevronDown className="h-4 w-4 text-muted-foreground shrink-0" /> : <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />}
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-bold text-primary text-sm">OS {os.id.slice(0, 8)}</span>
                      <span className="text-xs text-muted-foreground">{new Date(os.data_entrada).toLocaleDateString("pt-BR")}</span>
                      {os.data_saida && <span className="text-xs text-muted-foreground">→ {new Date(os.data_saida).toLocaleDateString("pt-BR")}</span>}
                    </div>
                    {veiculo && <p className="text-xs text-muted-foreground mt-0.5">{veiculo.marca} {veiculo.modelo} — {veiculo.placa}</p>}
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className={statusBadge(os.status)}>{os.status}</span>
                    <span className={finBadge(finStatus)}>{finStatus}</span>
                    <span className="text-sm font-semibold">R$ {Number(os.total).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</span>
                  </div>
                </button>

                {/* Expanded details */}
                {isExpanded && (
                  <div className="border-t border-border px-5 py-4 space-y-4">
                    {/* Info */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                      {os.km_entrada && <p><span className="text-muted-foreground">KM Entrada:</span> {os.km_entrada}</p>}
                      {os.como_chegou && <p><span className="text-muted-foreground">Chegou:</span> {os.como_chegou}</p>}
                      {os.reclamacao_cliente && <p className="sm:col-span-2"><span className="text-muted-foreground">Reclamação:</span> {os.reclamacao_cliente}</p>}
                      {os.diagnostico && <p className="sm:col-span-2"><span className="text-muted-foreground">Diagnóstico:</span> {os.diagnostico}</p>}
                      {os.observacoes && <p className="sm:col-span-2"><span className="text-muted-foreground">Obs:</span> {os.observacoes}</p>}
                    </div>

                    {/* Serviços */}
                    {servicos.length > 0 && (
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <Wrench className="h-3.5 w-3.5 text-primary" />
                          <h4 className="text-sm font-semibold">Serviços</h4>
                        </div>
                        <div className="space-y-1">
                          {servicos.map((s: any) => (
                            <div key={s.id} className="flex justify-between text-sm px-3 py-1.5 rounded bg-secondary/30">
                              <span>{s.descricao}</span>
                              <span className="font-medium">R$ {Number(s.valor).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Peças */}
                    {pecas.length > 0 && (
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <Package className="h-3.5 w-3.5 text-primary" />
                          <h4 className="text-sm font-semibold">Peças</h4>
                        </div>
                        <div className="space-y-1">
                          {pecas.map((p: any) => (
                            <div key={p.id} className="flex justify-between text-sm px-3 py-1.5 rounded bg-secondary/30">
                              <span>
                                {p.estoque_pecas?.nome || p.descricao}
                                {p.estoque_pecas?.codigo && <span className="text-muted-foreground"> (Cód: {p.estoque_pecas.codigo})</span>}
                                <span className="text-muted-foreground"> × {p.quantidade}</span>
                              </span>
                              <span className="font-medium">R$ {Number(p.valor).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Pagamentos */}
                    {pagamentos.length > 0 && (
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <CreditCard className="h-3.5 w-3.5 text-primary" />
                          <h4 className="text-sm font-semibold">Pagamentos</h4>
                        </div>
                        <div className="space-y-1">
                          {pagamentos.map((pg: any) => (
                            <div key={pg.id} className="flex justify-between text-sm px-3 py-1.5 rounded bg-secondary/30">
                              <span>
                                {new Date(pg.data_pagamento).toLocaleDateString("pt-BR")}
                                <span className="text-muted-foreground"> — {pg.forma_pagamento}</span>
                                {pg.observacoes && <span className="text-muted-foreground"> · {pg.observacoes}</span>}
                              </span>
                              <span className="font-medium text-[hsl(var(--success))]">R$ {Number(pg.valor).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Financial summary */}
                    <div className="flex items-center justify-between border-t border-border pt-3 text-sm">
                      <div className="space-x-4">
                        <span>Total: <strong>R$ {Number(os.total).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</strong></span>
                        {Number(os.desconto) > 0 && <span className="text-destructive">Desconto: R$ {Number(os.desconto).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</span>}
                      </div>
                      <div className="space-x-4">
                        <span className="text-[hsl(var(--success))]">Pago: R$ {totalPago.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</span>
                        {Number(os.total) - totalPago > 0 && (
                          <span className="text-destructive font-bold">Saldo: R$ {(Number(os.total) - totalPago).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</span>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
