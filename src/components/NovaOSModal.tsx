import { useState } from "react";
import { Plus, Wrench, Package, Trash2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { MoneyInput, parseBRL } from "@/components/MoneyInput";
import { useVeiculos } from "@/hooks/useSupabase";
import { format } from "date-fns";

interface LineItem {
  id: string;
  descricao: string;
  valor: string;
}

interface NovaOSForm {
  cliente_id: string;
  veiculo_id: string;
  data_entrada: string;
  km_entrada: string;
  status: string;
  data_saida: string;
  como_chegou: string;
  reclamacao_cliente: string;
  diagnostico: string;
  forma_pagamento: string;
  desconto: string;
  valor_pago: string;
  observacoes: string;
}

const emptyForm: NovaOSForm = {
  cliente_id: "",
  veiculo_id: "",
  data_entrada: format(new Date(), "yyyy-MM-dd"),
  km_entrada: "",
  status: "em andamento",
  data_saida: "",
  como_chegou: "",
  reclamacao_cliente: "",
  diagnostico: "",
  forma_pagamento: "PIX",
  desconto: "",
  valor_pago: "",
  observacoes: "",
};

interface NovaOSModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  clientes: any[];
  onSave: (form: NovaOSForm, servicos: LineItem[], pecas: LineItem[]) => void;
  isPending: boolean;
  editData?: any;
}

