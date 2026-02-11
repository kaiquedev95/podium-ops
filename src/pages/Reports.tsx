import { useState } from "react";
import { Download, TrendingUp, TrendingDown, DollarSign } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useOrdensServico, useDespesas } from "@/hooks/useSupabase";
import { Link } from "react-router-dom";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

const Reports = () => {
  const { data: ordensRaw } = useOrdensServico();
  const { data: despesas } = useDespesas();
  const [mesFilter, setMesFilter] = useState(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
  });

  // Compute monthly data
  const ordens = (ordensRaw || []).map((os) => {
    const totalPago = (os.pagamentos || []).reduce((s: number, p: any) => s + Number(p.valor), 0);
    return { ...os, totalPago };
  });

  const mesOrdens = ordens.filter((os) => os.data_entrada.startsWith(mesFilter));
  const mesDespesas = (despesas || []).filter((d) => d.data.startsWith(mesFilter));

  const faturamento = mesOrdens.reduce((s, os) => s + os.totalPago, 0);
  const totalOS = mesOrdens.reduce((s, os) => s + Number(os.total), 0);
  const aReceber = totalOS - faturamento;
  const totalDespesas = mesDespesas.reduce((s, d) => s + Number(d.valor), 0);
  const lucro = faturamento - totalDespesas;

  const meses = Array.from(new Set([
    ...(ordensRaw || []).map((os) => os.data_entrada.slice(0, 7)),
    ...(despesas || []).map((d) => d.data.slice(0, 7)),
    mesFilter,
  ])).sort().reverse();

  const exportPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text("Centro Automotivo Podium", 14, 22);
    doc.setFontSize(12);
    doc.text(`Relatório Financeiro — ${mesFilter}`, 14, 32);

    autoTable(doc, {
      startY: 42,
      head: [["Indicador", "Valor"]],
      body: [
        ["Faturamento (recebido)", `R$ ${faturamento.toLocaleString("pt-BR")}`],
        ["Total OS no mês", `R$ ${totalOS.toLocaleString("pt-BR")}`],
        ["A Receber", `R$ ${aReceber.toLocaleString("pt-BR")}`],
        ["Despesas", `R$ ${totalDespesas.toLocaleString("pt-BR")}`],
        ["Lucro", `R$ ${lucro.toLocaleString("pt-BR")}`],
      ],
    });

    if (mesDespesas.length > 0) {
      autoTable(doc, {
        startY: (doc as any).lastAutoTable.finalY + 10,
        head: [["Data", "Categoria", "Descrição", "Valor"]],
        body: mesDespesas.map((d) => [d.data, d.categoria || "—", d.descricao, `R$ ${Number(d.valor).toLocaleString("pt-BR")}`]),
      });
    }

    doc.save(`relatorio-${mesFilter}.pdf`);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Relatórios</h1>
          <p className="text-sm text-muted-foreground">Resumo financeiro mensal</p>
        </div>
        <div className="flex gap-2">
          <Link to="/"><Button variant="ghost" size="sm">Início</Button></Link>
          <select className="rounded-lg border border-border bg-card px-3 py-1.5 text-sm" value={mesFilter} onChange={(e) => setMesFilter(e.target.value)}>
            {meses.map((m) => <option key={m} value={m}>{m}</option>)}
          </select>
          <Button variant="outline" className="gap-2" onClick={exportPDF}>
            <Download className="h-4 w-4" /> Exportar PDF
          </Button>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-4">
        <div className="rounded-xl border border-border bg-card p-5">
          <div className="flex items-center gap-2"><TrendingUp className="h-4 w-4 text-[hsl(var(--success))]" /><p className="stat-label">Faturamento</p></div>
          <p className="mt-3 text-2xl font-bold text-[hsl(var(--success))]">R$ {faturamento.toLocaleString("pt-BR")}</p>
        </div>
        <div className="rounded-xl border border-border bg-card p-5">
          <div className="flex items-center gap-2"><DollarSign className="h-4 w-4 text-destructive" /><p className="stat-label">A Receber</p></div>
          <p className="mt-3 text-2xl font-bold text-destructive">R$ {aReceber.toLocaleString("pt-BR")}</p>
        </div>
        <div className="rounded-xl border border-border bg-card p-5">
          <div className="flex items-center gap-2"><TrendingDown className="h-4 w-4 text-primary" /><p className="stat-label">Despesas</p></div>
          <p className="mt-3 text-2xl font-bold text-primary">R$ {totalDespesas.toLocaleString("pt-BR")}</p>
        </div>
        <div className="rounded-xl border border-border bg-card p-5">
          <div className="flex items-center gap-2"><TrendingUp className="h-4 w-4 text-[hsl(var(--success))]" /><p className="stat-label">Lucro</p></div>
          <p className="mt-3 text-2xl font-bold" style={{ color: lucro >= 0 ? "hsl(var(--success))" : "hsl(var(--destructive))" }}>R$ {lucro.toLocaleString("pt-BR")}</p>
        </div>
      </div>

      {/* Despesas Table */}
      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <div className="border-b border-border px-5 py-4"><h2 className="font-semibold">Despesas do Mês</h2></div>
        <table className="w-full">
          <thead>
            <tr className="border-b border-border bg-secondary/50">
              <th className="px-5 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">Data</th>
              <th className="px-5 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">Categoria</th>
              <th className="px-5 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">Descrição</th>
              <th className="px-5 py-3 text-right text-xs font-medium uppercase tracking-wider text-muted-foreground">Valor</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {mesDespesas.map((d) => (
              <tr key={d.id} className="hover:bg-secondary/30">
                <td className="px-5 py-3 text-sm">{d.data}</td>
                <td className="px-5 py-3 text-sm">{d.categoria || "—"}</td>
                <td className="px-5 py-3 text-sm">{d.descricao}</td>
                <td className="px-5 py-3 text-right text-sm font-semibold text-destructive">R$ {Number(d.valor).toLocaleString("pt-BR")}</td>
              </tr>
            ))}
            {mesDespesas.length === 0 && <tr><td colSpan={4} className="px-5 py-8 text-center text-sm text-muted-foreground">Nenhuma despesa neste mês</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Reports;
