-- Plaza Rent Management Schema

-- Settings table
CREATE TABLE IF NOT EXISTS public.settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  plaza_name TEXT NOT NULL DEFAULT 'Grand Commercial Plaza',
  address TEXT DEFAULT '123 Business District, City Center',
  phone TEXT DEFAULT '+92 300 1234567',
  header_text TEXT DEFAULT 'Official Rent Invoice',
  footer_text TEXT DEFAULT 'Thank you for your timely payments.',
  whatsapp_template TEXT DEFAULT 'Dear {{tenant}}, your rent for {{month}} is pending. Outstanding balance: Rs {{balance}}. Kindly pay today.',
  default_increment_percent INTEGER DEFAULT 10,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "settings_select_own" ON public.settings FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "settings_insert_own" ON public.settings FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "settings_update_own" ON public.settings FOR UPDATE USING (auth.uid() = user_id);

-- Tenants table
CREATE TABLE IF NOT EXISTS public.tenants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  cnic TEXT DEFAULT '',
  phone TEXT DEFAULT '',
  email TEXT DEFAULT '',
  premises TEXT NOT NULL,
  effective_date TEXT DEFAULT '',
  monthly_rent INTEGER NOT NULL DEFAULT 0,
  security_deposit INTEGER DEFAULT 0,
  deposit_account_no TEXT DEFAULT '',
  utility_no TEXT DEFAULT '',
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'vacated')),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.tenants ENABLE ROW LEVEL SECURITY;
CREATE POLICY "tenants_select_own" ON public.tenants FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "tenants_insert_own" ON public.tenants FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "tenants_update_own" ON public.tenants FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "tenants_delete_own" ON public.tenants FOR DELETE USING (auth.uid() = user_id);

-- Leases table
CREATE TABLE IF NOT EXISTS public.leases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  start_date TEXT NOT NULL,
  end_date TEXT NOT NULL,
  increment_percent INTEGER DEFAULT 10,
  reminder_days INTEGER DEFAULT 30,
  status TEXT NOT NULL DEFAULT 'running' CHECK (status IN ('running', 'expired')),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.leases ENABLE ROW LEVEL SECURITY;
CREATE POLICY "leases_select_own" ON public.leases FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "leases_insert_own" ON public.leases FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "leases_update_own" ON public.leases FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "leases_delete_own" ON public.leases FOR DELETE USING (auth.uid() = user_id);

-- Rent Records table
CREATE TABLE IF NOT EXISTS public.rent_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  month_year TEXT NOT NULL,
  rent INTEGER NOT NULL DEFAULT 0,
  outstanding_previous INTEGER DEFAULT 0,
  paid INTEGER DEFAULT 0,
  balance INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.rent_records ENABLE ROW LEVEL SECURITY;
CREATE POLICY "rent_records_select_own" ON public.rent_records FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "rent_records_insert_own" ON public.rent_records FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "rent_records_update_own" ON public.rent_records FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "rent_records_delete_own" ON public.rent_records FOR DELETE USING (auth.uid() = user_id);

-- Payments table
CREATE TABLE IF NOT EXISTS public.payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  month_year TEXT NOT NULL,
  amount INTEGER NOT NULL DEFAULT 0,
  payment_date TEXT NOT NULL,
  payment_method TEXT DEFAULT 'cash',
  transaction_no TEXT DEFAULT '',
  notes TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "payments_select_own" ON public.payments FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "payments_insert_own" ON public.payments FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "payments_update_own" ON public.payments FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "payments_delete_own" ON public.payments FOR DELETE USING (auth.uid() = user_id);
