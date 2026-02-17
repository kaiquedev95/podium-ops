
-- Tabela de estoque de peças
CREATE TABLE public.estoque_pecas (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  nome TEXT NOT NULL,
  codigo TEXT NOT NULL UNIQUE,
  fornecedor TEXT,
  preco_custo NUMERIC NOT NULL DEFAULT 0,
  preco_venda NUMERIC NOT NULL DEFAULT 0,
  quantidade INTEGER NOT NULL DEFAULT 0,
  quantidade_minima INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.estoque_pecas ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can manage estoque_pecas"
ON public.estoque_pecas FOR ALL
USING (true)
WITH CHECK (true);

-- Tabela de histórico de compras
CREATE TABLE public.historico_compras (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  peca_id UUID NOT NULL REFERENCES public.estoque_pecas(id) ON DELETE CASCADE,
  fornecedor TEXT,
  quantidade INTEGER NOT NULL DEFAULT 1,
  valor_pago NUMERIC NOT NULL DEFAULT 0,
  data_compra DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.historico_compras ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can manage historico_compras"
ON public.historico_compras FOR ALL
USING (true)
WITH CHECK (true);

-- Trigger para updated_at
CREATE OR REPLACE FUNCTION public.update_estoque_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_estoque_pecas_updated_at
BEFORE UPDATE ON public.estoque_pecas
FOR EACH ROW
EXECUTE FUNCTION public.update_estoque_updated_at();

-- Função para abater estoque ao inserir peça na OS
CREATE OR REPLACE FUNCTION public.abater_estoque_peca()
RETURNS TRIGGER AS $$
BEGIN
  -- Tenta encontrar a peça no estoque pelo nome/descrição
  UPDATE public.estoque_pecas
  SET quantidade = GREATEST(quantidade - 1, 0)
  WHERE LOWER(nome) = LOWER(NEW.descricao);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER trigger_abater_estoque
AFTER INSERT ON public.pecas_os
FOR EACH ROW
EXECUTE FUNCTION public.abater_estoque_peca();
