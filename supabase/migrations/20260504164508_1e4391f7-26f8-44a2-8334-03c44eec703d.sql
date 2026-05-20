-- ============ ENUMS ============
DO $$ BEGIN CREATE TYPE public.client_user_status AS ENUM ('pending','approved','rejected'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE public.tx_status AS ENUM ('pending','success','failed','refunded'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE public.meeting_status AS ENUM ('scheduled','completed','cancelled'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- ============ CLIENT PORTAL USERS ============
CREATE TABLE IF NOT EXISTS public.client_users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE,
  client_id uuid REFERENCES public.clients(id) ON DELETE SET NULL,
  email text NOT NULL,
  full_name text,
  status public.client_user_status NOT NULL DEFAULT 'pending',
  approved_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.client_users ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.is_approved_client(_user_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path=public AS $$
  SELECT EXISTS (SELECT 1 FROM public.client_users WHERE user_id=_user_id AND status='approved')
$$;

CREATE OR REPLACE FUNCTION public.current_client_id()
RETURNS uuid LANGUAGE sql STABLE SECURITY DEFINER SET search_path=public AS $$
  SELECT client_id FROM public.client_users WHERE user_id=auth.uid() AND status='approved' LIMIT 1
$$;

CREATE POLICY "Self can view own client_user" ON public.client_users FOR SELECT USING (auth.uid()=user_id OR is_admin(auth.uid()));
CREATE POLICY "Self can insert own signup" ON public.client_users FOR INSERT WITH CHECK (auth.uid()=user_id);
CREATE POLICY "Admins manage client_users" ON public.client_users FOR ALL USING (is_admin(auth.uid())) WITH CHECK (is_admin(auth.uid()));

CREATE TRIGGER trg_client_users_updated BEFORE UPDATE ON public.client_users FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============ INVOICE EXTENSIONS ============
ALTER TABLE public.invoices ADD COLUMN IF NOT EXISTS pay_token text UNIQUE DEFAULT encode(extensions.gen_random_bytes(16),'hex');
ALTER TABLE public.invoices ADD COLUMN IF NOT EXISTS paid_amount numeric NOT NULL DEFAULT 0;
ALTER TABLE public.invoices ADD COLUMN IF NOT EXISTS payment_method text;

-- Allow public to view invoice by pay_token (for the payment page)
CREATE POLICY "Public view invoice by token" ON public.invoices FOR SELECT USING (pay_token IS NOT NULL);

-- Allow approved clients to view their own invoices
CREATE POLICY "Clients view own invoices" ON public.invoices FOR SELECT
  USING (client_id = public.current_client_id());

CREATE POLICY "Clients view own projects" ON public.projects FOR SELECT
  USING (client_id = public.current_client_id());

CREATE POLICY "Clients view own tasks" ON public.tasks FOR SELECT
  USING (client_id = public.current_client_id());

-- ============ TRANSACTIONS ============
CREATE TABLE IF NOT EXISTS public.transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_id uuid REFERENCES public.invoices(id) ON DELETE CASCADE,
  client_id uuid REFERENCES public.clients(id) ON DELETE SET NULL,
  method text NOT NULL DEFAULT 'esewa',
  status public.tx_status NOT NULL DEFAULT 'pending',
  amount numeric NOT NULL DEFAULT 0,
  currency text NOT NULL DEFAULT 'NPR',
  reference_id text,
  gateway_txn_id text,
  raw_response jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins manage transactions" ON public.transactions FOR ALL USING (is_admin(auth.uid())) WITH CHECK (is_admin(auth.uid()));
CREATE POLICY "Clients view own transactions" ON public.transactions FOR SELECT USING (client_id = public.current_client_id());
CREATE POLICY "Public can insert pending tx" ON public.transactions FOR INSERT WITH CHECK (status='pending');

CREATE TRIGGER trg_tx_updated BEFORE UPDATE ON public.transactions FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Auto-mark invoice paid when a successful transaction is recorded
CREATE OR REPLACE FUNCTION public.handle_tx_success()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE inv_total numeric; new_paid numeric;
BEGIN
  IF NEW.status = 'success' AND NEW.invoice_id IS NOT NULL THEN
    SELECT total INTO inv_total FROM public.invoices WHERE id = NEW.invoice_id;
    SELECT COALESCE(SUM(amount),0) INTO new_paid FROM public.transactions WHERE invoice_id=NEW.invoice_id AND status='success';
    UPDATE public.invoices
       SET paid_amount = new_paid,
           payment_method = NEW.method,
           status = CASE
              WHEN new_paid >= inv_total THEN 'paid'::invoice_status
              WHEN new_paid > 0 THEN 'partial'::invoice_status
              ELSE status
           END,
           paid_at = CASE WHEN new_paid >= inv_total THEN now() ELSE paid_at END
     WHERE id = NEW.invoice_id;
  END IF;
  RETURN NEW;
END $$;

DO $$ BEGIN
  ALTER TYPE public.invoice_status ADD VALUE IF NOT EXISTS 'partial';
EXCEPTION WHEN others THEN NULL; END $$;

CREATE TRIGGER trg_tx_success AFTER INSERT OR UPDATE ON public.transactions
FOR EACH ROW EXECUTE FUNCTION public.handle_tx_success();

-- ============ MEETINGS ============
CREATE TABLE IF NOT EXISTS public.meetings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  client_id uuid REFERENCES public.clients(id) ON DELETE SET NULL,
  project_id uuid REFERENCES public.projects(id) ON DELETE SET NULL,
  starts_at timestamptz NOT NULL,
  ends_at timestamptz NOT NULL,
  location text,
  meeting_link text,
  status public.meeting_status NOT NULL DEFAULT 'scheduled',
  reminder_sent boolean NOT NULL DEFAULT false,
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.meetings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins manage meetings" ON public.meetings FOR ALL USING (is_admin(auth.uid())) WITH CHECK (is_admin(auth.uid()));
CREATE POLICY "Clients view own meetings" ON public.meetings FOR SELECT USING (client_id = public.current_client_id());

CREATE TRIGGER trg_meetings_updated BEFORE UPDATE ON public.meetings FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============ CHAT ============
CREATE TABLE IF NOT EXISTS public.conversations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid REFERENCES public.clients(id) ON DELETE CASCADE,
  client_user_id uuid,
  subject text DEFAULT 'General',
  last_message_at timestamptz NOT NULL DEFAULT now(),
  unread_admin int NOT NULL DEFAULT 0,
  unread_client int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins all conversations" ON public.conversations FOR ALL USING (is_admin(auth.uid())) WITH CHECK (is_admin(auth.uid()));
CREATE POLICY "Clients see own conversation" ON public.conversations FOR SELECT USING (client_id = public.current_client_id());
CREATE POLICY "Clients create own conversation" ON public.conversations FOR INSERT WITH CHECK (client_id = public.current_client_id());

CREATE TABLE IF NOT EXISTS public.messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id uuid NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
  sender_id uuid,
  sender_role text NOT NULL CHECK (sender_role IN ('admin','client')),
  body text NOT NULL,
  read boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins all messages" ON public.messages FOR ALL USING (is_admin(auth.uid())) WITH CHECK (is_admin(auth.uid()));
CREATE POLICY "Clients view own messages" ON public.messages FOR SELECT
  USING (conversation_id IN (SELECT id FROM public.conversations WHERE client_id = public.current_client_id()));
CREATE POLICY "Clients send own messages" ON public.messages FOR INSERT
  WITH CHECK (sender_role='client' AND conversation_id IN (SELECT id FROM public.conversations WHERE client_id = public.current_client_id()));

-- Bump conversation last_message_at
CREATE OR REPLACE FUNCTION public.bump_conversation()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
BEGIN
  UPDATE public.conversations SET
    last_message_at = now(),
    unread_admin = CASE WHEN NEW.sender_role='client' THEN unread_admin+1 ELSE unread_admin END,
    unread_client = CASE WHEN NEW.sender_role='admin' THEN unread_client+1 ELSE unread_client END
  WHERE id = NEW.conversation_id;
  RETURN NEW;
END $$;
CREATE TRIGGER trg_msg_bump AFTER INSERT ON public.messages FOR EACH ROW EXECUTE FUNCTION public.bump_conversation();

-- ============ AUTOMATION LOGS ============
CREATE TABLE IF NOT EXISTS public.automation_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  workflow text NOT NULL,
  payload jsonb,
  status text NOT NULL DEFAULT 'success',
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.automation_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins view automation" ON public.automation_logs FOR SELECT USING (is_admin(auth.uid()));
CREATE POLICY "System inserts automation" ON public.automation_logs FOR INSERT WITH CHECK (true);

-- Lead-created automation hook
CREATE OR REPLACE FUNCTION public.on_lead_created()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
BEGIN
  INSERT INTO public.automation_logs(workflow, payload)
  VALUES ('lead.created', jsonb_build_object('lead_id', NEW.id, 'email', NEW.email, 'name', NEW.name));
  RETURN NEW;
END $$;
DROP TRIGGER IF EXISTS trg_lead_automation ON public.leads;
CREATE TRIGGER trg_lead_automation AFTER INSERT ON public.leads FOR EACH ROW EXECUTE FUNCTION public.on_lead_created();

-- Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;
ALTER PUBLICATION supabase_realtime ADD TABLE public.conversations;
ALTER PUBLICATION supabase_realtime ADD TABLE public.transactions;
