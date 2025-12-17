CREATE TABLE public.profile_optimizations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  current_headline TEXT NOT NULL,
  current_about TEXT NOT NULL,
  role TEXT,
  target_icp TEXT,
  custom_icp_if_any TEXT,
  selected_tones TEXT[] NOT NULL,
  profile_clarity_score INTEGER,
  icp_relevance_score INTEGER,
  detected_keywords TEXT[],
  missing_keywords TEXT[],
  optimized_headlines JSONB,
  optimized_about TEXT,
  positioning_angles JSONB
);

ALTER TABLE public.profile_optimizations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow anonymous inserts" 
ON public.profile_optimizations 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Allow anonymous reads" 
ON public.profile_optimizations 
FOR SELECT 
USING (true);