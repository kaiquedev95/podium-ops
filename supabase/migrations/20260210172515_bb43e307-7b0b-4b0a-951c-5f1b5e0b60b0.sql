
-- 1) clientes
CREATE TABLE public.clientes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nome text NOT NULL,
  telefone text,
  whatsapp text,
  cpf_cnpj text,
  endereco text,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.clientes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all on clientes" ON public.clientes FOR ALL USING (true) WITH CHECK (true);

-- 2) veiculos
CREATE TABLE public.veiculos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  cliente_id uuid NOT NULL REFERENCES public.clientes(id) ON DELETE CASCADE,
  placa text,
  marca text,
  modelo text,
  ano text,
  motor text,
  observacoes text,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.veiculos ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all on veiculos" ON public.veiculos FOR ALL USING (true) WITH CHECK (true);

-- 3) agendamentos
CREATE TABLE public.agendamentos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  cliente_id uuid NOT NULL REFERENCES public.clientes(id) ON DELETE CASCADE,
  veiculo_id uuid REFERENCES public.veiculos(id) ON DELETE SET NULL,
  data_hora timestamptz NOT NULL,
  servico_resumo text,
  status text NOT NULL DEFAULT 'agendado',
  observacoes text,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.agendamentos ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all on agendamentos" ON public.agendamentos FOR ALL USING (true) WITH CHECK (true);

-- 4) ordens_servico
CREATE TABLE public.ordens_servico (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  cliente_id uuid NOT NULL REFERENCES public.clientes(id) ON DELETE CASCADE,
  veiculo_id uuid REFERENCES public.veiculos(id) ON DELETE SET NULL,
  data_entrada timestamptz NOT NULL DEFAULT now(),
  como_chegou text,
  o_que_foi_feito text,
  pecas_texto text,
  total numeric NOT NULL DEFAULT 0,
  vencimento date,
  status text NOT NULL DEFAULT 'em andamento',
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.ordens_servico ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all on ordens_servico" ON public.ordens_servico FOR ALL USING (true) WITH CHECK (true);

-- 5) pagamentos
CREATE TABLE public.pagamentos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ordem_servico_id uuid NOT NULL REFERENCES public.ordens_servico(id) ON DELETE CASCADE,
  data_pagamento timestamptz NOT NULL DEFAULT now(),
  valor numeric NOT NULL,
  forma_pagamento text NOT NULL DEFAULT 'dinheiro',
  observacoes text,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.pagamentos ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all on pagamentos" ON public.pagamentos FOR ALL USING (true) WITH CHECK (true);

-- 6) logs_atendimento
CREATE TABLE public.logs_atendimento (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  cliente_id uuid NOT NULL REFERENCES public.clientes(id) ON DELETE CASCADE,
  ordem_servico_id uuid REFERENCES public.ordens_servico(id) ON DELETE SET NULL,
  data_hora timestamptz NOT NULL DEFAULT now(),
  usuario_responsavel text NOT NULL DEFAULT 'Admin',
  canal text NOT NULL DEFAULT 'WhatsApp',
  descricao text NOT NULL,
  data_combinada date,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.logs_atendimento ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all on logs_atendimento" ON public.logs_atendimento FOR ALL USING (true) WITH CHECK (true);

-- 7) pendencias
CREATE TABLE public.pendencias (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  cliente_id uuid NOT NULL REFERENCES public.clientes(id) ON DELETE CASCADE,
  ordem_servico_id uuid REFERENCES public.ordens_servico(id) ON DELETE SET NULL,
  log_atendimento_id uuid REFERENCES public.logs_atendimento(id) ON DELETE SET NULL,
  responsavel text NOT NULL DEFAULT 'Admin',
  data_prevista date NOT NULL,
  descricao text NOT NULL,
  status text NOT NULL DEFAULT 'aberta',
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.pendencias ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all on pendencias" ON public.pendencias FOR ALL USING (true) WITH CHECK (true);

-- 8) despesas
CREATE TABLE public.despesas (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  data date NOT NULL DEFAULT CURRENT_DATE,
  categoria text,
  descricao text NOT NULL,
  valor numeric NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.despesas ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all on despesas" ON public.despesas FOR ALL USING (true) WITH CHECK (true);

-- Trigger: auto-create pendencia when log_atendimento has data_combinada
CREATE OR REPLACE FUNCTION public.auto_create_pendencia()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.data_combinada IS NOT NULL THEN
    INSERT INTO public.pendencias (cliente_id, ordem_servico_id, log_atendimento_id, responsavel, data_prevista, descricao, status)
    VALUES (NEW.cliente_id, NEW.ordem_servico_id, NEW.id, NEW.usuario_responsavel, NEW.data_combinada, NEW.descricao, 'aberta');
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_auto_pendencia
  AFTER INSERT ON public.logs_atendimento
  FOR EACH ROW
  EXECUTE FUNCTION public.auto_create_pendencia();
