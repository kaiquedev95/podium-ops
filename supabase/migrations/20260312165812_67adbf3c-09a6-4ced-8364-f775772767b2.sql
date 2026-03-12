
-- Tabela de notas fiscais
CREATE TABLE public.notas_fiscais (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ordem_servico_id uuid NOT NULL REFERENCES public.ordens_servico(id) ON DELETE CASCADE,
  cliente_id uuid NOT NULL REFERENCES public.clientes(id) ON DELETE CASCADE,
  numero_nf serial NOT NULL,
  data_emissao timestamp with time zone NOT NULL DEFAULT now(),
  
  -- Dados da oficina
  oficina_nome text NOT NULL DEFAULT '',
  oficina_cnpj text NOT NULL DEFAULT '',
  oficina_endereco text NOT NULL DEFAULT '',
  oficina_inscricao_estadual text DEFAULT '',
  
  -- Valores
  valor_servicos numeric NOT NULL DEFAULT 0,
  valor_pecas numeric NOT NULL DEFAULT 0,
  valor_total numeric NOT NULL DEFAULT 0,
  desconto numeric NOT NULL DEFAULT 0,
  
  -- Impostos
  icms_percentual numeric NOT NULL DEFAULT 0,
  icms_valor numeric NOT NULL DEFAULT 0,
  iss_percentual numeric NOT NULL DEFAULT 0,
  iss_valor numeric NOT NULL DEFAULT 0,
  
  -- Itens snapshot JSON
  itens_servicos jsonb NOT NULL DEFAULT '[]'::jsonb,
  itens_pecas jsonb NOT NULL DEFAULT '[]'::jsonb,
  
  observacoes text DEFAULT '',
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  
  UNIQUE(numero_nf)
);

ALTER TABLE public.notas_fiscais ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can manage notas_fiscais"
  ON public.notas_fiscais
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);
