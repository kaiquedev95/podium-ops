import { useState } from "react";
import { Search, Plus, Phone, ChevronRight, Car, ArrowLeft, Trash2, Pencil, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useClientes, useMutateCliente, useVeiculos, useMutateVeiculo, useLogsAtendimento, useMutateLog } from "@/hooks/useSupabase";
import { toast } from "sonner";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { Label } from "@/components/ui/label";

const emptyForm = { nome: "", telefone: "", whatsapp: "", cpf_cnpj: "", email: "", endereco: "", cep: "", cidade: "", estado: "", bairro: "", numero: "", complemento: "" };

const Clients = () => {
  const [search, setSearch] = useState("");
  const { data: clientes, isLoading } = useClientes();
  const { data: allVeiculos } = useVeiculos();
  const { create, update, remove } = useMutateCliente();
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);

  const filtered = (clientes || []).filter((c) => {
    const s = search.toLowerCase().trim();
    if (!s) return true;
    if (c.nome.toLowerCase().includes(s)) return true;
    if ((c.telefone || "").includes(s)) return true;
    if ((c.whatsapp || "").includes(s)) return true;
    if ((c.cpf_cnpj || "").toLowerCase().includes(s)) return true;
    if ((c.email || "").toLowerCase().includes(s)) return true;
    // Search by placa via vehicles
    const clientVeiculos = (allVeiculos || []).filter((v) => v.cliente_id === c.id);
    if (clientVeiculos.some((v) => (v.placa || "").toLowerCase().includes(s))) return true;
    return false;
  });

  const openNew = () => { setForm(emptyForm); setEditId(null); setShowForm(true); };
  const openEdit = (c: any) => {
    setForm({
      nome: c.nome, telefone: c.telefone || "", whatsapp: c.whatsapp || "",
      cpf_cnpj: c.cpf_cnpj || "", email: c.email || "", endereco: c.endereco || "",
      cep: c.cep || "", cidade: c.cidade || "", estado: c.estado || "",
      bairro: c.bairro || "", numero: c.numero || "", complemento: c.complemento || "",
    });
    setEditId(c.id); setShowForm(true);
  };

  const handleSave = () => {
    if (!form.nome.trim()) { toast.error("Nome é obrigatório"); return; }
    const fn = editId ? update.mutateAsync({ id: editId, ...form }) : create.mutateAsync(form as any);
    fn.then(() => { toast.success(editId ? "Atualizado!" : "Criado!"); setShowForm(false); }).catch((e: any) => toast.error(e.message));
  };

  const handleDelete = (id: string) => {
    if (!confirm("Excluir cliente?")) return;
    remove.mutate(id, { onSuccess: () => toast.success("Excluído!"), onError: (e) => toast.error(e.message) });
  };

  const sendWhatsApp = (whatsapp: string, nome: string) => {
    const phone = whatsapp.replace(/\D/g, "");
    if (!phone) { toast.error("WhatsApp não cadastrado"); return; }
    const url = `https://wa.me/55${phone}?text=${encodeURIComponent(`Olá ${nome}!`)}`;
    window.open(url, "_blank");
  };

  if (selectedId) {
    return <ClientDetail id={selectedId} onBack={() => setSelectedId(null)} />;
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Clientes</h1>
          <p className="text-sm text-muted-foreground">{clientes?.length || 0} clientes cadastrados</p>
        </div>
        <Button className="gap-2" onClick={openNew}><Plus className="h-4 w-4" /> Novo Cliente</Button>
      </div>
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input placeholder="Buscar por nome, telefone, placa, CPF ou email..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10" />
      </div>
      <div className="space-y-3">
        {isLoading && <p className="text-sm text-muted-foreground">Carregando...</p>}
        {filtered.map((client) => (
          <div key={client.id} className="rounded-xl border border-border bg-card p-4 card-hover cursor-pointer space-y-2 sm:space-y-0 sm:flex sm:items-center sm:gap-4" onClick={() => setSelectedId(client.id)}>
            <div className="flex items-center gap-3 sm:flex-1 sm:min-w-0">
              <div className="flex h-11 w-11 items-center justify-center rounded-full bg-secondary text-sm font-bold text-secondary-foreground flex-shrink-0">
                {client.nome.split(" ").map((n) => n[0]).join("").slice(0, 2)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium truncate">{client.nome}</p>
                <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-0 text-xs text-muted-foreground">
                  {client.telefone && <span className="flex items-center gap-1"><Phone className="h-3 w-3" /> {client.telefone}</span>}
                  {(client as any).email && <span className="truncate">{(client as any).email}</span>}
                </div>
              </div>
            </div>
            <div className="flex items-center justify-end gap-1 flex-shrink-0">
              {client.whatsapp && (
                <button className="rounded-lg p-2 text-muted-foreground hover:text-[hsl(var(--success))]" title="Enviar WhatsApp" onClick={(e) => { e.stopPropagation(); sendWhatsApp(client.whatsapp!, client.nome); }}>
                  <MessageCircle className="h-4 w-4" />
                </button>
              )}
              <button className="rounded-lg p-2 text-muted-foreground hover:text-primary" onClick={(e) => { e.stopPropagation(); openEdit(client); }}><Pencil className="h-4 w-4" /></button>
              <button className="rounded-lg p-2 text-muted-foreground hover:text-destructive" onClick={(e) => { e.stopPropagation(); handleDelete(client.id); }}><Trash2 className="h-4 w-4" /></button>
            </div>
          </div>
        ))}
        {!isLoading && filtered.length === 0 && <p className="text-sm text-muted-foreground">Nenhum cliente encontrado.</p>}
      </div>

      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{editId ? "Editar" : "Novo"} Cliente</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground">Nome *</Label>
              <Input placeholder="Nome completo" value={form.nome} onChange={(e) => setForm({ ...form, nome: e.target.value })} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground">Telefone</Label>
                <Input placeholder="(00) 0000-0000" value={form.telefone} onChange={(e) => setForm({ ...form, telefone: e.target.value })} />
              </div>
              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground">WhatsApp</Label>
                <Input placeholder="(00) 00000-0000" value={form.whatsapp} onChange={(e) => setForm({ ...form, whatsapp: e.target.value })} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground">CPF/CNPJ</Label>
                <Input placeholder="000.000.000-00" value={form.cpf_cnpj} onChange={(e) => setForm({ ...form, cpf_cnpj: e.target.value })} />
              </div>
              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground">E-mail</Label>
                <Input placeholder="email@exemplo.com" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
              </div>
            </div>

            <div className="border-t border-border pt-4">
              <p className="text-sm font-medium mb-3">Endereço</p>
              <div className="space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="space-y-1">
                    <Label className="text-xs text-muted-foreground">CEP</Label>
                    <Input placeholder="00000-000" value={form.cep} onChange={(e) => setForm({ ...form, cep: e.target.value })} />
                  </div>
                  <div className="space-y-1 sm:col-span-2">
                    <Label className="text-xs text-muted-foreground">Rua / Logradouro</Label>
                    <Input placeholder="Rua, Av, etc." value={form.endereco} onChange={(e) => setForm({ ...form, endereco: e.target.value })} />
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="space-y-1">
                    <Label className="text-xs text-muted-foreground">Número</Label>
                    <Input placeholder="Nº" value={form.numero} onChange={(e) => setForm({ ...form, numero: e.target.value })} />
                  </div>
                  <div className="space-y-1 sm:col-span-2">
                    <Label className="text-xs text-muted-foreground">Complemento</Label>
                    <Input placeholder="Apto, Sala, etc." value={form.complemento} onChange={(e) => setForm({ ...form, complemento: e.target.value })} />
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="space-y-1">
                    <Label className="text-xs text-muted-foreground">Bairro</Label>
                    <Input placeholder="Bairro" value={form.bairro} onChange={(e) => setForm({ ...form, bairro: e.target.value })} />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs text-muted-foreground">Cidade</Label>
                    <Input placeholder="Cidade" value={form.cidade} onChange={(e) => setForm({ ...form, cidade: e.target.value })} />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs text-muted-foreground">Estado</Label>
                    <Input placeholder="UF" value={form.estado} onChange={(e) => setForm({ ...form, estado: e.target.value })} />
                  </div>
                </div>
              </div>
            </div>

            <Button onClick={handleSave} disabled={create.isPending || update.isPending} className="w-full">
              {(create.isPending || update.isPending) ? "Salvando..." : "Salvar"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

// ─── Client Detail (inline) ───
const ClientDetail = ({ id, onBack }: { id: string; onBack: () => void }) => {
  const { data: veiculos } = useVeiculos(id);
  const { data: logs } = useLogsAtendimento(id);
  const { create: createVeiculo, update: updateVeiculo, remove: removeVeiculo } = useMutateVeiculo();
  const { create: createLog, update: updateLog, remove: removeLog } = useMutateLog();
  const { data: clientes } = useClientes();
  const cliente = clientes?.find((c) => c.id === id);

  const [showVForm, setShowVForm] = useState(false);
  const [editVId, setEditVId] = useState<string | null>(null);
  const [vForm, setVForm] = useState({ placa: "", marca: "", modelo: "", ano: "", motor: "" });
  const [showLogForm, setShowLogForm] = useState(false);
  const [editLogId, setEditLogId] = useState<string | null>(null);
  const [logForm, setLogForm] = useState({ canal: "WhatsApp", descricao: "", data_combinada: "", usuario_responsavel: "Admin" });

  const openNewV = () => { setVForm({ placa: "", marca: "", modelo: "", ano: "", motor: "" }); setEditVId(null); setShowVForm(true); };
  const openEditV = (v: any) => { setVForm({ placa: v.placa || "", marca: v.marca || "", modelo: v.modelo || "", ano: v.ano || "", motor: v.motor || "" }); setEditVId(v.id); setShowVForm(true); };

  const openNewLog = () => { setLogForm({ canal: "WhatsApp", descricao: "", data_combinada: "", usuario_responsavel: "Admin" }); setEditLogId(null); setShowLogForm(true); };
  const openEditLog = (l: any) => { setLogForm({ canal: l.canal, descricao: l.descricao, data_combinada: l.data_combinada || "", usuario_responsavel: l.usuario_responsavel }); setEditLogId(l.id); setShowLogForm(true); };

  const handleSaveVeiculo = () => {
    if (editVId) {
      updateVeiculo.mutate({ id: editVId, ...vForm }, {
        onSuccess: () => { toast.success("Veículo atualizado!"); setShowVForm(false); },
        onError: (e) => toast.error(e.message),
      });
    } else {
      createVeiculo.mutate({ ...vForm, cliente_id: id }, {
        onSuccess: () => { toast.success("Veículo criado!"); setShowVForm(false); setVForm({ placa: "", marca: "", modelo: "", ano: "", motor: "" }); },
        onError: (e) => toast.error(e.message),
      });
    }
  };

  const handleDeleteV = (vId: string) => {
    if (!confirm("Excluir veículo?")) return;
    removeVeiculo.mutate(vId, { onSuccess: () => toast.success("Excluído!"), onError: (e) => toast.error(e.message) });
  };

  const handleSaveLog = () => {
    if (!logForm.descricao.trim()) { toast.error("Descrição obrigatória"); return; }
    if (editLogId) {
      updateLog.mutate({ id: editLogId, canal: logForm.canal, descricao: logForm.descricao, data_combinada: logForm.data_combinada || null, usuario_responsavel: logForm.usuario_responsavel }, {
        onSuccess: () => { toast.success("Log atualizado!"); setShowLogForm(false); },
        onError: (e) => toast.error(e.message),
      });
    } else {
      createLog.mutate({
        cliente_id: id, canal: logForm.canal, descricao: logForm.descricao,
        data_combinada: logForm.data_combinada || null, usuario_responsavel: logForm.usuario_responsavel,
      }, {
        onSuccess: () => {
          toast.success(logForm.data_combinada ? "Log criado + pendência gerada!" : "Log criado!");
          setShowLogForm(false);
          setLogForm({ canal: "WhatsApp", descricao: "", data_combinada: "", usuario_responsavel: "Admin" });
        },
        onError: (e) => toast.error(e.message),
      });
    }
  };

  const handleDeleteLog = (logId: string) => {
    if (!confirm("Excluir log?")) return;
    removeLog.mutate(logId, { onSuccess: () => toast.success("Log excluído!"), onError: (e) => toast.error(e.message) });
  };

  const sendWhatsApp = (whatsapp: string, nome: string) => {
    const phone = whatsapp.replace(/\D/g, "");
    if (!phone) { toast.error("WhatsApp não cadastrado"); return; }
    window.open(`https://wa.me/55${phone}?text=${encodeURIComponent(`Olá ${nome}!`)}`, "_blank");
  };

  const formatAddress = () => {
    const c = cliente as any;
    if (!c) return null;
    const parts = [
      c.endereco, c.numero ? `Nº ${c.numero}` : null, c.complemento,
      c.bairro, c.cidade && c.estado ? `${c.cidade}/${c.estado}` : c.cidade || c.estado,
      c.cep ? `CEP: ${c.cep}` : null,
    ].filter(Boolean);
    return parts.length > 0 ? parts.join(", ") : null;
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center gap-4">
        <Button variant="ghost" onClick={onBack}><ArrowLeft className="h-4 w-4 mr-2" /> Voltar</Button>
        <Link to="/"><Button variant="ghost" size="sm">Início</Button></Link>
      </div>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">{cliente?.nome}</h1>
        {cliente?.whatsapp && (
          <Button size="sm" variant="outline" className="gap-2 border-[hsl(var(--success))]/30 text-[hsl(var(--success))] hover:bg-[hsl(var(--success))]/10" onClick={() => sendWhatsApp(cliente.whatsapp!, cliente.nome)}>
            <MessageCircle className="h-4 w-4" /> WhatsApp
          </Button>
        )}
      </div>
      <div className="text-sm text-muted-foreground space-y-1">
        {cliente?.telefone && <p>📞 {cliente.telefone}</p>}
        {cliente?.whatsapp && <p>💬 {cliente.whatsapp}</p>}
        {(cliente as any)?.email && <p>📧 {(cliente as any).email}</p>}
        {cliente?.cpf_cnpj && <p>🪪 {cliente.cpf_cnpj}</p>}
        {formatAddress() && <p>📍 {formatAddress()}</p>}
      </div>

      {/* Veículos */}
      <div className="rounded-xl border border-border bg-card">
        <div className="flex items-center justify-between border-b border-border px-5 py-4">
          <h2 className="font-semibold">Veículos</h2>
          <Button size="sm" onClick={openNewV}><Plus className="h-3 w-3 mr-1" /> Veículo</Button>
        </div>
        <div className="divide-y divide-border">
          {veiculos?.map((v) => (
            <div key={v.id} className="px-5 py-3 flex items-center gap-3">
              <Car className="h-4 w-4 text-primary" />
              <div className="flex-1">
                <p className="text-sm font-medium">{v.marca} {v.modelo} {v.ano}</p>
                <p className="text-xs text-muted-foreground">Placa: {v.placa || "—"} • Motor: {v.motor || "—"}</p>
              </div>
              <button onClick={() => openEditV(v)} className="rounded p-1 text-muted-foreground hover:text-primary"><Pencil className="h-3 w-3" /></button>
              <button onClick={() => handleDeleteV(v.id)} className="rounded p-1 text-muted-foreground hover:text-destructive"><Trash2 className="h-3 w-3" /></button>
            </div>
          ))}
          {(!veiculos || veiculos.length === 0) && <p className="px-5 py-4 text-sm text-muted-foreground">Nenhum veículo</p>}
        </div>
      </div>

      {/* Logs de Atendimento */}
      <div className="rounded-xl border border-border bg-card">
        <div className="flex items-center justify-between border-b border-border px-5 py-4">
          <h2 className="font-semibold">Log de Atendimento</h2>
          <Button size="sm" onClick={openNewLog}><Plus className="h-3 w-3 mr-1" /> Log</Button>
        </div>
        <div className="divide-y divide-border">
          {logs?.map((l) => (
            <div key={l.id} className="px-5 py-3">
              <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 text-xs text-muted-foreground">
                <span>{new Date(l.data_hora).toLocaleString("pt-BR")}</span>
                <span className="rounded bg-secondary px-1.5 py-0.5">{l.canal}</span>
                <span>por {l.usuario_responsavel}</span>
                {l.data_combinada && <span className="badge-open">Combinado: {l.data_combinada}</span>}
                <div className="ml-auto flex gap-1">
                  <button onClick={() => openEditLog(l)} className="rounded p-1 text-muted-foreground hover:text-primary"><Pencil className="h-3 w-3" /></button>
                  <button onClick={() => handleDeleteLog(l.id)} className="rounded p-1 text-muted-foreground hover:text-destructive"><Trash2 className="h-3 w-3" /></button>
                </div>
              </div>
              <p className="mt-1 text-sm">{l.descricao}</p>
            </div>
          ))}
          {(!logs || logs.length === 0) && <p className="px-5 py-4 text-sm text-muted-foreground">Nenhum registro</p>}
        </div>
      </div>

      {/* Vehicle Dialog */}
      <Dialog open={showVForm} onOpenChange={setShowVForm}>
        <DialogContent>
          <DialogHeader><DialogTitle>{editVId ? "Editar" : "Novo"} Veículo</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <Input placeholder="Placa" value={vForm.placa} onChange={(e) => setVForm({ ...vForm, placa: e.target.value })} />
            <Input placeholder="Marca" value={vForm.marca} onChange={(e) => setVForm({ ...vForm, marca: e.target.value })} />
            <Input placeholder="Modelo" value={vForm.modelo} onChange={(e) => setVForm({ ...vForm, modelo: e.target.value })} />
            <Input placeholder="Ano" value={vForm.ano} onChange={(e) => setVForm({ ...vForm, ano: e.target.value })} />
            <Input placeholder="Motor" value={vForm.motor} onChange={(e) => setVForm({ ...vForm, motor: e.target.value })} />
            <Button onClick={handleSaveVeiculo} disabled={createVeiculo.isPending || updateVeiculo.isPending} className="w-full">
              {(createVeiculo.isPending || updateVeiculo.isPending) ? "Salvando..." : "Salvar Veículo"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Log Dialog */}
      <Dialog open={showLogForm} onOpenChange={setShowLogForm}>
        <DialogContent>
          <DialogHeader><DialogTitle>{editLogId ? "Editar" : "Novo"} Log de Atendimento</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <select className="w-full rounded-lg border border-border bg-card p-2 text-sm" value={logForm.canal} onChange={(e) => setLogForm({ ...logForm, canal: e.target.value })}>
              <option>WhatsApp</option><option>Telefone</option><option>Presencial</option><option>Outro</option>
            </select>
            <Input placeholder="Responsável" value={logForm.usuario_responsavel} onChange={(e) => setLogForm({ ...logForm, usuario_responsavel: e.target.value })} />
            <textarea className="w-full rounded-lg border border-border bg-card p-2 text-sm min-h-[80px]" placeholder="Descrição *" value={logForm.descricao} onChange={(e) => setLogForm({ ...logForm, descricao: e.target.value })} />
            <Input type="date" placeholder="Data combinada (gera pendência)" value={logForm.data_combinada} onChange={(e) => setLogForm({ ...logForm, data_combinada: e.target.value })} />
            <p className="text-xs text-muted-foreground">Se preencher data combinada, uma pendência será criada automaticamente.</p>
            <Button onClick={handleSaveLog} disabled={createLog.isPending || updateLog.isPending} className="w-full">
              {(createLog.isPending || updateLog.isPending) ? "Salvando..." : "Salvar Log"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Clients;
