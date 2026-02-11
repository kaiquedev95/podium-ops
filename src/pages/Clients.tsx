import { useState } from "react";
import { Search, Plus, Phone, MessageCircle, ChevronRight, Car, ArrowLeft, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useClientes, useMutateCliente, useVeiculos, useMutateVeiculo, useLogsAtendimento, useMutateLog } from "@/hooks/useSupabase";
import { toast } from "sonner";
import { Link } from "react-router-dom";

const Clients = () => {
  const [search, setSearch] = useState("");
  const { data: clientes, isLoading } = useClientes();
  const { create, update, remove } = useMutateCliente();
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [form, setForm] = useState({ nome: "", telefone: "", whatsapp: "", cpf_cnpj: "", endereco: "" });

  const filtered = (clientes || []).filter((c) =>
    c.nome.toLowerCase().includes(search.toLowerCase()) || (c.telefone || "").includes(search)
  );

  const openNew = () => { setForm({ nome: "", telefone: "", whatsapp: "", cpf_cnpj: "", endereco: "" }); setEditId(null); setShowForm(true); };
  const openEdit = (c: any) => { setForm({ nome: c.nome, telefone: c.telefone || "", whatsapp: c.whatsapp || "", cpf_cnpj: c.cpf_cnpj || "", endereco: c.endereco || "" }); setEditId(c.id); setShowForm(true); };

  const handleSave = () => {
    if (!form.nome.trim()) { toast.error("Nome é obrigatório"); return; }
    const fn = editId ? update.mutateAsync({ id: editId, ...form }) : create.mutateAsync(form);
    fn.then(() => { toast.success(editId ? "Atualizado!" : "Criado!"); setShowForm(false); }).catch((e) => toast.error(e.message));
  };

  const handleDelete = (id: string) => {
    if (!confirm("Excluir cliente?")) return;
    remove.mutate(id, { onSuccess: () => toast.success("Excluído!"), onError: (e) => toast.error(e.message) });
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
        <Input placeholder="Buscar por nome ou telefone..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10" />
      </div>
      <div className="space-y-3">
        {isLoading && <p className="text-sm text-muted-foreground">Carregando...</p>}
        {filtered.map((client) => (
          <div key={client.id} className="flex items-center gap-4 rounded-xl border border-border bg-card p-4 card-hover cursor-pointer" onClick={() => setSelectedId(client.id)}>
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-secondary text-sm font-bold text-secondary-foreground">
              {client.nome.split(" ").map((n) => n[0]).join("").slice(0, 2)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium">{client.nome}</p>
              <div className="mt-1 flex items-center gap-4 text-xs text-muted-foreground">
                {client.telefone && <span className="flex items-center gap-1"><Phone className="h-3 w-3" /> {client.telefone}</span>}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button className="rounded-lg p-2 text-muted-foreground hover:bg-secondary" onClick={(e) => { e.stopPropagation(); openEdit(client); }}><ChevronRight className="h-4 w-4" /></button>
              <button className="rounded-lg p-2 text-muted-foreground hover:text-destructive" onClick={(e) => { e.stopPropagation(); handleDelete(client.id); }}><Trash2 className="h-4 w-4" /></button>
            </div>
          </div>
        ))}
      </div>

      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent>
          <DialogHeader><DialogTitle>{editId ? "Editar" : "Novo"} Cliente</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <Input placeholder="Nome *" value={form.nome} onChange={(e) => setForm({ ...form, nome: e.target.value })} />
            <Input placeholder="Telefone" value={form.telefone} onChange={(e) => setForm({ ...form, telefone: e.target.value })} />
            <Input placeholder="WhatsApp" value={form.whatsapp} onChange={(e) => setForm({ ...form, whatsapp: e.target.value })} />
            <Input placeholder="CPF/CNPJ" value={form.cpf_cnpj} onChange={(e) => setForm({ ...form, cpf_cnpj: e.target.value })} />
            <Input placeholder="Endereço" value={form.endereco} onChange={(e) => setForm({ ...form, endereco: e.target.value })} />
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
  const { create: createVeiculo } = useMutateVeiculo();
  const { create: createLog } = useMutateLog();
  const { data: clientes } = useClientes();
  const cliente = clientes?.find((c) => c.id === id);

  const [showVForm, setShowVForm] = useState(false);
  const [vForm, setVForm] = useState({ placa: "", marca: "", modelo: "", ano: "", motor: "" });
  const [showLogForm, setShowLogForm] = useState(false);
  const [logForm, setLogForm] = useState({ canal: "WhatsApp", descricao: "", data_combinada: "", usuario_responsavel: "Admin" });

  const handleSaveVeiculo = () => {
    createVeiculo.mutate({ ...vForm, cliente_id: id }, {
      onSuccess: () => { toast.success("Veículo criado!"); setShowVForm(false); setVForm({ placa: "", marca: "", modelo: "", ano: "", motor: "" }); },
      onError: (e) => toast.error(e.message),
    });
  };

  const handleSaveLog = () => {
    if (!logForm.descricao.trim()) { toast.error("Descrição obrigatória"); return; }
    createLog.mutate({
      cliente_id: id,
      canal: logForm.canal,
      descricao: logForm.descricao,
      data_combinada: logForm.data_combinada || null,
      usuario_responsavel: logForm.usuario_responsavel,
    }, {
      onSuccess: () => {
        toast.success(logForm.data_combinada ? "Log criado + pendência gerada!" : "Log criado!");
        setShowLogForm(false);
        setLogForm({ canal: "WhatsApp", descricao: "", data_combinada: "", usuario_responsavel: "Admin" });
      },
      onError: (e) => toast.error(e.message),
    });
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center gap-4">
        <Button variant="ghost" onClick={onBack}><ArrowLeft className="h-4 w-4 mr-2" /> Voltar</Button>
        <Link to="/"><Button variant="ghost" size="sm">Início</Button></Link>
      </div>
      <h1 className="text-2xl font-bold">{cliente?.nome}</h1>
      <div className="text-sm text-muted-foreground space-y-1">
        {cliente?.telefone && <p>📞 {cliente.telefone}</p>}
        {cliente?.whatsapp && <p>💬 {cliente.whatsapp}</p>}
        {cliente?.endereco && <p>📍 {cliente.endereco}</p>}
        {cliente?.cpf_cnpj && <p>🪪 {cliente.cpf_cnpj}</p>}
      </div>

      {/* Veículos */}
      <div className="rounded-xl border border-border bg-card">
        <div className="flex items-center justify-between border-b border-border px-5 py-4">
          <h2 className="font-semibold">Veículos</h2>
          <Button size="sm" onClick={() => setShowVForm(true)}><Plus className="h-3 w-3 mr-1" /> Veículo</Button>
        </div>
        <div className="divide-y divide-border">
          {veiculos?.map((v) => (
            <div key={v.id} className="px-5 py-3 flex items-center gap-3">
              <Car className="h-4 w-4 text-primary" />
              <div>
                <p className="text-sm font-medium">{v.marca} {v.modelo} {v.ano}</p>
                <p className="text-xs text-muted-foreground">Placa: {v.placa || "—"} • Motor: {v.motor || "—"}</p>
              </div>
            </div>
          ))}
          {(!veiculos || veiculos.length === 0) && <p className="px-5 py-4 text-sm text-muted-foreground">Nenhum veículo</p>}
        </div>
      </div>

      {/* Logs de Atendimento */}
      <div className="rounded-xl border border-border bg-card">
        <div className="flex items-center justify-between border-b border-border px-5 py-4">
          <h2 className="font-semibold">Log de Atendimento</h2>
          <Button size="sm" onClick={() => setShowLogForm(true)}><Plus className="h-3 w-3 mr-1" /> Log</Button>
        </div>
        <div className="divide-y divide-border">
          {logs?.map((l) => (
            <div key={l.id} className="px-5 py-3">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <span>{new Date(l.data_hora).toLocaleString("pt-BR")}</span>
                <span className="rounded bg-secondary px-1.5 py-0.5">{l.canal}</span>
                <span>por {l.usuario_responsavel}</span>
                {l.data_combinada && <span className="badge-open">Combinado: {l.data_combinada}</span>}
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
          <DialogHeader><DialogTitle>Novo Veículo</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <Input placeholder="Placa" value={vForm.placa} onChange={(e) => setVForm({ ...vForm, placa: e.target.value })} />
            <Input placeholder="Marca" value={vForm.marca} onChange={(e) => setVForm({ ...vForm, marca: e.target.value })} />
            <Input placeholder="Modelo" value={vForm.modelo} onChange={(e) => setVForm({ ...vForm, modelo: e.target.value })} />
            <Input placeholder="Ano" value={vForm.ano} onChange={(e) => setVForm({ ...vForm, ano: e.target.value })} />
            <Input placeholder="Motor" value={vForm.motor} onChange={(e) => setVForm({ ...vForm, motor: e.target.value })} />
            <Button onClick={handleSaveVeiculo} disabled={createVeiculo.isPending} className="w-full">
              {createVeiculo.isPending ? "Salvando..." : "Salvar Veículo"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Log Dialog */}
      <Dialog open={showLogForm} onOpenChange={setShowLogForm}>
        <DialogContent>
          <DialogHeader><DialogTitle>Novo Log de Atendimento</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <select className="w-full rounded-lg border border-border bg-card p-2 text-sm" value={logForm.canal} onChange={(e) => setLogForm({ ...logForm, canal: e.target.value })}>
              <option>WhatsApp</option><option>Telefone</option><option>Presencial</option><option>Outro</option>
            </select>
            <Input placeholder="Responsável" value={logForm.usuario_responsavel} onChange={(e) => setLogForm({ ...logForm, usuario_responsavel: e.target.value })} />
            <textarea className="w-full rounded-lg border border-border bg-card p-2 text-sm min-h-[80px]" placeholder="Descrição *" value={logForm.descricao} onChange={(e) => setLogForm({ ...logForm, descricao: e.target.value })} />
            <Input type="date" placeholder="Data combinada (gera pendência)" value={logForm.data_combinada} onChange={(e) => setLogForm({ ...logForm, data_combinada: e.target.value })} />
            <p className="text-xs text-muted-foreground">Se preencher data combinada, uma pendência será criada automaticamente.</p>
            <Button onClick={handleSaveLog} disabled={createLog.isPending} className="w-full">
              {createLog.isPending ? "Salvando..." : "Salvar Log"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Clients;
