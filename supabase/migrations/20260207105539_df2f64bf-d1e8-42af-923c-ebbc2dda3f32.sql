-- Create enum for user roles
CREATE TYPE public.user_role AS ENUM ('asha', 'pregnant', 'elderly', 'infant_family');

-- Create enum for alert types
CREATE TYPE public.alert_type AS ENUM ('medical', 'urgent', 'general');

-- Create enum for alert status
CREATE TYPE public.alert_status AS ENUM ('active', 'acknowledged', 'resolved');

-- Create enum for beneficiary types
CREATE TYPE public.beneficiary_type AS ENUM ('pregnant', 'elderly', 'infant');

-- Create enum for meal types
CREATE TYPE public.meal_type AS ENUM ('breakfast', 'lunch', 'dinner', 'snack');

-- Create enum for funding status
CREATE TYPE public.funding_status AS ENUM ('pending', 'approved', 'disbursed');

-- Create enum for funding eligibility
CREATE TYPE public.funding_eligibility AS ENUM ('pregnant', 'elderly', 'infant', 'all');

-- Create profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  patient_id VARCHAR(6) NOT NULL UNIQUE,
  name TEXT NOT NULL,
  role user_role NOT NULL,
  phone TEXT NOT NULL,
  village TEXT,
  assigned_asha_id UUID,
  login_time TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create emergency alerts table
CREATE TABLE public.emergency_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  user_name TEXT NOT NULL,
  user_role user_role NOT NULL,
  type alert_type NOT NULL DEFAULT 'general',
  message TEXT NOT NULL,
  photo_url TEXT,
  location TEXT,
  status alert_status NOT NULL DEFAULT 'active',
  assigned_asha_id UUID REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create vaccination records table
CREATE TABLE public.vaccination_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  beneficiary_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  beneficiary_name TEXT NOT NULL,
  beneficiary_type beneficiary_type NOT NULL,
  vaccine_name TEXT NOT NULL,
  dose_number INTEGER NOT NULL DEFAULT 1,
  date_given TIMESTAMPTZ NOT NULL,
  next_due_date TIMESTAMPTZ,
  administered_by TEXT NOT NULL,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create treatment records table
CREATE TABLE public.treatment_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  beneficiary_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  beneficiary_name TEXT NOT NULL,
  beneficiary_type beneficiary_type NOT NULL,
  treatment_type TEXT NOT NULL,
  diagnosis TEXT NOT NULL,
  prescription TEXT NOT NULL,
  date_given TIMESTAMPTZ NOT NULL,
  doctor_name TEXT NOT NULL,
  notes TEXT,
  photo_url TEXT,
  documents TEXT[],
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create prescribed meals table
CREATE TABLE public.prescribed_meals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id VARCHAR(6) NOT NULL,
  patient_name TEXT NOT NULL,
  patient_type beneficiary_type NOT NULL,
  meal_type meal_type NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  calories INTEGER NOT NULL DEFAULT 0,
  protein DECIMAL(10,2) NOT NULL DEFAULT 0,
  carbs DECIMAL(10,2) NOT NULL DEFAULT 0,
  fat DECIMAL(10,2) NOT NULL DEFAULT 0,
  ingredients TEXT[],
  prescribed_by TEXT NOT NULL,
  prescribed_date TIMESTAMPTZ NOT NULL DEFAULT now(),
  special_instructions TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create nutrition recommendations table
CREATE TABLE public.nutrition_recommendations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category beneficiary_type NOT NULL,
  nutrient_name TEXT NOT NULL,
  daily_requirement TEXT NOT NULL,
  unit TEXT NOT NULL,
  sources TEXT[],
  importance TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create government funding table
