
-- Add owner_id to all 13 tables
ALTER TABLE public.clientes ADD COLUMN IF NOT EXISTS owner_id uuid REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE public.veiculos ADD COLUMN IF NOT EXISTS owner_id uuid REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE public.agendamentos ADD COLUMN IF NOT EXISTS owner_id uuid REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE public.ordens_servico ADD COLUMN IF NOT EXISTS owner_id uuid REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE public.pagamentos ADD COLUMN IF NOT EXISTS owner_id uuid REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE public.logs_atendimento ADD COLUMN IF NOT EXISTS owner_id uuid REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE public.pendencias ADD COLUMN IF NOT EXISTS owner_id uuid REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE public.despesas ADD COLUMN IF NOT EXISTS owner_id uuid REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE public.servicos_os ADD COLUMN IF NOT EXISTS owner_id uuid REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE public.pecas_os ADD COLUMN IF NOT EXISTS owner_id uuid REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE public.estoque_pecas ADD COLUMN IF NOT EXISTS owner_id uuid REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE public.historico_compras ADD COLUMN IF NOT EXISTS owner_id uuid REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE public.notas_fiscais ADD COLUMN IF NOT EXISTS owner_id uuid REFERENCES auth.users(id) ON DELETE CASCADE;

-- Drop old permissive policies
DROP POLICY IF EXISTS "Authenticated users can manage clientes" ON public.clientes;
DROP POLICY IF EXISTS "Authenticated users can manage veiculos" ON public.veiculos;
DROP POLICY IF EXISTS "Authenticated users can manage agendamentos" ON public.agendamentos;
DROP POLICY IF EXISTS "Authenticated users can manage ordens_servico" ON public.ordens_servico;
DROP POLICY IF EXISTS "Authenticated users can manage pagamentos" ON public.pagamentos;
DROP POLICY IF EXISTS "Authenticated users can manage logs_atendimento" ON public.logs_atendimento;
DROP POLICY IF EXISTS "Authenticated users can manage pendencias" ON public.pendencias;
DROP POLICY IF EXISTS "Authenticated users can manage despesas" ON public.despesas;
DROP POLICY IF EXISTS "Authenticated users can manage servicos_os" ON public.servicos_os;
DROP POLICY IF EXISTS "Authenticated users can manage pecas_os" ON public.pecas_os;
DROP POLICY IF EXISTS "Authenticated users can manage estoque_pecas" ON public.estoque_pecas;
DROP POLICY IF EXISTS "Authenticated users can manage historico_compras" ON public.historico_compras;
DROP POLICY IF EXISTS "Authenticated users can manage notas_fiscais" ON public.notas_fiscais;

-- Create owner-scoped policies for all tables
CREATE POLICY "owner_only" ON public.clientes FOR ALL TO authenticated
  USING (owner_id = auth.uid()) WITH CHECK (owner_id = auth.uid());

CREATE POLICY "owner_only" ON public.veiculos FOR ALL TO authenticated
  USING (owner_id = auth.uid()) WITH CHECK (owner_id = auth.uid());

CREATE POLICY "owner_only" ON public.agendamentos FOR ALL TO authenticated
  USING (owner_id = auth.uid()) WITH CHECK (owner_id = auth.uid());

CREATE POLICY "owner_only" ON public.ordens_servico FOR ALL TO authenticated
  USING (owner_id = auth.uid()) WITH CHECK (owner_id = auth.uid());

CREATE POLICY "owner_only" ON public.pagamentos FOR ALL TO authenticated
  USING (owner_id = auth.uid()) WITH CHECK (owner_id = auth.uid());

CREATE POLICY "owner_only" ON public.logs_atendimento FOR ALL TO authenticated
  USING (owner_id = auth.uid()) WITH CHECK (owner_id = auth.uid());

CREATE POLICY "owner_only" ON public.pendencias FOR ALL TO authenticated
  USING (owner_id = auth.uid()) WITH CHECK (owner_id = auth.uid());

CREATE POLICY "owner_only" ON public.despesas FOR ALL TO authenticated
  USING (owner_id = auth.uid()) WITH CHECK (owner_id = auth.uid());

CREATE POLICY "owner_only" ON public.servicos_os FOR ALL TO authenticated
  USING (owner_id = auth.uid()) WITH CHECK (owner_id = auth.uid());

CREATE POLICY "owner_only" ON public.pecas_os FOR ALL TO authenticated
  USING (owner_id = auth.uid()) WITH CHECK (owner_id = auth.uid());

CREATE POLICY "owner_only" ON public.estoque_pecas FOR ALL TO authenticated
  USING (owner_id = auth.uid()) WITH CHECK (owner_id = auth.uid());

CREATE POLICY "owner_only" ON public.historico_compras FOR ALL TO authenticated
  USING (owner_id = auth.uid()) WITH CHECK (owner_id = auth.uid());

CREATE POLICY "owner_only" ON public.notas_fiscais FOR ALL TO authenticated
  USING (owner_id = auth.uid()) WITH CHECK (owner_id = auth.uid());

-- Update auto_create_pendencia to set owner_id from the trigger context
CREATE OR REPLACE FUNCTION public.auto_create_pendencia()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.data_combinada IS NOT NULL THEN
    INSERT INTO public.pendencias (cliente_id, ordem_servico_id, log_atendimento_id, responsavel, data_prevista, descricao, status, owner_id)
    VALUES (NEW.cliente_id, NEW.ordem_servico_id, NEW.id, NEW.usuario_responsavel, NEW.data_combinada, NEW.descricao, 'aberta', NEW.owner_id);
  END IF;
  RETURN NEW;
END;
$$;

-- Update abater_estoque_peca to copy owner_id
CREATE OR REPLACE FUNCTION public.abater_estoque_peca()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.peca_id IS NOT NULL THEN
    IF (SELECT quantidade FROM public.estoque_pecas WHERE id = NEW.peca_id) < NEW.quantidade THEN
      RAISE EXCEPTION 'Estoque insuficiente para esta peça';
    END IF;
    UPDATE public.estoque_pecas
    SET quantidade = quantidade - NEW.quantidade
    WHERE id = NEW.peca_id;
  END IF;
  RETURN NEW;
END;
$$;
