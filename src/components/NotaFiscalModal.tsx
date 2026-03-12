import { useState, useEffect } from "react";
import { FileText, Download, Printer } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

interface NFItem {
  descricao: string;
  quantidade: number;
  valor_unitario: number;
  valor_total: number;
}

interface NotaFiscalModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  osId: string;
  osData: any;
  clienteData: any;
}

const DEFAULT_OFICINA = {
  nome: "Minha Oficina",
  cnpj: "00.000.000/0001-00",
  endereco: "Rua Exemplo, 123 - Centro",
  inscricao_estadual: "",
};

export const NotaFiscalModal = ({ open, onOpenChange, osId, osData, clienteData }: NotaFiscalModalProps) => {
  const [oficina, setOficina] = useState(DEFAULT_OFICINA);
  const [icms, setIcms] = useState(0);
  const [iss, setIss] = useState(0);
  const [observacoes, setObservacoes] = useState("");
  const [servicos, setServicos] = useState<NFItem[]>([]);
  const [pecas, setPecas] = useState<NFItem[]>([]);
  const [saving, setSaving] = useState(false);
  const [existingNF, setExistingNF] = useState<any>(null);

  useEffect(() => {
    if (!open || !osId) return;
    loadItems();
    checkExisting();
  }, [open, osId]);

  const loadItems = async () => {
    const [sRes, pRes] = await Promise.all([
      supabase.from("servicos_os").select("*").eq("ordem_servico_id", osId),
      supabase.from("pecas_os").select("*, estoque_pecas(nome, codigo)").eq("ordem_servico_id", osId),
    ]);
    setServicos((sRes.data || []).map((s: any) => ({
      descricao: s.descricao,
      quantidade: 1,
      valor_unitario: Number(s.valor),
      valor_total: Number(s.valor),
    })));
    setPecas((pRes.data || []).map((p: any) => ({
      descricao: p.estoque_pecas?.nome || p.descricao,
      quantidade: p.quantidade || 1,
      valor_unitario: Number(p.valor) / (p.quantidade || 1),
      valor_total: Number(p.valor),
    })));
  };

  const checkExisting = async () => {
    const { data } = await supabase
      .from("notas_fiscais")
      .select("*")
      .eq("ordem_servico_id", osId)
      .order("created_at", { ascending: false })
      .limit(1);
    if (data && data.length > 0) {
      setExistingNF(data[0]);
      setOficina({
        nome: data[0].oficina_nome,
        cnpj: data[0].oficina_cnpj,
        endereco: data[0].oficina_endereco,
        inscricao_estadual: data[0].oficina_inscricao_estadual || "",
      });
      setIcms(Number(data[0].icms_percentual));
      setIss(Number(data[0].iss_percentual));
      setObservacoes(data[0].observacoes || "");
    } else {
      setExistingNF(null);
    }
  };

  const valorServicos = servicos.reduce((s, i) => s + i.valor_total, 0);
  const valorPecas = pecas.reduce((s, i) => s + i.valor_total, 0);
  const desconto = Number(osData?.desconto || 0);
  const subtotal = valorServicos + valorPecas - desconto;
  const icmsValor = subtotal * (icms / 100);
  const issValor = valorServicos * (iss / 100);
  const totalNF = subtotal;

  const handleSave = async () => {
    setSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { toast.error("Usuário não autenticado"); return; }

      const payload = {
        ordem_servico_id: osId,
        cliente_id: osData.cliente_id,
        oficina_nome: oficina.nome,
        oficina_cnpj: oficina.cnpj,
        oficina_endereco: oficina.endereco,
        oficina_inscricao_estadual: oficina.inscricao_estadual,
        valor_servicos: valorServicos,
        valor_pecas: valorPecas,
        valor_total: totalNF,
        desconto,
        icms_percentual: icms,
        icms_valor: icmsValor,
        iss_percentual: iss,
        iss_valor: issValor,
        itens_servicos: servicos as any,
        itens_pecas: pecas as any,
        observacoes,
      };

      let nf;
      if (existingNF) {
        const { data, error } = await supabase.from("notas_fiscais").update(payload).eq("id", existingNF.id).select().single();
        if (error) throw error;
        nf = data;
      } else {
        const { data, error } = await supabase.from("notas_fiscais").insert({ ...payload, owner_id: user.id }).select().single();
        if (error) throw error;
        nf = data;
      }
      setExistingNF(nf);
      toast.success("Nota Fiscal salva!");
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setSaving(false);
    }
  };

  const handleGeneratePDF = async () => {
    if (!existingNF) {
      await handleSave();
    }
    const nfData = existingNF || { numero_nf: "---" };

    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();

    // Header
    doc.setFontSize(16);
    doc.setFont("helvetica", "bold");
    doc.text("NOTA FISCAL DE SERVIÇO", pageWidth / 2, 20, { align: "center" });

    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text(`NF Nº: ${nfData.numero_nf}`, pageWidth - 15, 20, { align: "right" });
    doc.text(`Emissão: ${new Date().toLocaleDateString("pt-BR")}`, pageWidth - 15, 26, { align: "right" });

    // Oficina
    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.text("PRESTADOR", 15, 38);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.text(`${oficina.nome}`, 15, 44);
    doc.text(`CNPJ: ${oficina.cnpj}`, 15, 49);
    doc.text(`${oficina.endereco}`, 15, 54);
    if (oficina.inscricao_estadual) doc.text(`IE: ${oficina.inscricao_estadual}`, 15, 59);

    // Cliente
    const clienteY = oficina.inscricao_estadual ? 68 : 63;
    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.text("TOMADOR / CLIENTE", 15, clienteY);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.text(`${clienteData?.nome || ""}`, 15, clienteY + 6);
    doc.text(`CPF/CNPJ: ${clienteData?.cpf_cnpj || "Não informado"}`, 15, clienteY + 11);
    const enderecoCliente = [clienteData?.endereco, clienteData?.numero, clienteData?.bairro, clienteData?.cidade, clienteData?.estado].filter(Boolean).join(", ");
    doc.text(`${enderecoCliente || "Endereço não informado"}`, 15, clienteY + 16);

    // Serviços table
    let startY = clienteY + 26;
    if (servicos.length > 0) {
      doc.setFontSize(10);
      doc.setFont("helvetica", "bold");
      doc.text("SERVIÇOS", 15, startY);
      autoTable(doc, {
        startY: startY + 3,
        head: [["Descrição", "Qtd", "Valor Unit.", "Total"]],
        body: servicos.map((s) => [
          s.descricao,
          String(s.quantidade),
          `R$ ${s.valor_unitario.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`,
          `R$ ${s.valor_total.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`,
        ]),
        theme: "grid",
        styles: { fontSize: 8 },
        headStyles: { fillColor: [60, 60, 60] },
      });
      startY = (doc as any).lastAutoTable.finalY + 6;
    }

    // Peças table
    if (pecas.length > 0) {
      doc.setFontSize(10);
      doc.setFont("helvetica", "bold");
      doc.text("PEÇAS / MATERIAIS", 15, startY);
      autoTable(doc, {
        startY: startY + 3,
        head: [["Descrição", "Qtd", "Valor Unit.", "Total"]],
        body: pecas.map((p) => [
          p.descricao,
          String(p.quantidade),
          `R$ ${p.valor_unitario.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`,
          `R$ ${p.valor_total.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`,
        ]),
        theme: "grid",
        styles: { fontSize: 8 },
        headStyles: { fillColor: [60, 60, 60] },
      });
      startY = (doc as any).lastAutoTable.finalY + 6;
    }

    // Totals
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    const totalsX = pageWidth - 15;
    doc.text(`Serviços: R$ ${valorServicos.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`, totalsX, startY, { align: "right" });
    doc.text(`Peças: R$ ${valorPecas.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`, totalsX, startY + 5, { align: "right" });
    if (desconto > 0) doc.text(`Desconto: -R$ ${desconto.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`, totalsX, startY + 10, { align: "right" });
    const taxY = desconto > 0 ? startY + 15 : startY + 10;
    if (icms > 0) doc.text(`ICMS (${icms}%): R$ ${icmsValor.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`, totalsX, taxY, { align: "right" });
    if (iss > 0) doc.text(`ISS (${iss}%): R$ ${issValor.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`, totalsX, taxY + 5, { align: "right" });

    const finalY = taxY + (icms > 0 ? 5 : 0) + (iss > 0 ? 5 : 0) + 5;
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text(`TOTAL: R$ ${totalNF.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`, totalsX, finalY, { align: "right" });

    if (observacoes) {
      doc.setFontSize(8);
      doc.setFont("helvetica", "normal");
      doc.text(`Obs: ${observacoes}`, 15, finalY + 10);
    }

    doc.save(`NF_${nfData.numero_nf}_OS_${osId.slice(0, 8)}.pdf`);
    toast.success("PDF gerado!");
  };

  const fmt = (v: number) => `R$ ${v.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            {existingNF ? `Nota Fiscal #${existingNF.numero_nf}` : "Emitir Nota Fiscal"}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-5">
          {/* Dados da Oficina */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Dados da Oficina (Prestador)</h3>
            <div className="grid grid-cols-2 gap-3">
              <Input placeholder="Nome da oficina" value={oficina.nome} onChange={(e) => setOficina({ ...oficina, nome: e.target.value })} />
              <Input placeholder="CNPJ" value={oficina.cnpj} onChange={(e) => setOficina({ ...oficina, cnpj: e.target.value })} />
              <Input placeholder="Endereço" value={oficina.endereco} onChange={(e) => setOficina({ ...oficina, endereco: e.target.value })} className="col-span-2" />
              <Input placeholder="Inscrição Estadual" value={oficina.inscricao_estadual} onChange={(e) => setOficina({ ...oficina, inscricao_estadual: e.target.value })} />
            </div>
          </div>

          <Separator />

          {/* Dados do Cliente */}
          <div className="space-y-2">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Cliente (Tomador)</h3>
            <div className="rounded-lg border border-border bg-secondary/30 p-3 space-y-1">
              <p className="text-sm font-medium">{clienteData?.nome}</p>
              <p className="text-xs text-muted-foreground">CPF/CNPJ: {clienteData?.cpf_cnpj || "Não informado"}</p>
              <p className="text-xs text-muted-foreground">
                {[clienteData?.endereco, clienteData?.numero, clienteData?.bairro, clienteData?.cidade, clienteData?.estado].filter(Boolean).join(", ") || "Endereço não informado"}
              </p>
            </div>
          </div>

          <Separator />

          {/* Itens */}
          {servicos.length > 0 && (
            <div className="space-y-2">
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Serviços</h3>
              <div className="rounded-lg border border-border overflow-hidden">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-secondary/50">
                      <th className="px-3 py-2 text-left text-xs font-medium text-muted-foreground">Descrição</th>
                      <th className="px-3 py-2 text-right text-xs font-medium text-muted-foreground">Qtd</th>
                      <th className="px-3 py-2 text-right text-xs font-medium text-muted-foreground">Valor Unit.</th>
                      <th className="px-3 py-2 text-right text-xs font-medium text-muted-foreground">Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {servicos.map((s, i) => (
                      <tr key={i}>
                        <td className="px-3 py-2">{s.descricao}</td>
                        <td className="px-3 py-2 text-right">{s.quantidade}</td>
                        <td className="px-3 py-2 text-right">{fmt(s.valor_unitario)}</td>
                        <td className="px-3 py-2 text-right font-medium">{fmt(s.valor_total)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {pecas.length > 0 && (
            <div className="space-y-2">
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Peças / Materiais</h3>
              <div className="rounded-lg border border-border overflow-hidden">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-secondary/50">
                      <th className="px-3 py-2 text-left text-xs font-medium text-muted-foreground">Descrição</th>
                      <th className="px-3 py-2 text-right text-xs font-medium text-muted-foreground">Qtd</th>
                      <th className="px-3 py-2 text-right text-xs font-medium text-muted-foreground">Valor Unit.</th>
                      <th className="px-3 py-2 text-right text-xs font-medium text-muted-foreground">Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {pecas.map((p, i) => (
                      <tr key={i}>
                        <td className="px-3 py-2">{p.descricao}</td>
                        <td className="px-3 py-2 text-right">{p.quantidade}</td>
                        <td className="px-3 py-2 text-right">{fmt(p.valor_unitario)}</td>
                        <td className="px-3 py-2 text-right font-medium">{fmt(p.valor_total)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          <Separator />

          {/* Impostos */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Impostos</h3>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-muted-foreground">ICMS (%)</label>
                <Input type="number" min={0} max={100} step={0.01} value={icms} onChange={(e) => setIcms(Number(e.target.value))} />
                {icms > 0 && <p className="text-xs text-muted-foreground mt-1">Valor: {fmt(icmsValor)}</p>}
              </div>
              <div>
                <label className="text-xs text-muted-foreground">ISS (%)</label>
                <Input type="number" min={0} max={100} step={0.01} value={iss} onChange={(e) => setIss(Number(e.target.value))} />
                {iss > 0 && <p className="text-xs text-muted-foreground mt-1">Valor: {fmt(issValor)}</p>}
              </div>
            </div>
          </div>

          <Separator />

          {/* Totais */}
          <div className="rounded-lg border border-border bg-secondary/30 p-4 space-y-1">
            <div className="flex justify-between text-sm"><span>Serviços</span><span>{fmt(valorServicos)}</span></div>
            <div className="flex justify-between text-sm"><span>Peças</span><span>{fmt(valorPecas)}</span></div>
            {desconto > 0 && <div className="flex justify-between text-sm text-destructive"><span>Desconto</span><span>-{fmt(desconto)}</span></div>}
            {icms > 0 && <div className="flex justify-between text-xs text-muted-foreground"><span>ICMS ({icms}%)</span><span>{fmt(icmsValor)}</span></div>}
            {iss > 0 && <div className="flex justify-between text-xs text-muted-foreground"><span>ISS ({iss}%)</span><span>{fmt(issValor)}</span></div>}
            <Separator className="my-2" />
            <div className="flex justify-between text-lg font-bold"><span>TOTAL</span><span>{fmt(totalNF)}</span></div>
          </div>

          {/* Observações */}
          <div>
            <label className="text-xs text-muted-foreground">Observações</label>
            <Input placeholder="Observações da NF" value={observacoes} onChange={(e) => setObservacoes(e.target.value)} />
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" onClick={() => onOpenChange(false)}>Fechar</Button>
          <Button onClick={handleSave} disabled={saving}>{saving ? "Salvando..." : existingNF ? "Atualizar NF" : "Salvar NF"}</Button>
          <Button onClick={handleGeneratePDF} className="gap-2"><Download className="h-4 w-4" /> Gerar PDF</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
