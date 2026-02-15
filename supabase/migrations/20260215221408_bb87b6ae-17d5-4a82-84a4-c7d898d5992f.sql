
-- Drop all permissive "Allow all" policies and replace with authenticated-only policies

-- agendamentos
DROP POLICY IF EXISTS "Allow all on agendamentos" ON public.agendamentos;
CREATE POLICY "Authenticated users can manage agendamentos" ON public.agendamentos FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- clientes
DROP POLICY IF EXISTS "Allow all on clientes" ON public.clientes;
CREATE POLICY "Authenticated users can manage clientes" ON public.clientes FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- veiculos
DROP POLICY IF EXISTS "Allow all on veiculos" ON public.veiculos;
CREATE POLICY "Authenticated users can manage veiculos" ON public.veiculos FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- ordens_servico
DROP POLICY IF EXISTS "Allow all on ordens_servico" ON public.ordens_servico;
CREATE POLICY "Authenticated users can manage ordens_servico" ON public.ordens_servico FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- pagamentos
DROP POLICY IF EXISTS "Allow all on pagamentos" ON public.pagamentos;
CREATE POLICY "Authenticated users can manage pagamentos" ON public.pagamentos FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- logs_atendimento
DROP POLICY IF EXISTS "Allow all on logs_atendimento" ON public.logs_atendimento;
CREATE POLICY "Authenticated users can manage logs_atendimento" ON public.logs_atendimento FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- pendencias
DROP POLICY IF EXISTS "Allow all on pendencias" ON public.pendencias;
CREATE POLICY "Authenticated users can manage pendencias" ON public.pendencias FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- despesas
DROP POLICY IF EXISTS "Allow all on despesas" ON public.despesas;
CREATE POLICY "Authenticated users can manage despesas" ON public.despesas FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- servicos_os
DROP POLICY IF EXISTS "Allow all on servicos_os" ON public.servicos_os;
CREATE POLICY "Authenticated users can manage servicos_os" ON public.servicos_os FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- pecas_os
DROP POLICY IF EXISTS "Allow all on pecas_os" ON public.pecas_os;
CREATE POLICY "Authenticated users can manage pecas_os" ON public.pecas_os FOR ALL TO authenticated USING (true) WITH CHECK (true);
