import { FileText, Download, TrendingUp, TrendingDown, DollarSign } from "lucide-react";
import { Button } from "@/components/ui/button";

const months = [
  { month: "Janeiro", revenue: 38200, receivable: 4400, expenses: 18500 },
  { month: "Fevereiro", revenue: 42350, receivable: 8720, expenses: 21000 },
];

const Reports = () => {
  const current = months[1];
  const prev = months[0];
  const revenueChange = ((current.revenue - prev.revenue) / prev.revenue * 100).toFixed(1);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Relatórios</h1>
          <p className="text-sm text-muted-foreground">Resumo financeiro mensal</p>
        </div>
        <Button variant="outline" className="gap-2">
          <Download className="h-4 w-4" /> Exportar PDF
        </Button>
      </div>

      {/* Current Month */}
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-border bg-card p-5">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-[hsl(var(--success))]" />
            <p className="stat-label">Faturamento — Fev/2026</p>
          </div>
          <p className="mt-3 text-2xl font-bold text-[hsl(var(--success))]">
            R$ {current.revenue.toLocaleString("pt-BR")}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            +{revenueChange}% vs. mês anterior
          </p>
        </div>
        <div className="rounded-xl border border-border bg-card p-5">
          <div className="flex items-center gap-2">
            <DollarSign className="h-4 w-4 text-destructive" />
            <p className="stat-label">A Receber — Fev/2026</p>
          </div>
          <p className="mt-3 text-2xl font-bold text-destructive">
            R$ {current.receivable.toLocaleString("pt-BR")}
          </p>
        </div>
        <div className="rounded-xl border border-border bg-card p-5">
          <div className="flex items-center gap-2">
            <TrendingDown className="h-4 w-4 text-primary" />
            <p className="stat-label">Despesas — Fev/2026</p>
          </div>
          <p className="mt-3 text-2xl font-bold text-primary">
            R$ {current.expenses.toLocaleString("pt-BR")}
          </p>
        </div>
      </div>

      {/* Monthly Table */}
      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <div className="border-b border-border px-5 py-4">
          <h2 className="font-semibold">Resumo por Mês</h2>
        </div>
        <table className="w-full">
          <thead>
            <tr className="border-b border-border bg-secondary/50">
              <th className="px-5 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">Mês</th>
              <th className="px-5 py-3 text-right text-xs font-medium uppercase tracking-wider text-muted-foreground">Faturamento</th>
              <th className="px-5 py-3 text-right text-xs font-medium uppercase tracking-wider text-muted-foreground">A Receber</th>
              <th className="px-5 py-3 text-right text-xs font-medium uppercase tracking-wider text-muted-foreground">Despesas</th>
              <th className="px-5 py-3 text-right text-xs font-medium uppercase tracking-wider text-muted-foreground">Lucro</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {months.map((m) => (
              <tr key={m.month} className="hover:bg-secondary/30">
                <td className="px-5 py-3 text-sm font-medium">{m.month}/2026</td>
                <td className="px-5 py-3 text-right text-sm text-[hsl(var(--success))]">R$ {m.revenue.toLocaleString("pt-BR")}</td>
                <td className="px-5 py-3 text-right text-sm text-destructive">R$ {m.receivable.toLocaleString("pt-BR")}</td>
                <td className="px-5 py-3 text-right text-sm text-primary">R$ {m.expenses.toLocaleString("pt-BR")}</td>
                <td className="px-5 py-3 text-right text-sm font-semibold">
                  R$ {(m.revenue - m.expenses).toLocaleString("pt-BR")}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Reports;
