import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Tables, TablesInsert, TablesUpdate } from "@/integrations/supabase/types";

// ─── Clientes ───
export const useClientes = () =>
  useQuery({
    queryKey: ["clientes"],
    queryFn: async () => {
      const { data, error } = await supabase.from("clientes").select("*").order("nome");
      if (error) throw error;
      return data;
    },
  });

export const useCliente = (id: string | undefined) =>
  useQuery({
    queryKey: ["clientes", id],
    enabled: !!id,
    queryFn: async () => {
      const { data, error } = await supabase.from("clientes").select("*").eq("id", id!).maybeSingle();
      if (error) throw error;
      return data;
    },
  });

export const useMutateCliente = () => {
  const qc = useQueryClient();
  const create = useMutation({
    mutationFn: async (c: TablesInsert<"clientes">) => {
      const { data, error } = await supabase.from("clientes").insert(c).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["clientes"] }),
  });
  const update = useMutation({
    mutationFn: async ({ id, ...c }: TablesUpdate<"clientes"> & { id: string }) => {
      const { data, error } = await supabase.from("clientes").update(c).eq("id", id).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["clientes"] }),
  });
  const remove = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("clientes").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["clientes"] }),
  });
  return { create, update, remove };
};

// ─── Veiculos ───
export const useVeiculos = (clienteId?: string) =>
  useQuery({
    queryKey: ["veiculos", clienteId],
    queryFn: async () => {
      let q = supabase.from("veiculos").select("*, clientes(nome)").order("created_at", { ascending: false });
      if (clienteId) q = q.eq("cliente_id", clienteId);
      const { data, error } = await q;
      if (error) throw error;
      return data;
    },
  });

export const useMutateVeiculo = () => {
  const qc = useQueryClient();
  const create = useMutation({
    mutationFn: async (v: TablesInsert<"veiculos">) => {
      const { data, error } = await supabase.from("veiculos").insert(v).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["veiculos"] }),
  });
  const update = useMutation({
    mutationFn: async ({ id, ...v }: TablesUpdate<"veiculos"> & { id: string }) => {
      const { data, error } = await supabase.from("veiculos").update(v).eq("id", id).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["veiculos"] }),
  });
  const remove = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("veiculos").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["veiculos"] }),
  });
  return { create, update, remove };
};

// ─── Agendamentos ───
export const useAgendamentos = () =>
  useQuery({
    queryKey: ["agendamentos"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("agendamentos")
        .select("*, clientes(nome), veiculos(placa, modelo, marca)")
        .order("data_hora", { ascending: true });
      if (error) throw error;
      return data;
    },
  });

export const useMutateAgendamento = () => {
  const qc = useQueryClient();
  const create = useMutation({
    mutationFn: async (a: TablesInsert<"agendamentos">) => {
      const { data, error } = await supabase.from("agendamentos").insert(a).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["agendamentos"] }),
  });
  const update = useMutation({
    mutationFn: async ({ id, ...a }: TablesUpdate<"agendamentos"> & { id: string }) => {
      const { data, error } = await supabase.from("agendamentos").update(a).eq("id", id).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["agendamentos"] }),
  });
  const remove = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("agendamentos").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["agendamentos"] }),
  });
  return { create, update, remove };
};

// ─── Ordens de Serviço ───
export const useOrdensServico = () =>
  useQuery({
    queryKey: ["ordens_servico"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("ordens_servico")
        .select("*, clientes(nome), veiculos(placa, modelo, marca), pagamentos(id, valor)")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

export const useOrdemServico = (id: string | undefined) =>
  useQuery({
    queryKey: ["ordens_servico", id],
    enabled: !!id,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("ordens_servico")
        .select("*, clientes(nome), veiculos(placa, modelo, marca), pagamentos(*)")
        .eq("id", id!)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
  });

export const useMutateOS = () => {
  const qc = useQueryClient();
  const create = useMutation({
    mutationFn: async (os: TablesInsert<"ordens_servico">) => {
      const { data, error } = await supabase.from("ordens_servico").insert(os).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["ordens_servico"] }),
  });
  const update = useMutation({
    mutationFn: async ({ id, ...os }: TablesUpdate<"ordens_servico"> & { id: string }) => {
      const { data, error } = await supabase.from("ordens_servico").update(os).eq("id", id).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["ordens_servico"] }),
  });
  return { create, update };
};

// ─── Pagamentos ───
export const usePagamentos = (osId?: string) =>
  useQuery({
    queryKey: ["pagamentos", osId],
    enabled: !!osId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("pagamentos")
        .select("*")
        .eq("ordem_servico_id", osId!)
        .order("data_pagamento", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

export const useMutatePagamento = () => {
  const qc = useQueryClient();
  const create = useMutation({
    mutationFn: async (p: TablesInsert<"pagamentos">) => {
      const { data, error } = await supabase.from("pagamentos").insert(p).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["pagamentos"] });
      qc.invalidateQueries({ queryKey: ["ordens_servico"] });
    },
  });
  return { create };
};

// ─── Logs de Atendimento ───
export const useLogsAtendimento = (clienteId?: string) =>
  useQuery({
    queryKey: ["logs_atendimento", clienteId],
    enabled: !!clienteId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("logs_atendimento")
        .select("*")
        .eq("cliente_id", clienteId!)
        .order("data_hora", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

export const useMutateLog = () => {
  const qc = useQueryClient();
  const create = useMutation({
    mutationFn: async (log: TablesInsert<"logs_atendimento">) => {
      const { data, error } = await supabase.from("logs_atendimento").insert(log).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["logs_atendimento"] });
      qc.invalidateQueries({ queryKey: ["pendencias"] });
    },
  });
  return { create };
};

// ─── Pendencias ───
export const usePendencias = () =>
  useQuery({
    queryKey: ["pendencias"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("pendencias")
        .select("*, clientes(nome)")
        .order("data_prevista", { ascending: true });
      if (error) throw error;
      return data;
    },
  });

export const useMutatePendencia = () => {
  const qc = useQueryClient();
  const update = useMutation({
    mutationFn: async ({ id, ...p }: TablesUpdate<"pendencias"> & { id: string }) => {
      const { data, error } = await supabase.from("pendencias").update(p).eq("id", id).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["pendencias"] }),
  });
  return { update };
};

// ─── Despesas ───
export const useDespesas = () =>
  useQuery({
    queryKey: ["despesas"],
    queryFn: async () => {
      const { data, error } = await supabase.from("despesas").select("*").order("data", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

export const useMutateDespesa = () => {
  const qc = useQueryClient();
  const create = useMutation({
    mutationFn: async (d: TablesInsert<"despesas">) => {
      const { data, error } = await supabase.from("despesas").insert(d).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["despesas"] }),
  });
  return { create };
};

// ─── Helpers ───
export const calcFinStatus = (total: number, totalPago: number, vencimento?: string | null) => {
  if (total <= 0) return "pago";
  if (totalPago <= 0) {
    if (vencimento && new Date(vencimento) < new Date()) return "atrasado";
    return "aberto";
  }
  if (totalPago >= total) return "pago";
  if (vencimento && new Date(vencimento) < new Date() && totalPago < total) return "atrasado";
  return "parcial";
};
