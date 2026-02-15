
-- Add detailed address fields and email to clientes
ALTER TABLE public.clientes ADD COLUMN IF NOT EXISTS email text;
ALTER TABLE public.clientes ADD COLUMN IF NOT EXISTS cep text;
ALTER TABLE public.clientes ADD COLUMN IF NOT EXISTS cidade text;
ALTER TABLE public.clientes ADD COLUMN IF NOT EXISTS estado text;
ALTER TABLE public.clientes ADD COLUMN IF NOT EXISTS bairro text;
ALTER TABLE public.clientes ADD COLUMN IF NOT EXISTS numero text;
ALTER TABLE public.clientes ADD COLUMN IF NOT EXISTS complemento text;
