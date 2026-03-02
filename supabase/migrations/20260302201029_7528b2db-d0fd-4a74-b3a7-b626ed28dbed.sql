
-- Criar trigger para abater estoque quando peça é inserida na OS
CREATE TRIGGER trg_abater_estoque_peca
AFTER INSERT ON public.pecas_os
FOR EACH ROW
EXECUTE FUNCTION public.abater_estoque_peca();
