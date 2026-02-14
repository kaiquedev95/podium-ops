
-- Add missing columns to ordens_servico
ALTER TABLE public.ordens_servico
  ADD COLUMN IF NOT EXISTS km_entrada integer,
  ADD COLUMN IF NOT EXISTS reclamacao_cliente text,
  ADD COLUMN IF NOT EXISTS diagnostico text,
  ADD COLUMN IF NOT EXISTS data_saida timestamp with time zone,
  ADD COLUMN IF NOT EXISTS desconto numeric NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS observacoes text;

-- Servicos line items
CREATE TABLE public.servicos_os (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  ordem_servico_id UUID NOT NULL REFERENCES public.ordens_servico(id) ON DELETE CASCADE,
  descricao TEXT NOT NULL,
  valor NUMERIC NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
ALTER TABLE public.servicos_os ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all on servicos_os" ON public.servicos_os FOR ALL USING (true) WITH CHECK (true);

-- Pecas line items
CREATE TABLE public.pecas_os (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  ordem_servico_id UUID NOT NULL REFERENCES public.ordens_servico(id) ON DELETE CASCADE,
  descricao TEXT NOT NULL,
  valor NUMERIC NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
ALTER TABLE public.pecas_os ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all on pecas_os" ON public.pecas_os FOR ALL USING (true) WITH CHECK (true);