CREATE TABLE public.government_funding (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  scheme_name TEXT NOT NULL,
  description TEXT,
  eligibility funding_eligibility NOT NULL DEFAULT 'all',
  amount_inr DECIMAL(12,2) NOT NULL DEFAULT 0,
  disbursement_date TIMESTAMPTZ,
  status funding_status NOT NULL DEFAULT 'pending',
  beneficiary_count INTEGER NOT NULL DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.emergency_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vaccination_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.treatment_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.prescribed_meals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.nutrition_recommendations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.government_funding ENABLE ROW LEVEL SECURITY;

-- RLS Policies for profiles
CREATE POLICY "Anyone can view profiles" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Anyone can insert profiles" ON public.profiles FOR INSERT WITH CHECK (true);

-- RLS Policies for emergency_alerts (all authenticated users can view and manage)
CREATE POLICY "Anyone can view alerts" ON public.emergency_alerts FOR SELECT USING (true);
CREATE POLICY "Anyone can create alerts" ON public.emergency_alerts FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update alerts" ON public.emergency_alerts FOR UPDATE USING (true);
CREATE POLICY "Anyone can delete alerts" ON public.emergency_alerts FOR DELETE USING (true);

-- RLS Policies for vaccination_records
CREATE POLICY "Anyone can view vaccinations" ON public.vaccination_records FOR SELECT USING (true);
CREATE POLICY "Anyone can create vaccinations" ON public.vaccination_records FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update vaccinations" ON public.vaccination_records FOR UPDATE USING (true);
CREATE POLICY "Anyone can delete vaccinations" ON public.vaccination_records FOR DELETE USING (true);

-- RLS Policies for treatment_records
CREATE POLICY "Anyone can view treatments" ON public.treatment_records FOR SELECT USING (true);
CREATE POLICY "Anyone can create treatments" ON public.treatment_records FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update treatments" ON public.treatment_records FOR UPDATE USING (true);
CREATE POLICY "Anyone can delete treatments" ON public.treatment_records FOR DELETE USING (true);

-- RLS Policies for prescribed_meals
CREATE POLICY "Anyone can view meals" ON public.prescribed_meals FOR SELECT USING (true);
CREATE POLICY "Anyone can create meals" ON public.prescribed_meals FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update meals" ON public.prescribed_meals FOR UPDATE USING (true);
CREATE POLICY "Anyone can delete meals" ON public.prescribed_meals FOR DELETE USING (true);

-- RLS Policies for nutrition_recommendations
CREATE POLICY "Anyone can view nutrition" ON public.nutrition_recommendations FOR SELECT USING (true);
CREATE POLICY "Anyone can create nutrition" ON public.nutrition_recommendations FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update nutrition" ON public.nutrition_recommendations FOR UPDATE USING (true);
CREATE POLICY "Anyone can delete nutrition" ON public.nutrition_recommendations FOR DELETE USING (true);

-- RLS Policies for government_funding
CREATE POLICY "Anyone can view funding" ON public.government_funding FOR SELECT USING (true);
CREATE POLICY "Anyone can create funding" ON public.government_funding FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update funding" ON public.government_funding FOR UPDATE USING (true);
CREATE POLICY "Anyone can delete funding" ON public.government_funding FOR DELETE USING (true);

-- Enable realtime for all tables
ALTER PUBLICATION supabase_realtime ADD TABLE public.profiles;
ALTER PUBLICATION supabase_realtime ADD TABLE public.emergency_alerts;
ALTER PUBLICATION supabase_realtime ADD TABLE public.vaccination_records;
ALTER PUBLICATION supabase_realtime ADD TABLE public.treatment_records;
ALTER PUBLICATION supabase_realtime ADD TABLE public.prescribed_meals;
ALTER PUBLICATION supabase_realtime ADD TABLE public.nutrition_recommendations;
ALTER PUBLICATION supabase_realtime ADD TABLE public.government_funding;

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at triggers
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_emergency_alerts_updated_at BEFORE UPDATE ON public.emergency_alerts FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_vaccination_records_updated_at BEFORE UPDATE ON public.vaccination_records FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_treatment_records_updated_at BEFORE UPDATE ON public.treatment_records FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_prescribed_meals_updated_at BEFORE UPDATE ON public.prescribed_meals FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_nutrition_recommendations_updated_at BEFORE UPDATE ON public.nutrition_recommendations FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_government_funding_updated_at BEFORE UPDATE ON public.government_funding FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();