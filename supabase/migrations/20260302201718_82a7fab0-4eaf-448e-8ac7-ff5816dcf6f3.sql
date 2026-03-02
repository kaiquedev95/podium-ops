
-- Add peca_id and quantidade to pecas_os
ALTER TABLE public.pecas_os
ADD COLUMN peca_id uuid REFERENCES public.estoque_pecas(id) ON DELETE SET NULL,
ADD COLUMN quantidade integer NOT NULL DEFAULT 1;

-- Update trigger function to use peca_id and quantidade
CREATE OR REPLACE FUNCTION public.abater_estoque_peca()
RETURNS trigger
LANGUAGE plpgsql
SET search_path TO 'public'
AS $$
BEGIN
  IF NEW.peca_id IS NOT NULL THEN
    -- Validate stock
    IF (SELECT quantidade FROM public.estoque_pecas WHERE id = NEW.peca_id) < NEW.quantidade THEN
      RAISE EXCEPTION 'Estoque insuficiente para esta peça';
    END IF;
    -- Deduct stock
    UPDATE public.estoque_pecas
    SET quantidade = quantidade - NEW.quantidade
    WHERE id = NEW.peca_id;
  END IF;
  RETURN NEW;
END;
$$;
