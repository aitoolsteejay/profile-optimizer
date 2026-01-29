-- Create leads table for storing captured contact information
CREATE TABLE public.leads (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  company_name TEXT NOT NULL,
  role TEXT NOT NULL,
  company_description TEXT NOT NULL,
  target_icp TEXT NOT NULL,
  custom_icp TEXT,
  selected_tones TEXT[] NOT NULL DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;

-- Create restrictive policy: only service role can read (for admin access via edge function)
-- No public SELECT allowed
CREATE POLICY "No public read access" 
ON public.leads 
FOR SELECT 
USING (false);

-- Allow anonymous inserts for lead capture (public form submission)
CREATE POLICY "Allow anonymous inserts" 
ON public.leads 
FOR INSERT 
WITH CHECK (true);

-- Create index for email lookups
CREATE INDEX idx_leads_email ON public.leads(email);

-- Create index for created_at for sorting
CREATE INDEX idx_leads_created_at ON public.leads(created_at DESC);