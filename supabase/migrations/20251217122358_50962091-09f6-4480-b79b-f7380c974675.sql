-- Drop the anonymous reads policy (exposes user data publicly)
DROP POLICY IF EXISTS "Allow anonymous reads" ON public.profile_optimizations;

-- Keep the anonymous inserts policy for the tool to work
-- But rename it to be clearer about its purpose
DROP POLICY IF EXISTS "Allow anonymous inserts" ON public.profile_optimizations;

CREATE POLICY "Allow public inserts for lead generation" 
ON public.profile_optimizations 
FOR INSERT 
TO anon
WITH CHECK (true);