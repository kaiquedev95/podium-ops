import { useState } from "react";
import { Package, Plus, AlertTriangle, Edit, Trash2, ShoppingCart, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { MoneyInput, parseBRL } from "@/components/MoneyInput";
import { useEstoquePecas, useMutateEstoquePeca, useHistoricoCompras, useMutateHistoricoCompra } from "@/hooks/useSupabase";
import { toast } from "sonner";
import { format } from "date-fns";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const emptyPeca = { nome: "", codigo: "", fornecedor: "", preco_custo: "", preco_venda: "", quantidade: "", quantidade_minima: "1" };

const Estoque = () => {
  const { data: pecas, isLoading } = useEstoquePecas();
  const { data: historico } = useHistoricoCompras();
  const { create, update, remove } = useMutateEstoquePeca();
  const { create: createCompra } = useMutateHistoricoCompra();

  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [compraOpen, setCompraOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyPeca);
  const [compraForm, setCompraForm] = useState({ peca_id: "", quantidade: "1", valor_pago: "", fornecedor: "" });

  const filtered = (pecas || []).filter((p) =>
    [p.nome, p.codigo, p.fornecedor].some((f) => f?.toLowerCase().includes(search.toLowerCase()))
  );

  const openNew = () => { setEditId(null); setForm(emptyPeca); setDialogOpen(true); };
  const openEdit = (p: any) => {
    setEditId(p.id);
    setForm({
      nome: p.nome, codigo: p.codigo, fornecedor: p.fornecedor || "",
      preco_custo: String(p.preco_custo).replace(".", ","),
      preco_venda: String(p.preco_venda).replace(".", ","),
      quantidade: String(p.quantidade), quantidade_minima: String(p.quantidade_minima),
    });
    setDialogOpen(true);
  };

  const handleSave = () => {
    if (!form.nome || !form.codigo || !form.quantidade) { toast.error("Preencha os campos obrigatórios"); return; }
    const payload = {
      nome: form.nome, codigo: form.codigo, fornecedor: form.fornecedor || null,
      preco_custo: parseBRL(form.preco_custo), preco_venda: parseBRL(form.preco_venda),
      quantidade: parseInt(form.quantidade) || 0, quantidade_minima: parseInt(form.quantidade_minima) || 1,
    };
    if (editId) {
      update.mutate({ id: editId, ...payload } as any, { onSuccess: () => { toast.success("Peça atualizada!"); setDialogOpen(false); } });
    } else {
      create.mutate(payload as any, { onSuccess: () => { toast.success("Peça cadastrada!"); setDialogOpen(false); } });
    }
  };

  const handleDelete = (id: string) => {
    if (confirm("Excluir esta peça?")) remove.mutate(id, { onSuccess: () => toast.success("Peça excluída!") });
  };

  const openCompra = () => { setCompraForm({ peca_id: "", quantidade: "1", valor_pago: "", fornecedor: "" }); setCompraOpen(true); };
  const handleCompra = () => {
    if (!compraForm.peca_id || !compraForm.quantidade) { toast.error("Selecione peça e quantidade"); return; }
    const qtd = parseInt(compraForm.quantidade) || 1;
    createCompra.mutate(
      { peca_id: compraForm.peca_id, quantidade: qtd, valor_pago: parseBRL(compraForm.valor_pago), fornecedor: compraForm.fornecedor || null } as any,
      {
        onSuccess: () => {
          // Update stock quantity
          const peca = pecas?.find((p) => p.id === compraForm.peca_id);
          if (peca) update.mutate({ id: peca.id, quantidade: peca.quantidade + qtd } as any);
          toast.success("Compra registrada e estoque atualizado!");
          setCompraOpen(false);
        },
      }
    );
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">Estoque de Peças</h1>
          <p className="text-sm text-muted-foreground">Controle de peças e componentes</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={openCompra} variant="outline" className="gap-2"><ShoppingCart className="h-4 w-4" />Registrar Compra</Button>
          <Button onClick={openNew} className="gap-2"><Plus className="h-4 w-4" />Nova Peça</Button>
        </div>
      </div>

      <Tabs defaultValue="estoque">
        <TabsList>
          <TabsTrigger value="estoque">Estoque</TabsTrigger>
          <TabsTrigger value="historico">Histórico de Compras</TabsTrigger>
        </TabsList>

        <TabsContent value="estoque" className="space-y-4">
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder="Buscar peça..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10" />
          </div>

          {isLoading ? (
            <p className="text-center text-muted-foreground py-8">Carregando...</p>
          ) : (
            <>
              {/* Desktop table */}
              <div className="hidden md:block rounded-xl border border-border bg-card overflow-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="px-4 py-3 text-left font-medium text-muted-foreground">Nome</th>
                      <th className="px-4 py-3 text-left font-medium text-muted-foreground">Código</th>
                      <th className="px-4 py-3 text-left font-medium text-muted-foreground">Fornecedor</th>
                      <th className="px-4 py-3 text-right font-medium text-muted-foreground">Custo</th>
                      <th className="px-4 py-3 text-right font-medium text-muted-foreground">Venda</th>
                      <th className="px-4 py-3 text-center font-medium text-muted-foreground">Estoque</th>
                      <th className="px-4 py-3 text-right font-medium text-muted-foreground">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {filtered.map((p) => {
                      const low = p.quantidade <= p.quantidade_minima;
                      return (
                        <tr key={p.id} className="hover:bg-muted/50">
                          <td className="px-4 py-3 font-medium flex items-center gap-2">
                            {low && <AlertTriangle className="h-4 w-4 text-destructive shrink-0" />}
                            {p.nome}
                          </td>
                          <td className="px-4 py-3 text-muted-foreground">{p.codigo}</td>
                          <td className="px-4 py-3 text-muted-foreground">{p.fornecedor || "—"}</td>
                          <td className="px-4 py-3 text-right">R$ {Number(p.preco_custo).toLocaleString("pt-BR")}</td>
                          <td className="px-4 py-3 text-right">R$ {Number(p.preco_venda).toLocaleString("pt-BR")}</td>
                          <td className={`px-4 py-3 text-center font-bold ${low ? "text-destructive" : ""}`}>{p.quantidade}</td>
                          <td className="px-4 py-3 text-right">
                            <div className="flex justify-end gap-1">
                              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(p)}><Edit className="h-4 w-4" /></Button>
                              <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => handleDelete(p.id)}><Trash2 className="h-4 w-4" /></Button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                    {filtered.length === 0 && (
                      <tr><td colSpan={7} className="px-4 py-8 text-center text-muted-foreground">Nenhuma peça encontrada</td></tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Mobile cards */}
              <div className="md:hidden space-y-3">
                {filtered.map((p) => {
                  const low = p.quantidade <= p.quantidade_minima;
                  return (
                    <div key={p.id} className="rounded-xl border border-border bg-card p-4 space-y-2">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-2">
                          {low && <AlertTriangle className="h-4 w-4 text-destructive shrink-0" />}
                          <span className="font-medium">{p.nome}</span>
                        </div>
                        <div className="flex gap-1">
                          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(p)}><Edit className="h-4 w-4" /></Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => handleDelete(p.id)}><Trash2 className="h-4 w-4" /></Button>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div><span className="text-muted-foreground">Código: </span>{p.codigo}</div>
                        <div><span className="text-muted-foreground">Fornecedor: </span>{p.fornecedor || "—"}</div>
                        <div><span className="text-muted-foreground">Custo: </span>R$ {Number(p.preco_custo).toLocaleString("pt-BR")}</div>
                        <div><span className="text-muted-foreground">Venda: </span>R$ {Number(p.preco_venda).toLocaleString("pt-BR")}</div>
                      </div>
                      <div className={`text-sm font-bold ${low ? "text-destructive" : ""}`}>
                        Estoque: {p.quantidade} {low && "(baixo!)"}
                      </div>
                    </div>
                  );
                })}
                {filtered.length === 0 && <p className="text-center text-muted-foreground py-8">Nenhuma peça encontrada</p>}
              </div>
            </>
          )}
        </TabsContent>

        <TabsContent value="historico" className="space-y-4">
          {/* Desktop */}
          <div className="hidden md:block rounded-xl border border-border bg-card overflow-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">Data</th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">Peça</th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">Fornecedor</th>
                  <th className="px-4 py-3 text-center font-medium text-muted-foreground">Qtd</th>
                  <th className="px-4 py-3 text-right font-medium text-muted-foreground">Valor Pago</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {(historico || []).map((h) => (
                  <tr key={h.id} className="hover:bg-muted/50">
                    <td className="px-4 py-3">{format(new Date(h.data_compra), "dd/MM/yyyy")}</td>
                    <td className="px-4 py-3 font-medium">{(h as any).estoque_pecas?.nome || "—"}</td>
                    <td className="px-4 py-3 text-muted-foreground">{h.fornecedor || "—"}</td>
                    <td className="px-4 py-3 text-center">{h.quantidade}</td>
                    <td className="px-4 py-3 text-right">R$ {Number(h.valor_pago).toLocaleString("pt-BR")}</td>
                  </tr>
                ))}
                {(historico || []).length === 0 && (
                  <tr><td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">Nenhuma compra registrada</td></tr>
                )}
              </tbody>
            </table>
          </div>
          {/* Mobile */}
          <div className="md:hidden space-y-3">
            {(historico || []).map((h) => (
              <div key={h.id} className="rounded-xl border border-border bg-card p-4 space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="font-medium">{(h as any).estoque_pecas?.nome || "—"}</span>
                  <span className="text-muted-foreground">{format(new Date(h.data_compra), "dd/MM/yyyy")}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Fornecedor: {h.fornecedor || "—"}</span>
                  <span>Qtd: {h.quantidade}</span>
                </div>
                <div className="font-bold">R$ {Number(h.valor_pago).toLocaleString("pt-BR")}</div>
              </div>
            ))}
            {(historico || []).length === 0 && <p className="text-center text-muted-foreground py-8">Nenhuma compra registrada</p>}
          </div>
        </TabsContent>
      </Tabs>

      {/* Modal Nova/Editar Peça */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>{editId ? "Editar Peça" : "Nova Peça"}</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div>
              <label className="text-sm font-medium">Nome da Peça *</label>
              <Input value={form.nome} onChange={(e) => setForm({ ...form, nome: e.target.value })} />
            </div>
            <div>
              <label className="text-sm font-medium">Código *</label>
              <Input value={form.codigo} onChange={(e) => setForm({ ...form, codigo: e.target.value })} />
            </div>
            <div>
              <label className="text-sm font-medium">Fornecedor</label>
              <Input value={form.fornecedor} onChange={(e) => setForm({ ...form, fornecedor: e.target.value })} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm font-medium">Preço de Custo</label>
                <MoneyInput value={form.preco_custo} onChange={(v) => setForm({ ...form, preco_custo: v })} />
              </div>
              <div>
                <label className="text-sm font-medium">Preço de Venda</label>
                <MoneyInput value={form.preco_venda} onChange={(v) => setForm({ ...form, preco_venda: v })} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm font-medium">Quantidade *</label>
                <Input type="number" value={form.quantidade} onChange={(e) => setForm({ ...form, quantidade: e.target.value })} />
              </div>
              <div>
                <label className="text-sm font-medium">Qtd Mínima</label>
                <Input type="number" value={form.quantidade_minima} onChange={(e) => setForm({ ...form, quantidade_minima: e.target.value })} />
              </div>
            </div>
            <Button onClick={handleSave} className="w-full" disabled={create.isPending || update.isPending}>
              {(create.isPending || update.isPending) ? "Salvando..." : "Salvar"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal Registrar Compra */}
      <Dialog open={compraOpen} onOpenChange={setCompraOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>Registrar Compra</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div>
              <label className="text-sm font-medium">Peça *</label>
              <select className="w-full rounded-md border border-input bg-background p-2 text-sm" value={compraForm.peca_id} onChange={(e) => setCompraForm({ ...compraForm, peca_id: e.target.value })}>
                <option value="">Selecione...</option>
                {(pecas || []).map((p) => <option key={p.id} value={p.id}>{p.nome} ({p.codigo})</option>)}
              </select>
            </div>
            <div>
              <label className="text-sm font-medium">Fornecedor</label>
              <Input value={compraForm.fornecedor} onChange={(e) => setCompraForm({ ...compraForm, fornecedor: e.target.value })} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm font-medium">Quantidade</label>
                <Input type="number" value={compraForm.quantidade} onChange={(e) => setCompraForm({ ...compraForm, quantidade: e.target.value })} />
              </div>
              <div>
                <label className="text-sm font-medium">Valor Pago</label>
                <MoneyInput value={compraForm.valor_pago} onChange={(v) => setCompraForm({ ...compraForm, valor_pago: v })} />
              </div>
            </div>
            <Button onClick={handleCompra} className="w-full" disabled={createCompra.isPending}>
              {createCompra.isPending ? "Salvando..." : "Registrar Compra"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Estoque;
