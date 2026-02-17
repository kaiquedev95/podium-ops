import { useState } from "react";
import { Download, TrendingUp, TrendingDown, DollarSign, Plus, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useOrdensServico, useDespesas, useMutateDespesa } from "@/hooks/useSupabase";
import { MoneyInput, parseBRL } from "@/components/MoneyInput";
import { toast } from "sonner";
import { Link } from "react-router-dom";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

const Reports = () => {
  const { data: ordensRaw } = useOrdensServico();
  const { data: despesas } = useDespesas();
  const { create: createDespesa, update: updateDespesa, remove: removeDespesa } = useMutateDespesa();
  const [mesFilter, setMesFilter] = useState(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
  });
  const [showDespForm, setShowDespForm] = useState(false);
  const [editDespId, setEditDespId] = useState<string | null>(null);
  const [despForm, setDespForm] = useState({ descricao: "", valor: "", categoria: "", data: "" });

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

  const openNewDesp = () => {
    const today = new Date().toISOString().split("T")[0];
    setDespForm({ descricao: "", valor: "", categoria: "", data: today });
    setEditDespId(null);
    setShowDespForm(true);
  };
  const openEditDesp = (d: any) => {
    setDespForm({ descricao: d.descricao, valor: Number(d.valor).toFixed(2).replace(".", ","), categoria: d.categoria || "", data: d.data });
    setEditDespId(d.id);
    setShowDespForm(true);
  };

  const handleSaveDesp = () => {
    if (!despForm.descricao.trim()) { toast.error("Descrição obrigatória"); return; }
    const payload = { descricao: despForm.descricao, valor: parseBRL(despForm.valor), categoria: despForm.categoria || null, data: despForm.data || undefined };
    if (editDespId) {
      updateDespesa.mutate({ id: editDespId, ...payload }, {
        onSuccess: () => { toast.success("Despesa atualizada!"); setShowDespForm(false); },
        onError: (e) => toast.error(e.message),
      });
    } else {
      createDespesa.mutate(payload as any, {
        onSuccess: () => { toast.success("Despesa criada!"); setShowDespForm(false); },
        onError: (e) => toast.error(e.message),
      });
    }
  };

  const handleDeleteDesp = (id: string) => {
    if (!confirm("Excluir despesa?")) return;
    removeDespesa.mutate(id, { onSuccess: () => toast.success("Excluída!"), onError: (e) => toast.error(e.message) });
  };

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
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">Relatórios</h1>
          <p className="text-sm text-muted-foreground">Resumo financeiro mensal</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link to="/"><Button variant="ghost" size="sm">Início</Button></Link>
          <select className="rounded-lg border border-border bg-card px-3 py-1.5 text-sm" value={mesFilter} onChange={(e) => setMesFilter(e.target.value)}>
            {meses.map((m) => <option key={m} value={m}>{m}</option>)}
          </select>
          <Button variant="outline" className="gap-2" onClick={exportPDF}>
            <Download className="h-4 w-4" /> <span className="hidden sm:inline">Exportar</span> PDF
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
        <div className="rounded-xl border border-border bg-card p-4 sm:p-5">
          <div className="flex items-center gap-2"><TrendingUp className="h-4 w-4 text-[hsl(var(--success))]" /><p className="stat-label">Faturamento</p></div>
          <p className="mt-2 sm:mt-3 text-lg sm:text-2xl font-bold text-[hsl(var(--success))]">R$ {faturamento.toLocaleString("pt-BR")}</p>
        </div>
        <div className="rounded-xl border border-border bg-card p-4 sm:p-5">
          <div className="flex items-center gap-2"><DollarSign className="h-4 w-4 text-destructive" /><p className="stat-label">A Receber</p></div>
          <p className="mt-2 sm:mt-3 text-lg sm:text-2xl font-bold text-destructive">R$ {aReceber.toLocaleString("pt-BR")}</p>
        </div>
        <div className="rounded-xl border border-border bg-card p-4 sm:p-5">
          <div className="flex items-center gap-2"><TrendingDown className="h-4 w-4 text-primary" /><p className="stat-label">Despesas</p></div>
          <p className="mt-2 sm:mt-3 text-lg sm:text-2xl font-bold text-primary">R$ {totalDespesas.toLocaleString("pt-BR")}</p>
        </div>
        <div className="rounded-xl border border-border bg-card p-4 sm:p-5">
          <div className="flex items-center gap-2"><TrendingUp className="h-4 w-4 text-[hsl(var(--success))]" /><p className="stat-label">Lucro</p></div>
          <p className="mt-2 sm:mt-3 text-lg sm:text-2xl font-bold" style={{ color: lucro >= 0 ? "hsl(var(--success))" : "hsl(var(--destructive))" }}>R$ {lucro.toLocaleString("pt-BR")}</p>
        </div>
      </div>

      {/* Despesas Table */}
      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <div className="flex items-center justify-between border-b border-border px-5 py-4">
          <h2 className="font-semibold">Despesas do Mês</h2>
          <Button size="sm" className="gap-1" onClick={openNewDesp}><Plus className="h-3 w-3" /> Nova Despesa</Button>
        </div>
        {/* Desktop table */}
        <table className="hidden md:table w-full">
          <thead>
            <tr className="border-b border-border bg-secondary/50">
              <th className="px-5 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">Data</th>
              <th className="px-5 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">Categoria</th>
              <th className="px-5 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">Descrição</th>
              <th className="px-5 py-3 text-right text-xs font-medium uppercase tracking-wider text-muted-foreground">Valor</th>
              <th className="px-5 py-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {mesDespesas.map((d) => (
              <tr key={d.id} className="hover:bg-secondary/30">
                <td className="px-5 py-3 text-sm">{d.data}</td>
                <td className="px-5 py-3 text-sm">{d.categoria || "—"}</td>
                <td className="px-5 py-3 text-sm">{d.descricao}</td>
                <td className="px-5 py-3 text-right text-sm font-semibold text-destructive">R$ {Number(d.valor).toLocaleString("pt-BR")}</td>
                <td className="px-5 py-3">
                  <div className="flex gap-1 justify-end">
                    <button onClick={() => openEditDesp(d)} className="rounded p-1 text-muted-foreground hover:text-primary"><Pencil className="h-3 w-3" /></button>
                    <button onClick={() => handleDeleteDesp(d.id)} className="rounded p-1 text-muted-foreground hover:text-destructive"><Trash2 className="h-3 w-3" /></button>
                  </div>
                </td>
              </tr>
            ))}
            {mesDespesas.length === 0 && <tr><td colSpan={5} className="px-5 py-8 text-center text-sm text-muted-foreground">Nenhuma despesa neste mês</td></tr>}
          </tbody>
        </table>
        {/* Mobile cards */}
        <div className="md:hidden divide-y divide-border">
          {mesDespesas.map((d) => (
            <div key={d.id} className="px-4 py-3 space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">{d.data} • {d.categoria || "Sem categoria"}</span>
                <div className="flex gap-1">
                  <button onClick={() => openEditDesp(d)} className="rounded p-1 text-muted-foreground hover:text-primary"><Pencil className="h-3 w-3" /></button>
                  <button onClick={() => handleDeleteDesp(d.id)} className="rounded p-1 text-muted-foreground hover:text-destructive"><Trash2 className="h-3 w-3" /></button>
                </div>
              </div>
              <p className="text-sm">{d.descricao}</p>
              <p className="text-sm font-semibold text-destructive">R$ {Number(d.valor).toLocaleString("pt-BR")}</p>
            </div>
          ))}
          {mesDespesas.length === 0 && <p className="px-4 py-8 text-center text-sm text-muted-foreground">Nenhuma despesa neste mês</p>}
        </div>
      </div>

      <Dialog open={showDespForm} onOpenChange={setShowDespForm}>
        <DialogContent>
          <DialogHeader><DialogTitle>{editDespId ? "Editar" : "Nova"} Despesa</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <Input placeholder="Descrição *" value={despForm.descricao} onChange={(e) => setDespForm({ ...despForm, descricao: e.target.value })} />
            <MoneyInput value={despForm.valor} onChange={(v) => setDespForm({ ...despForm, valor: v })} />
            <Input placeholder="Categoria" value={despForm.categoria} onChange={(e) => setDespForm({ ...despForm, categoria: e.target.value })} />
            <Input type="date" value={despForm.data} onChange={(e) => setDespForm({ ...despForm, data: e.target.value })} />
            <Button onClick={handleSaveDesp} disabled={createDespesa.isPending || updateDespesa.isPending} className="w-full">
              {(createDespesa.isPending || updateDespesa.isPending) ? "Salvando..." : "Salvar"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Reports;