export const NovaOSModal = ({ open, onOpenChange, clientes, onSave, isPending, editData }: NovaOSModalProps) => {
  const [tab, setTab] = useState("info");
  const [form, setForm] = useState<NovaOSForm>(editData ? mapEditToForm(editData) : { ...emptyForm });
  const [servicos, setServicos] = useState<LineItem[]>(editData?.servicos || []);
  const [pecas, setPecas] = useState<LineItem[]>(editData?.pecas || []);
  const [newServico, setNewServico] = useState({ descricao: "", valor: "" });
  const [newPeca, setNewPeca] = useState({ descricao: "", valor: "" });

  const { data: veiculos } = useVeiculos(form.cliente_id || undefined);

  const totalServicos = servicos.reduce((s, i) => s + parseBRL(i.valor), 0);
  const totalPecas = pecas.reduce((s, i) => s + parseBRL(i.valor), 0);
  const totalOS = totalServicos + totalPecas - parseBRL(form.desconto);

  const addServico = () => {
    if (!newServico.descricao) return;
    setServicos([...servicos, { id: crypto.randomUUID(), ...newServico }]);
    setNewServico({ descricao: "", valor: "" });
  };

  const addPeca = () => {
    if (!newPeca.descricao) return;
    setPecas([...pecas, { id: crypto.randomUUID(), ...newPeca }]);
    setNewPeca({ descricao: "", valor: "" });
  };

  const removeItem = (list: LineItem[], setList: (l: LineItem[]) => void, id: string) => {
    setList(list.filter((i) => i.id !== id));
  };

  const handleSubmit = () => {
    if (!form.cliente_id) return;
    onSave(form, servicos, pecas);
  };

  // Reset form when modal opens
  const handleOpenChange = (v: boolean) => {
    if (v && !editData) {
      setForm({ ...emptyForm });
      setServicos([]);
      setPecas([]);
      setTab("info");
    }
    onOpenChange(v);
  };

  const f = (v: string) => `R$ ${Number(v || 0).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`;

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>{editData ? "Editar" : "Nova"} Ordem de Serviço</DialogTitle>
        </DialogHeader>

        <Tabs value={tab} onValueChange={setTab} className="flex-1 overflow-hidden flex flex-col">
          <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4 h-auto">
            <TabsTrigger value="info" className="text-xs sm:text-sm">Informações</TabsTrigger>
            <TabsTrigger value="servicos" className="text-xs sm:text-sm">Serviços</TabsTrigger>
            <TabsTrigger value="pecas" className="text-xs sm:text-sm">Peças</TabsTrigger>
            <TabsTrigger value="pagamento" className="text-xs sm:text-sm">Pagamento</TabsTrigger>
          </TabsList>

          <div className="flex-1 overflow-y-auto mt-4">
            {/* ── ABA INFORMAÇÕES ── */}
            <TabsContent value="info" className="space-y-4 m-0">
              <div className="space-y-1">
                <label className="text-sm font-medium">Cliente *</label>
                <select
                  className="w-full rounded-lg border border-input bg-background p-2 text-sm"
                  value={form.cliente_id}
                  onChange={(e) => setForm({ ...form, cliente_id: e.target.value, veiculo_id: "" })}
                >
                  <option value="">Selecione o cliente</option>
                  {clientes.map((c) => (
                    <option key={c.id} value={c.id}>{c.nome}</option>
                  ))}
                </select>
              </div>

              {form.cliente_id && (
                <div className="space-y-1">
                  <label className="text-sm font-medium">Veículo *</label>
                  <select
                    className="w-full rounded-lg border border-input bg-background p-2 text-sm"
                    value={form.veiculo_id}
                    onChange={(e) => setForm({ ...form, veiculo_id: e.target.value })}
                  >
                    <option value="">Selecione o veículo</option>
                    {(veiculos || []).map((v: any) => (
                      <option key={v.id} value={v.id}>{v.marca} {v.modelo} — {v.placa}</option>
                    ))}
                  </select>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-sm font-medium">Data de Entrada *</label>
                  <Input type="date" value={form.data_entrada} onChange={(e) => setForm({ ...form, data_entrada: e.target.value })} />
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium">KM na Entrada</label>
                  <Input type="number" placeholder="Ex: 50000" value={form.km_entrada} onChange={(e) => setForm({ ...form, km_entrada: e.target.value })} />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-sm font-medium">Status</label>
                  <select className="w-full rounded-lg border border-input bg-background p-2 text-sm" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
                    <option value="em andamento">Em andamento</option>
                    <option value="aguardando peça">Aguardando peça</option>
                    <option value="orçamento">Orçamento</option>
                    <option value="concluída">Concluída</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium">Data de Saída</label>
                  <Input type="date" value={form.data_saida} onChange={(e) => setForm({ ...form, data_saida: e.target.value })} />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-sm font-medium">Condição de Chegada do Veículo</label>
                <Textarea placeholder="Descreva como o veículo chegou..." value={form.como_chegou} onChange={(e) => setForm({ ...form, como_chegou: e.target.value })} />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium">Reclamação/Solicitação do Cliente</label>
                <Textarea placeholder="O que o cliente relatou..." value={form.reclamacao_cliente} onChange={(e) => setForm({ ...form, reclamacao_cliente: e.target.value })} />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium">Diagnóstico</label>
                <Textarea placeholder="Diagnóstico técnico..." value={form.diagnostico} onChange={(e) => setForm({ ...form, diagnostico: e.target.value })} />
              </div>
            </TabsContent>

            {/* ── ABA SERVIÇOS ── */}
            <TabsContent value="servicos" className="space-y-4 m-0">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-end">
                <div className="flex-1 space-y-1">
                  <label className="text-sm font-medium">Descrição do serviço</label>
                  <Input placeholder="Ex: Troca de óleo" value={newServico.descricao} onChange={(e) => setNewServico({ ...newServico, descricao: e.target.value })} />
                </div>
                <div className="flex items-end gap-2">
                  <div className="flex-1 sm:w-36 space-y-1">
                    <label className="text-sm font-medium">Valor R$</label>
                    <MoneyInput value={newServico.valor} onChange={(v) => setNewServico({ ...newServico, valor: v })} />
                  </div>
                  <Button size="icon" onClick={addServico} className="shrink-0">
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {servicos.length === 0 ? (
                <div className="rounded-lg border border-dashed border-border p-8 text-center">
                  <Wrench className="mx-auto h-8 w-8 text-muted-foreground mb-2" />
                  <p className="text-sm text-muted-foreground">Nenhum serviço adicionado</p>
                  <p className="text-xs text-muted-foreground">Use o botão "+" acima para adicionar</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {servicos.map((s) => (
                    <div key={s.id} className="flex items-center justify-between rounded-lg border border-border bg-card px-4 py-3">
                      <div>
                        <p className="text-sm font-medium">{s.descricao}</p>
                        <p className="text-xs text-muted-foreground">R$ {parseBRL(s.valor).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</p>
                      </div>
                      <button onClick={() => removeItem(servicos, setServicos, s.id)} className="rounded p-1 text-muted-foreground hover:text-destructive">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                  <div className="text-right text-sm font-semibold">
                    Total Serviços: R$ {totalServicos.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                  </div>
                </div>
              )}
            </TabsContent>

            {/* ── ABA PEÇAS ── */}
            <TabsContent value="pecas" className="space-y-4 m-0">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-end">
                <div className="flex-1 space-y-1">
                  <label className="text-sm font-medium">Descrição da peça</label>
                  <Input placeholder="Ex: Filtro de óleo" value={newPeca.descricao} onChange={(e) => setNewPeca({ ...newPeca, descricao: e.target.value })} />
                </div>
                <div className="flex items-end gap-2">
                  <div className="flex-1 sm:w-36 space-y-1">
                    <label className="text-sm font-medium">Valor R$</label>
                    <MoneyInput value={newPeca.valor} onChange={(v) => setNewPeca({ ...newPeca, valor: v })} />
                  </div>
                  <Button size="icon" onClick={addPeca} className="shrink-0">
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {pecas.length === 0 ? (
                <div className="rounded-lg border border-dashed border-border p-8 text-center">
                  <Package className="mx-auto h-8 w-8 text-muted-foreground mb-2" />
                  <p className="text-sm text-muted-foreground">Nenhuma peça adicionada</p>
                  <p className="text-xs text-muted-foreground">Use o botão "+" acima para adicionar</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {pecas.map((p) => (
                    <div key={p.id} className="flex items-center justify-between rounded-lg border border-border bg-card px-4 py-3">
                      <div>
                        <p className="text-sm font-medium">{p.descricao}</p>
                        <p className="text-xs text-muted-foreground">R$ {parseBRL(p.valor).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</p>
                      </div>
                      <button onClick={() => removeItem(pecas, setPecas, p.id)} className="rounded p-1 text-muted-foreground hover:text-destructive">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                  <div className="text-right text-sm font-semibold">
                    Total Peças: R$ {totalPecas.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                  </div>
                </div>
              )}
            </TabsContent>

            {/* ── ABA PAGAMENTO ── */}
            <TabsContent value="pagamento" className="space-y-4 m-0">
              <div className="space-y-1">
                <label className="text-sm font-medium">Forma de Pagamento</label>
                <select className="w-full rounded-lg border border-input bg-background p-2 text-sm" value={form.forma_pagamento} onChange={(e) => setForm({ ...form, forma_pagamento: e.target.value })}>
                  <option>PIX</option>
                  <option>Dinheiro</option>
                  <option>Cartão Débito</option>
                  <option>Cartão Crédito</option>
                  <option>Boleto</option>
                  <option>Transferência</option>
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-sm font-medium">Desconto R$</label>
                  <MoneyInput value={form.desconto} onChange={(v) => setForm({ ...form, desconto: v })} placeholder="0,00" />
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium">Valor Pago R$</label>
                  <MoneyInput value={form.valor_pago} onChange={(v) => setForm({ ...form, valor_pago: v })} placeholder="0,00" />
                </div>
              </div>

              {/* Resumo do Orçamento */}
              <div className="rounded-xl border border-border bg-secondary/50 p-5 space-y-3">
                <h3 className="font-semibold text-sm">Resumo do Orçamento</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Mão de Obra:</span>
                    <span>R$ {totalServicos.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Peças:</span>
                    <span>R$ {totalPecas.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</span>
                  </div>
                  {parseBRL(form.desconto) > 0 && (
                    <div className="flex justify-between text-destructive">
                      <span>Desconto:</span>
                      <span>- R$ {parseBRL(form.desconto).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</span>
                    </div>
                  )}
                  <div className="border-t border-border pt-2 flex justify-between font-bold text-base text-primary">
                    <span>Total da OS:</span>
                    <span>R$ {Math.max(0, totalOS).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</span>
                  </div>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-sm font-medium">Observações</label>
                <Textarea placeholder="Observações adicionais..." value={form.observacoes} onChange={(e) => setForm({ ...form, observacoes: e.target.value })} />
              </div>
            </TabsContent>
          </div>
        </Tabs>

        <DialogFooter className="mt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
          <Button onClick={handleSubmit} disabled={isPending || !form.cliente_id}>
            {isPending ? "Salvando..." : editData ? "Salvar Alterações" : "Criar Ordem de Serviço"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

function mapEditToForm(os: any): NovaOSForm {
  return {
    cliente_id: os.cliente_id || "",
    veiculo_id: os.veiculo_id || "",
    data_entrada: os.data_entrada ? format(new Date(os.data_entrada), "yyyy-MM-dd") : format(new Date(), "yyyy-MM-dd"),
    km_entrada: os.km_entrada?.toString() || "",
    status: os.status || "em andamento",
    data_saida: os.data_saida ? format(new Date(os.data_saida), "yyyy-MM-dd") : "",
    como_chegou: os.como_chegou || "",
    reclamacao_cliente: os.reclamacao_cliente || "",
    diagnostico: os.diagnostico || "",
    forma_pagamento: "PIX",
    desconto: os.desconto ? Number(os.desconto).toFixed(2).replace(".", ",") : "",
    valor_pago: "",
    observacoes: os.observacoes || "",
  };
}

export type { NovaOSForm, LineItem };
