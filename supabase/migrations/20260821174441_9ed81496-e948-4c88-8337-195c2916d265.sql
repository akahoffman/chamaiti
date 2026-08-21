
CREATE TYPE public.app_role AS ENUM ('admin','intern');

CREATE TABLE public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "profiles readable by authenticated" ON public.profiles FOR SELECT TO authenticated USING (true);
CREATE POLICY "own profile insert" ON public.profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);
CREATE POLICY "own profile update" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = id);

CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  UNIQUE (user_id, role)
);
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "roles readable by authenticated" ON public.user_roles FOR SELECT TO authenticated USING (true);

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role)
$$;

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'full_name',''))
  ON CONFLICT (id) DO NOTHING;
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, CASE WHEN (SELECT count(*) FROM public.user_roles) = 0 THEN 'admin'::public.app_role ELSE 'intern'::public.app_role END)
  ON CONFLICT DO NOTHING;
  RETURN NEW;
END; $$;
CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

CREATE TABLE public.sectors (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE public.categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  group_name text NOT NULL,
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (group_name, name)
);
CREATE TABLE public.technicians (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE public.requesters (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  sector_id uuid REFERENCES public.sectors(id) ON DELETE SET NULL,
  phone text,
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE public.unresolved_reasons (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TYPE public.ticket_status AS ENUM ('aberto','em_triagem','em_atendimento','aguardando_solicitante','aguardando_terceiro','resolvido','encerrado','cancelado');
CREATE TYPE public.ticket_urgency AS ENUM ('baixa','normal','alta','critica');

CREATE TABLE public.ticket_counters (
  year int PRIMARY KEY,
  last_number int NOT NULL DEFAULT 0
);

CREATE TABLE public.tickets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  number text NOT NULL UNIQUE DEFAULT '',
  requester_id uuid REFERENCES public.requesters(id) ON DELETE SET NULL,
  sector_id uuid REFERENCES public.sectors(id) ON DELETE SET NULL,
  category_id uuid REFERENCES public.categories(id) ON DELETE SET NULL,
  urgency public.ticket_urgency NOT NULL DEFAULT 'normal',
  title text NOT NULL,
  description text NOT NULL DEFAULT '',
  technician_id uuid REFERENCES public.technicians(id) ON DELETE SET NULL,
  status public.ticket_status NOT NULL DEFAULT 'aberto',
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  first_attended_at timestamptz,
  resolved_at timestamptz,
  closed_at timestamptz,
  solution text,
  final_note text,
  unresolved_reason_id uuid REFERENCES public.unresolved_reasons(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX tickets_status_idx ON public.tickets(status);
CREATE INDEX tickets_created_at_idx ON public.tickets(created_at DESC);

CREATE TABLE public.ticket_comments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id uuid NOT NULL REFERENCES public.tickets(id) ON DELETE CASCADE,
  author_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  content text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE public.ticket_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id uuid NOT NULL REFERENCES public.tickets(id) ON DELETE CASCADE,
  actor_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  action text NOT NULL,
  detail text,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE public.ticket_attachments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id uuid NOT NULL REFERENCES public.tickets(id) ON DELETE CASCADE,
  file_path text NOT NULL,
  file_name text NOT NULL,
  file_size bigint,
  mime_type text,
  uploaded_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

DO $$
DECLARE t text;
BEGIN
  FOREACH t IN ARRAY ARRAY['sectors','categories','technicians','requesters','unresolved_reasons','tickets','ticket_comments','ticket_history','ticket_attachments','ticket_counters']
  LOOP
    EXECUTE format('GRANT SELECT, INSERT, UPDATE, DELETE ON public.%I TO authenticated', t);
    EXECUTE format('GRANT ALL ON public.%I TO service_role', t);
    EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', t);
    EXECUTE format('CREATE POLICY "staff read %1$s" ON public.%1$I FOR SELECT TO authenticated USING (true)', t);
    EXECUTE format('CREATE POLICY "staff insert %1$s" ON public.%1$I FOR INSERT TO authenticated WITH CHECK (true)', t);
    EXECUTE format('CREATE POLICY "staff update %1$s" ON public.%1$I FOR UPDATE TO authenticated USING (true) WITH CHECK (true)', t);
    EXECUTE format('CREATE POLICY "admin delete %1$s" ON public.%1$I FOR DELETE TO authenticated USING (public.has_role(auth.uid(), ''admin''))', t);
  END LOOP;
END $$;

CREATE OR REPLACE FUNCTION public.set_ticket_number()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE y int; n int;
BEGIN
  y := EXTRACT(YEAR FROM now());
  INSERT INTO public.ticket_counters(year, last_number) VALUES (y, 1)
  ON CONFLICT (year) DO UPDATE SET last_number = public.ticket_counters.last_number + 1
  RETURNING last_number INTO n;
  NEW.number := y::text || '-' || lpad(n::text, 4, '0');
  RETURN NEW;
END; $$;
CREATE TRIGGER tickets_set_number BEFORE INSERT ON public.tickets
FOR EACH ROW WHEN (NEW.number IS NULL OR NEW.number = '') EXECUTE FUNCTION public.set_ticket_number();

CREATE OR REPLACE FUNCTION public.touch_updated_at()
RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at := now(); RETURN NEW; END; $$;
CREATE TRIGGER tickets_touch BEFORE UPDATE ON public.tickets
FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

CREATE OR REPLACE FUNCTION public.log_ticket_insert()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.ticket_history(ticket_id, actor_id, action, detail)
  VALUES (NEW.id, auth.uid(), 'criacao', 'Chamado aberto');
  RETURN NEW;
END; $$;
CREATE TRIGGER tickets_log_insert AFTER INSERT ON public.tickets
FOR EACH ROW EXECUTE FUNCTION public.log_ticket_insert();

CREATE OR REPLACE FUNCTION public.log_ticket_update()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE old_tech text; new_tech text;
BEGIN
  IF NEW.status IS DISTINCT FROM OLD.status THEN
    INSERT INTO public.ticket_history(ticket_id, actor_id, action, detail)
    VALUES (NEW.id, auth.uid(), 'status', 'Status alterado de ' || OLD.status::text || ' para ' || NEW.status::text);
  END IF;
  IF NEW.technician_id IS DISTINCT FROM OLD.technician_id THEN
    SELECT name INTO old_tech FROM public.technicians WHERE id = OLD.technician_id;
    SELECT name INTO new_tech FROM public.technicians WHERE id = NEW.technician_id;
    INSERT INTO public.ticket_history(ticket_id, actor_id, action, detail)
    VALUES (NEW.id, auth.uid(), 'tecnico', 'Técnico alterado de ' || COALESCE(old_tech,'nenhum') || ' para ' || COALESCE(new_tech,'nenhum'));
  END IF;
  IF NEW.solution IS DISTINCT FROM OLD.solution AND COALESCE(NEW.solution,'') <> '' THEN
    INSERT INTO public.ticket_history(ticket_id, actor_id, action, detail)
    VALUES (NEW.id, auth.uid(), 'solucao', 'Solução registrada');
  END IF;
  RETURN NEW;
END; $$;
CREATE TRIGGER tickets_log_update AFTER UPDATE ON public.tickets
FOR EACH ROW EXECUTE FUNCTION public.log_ticket_update();

CREATE OR REPLACE FUNCTION public.log_ticket_comment()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.ticket_history(ticket_id, actor_id, action, detail)
  VALUES (NEW.ticket_id, auth.uid(), 'comentario', 'Comentário adicionado');
  RETURN NEW;
END; $$;
CREATE TRIGGER comments_log AFTER INSERT ON public.ticket_comments
FOR EACH ROW EXECUTE FUNCTION public.log_ticket_comment();

INSERT INTO public.sectors(name) VALUES ('Financeiro'),('Comercial'),('Pedagógico'),('TI'),('Administrativo');
INSERT INTO public.categories(group_name, name) VALUES
 ('Hardware','Computador'),('Hardware','Notebook'),('Hardware','Monitor'),('Hardware','Impressora'),('Hardware','Periféricos'),
 ('Software','Windows'),('Software','Microsoft Office'),('Software','Sistema interno'),('Software','Aplicativo'),('Software','Instalação/configuração'),
 ('Rede','Internet'),('Rede','Wi-Fi'),('Rede','Cabeamento'),('Rede','Acesso à rede'),('Rede','Impressora de rede'),
 ('Contas e Acessos','Senha'),('Contas e Acessos','E-mail'),('Contas e Acessos','Sistema'),('Contas e Acessos','Permissões'),('Contas e Acessos','Criação de usuário'),
 ('Manutenção','Preventiva'),('Manutenção','Corretiva');
INSERT INTO public.unresolved_reasons(name) VALUES
 ('Sem solução no momento'),('Problema persiste'),('Necessita equipamento'),('Necessita fornecedor'),('Necessita acesso'),('Necessita intervenção externa'),('Problema não reproduzido'),('Solicitante desistiu'),('Outro');
INSERT INTO public.technicians(name) VALUES ('Administrador/Técnico'),('Estagiária');

CREATE POLICY "staff read attachments" ON storage.objects FOR SELECT TO authenticated USING (bucket_id = 'ticket-attachments');
CREATE POLICY "staff upload attachments" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'ticket-attachments');
CREATE POLICY "staff delete attachments" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'ticket-attachments');
